import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';

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
      case 'payment.created': {
        const payment = event?.data?.object?.payment;
        if (payment) {
          console.info(`[Square Webhook] Payment ${payment.id}: status=${payment.status}, amount=${payment.amount_money?.amount}p, ref=${payment.reference_id}`);
        }
        break;
      }

      case 'payment.updated': {
        const payment = event?.data?.object?.payment;
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
