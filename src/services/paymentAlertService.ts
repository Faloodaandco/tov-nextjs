import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const DEVELOPER_ALERT_EMAIL = 'sales@tekrenewed.co.uk';

export interface PaymentFailureDetails {
  orderId?: string;
  branchName: string;
  branchId: string;
  errorMessage: string;
  errorCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cartTotal: number;
  paymentMethod: 'card' | 'apple_pay' | 'google_pay' | 'unknown';
  sourceId?: string;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Queues a high-priority payment failure alert email to developers via the Firestore `mail` collection.
 * Non-blocking safe execution prevents disruptions to the customer checkout flow.
 */
export async function sendPaymentFailureAlert(details: PaymentFailureDetails): Promise<void> {
  try {
    const rawOrderId = details.orderId?.trim();
    const orderId = rawOrderId || 'N/A';
    const cleanBranch = details.branchName.replace(/^Taste\s+of\s+Village\s+/i, '').trim();
    const branchName = cleanBranch || details.branchName;
    const subject = `🚨 PAYMENT FAILURE: Order #${orderId} — Taste of Village ${branchName}`;

    const now = new Date();
    const isoTimestamp = now.toISOString();
    const formattedDate = now.toLocaleString('en-GB', {
      timeZone: 'Europe/London',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    const formattedTotal = `£${Number(details.cartTotal || 0).toFixed(2)}`;
    const errorCode = details.errorCode || 'N/A';
    const customerName = details.customerName?.trim() || 'Not provided';
    const customerPhone = details.customerPhone?.trim() || 'Not provided';
    const customerEmail = details.customerEmail?.trim() || 'Not provided';
    const sourceId = details.sourceId?.trim() || 'N/A';

    const text = [
      '🚨 PAYMENT FAILURE ALERT',
      '==============================================',
      `Order ID:         #${orderId}`,
      `Branch:           Taste of Village ${branchName} (${details.branchId})`,
      `Cart Total:       ${formattedTotal}`,
      `Payment Method:   ${details.paymentMethod}`,
      `Timestamp:        ${formattedDate} (${isoTimestamp})`,
      '----------------------------------------------',
      'SQUARE ERROR INFORMATION:',
      `Error Code:       ${errorCode}`,
      `Error Message:    ${details.errorMessage}`,
      `Source ID:        ${sourceId}`,
      '----------------------------------------------',
      'CUSTOMER INFORMATION:',
      `Name:             ${customerName}`,
      `Phone:            ${customerPhone}`,
      `Email:            ${customerEmail}`,
      '==============================================',
    ].join('\n');

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #b91c1c; padding: 20px 28px; text-align: left;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fecaca;">
                Taste of Village • Payment Gateway Monitor
              </p>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                🚨 Payment Failure Alert
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 28px 16px 28px; background-color: #fef2f2; border-bottom: 1px solid #fee2e2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d; width: 120px; font-weight: 600;">Order:</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #991b1b; font-weight: 700;">#${escapeHtml(orderId)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d; font-weight: 600;">Branch:</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #991b1b; font-weight: 600;">Taste of Village ${escapeHtml(branchName)} (${escapeHtml(details.branchId)})</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d; font-weight: 600;">Cart Total:</td>
                  <td style="padding: 4px 0; font-size: 16px; color: #991b1b; font-weight: 800;">${escapeHtml(formattedTotal)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d; font-weight: 600;">Payment Method:</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #991b1b; font-weight: 600;">${escapeHtml(details.paymentMethod)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d; font-weight: 600;">Timestamp:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #7f1d1d;">${escapeHtml(formattedDate)} <span style="font-size: 11px; opacity: 0.85;">(${escapeHtml(isoTimestamp)})</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 28px 12px 28px;">
              <h2 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; font-weight: 700;">
                Square Gateway Error
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b; width: 120px;">Error Code:</td>
                  <td style="padding: 4px 0; font-size: 13px; font-family: monospace; font-weight: 700; color: #dc2626;">${escapeHtml(errorCode)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b; vertical-align: top;">Error Message:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 500; line-height: 1.4;">${escapeHtml(details.errorMessage)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b;">Source ID:</td>
                  <td style="padding: 4px 0; font-size: 12px; font-family: monospace; color: #475569;">${escapeHtml(sourceId)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 28px 28px 28px;">
              <h2 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #475569; font-weight: 700;">
                Customer Contact Details
              </h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; background-color: #ffffff;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b; width: 120px;">Name:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${escapeHtml(customerName)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b;">Phone:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #0f172a;">${escapeHtml(customerPhone)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; font-weight: 600; color: #64748b;">Email:</td>
                  <td style="padding: 4px 0; font-size: 13px; color: #0f172a;">${escapeHtml(customerEmail)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Taste of Village Online Ordering System • Automated Server Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await addDoc(collection(db, 'mail'), {
      to: [DEVELOPER_ALERT_EMAIL],
      ...(details.customerEmail?.trim() ? { replyTo: details.customerEmail.trim() } : {}),
      message: {
        subject,
        text,
        html,
      },
      paymentFailureDetails: {
        ...details,
        timestamp: isoTimestamp,
      },
      timestamp: isoTimestamp,
      status: 'queued',
    });

    console.info(`[PaymentAlertService] Payment failure alert queued for ${DEVELOPER_ALERT_EMAIL} (Order: #${orderId})`);
  } catch (error) {
    console.warn('[PaymentAlertService] Failed to queue payment failure alert:', error);
  }
}
