/**
 * Email notification service stub.
 * The actual email sending is handled server-side via Cloud Functions.
 * This client-side function is a no-op placeholder.
 */
export async function sendOrderNotificationEmail(
  _orderId: string,
  _customerEmail: string,
  _orderDetails: any
): Promise<void> {
  // Server-side only — no-op on client
  console.log('[Email] Order notification would be sent server-side');
}
