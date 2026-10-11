/**
 * SMTP Email Service for WhatsApp Order Notifications
 *
 * Uses nodemailer with Google Workspace SMTP (info@tasteofvillagerestaurants.co.uk).
 * Requires SMTP_EMAIL and SMTP_APP_PASSWORD in environment.
 *
 * Non-fatal: email failures never block order processing.
 */
import nodemailer, { type Transporter } from 'nodemailer';

const SMTP_EMAIL = process.env.SMTP_EMAIL || 'info@tasteofvillagerestaurants.co.uk';
const SMTP_PASSWORD = process.env.SMTP_APP_PASSWORD || '';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!SMTP_PASSWORD) {
    console.warn('[Email] SMTP_APP_PASSWORD not configured — email notifications disabled');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

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

/**
 * Send order notification email to the restaurant.
 * Non-fatal — NEVER blocks order processing.
 */
export async function sendOrderNotificationEmail(data: OrderEmailData): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const itemLines = data.items
    .map(i => `  ${i.quantity}x ${i.name} — £${(i.pricePence / 100).toFixed(2)}`)
    .join('\n');

  const addressBlock = data.fulfillmentType === 'delivery' && data.deliveryAddress
    ? `\nDelivery Address: ${data.deliveryAddress}, ${data.deliveryPostcode || ''}`
    : '';

  const textBody = [
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

  const htmlBody = `
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

  try {
    await transport.sendMail({
      from: `"TOV Orders" <${SMTP_EMAIL}>`,
      to: SMTP_EMAIL,
      subject: `🍽️ WhatsApp Order #${data.orderDisplayId} — ${data.branchName} — £${data.totalPounds.toFixed(2)}`,
      text: textBody,
      html: htmlBody,
    });
    console.info(`[Email] Sent order notification for #${data.orderDisplayId}`);
  } catch (error) {
    console.error('[Email] Failed to send order notification (non-fatal):', error);
  }
}
