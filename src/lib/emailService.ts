/**
 * Email Service for WhatsApp Order Notifications
 *
 * Strategy: Resend API (primary, zero-config) → SMTP/nodemailer (fallback).
 * - RESEND_API_KEY → uses Resend (free tier: 100 emails/day)
 * - SMTP_APP_PASSWORD → falls back to Google Workspace SMTP
 *
 * Non-fatal: email failures never block order processing.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SMTP_EMAIL = process.env.SMTP_EMAIL || 'info@tasteofvillagerestaurants.co.uk';
const SMTP_PASSWORD = process.env.SMTP_APP_PASSWORD || '';
const RECIPIENT = 'info@tasteofvillagerestaurants.co.uk';

export interface OrderEmailData {
  orderDisplayId: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'collection' | 'delivery';
  items: { name: string; quantity: number; pricePence: number }[];
  totalPounds: number;
  trackingUrl: string;
  paymentId: string;
  deliveryAddress?: string;
  deliveryPostcode?: string;
}

function buildEmailContent(data: OrderEmailData) {
  const itemLines = data.items
    .map(i => `  ${i.quantity}x ${i.name} — £${(i.pricePence / 100).toFixed(2)}`)
    .join('\n');

  const addressBlock = data.fulfillmentType === 'delivery' && data.deliveryAddress
    ? `\nDelivery Address: ${data.deliveryAddress}, ${data.deliveryPostcode || ''}`
    : '';

  const text = [
    `New WhatsApp Order — ${data.branchName}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Order #${data.orderDisplayId}`,
    `Customer: ${data.customerName}`,
    `Phone: +${data.customerPhone}`,
    `Type: ${data.fulfillmentType === 'delivery' ? '🚗 Delivery' : '🏪 Collection'}`,
    addressBlock,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Total: £${data.totalPounds.toFixed(2)}`,
    ``,
    `Track: ${data.trackingUrl}`,
    `Square Payment: ${data.paymentId}`,
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A3C34; color: white; padding: 20px; text-align: center;">
        <h1 style="font-family: 'Cinzel', serif; margin: 0; font-size: 18px; letter-spacing: 2px;">
          🍽️ NEW WHATSAPP ORDER
        </h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">${data.branchName}</p>
      </div>
      <div style="padding: 20px; background: #FDF5F2;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Order</td><td style="text-align: right;">#${data.orderDisplayId}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Customer</td><td style="text-align: right;">${data.customerName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Phone</td><td style="text-align: right;"><a href="tel:+${data.customerPhone}">+${data.customerPhone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Type</td><td style="text-align: right;">${data.fulfillmentType === 'delivery' ? '🚗 Delivery' : '🏪 Collection'}</td></tr>
          ${data.deliveryAddress ? `<tr><td style="padding: 8px 0; font-weight: bold;">Address</td><td style="text-align: right;">${data.deliveryAddress}, ${data.deliveryPostcode || ''}</td></tr>` : ''}
        </table>
        <hr style="border: 1px solid #1A3C34; margin: 15px 0;">
        <h3 style="color: #1A3C34; margin: 0 0 10px;">Items</h3>
        ${data.items.map(i => `<div style="display: flex; justify-content: space-between; padding: 4px 0;">
          <span>${i.quantity}x ${i.name}</span>
          <span style="font-weight: bold;">£${(i.pricePence / 100).toFixed(2)}</span>
        </div>`).join('')}
        <hr style="border: 1px solid #1A3C34; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1A3C34;">
          <span>Total</span>
          <span>£${data.totalPounds.toFixed(2)}</span>
        </div>
      </div>
      <div style="padding: 15px; text-align: center; background: #1A3C34;">
        <a href="${data.trackingUrl}" style="color: white; text-decoration: none; font-weight: bold;">View Order Tracking →</a>
      </div>
    </div>
  `;

  const subject = `🍽️ WhatsApp Order #${data.orderDisplayId} — ${data.branchName} — £${data.totalPounds.toFixed(2)}`;

  return { text, html, subject };
}

/** Send via Resend API (free, no SMTP config needed) */
async function sendViaResend(data: OrderEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) return false;

  const { text, html, subject } = buildEmailContent(data);

  const payload = JSON.stringify({
    from: 'TOV Orders <onboarding@resend.dev>',
    reply_to: 'info@tasteofvillagerestaurants.co.uk',
    to: [RECIPIENT],
    subject,
    text,
    html,
  });

  const attemptSend = async (): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      return await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: payload,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  // First attempt
  let res: Response;
  try {
    res = await attemptSend();
  } catch (err) {
    console.error('[Email/Resend] Fetch failed (timeout or network):', err);
    return false;
  }

  // Retry once on 429 (rate limited) or 5xx with 500ms backoff
  if (res.status === 429 || res.status >= 500) {
    console.warn(`[Email/Resend] Retryable error (HTTP ${res.status}), retrying in 500ms…`);
    await new Promise(r => setTimeout(r, 500));
    try {
      res = await attemptSend();
    } catch (err) {
      console.error('[Email/Resend] Retry fetch failed (timeout or network):', err);
      return false;
    }
  }

  if (!res.ok) {
    const err = await res.text();
    console.error(`[Email/Resend] Failed (HTTP ${res.status}):`, err);
    return false;
  }

  console.info(`[Email/Resend] Sent order notification for #${data.orderDisplayId}`);
  return true;
}

/** Send via SMTP/nodemailer (fallback, requires Google App Password) */
async function sendViaSMTP(data: OrderEmailData): Promise<boolean> {
  if (!SMTP_PASSWORD) return false;

  const nodemailer = (await import('nodemailer')).default;
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
  });

  const { text, html, subject } = buildEmailContent(data);

  try {
    await transport.sendMail({
      from: `"TOV Orders" <${SMTP_EMAIL}>`,
      to: RECIPIENT,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error(`[Email/SMTP] sendMail failed for order #${data.orderDisplayId}:`, err);
    return false;
  }

  console.info(`[Email/SMTP] Sent order notification for #${data.orderDisplayId}`);
  return true;
}

/**
 * Send order notification email to the restaurant.
 * Tries Resend first (zero config), falls back to SMTP.
 * Non-fatal — NEVER blocks order processing.
 */
export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  try {
    // Strategy 1: Resend (free API, no SMTP setup)
    const sentViaResend = await sendViaResend(data);
    if (sentViaResend) {
      console.info(`[Email] Order #${data.orderDisplayId} notification sent via Resend (primary)`);
      return;
    }

    // Strategy 2: SMTP via nodemailer (Google Workspace)
    const sentViaSMTP = await sendViaSMTP(data);
    if (sentViaSMTP) {
      console.info(`[Email] Order #${data.orderDisplayId} notification sent via SMTP (fallback)`);
      return;
    }

    console.warn('[Email] No email provider configured. Set RESEND_API_KEY or SMTP_APP_PASSWORD on Vercel.');
  } catch (error) {
    console.error('[Email] Failed to send order notification (non-fatal):', error);
  }
}
