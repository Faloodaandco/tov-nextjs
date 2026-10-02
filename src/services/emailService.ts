import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';
import { LOCATIONS } from '@/config/shopConfig';

const STORE_EMAILS_BY_BRANCH: Record<string, string[]> = {
  hayes: ['info@tasteofvillagerestaurants.co.uk'],
  slough: ['info@tasteofvillagerestaurants.co.uk'],
};

function getStoreNotificationEmails(branchId?: string): string[] {
  if (branchId && STORE_EMAILS_BY_BRANCH[branchId]) {
    return STORE_EMAILS_BY_BRANCH[branchId];
  }
  return STORE_EMAILS_BY_BRANCH.hayes;
}

export async function sendBookingNotificationEmail(booking: any): Promise<void> {
  try {
    const branchName = booking.branch === 'slough' || booking.location === 'slough'
      ? 'Taste of Village Slough'
      : 'Taste of Village Hayes';
      
    const subject = `📅 New Table Booking: ${booking.date} at ${booking.time} (${branchName})`;
    
    const text = `
🚨 NEW TABLE BOOKING
==================================
Booking ID: ${booking.id}
Branch:     ${branchName}
Date:       ${booking.date}
Time:       ${booking.time}
Guests:     ${booking.guests}

CUSTOMER DETAILS:
Name:       ${booking.customerName}
Phone:      ${booking.customerPhone}
Email:      ${booking.email || 'Not provided'}
Notes:      ${booking.notes || 'None'}
==================================
`;
    
    const html = `<div style="font-family: Arial, sans-serif;">
      <h2 style="color: #1E3A34;">New Table Booking - ${branchName}</h2>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Guests:</strong> ${booking.guests}</p>
      <br/>
      <p><strong>Name:</strong> ${booking.customerName}</p>
      <p><strong>Phone:</strong> ${booking.customerPhone}</p>
      <p><strong>Email:</strong> ${booking.email || 'Not provided'}</p>
      <p><strong>Notes:</strong> ${booking.notes || 'None'}</p>
    </div>`;

    const branchId = booking.branch || booking.location || 'hayes';
    const storeEmails = getStoreNotificationEmails(branchId);
    const recipients = [...storeEmails];
    
    if (booking.email && !recipients.includes(booking.email.trim())) {
      recipients.push(booking.email.trim());
    }

    await addDoc(collection(db, 'mail'), {
      to: recipients,
      ...(booking.email ? { replyTo: booking.email.trim() } : {}),
      message: { subject, text, html },
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
      status: 'queued',
    });

    console.log(`[EmailService] Booking notification queued for ${recipients.join(', ')} (Booking: ${booking.id})`);
  } catch (err) {
    console.warn('[EmailService] Failed to queue booking email notification:', err);
  }
}

/**
 * Generates clean plain text for email tickets (kitchen receipt printers & mobile).
 */
export function formatOrderPlainText(order: any): string {
  const isDelivery = order.type === 'delivery' || order.fulfillment_type === 'delivery';
  const branchName = order.tenant_id === LOCATIONS.slough.tenant_id
    ? 'Taste of Village Slough (Farnham Road)'
    : 'Taste of Village Hayes (Uxbridge Road)';

  const itemLines = order.items
    .map((i: any) => `• ${i.quantity}x ${i.name} ${i.notes ? `[Note: ${i.notes}]` : ''} - £${(i.price * i.quantity).toFixed(2)}`)
    .join('\n');

  const isSlough = order.tenant_id === LOCATIONS.slough.tenant_id;
  const deliveryCity = isSlough ? 'Slough' : 'Hayes';

  const deliveryAddressText = isDelivery && order.deliveryAddress
    ? `\nDELIVERY DESTINATION:\n${order.deliveryAddress.line1 || ''}, ${order.deliveryAddress.line2 ? order.deliveryAddress.line2 + ', ' : ''}${order.deliveryAddress.city || deliveryCity} ${order.deliveryAddress.postcode || ''}\nDriver Note: ${order.deliveryAddress.instructions || 'None'}\n`
    : '';

  return `
🚨 NEW ONLINE ${isDelivery ? 'DOORSTEP DELIVERY' : 'COLLECTION'} ORDER
==================================
Order ID:   ${order.id}
Branch:     ${branchName}
Time:       ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (${new Date().toLocaleDateString('en-GB')})
Status:     ${order.payment_status === 'paid' ? 'PAID ONLINE (Card / Apple Pay)' : 'UNPAID'}

CUSTOMER DETAILS:
Name:       ${order.customerName}
Phone:      ${order.customerPhone}
Email:      ${order.customerEmail || 'Not provided'}
${deliveryAddressText}
ITEMS ORDERED:
${itemLines}
${isDelivery && order.deliveryFee ? `• Driver Delivery Fee - £${Number(order.deliveryFee).toFixed(2)}\n` : ''}
==================================
TOTAL:      £${Number(order.total).toFixed(2)}
==================================
Order Type: ${isDelivery ? (isSlough ? 'Slough Delivery (Own Drivers)' : 'Hayes In-House Fleet Delivery') : 'Store Collection'}
`;
}

/**
 * Generates branded HTML email for restaurant manager & customer.
 */
export function formatOrderHtml(order: Order): string {
  const branchName = order.tenant_id === LOCATIONS.slough.tenant_id
    ? 'Taste of Village Slough'
    : 'Taste of Village Hayes';

  const branchAddress = order.tenant_id === LOCATIONS.slough.tenant_id
    ? '260 Farnham Road, Slough, SL1 4XL'
    : '766B Uxbridge Rd, Hayes, UB4 0RU';

  const isDelivery = (order as any).fulfillment_type === 'delivery' || (order as any).type === 'delivery';

  const rows = order.items
    .map(i => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 8px; font-weight: bold; color: #1E3A34;">${i.quantity}x ${i.name} ${i.notes ? `<br><span style="font-size: 12px; color: #8A3D2A; font-weight: normal; font-style: italic;">Note: ${i.notes}</span>` : ''}</td>
        <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #8A3D2A;">£${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>New Order ${order.id}</title></head>
  <body style="font-family: Arial, sans-serif; background-color: #F8F5EE; padding: 20px; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E0D8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

      <div style="background-color: #1E3A34; padding: 24px; text-align: center; color: #FFFFFF;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">TASTE OF VILLAGE</h1>
        <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.8;">Authentic Desi Cuisine • ${isDelivery ? 'Online Delivery Ticket' : 'Online Collection Ticket'}</p>
      </div>

      <div style="background-color: #8A3D2A; color: #FFFFFF; padding: 12px 20px; text-align: center; font-weight: bold; font-size: 16px;">
        🚨 NEW ${isDelivery ? 'DOORSTEP DELIVERY' : 'COLLECTION'} ORDER: #${order.id}
      </div>

      <div style="padding: 24px;">
        <table style="width: 100%; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="color: #64748B;">Branch:</td><td style="font-weight: bold; color: #1E3A34; text-align: right;">${branchName}</td></tr>
          <tr><td style="color: #64748B;">Address:</td><td style="color: #1E3A34; text-align: right;">${branchAddress}</td></tr>
          <tr><td style="color: #64748B;">Payment Status:</td><td style="font-weight: bold; color: ${order.payment_status === 'paid' ? '#16A34A' : '#DC2626'}; text-align: right;">${order.payment_status === 'paid' ? 'PAID ONLINE (Card / Apple Pay / Google Pay)' : 'PAY AT TILL'}</td></tr>
          <tr><td style="color: #64748B;">Order Placed:</td><td style="color: #1E3A34; text-align: right;">${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (${new Date().toLocaleDateString('en-GB')})</td></tr>
        </table>

        <div style="background: #F8F5EE; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #1E3A34;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; color: #1E3A34; letter-spacing: 1px;">Customer Information</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #1E3A34;"><strong>Name:</strong> ${order.customerName}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #1E3A34;"><strong>Phone:</strong> <a aria-label="Phone" href="tel:${order.customerPhone}" style="color: #8A3D2A; text-decoration: none; font-weight: bold;">${order.customerPhone}</a></p>
          ${order.customerEmail ? `<p style="margin: 4px 0; font-size: 14px; color: #1E3A34;"><strong>Email:</strong> ${order.customerEmail}</p>` : ''}
        </div>

        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #1E3A34; letter-spacing: 1px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead><tr style="border-bottom: 2px solid #1E3A34;"><th style="padding: 8px; text-align: left; color: #1E3A34;">Item</th><th style="padding: 8px; text-align: right; color: #1E3A34;">Price</th></tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td style="padding: 16px 8px; font-size: 18px; font-weight: bold; color: #1E3A34;">Total Amount</td><td style="padding: 16px 8px; font-size: 20px; font-weight: bold; color: #8A3D2A; text-align: right;">£${Number(order.total).toFixed(2)}</td></tr></tfoot>
        </table>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center; color: #94A3B8; font-size: 12px;">
          <p style="margin: 4px 0;">Taste of Village Online Order Notification</p>
          <p style="margin: 4px 0;">This email was automatically generated upon customer checkout.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Dispatches an automated email notification for newly placed orders.
 * Writes to Firestore 'mail' collection (Firebase Trigger Email extension compatible).
 * Non-blocking — never crashes the checkout flow.
 */
export async function sendOrderNotificationEmail(order: any): Promise<void> {
  try {
    const isPaid = order.payment_status === 'paid';
    const isDelivery = order.type === 'delivery' || order.fulfillment_type === 'delivery';
    const statusText = isPaid
      ? (isDelivery ? 'PAID ONLINE (DELIVERY)' : 'PAID ONLINE (COLLECTION)')
      : (order.type === 'dine-in' ? 'DINE-IN (PAY WITH STAFF)' : 'COLLECTION ORDER');
    const subject = `🚨 ${statusText}: Order #${order.id} (£${Number(order.total).toFixed(2)}) — Taste of Village`;
    const text = formatOrderPlainText(order);
    const html = formatOrderHtml(order);

    const branchId = order.tenant_id === LOCATIONS.slough.tenant_id ? 'slough' : 'hayes';
    const storeEmails = getStoreNotificationEmails(branchId);
    const recipients = [...storeEmails];
    if (order.customerEmail && !recipients.includes(order.customerEmail.trim())) {
      recipients.push(order.customerEmail.trim());
    }

    await addDoc(collection(db, 'mail'), {
      to: recipients,
      ...(order.customerEmail ? { replyTo: order.customerEmail.trim() } : {}),
      message: { subject, text, html },
      orderId: order.id,
      timestamp: new Date().toISOString(),
      status: 'queued',
    });

    console.log(`[EmailService] Order notification queued for ${recipients.join(', ')} (Order: ${order.id})`);
  } catch (err) {
    console.warn('[EmailService] Failed to queue email notification:', err);
  }
}
