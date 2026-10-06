import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWhatsAppMessage } from '@/lib/waba';
import { LOCATIONS, type LocationId } from '@/config/shopConfig';

/**
 * POST /api/webhooks/square
 *
 * Receives Square webhook events (payment.updated, order.updated, etc).
 * Verifies the webhook signature using the Square webhook signature key.
 * Uses Firestore-backed deduplication to survive Vercel cold starts.
 *
 * Env: SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY, SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY
 */

/** Maps Square location_id to the correct webhook signature env var */
const LOCATION_KEY_MAP: Record<string, string | undefined> = {
  'LW0Z07P1KP8HB': process.env.SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY,
  'LD40KJ3QHAPGK': process.env.SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY,
};

export async function POST(req: NextRequest) {
  try {
    const allKeys = [
      process.env.SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY,
      process.env.SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY,
    ].filter(Boolean) as string[];

    const body = await req.text();

    // Signature verification — fail-closed: no keys = reject
    if (allKeys.length === 0) {
      console.error('[Square Webhook] No signature keys configured — rejecting all webhooks');
      return NextResponse.json({ error: 'Webhook signature verification not configured' }, { status: 500 });
    }

    const signature = req.headers.get('x-square-hmacsha256-signature');
    const headersList = await headers();
    const notificationUrl = process.env.SQUARE_WEBHOOK_URL || `https://${headersList.get('host')}/api/webhooks/square`;

    // Parse body early to extract location_id for targeted key selection
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      console.warn('[Square Webhook] Invalid JSON body');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Try branch-specific key first (preferred), fall back to trying all keys
    const locationId = event?.data?.object?.payment?.location_id
      || event?.data?.object?.order?.location_id
      || event?.data?.object?.order_updated?.location_id;

    let isValid = false;

    if (locationId && LOCATION_KEY_MAP[locationId]) {
      // Branch-specific validation — correct and secure
      const key = LOCATION_KEY_MAP[locationId]!;
      const hmac = crypto
        .createHmac('sha256', key)
        .update(notificationUrl + body)
        .digest('base64');
      isValid = signature === hmac;
    } else {
      // Fallback: try all keys (for events without clear location_id)
      isValid = allKeys.some((key) => {
        const hmac = crypto
          .createHmac('sha256', key)
          .update(notificationUrl + body)
          .digest('base64');
        return signature === hmac;
      });
    }

    if (!isValid) {
      console.warn('[Square Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const eventId = event?.id || event?.event_id;
    
    // Firestore-backed idempotency check (survives Vercel cold starts)
    if (eventId) {
      const dedupRef = adminDb.collection('webhook_events').doc(eventId);
      const dedupSnap = await dedupRef.get();
      
      if (dedupSnap.exists) {
        console.info(`[Square Webhook] Event ${eventId} already processed, skipping`);
        return NextResponse.json({ received: true });
      }

      // Mark as processed with TTL metadata (clean up events older than 48h externally)
      await dedupRef.set({
        processedAt: new Date().toISOString(),
        eventType: event?.type,
        locationId: locationId || null,
      });
    }

    const eventType = event?.type;

    console.info(`[Square Webhook] Received: ${eventType} (${event?.data?.id || 'no-id'}) location=${locationId || 'unknown'}`);

    switch (eventType) {
      case 'payment.created':
      case 'payment.updated': {
        const payment = event?.data?.object?.payment;
        
        if (payment && eventType === 'payment.created' && payment.status !== 'COMPLETED') {
          console.info(`[Square Webhook] Payment ${payment.id}: status=${payment.status}, amount=${payment.amount_money?.amount}p, ref=${payment.reference_id}`);
        }

        if (payment && payment.status === 'COMPLETED') {
          console.info(`[Square Webhook] Payment ${payment.id} COMPLETED: amount=${payment.amount_money?.amount}p, ref=${payment.reference_id}`);
          const orderRefId = payment.reference_id;
          if (orderRefId) {
            try {
              const orderDocRef = adminDb.collection('orders').doc(orderRefId);
              const orderSnap = await orderDocRef.get();
              if (orderSnap.exists) {
                await orderDocRef.update({
                  paymentStatus: 'PAID',
                  squarePaymentId: payment.id,
                  paidAt: new Date().toISOString(),
                  status: 'CONFIRMED',
                  updatedAt: new Date().toISOString(),
                });
                console.info(`[Square Webhook] Order ${orderRefId} updated to CONFIRMED / PAID`);
              }
            } catch (updateErr) {
              console.error(`[Square Webhook] Failed to update order ${orderRefId}:`, updateErr);
            }
          }

          // ── WhatsApp Order Payment Sync & Notification ──
          const squareOrderId = payment.order_id;
          const isWaRef = orderRefId && orderRefId.startsWith('TOV-WA-');

          if (isWaRef || squareOrderId) {
            try {
              // Try finding whatsapp_orders by referenceId first, then squareOrderId
              let waDocRef = orderRefId ? adminDb.collection('whatsapp_orders').doc(orderRefId) : null;
              let waSnap = waDocRef ? await waDocRef.get() : null;

              if (!waSnap?.exists && squareOrderId) {
                waDocRef = adminDb.collection('whatsapp_orders').doc(squareOrderId);
                waSnap = await waDocRef.get();
              }

              if (waSnap?.exists) {
                const waOrder = waSnap.data();
                if (waOrder && waOrder.status !== 'PAID') {
                  await waDocRef!.update({
                    status: 'PAID',
                    paidAt: new Date().toISOString(),
                    squarePaymentId: payment.id,
                  });
                  console.info(`[Square Webhook] whatsapp_orders/${waDocRef!.id} marked as PAID`);

                  // Clear user's active cart in whatsapp_conversations since they paid!
                  if (waOrder.phone) {
                    await adminDb.collection('whatsapp_conversations').doc(waOrder.phone).set({
                      activeCart: null,
                      state: 'idle',
                      lastPaidOrderId: orderRefId || squareOrderId,
                      lastPaidAt: new Date().toISOString(),
                    }, { merge: true });

                    // Dynamic Branch Resolution (Hayes vs Slough)
                    const branchKey: LocationId = (waOrder.branchId === 'slough' ? 'slough' : 'hayes');
                    const loc = LOCATIONS[branchKey];

                    const displayId = orderRefId || (squareOrderId ? squareOrderId.slice(-6).toUpperCase() : 'TOV');
                    const trackingOrderId = waOrder.orderId || orderRefId || squareOrderId || displayId;
                    const trackingUrl = `https://tasteofvillagerestaurants.co.uk/track/${trackingOrderId}`;

                    const isDelivery = waOrder.fulfillmentType === 'delivery';
                    const estMinutes = isDelivery
                      ? `${loc.delivery.estimatedMinutes.delivery.min}–${loc.delivery.estimatedMinutes.delivery.max}`
                      : `${loc.delivery.estimatedMinutes.collection.min}–${loc.delivery.estimatedMinutes.collection.max}`;

                    // Mirror into main 'orders' collection for unified POS/KDS & tracking API
                    await adminDb.collection('orders').doc(trackingOrderId).set({
                      id: trackingOrderId,
                      orderId: trackingOrderId,
                      customerName: waOrder.name || 'WhatsApp Customer',
                      customerPhone: waOrder.phone,
                      type: waOrder.fulfillmentType || 'collection',
                      fulfillmentType: waOrder.fulfillmentType || 'collection',
                      branch: branchKey,
                      branchId: branchKey,
                      branchName: loc.name,
                      status: 'CONFIRMED',
                      paymentStatus: 'PAID',
                      payment_status: 'paid',
                      squarePaymentId: payment.id,
                      squareOrderId: squareOrderId || null,
                      items: (waOrder.items || []).map((i: any) => ({
                        name: i.name,
                        quantity: i.quantity,
                        price: (i.pricePence || 0) / 100,
                      })),
                      total: (waOrder.totalPence || 0) / 100,
                      deliveryAddress: isDelivery ? (waOrder.streetAddress ? `${waOrder.streetAddress}, ${waOrder.postcode || ''}` : waOrder.postcode) : null,
                      paidAt: new Date().toISOString(),
                      createdAt: waOrder.createdAt || new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }, { merge: true }).catch((err) => {
                      console.warn('[Square Webhook] Non-blocking mirror to orders collection:', err);
                    });

                    // Send Instant WhatsApp Receipt, Dynamic Location & Live Tracking Link!
                    const phoneId = waOrder.phoneId || process.env.TOV_WABA_PHONE_ID || '1353080021225827';
                    const addressLine = isDelivery
                      ? (waOrder.streetAddress
                          ? `📍 Delivering to: *${waOrder.streetAddress}, ${waOrder.postcode || ''}*`
                          : `📍 Delivering to: *${waOrder.postcode || 'Your address'}*`)
                      : `📍 Pickup at: *${loc.name}*\n_${loc.address}, ${loc.city} ${loc.postcode}_`;

                    const itemsList = (waOrder.items || [])
                      .map((i: any) => `• ${i.quantity}x ${i.name}`)
                      .join('\n');

                    await sendWhatsAppMessage(phoneId, waOrder.phone, {
                      type: 'text',
                      text: {
                        preview_url: false,
                        body: [
                          `🎉 *Payment Confirmed!*`,
                          `Thank you ${waOrder.name || ''}! We've received your payment.`,
                          ``,
                          `📋 *Order #${displayId}* (${loc.name})`,
                          itemsList,
                          ``,
                          addressLine,
                          `⏱️ *Estimated Time: ${estMinutes} mins*`,
                          ``,
                          `🔥 *Track Your Order Live:*`,
                          trackingUrl,
                          ``,
                          `Our kitchen has started preparing your fresh food! 👨‍🍳🔥`,
                          `If you have any questions or dietary notes, simply reply to this chat.`
                        ].filter(Boolean).join('\n'),
                      },
                    });
                    console.info(`[Square Webhook] Sent WhatsApp payment confirmation with tracking link to ${waOrder.phone}`);
                  }
                }
              }
            } catch (waErr) {
              console.error('[Square Webhook] Failed to process WhatsApp order confirmation:', waErr);
            }
          }
        }
        break;
      }

      case 'order.updated': {
        const order = event?.data?.object?.order_updated;
        if (order) {
          console.info(`[Square Webhook] Order ${order.order_id}: state=${order.state}`);
        }
        break;
      }

      case 'order.fulfillment.updated': {
        const fulfillmentUpdate = event?.data?.object?.order_fulfillment_updated;
        if (fulfillmentUpdate) {
          const squareOrderId = fulfillmentUpdate.order_id;
          const newState = fulfillmentUpdate.fulfillment_update?.[0]?.new_state;
          console.info(`[Square Webhook] Fulfillment updated for order ${squareOrderId}: state=${newState}`);
          if (squareOrderId && newState) {
            try {
              const q = await adminDb.collection('orders').where('squareOrderId', '==', squareOrderId).limit(1).get();
              if (!q.empty) {
                const docRef = q.docs[0].ref;
                let mappedStatus = 'CONFIRMED';
                if (newState === 'PREPARED') mappedStatus = 'READY';
                else if (newState === 'COMPLETED') mappedStatus = 'COMPLETED';
                else if (newState === 'CANCELED') mappedStatus = 'CANCELLED';
                await docRef.update({
                  fulfillmentState: newState,
                  status: mappedStatus,
                  updatedAt: new Date().toISOString(),
                });
                console.info(`[Square Webhook] Synced fulfillment state ${newState} -> status ${mappedStatus} for doc ${docRef.id}`);

                // Queue 24H Automated Review Request Loop (SEO Dominance)
                if (newState === 'COMPLETED') {
                  const orderData = q.docs[0].data();
                  if (orderData.customerEmail || orderData.customerPhone) {
                    await adminDb.collection('review_queue').doc(docRef.id).set({
                      orderId: docRef.id,
                      squareOrderId: squareOrderId,
                      branchId: orderData.branch || 'unknown',
                      customerEmail: orderData.customerEmail || null,
                      customerPhone: orderData.customerPhone || null,
                      customerName: orderData.customerName || 'Customer',
                      status: 'PENDING',
                      // Schedule for 24 hours from now
                      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                      createdAt: new Date().toISOString(),
                    });
                    console.info(`[Square Webhook] Queued order ${docRef.id} for 24H review request loop.`);
                  }
                }
              }
            } catch (syncErr) {
              console.warn('[Square Webhook] Failed to sync fulfillment state:', syncErr);
            }
          }
        }
        break;
      }

      default:
        console.info(`[Square Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Square Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
