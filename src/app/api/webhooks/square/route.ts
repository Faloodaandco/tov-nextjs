import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * POST /api/webhooks/square
 *
 * Receives Square webhook events (payment.updated, order.updated).
 * Verifies the webhook signature using the Square webhook signature key.
 *
 * Env: SQUARE_WEBHOOK_SIGNATURE_KEY, SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY, SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY
 */
export async function POST(req: NextRequest) {
  try {
    const signatureKeys = [
      process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      process.env.SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY,
      process.env.SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY,
    ].filter(Boolean) as string[];

    const body = await req.text();

    // Signature verification — fail-closed: no keys = reject
    if (signatureKeys.length === 0) {
      console.error('[Square Webhook] No signature keys configured — rejecting all webhooks');
      return NextResponse.json({ error: 'Webhook signature verification not configured' }, { status: 500 });
    }

    const signature = req.headers.get('x-square-hmacsha256-signature');
    const notificationUrl = `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}/api/webhooks/square`;

    const isValid = signatureKeys.some((key) => {
      const hmac = crypto
        .createHmac('sha256', key)
        .update(notificationUrl + body)
        .digest('base64');
      return signature === hmac;
    });

    if (!isValid) {
      console.warn('[Square Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType = event?.type;

    console.log(`[Square Webhook] Received: ${eventType} (${event?.data?.id || 'no-id'})`);

    switch (eventType) {
      case 'payment.completed':
      case 'payment.updated': {
        const payment = event?.data?.object?.payment;
        if (payment) {
          console.log(`[Square Webhook] Payment ${payment.id}: status=${payment.status}, amount=${payment.amount_money?.amount}p, ref=${payment.reference_id}`);
          // Future: update Firestore order status, trigger push notification
        }
        break;
      }

      case 'order.updated': {
        const order = event?.data?.object?.order_updated;
        if (order) {
          console.log(`[Square Webhook] Order ${order.order_id}: state=${order.state}`);
          // Future: sync order state to Firestore, update live-tracker
        }
        break;
      }

      default:
        console.log(`[Square Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Square Webhook] Error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
