// TODO: Replace with real WhatsApp Business API calls once WABA number is approved for TOV

/**
 * Meta WABA API Structure Reference:
 * POST https://graph.facebook.com/v17.0/{{Phone-Number-ID}}/messages
 * Headers:
 *   Authorization: Bearer {{System-User-Access-Token}}
 *   Content-Type: application/json
 * Body:
 * {
 *   "messaging_product": "whatsapp",
 *   "to": "447123456789",
 *   "type": "template",
 *   "template": {
 *     "name": "voucher_offer",
 *     "language": { "code": "en_GB" },
 *     "components": [
 *       {
 *         "type": "body",
 *         "parameters": [
 *           { "type": "text", "text": "TOV20" }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */

export async function sendVoucherMessage(phone: string, voucherCode: string, discountPercent: number) {
  console.info(`[WhatsApp] SKELETON: Sending ${discountPercent}% voucher ${voucherCode} to ${phone}`);
  return { sent: false, reason: 'WABA_NOT_APPROVED' };
}

export async function sendOrderConfirmation(phone: string, orderId: string, total: number) {
  console.info(`[WhatsApp] SKELETON: Sending order confirmation for ${orderId} (£${total.toFixed(2)}) to ${phone}`);
  return { sent: false, reason: 'WABA_NOT_APPROVED' };
}

export async function sendWeeklyOffer(phone: string, offerText: string) {
  console.info(`[WhatsApp] SKELETON: Sending weekly offer "${offerText}" to ${phone}`);
  return { sent: false, reason: 'WABA_NOT_APPROVED' };
}
