/**
 * Square Checkout — Creates itemised payment links via Square Payment Links API.
 *
 * Uses the inline Order approach: one API call creates both the Order (with
 * individual line items visible on POS/KDS) and the hosted payment link.
 *
 * Replaces the old quick_pay approach which showed a single lump sum.
 */

import crypto from 'crypto';
import { LOCATIONS, type LocationId } from '@/config/shopConfig';

export interface CheckoutLineItem {
  name: string;
  quantity: number;
  pricePence: number;
  note?: string;
}

export interface CheckoutResult {
  url: string | null;
  orderId: string | null;
  referenceId: string;
}

/**
 * Create a Square Payment Link with itemised line items.
 *
 * The order appears on the in-store POS/KDS with individual items,
 * delivery fee, and fulfillment type.
 */
export async function createItemisedCheckoutLink(options: {
  branchId: LocationId;
  items: CheckoutLineItem[];
  isDelivery: boolean;
  deliveryFeePence?: number;
  customerName?: string;
  customerPhone?: string;
  streetAddress?: string;
  postcode?: string;
}): Promise<CheckoutResult> {
  const {
    branchId,
    items,
    isDelivery,
    deliveryFeePence = 0,
    customerName,
    streetAddress,
    postcode,
  } = options;

  const loc = LOCATIONS[branchId];
  const token = branchId === 'hayes'
    ? process.env.SQUARE_HAYES_ACCESS_TOKEN
    : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;
  const locationId = loc.square.locationId;

  if (!token) {
    console.error(`[Square] Missing SQUARE_${branchId.toUpperCase()}_ACCESS_TOKEN`);
    return { url: `https://tasteofvillagerestaurants.co.uk/${branchId}/menu`, orderId: null, referenceId: '' };
  }

  // ── Build line items ──────────────────────────────────────────────
  const lineItems = items.map(item => ({
    name: String(item.name).slice(0, 500),
    quantity: String(Math.max(1, item.quantity)),
    base_price_money: { amount: Math.round(item.pricePence), currency: 'GBP' },
    ...(item.note ? { note: String(item.note).slice(0, 500) } : {}),
  }));

  if (isDelivery && deliveryFeePence > 0) {
    lineItems.push({
      name: '🚗 Local Delivery Fee',
      quantity: '1',
      base_price_money: { amount: deliveryFeePence, currency: 'GBP' },
    });
  }

  if (lineItems.length === 0) {
    console.error('[Square] Cannot create payment link with zero items');
    return { url: null, orderId: null, referenceId: '' };
  }

  const displayName = customerName || 'WhatsApp Customer';
  const referenceId = `TOV-WA-${Date.now()}`;

  const ticketName = isDelivery && streetAddress
    ? `DELIV: ${streetAddress}, ${postcode || ''} — WA ${displayName}`
    : `${isDelivery ? 'DELIVERY' : 'Pickup'} — WA ${displayName}`;

  const payload = {
    idempotency_key: crypto.createHash('sha256').update(referenceId).digest('hex'),
    order: {
      location_id: locationId,
      reference_id: referenceId,
      line_items: lineItems,
      ticket_name: ticketName.slice(0, 100),
    },
    checkout_options: {
      ask_for_shipping_address: isDelivery,
      accepted_payment_methods: { apple_pay: true, google_pay: true },
    },
  };

  try {
    const res = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-08-21',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('[Square] Itemised checkout error, attempting QuickPay fallback:', JSON.stringify(data.errors || data));
      const totalPence = items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0) + deliveryFeePence;
      return await createQuickPayFallbackLink({
        branchId,
        totalPence,
        memo: `Taste of Village ${isDelivery ? 'Delivery' : 'Collection'} Order (${displayName})`,
        isDelivery,
      });
    }

    return {
      url: data.payment_link?.long_url || data.payment_link?.url || null,
      orderId: data.payment_link?.order_id || referenceId,
      referenceId,
    };
  } catch (error) {
    console.error('[Square] Fetch error, attempting QuickPay fallback:', error);
    const totalPence = items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0) + deliveryFeePence;
    return await createQuickPayFallbackLink({
      branchId,
      totalPence,
      memo: `Taste of Village ${isDelivery ? 'Delivery' : 'Collection'} Order (${displayName})`,
      isDelivery,
    });
  }
}

/**
 * Fallback: lump-sum QuickPay payment link (mirrors Falooda & Co resilient checkout).
 * Guarantees that a customer ALWAYS receives a working payment link.
 */
export async function createQuickPayFallbackLink(options: {
  branchId: LocationId;
  totalPence: number;
  memo: string;
  isDelivery: boolean;
}): Promise<CheckoutResult> {
  const { branchId, totalPence, memo, isDelivery } = options;
  const loc = LOCATIONS[branchId];
  const token = branchId === 'hayes'
    ? process.env.SQUARE_HAYES_ACCESS_TOKEN
    : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;
  const locationId = loc.square.locationId;
  const referenceId = `TOV-QP-${Date.now()}`;

  if (!token) {
    console.error(`[Square QuickPay] Missing token for ${branchId}`);
    return { url: `https://tasteofvillagerestaurants.co.uk/${branchId}/menu`, orderId: null, referenceId };
  }

  try {
    const res = await fetch('https://connect.squareup.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Square-Version': '2024-08-21',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: crypto.createHash('sha256').update(referenceId).digest('hex'),
        quick_pay: {
          name: memo,
          price_money: { amount: Math.max(50, totalPence), currency: 'GBP' },
          location_id: locationId,
        },
        checkout_options: {
          ask_for_shipping_address: isDelivery,
          accepted_payment_methods: { apple_pay: true, google_pay: true },
        },
      }),
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    return {
      url: data.payment_link?.long_url || data.payment_link?.url || `https://tasteofvillagerestaurants.co.uk/${branchId}/menu`,
      orderId: data.payment_link?.order_id || referenceId,
      referenceId,
    };
  } catch (err) {
    console.error('[Square QuickPay Fallback Exception]:', err);
    return { url: `https://tasteofvillagerestaurants.co.uk/${branchId}/menu`, orderId: null, referenceId };
  }
}

/**
 * Verify if a Square order has been paid by checking the 'tenders' array
 */
export async function verifySquareOrderPayment(
  orderId: string,
  branchId: LocationId
): Promise<boolean> {
  const token = branchId === 'hayes'
    ? process.env.SQUARE_HAYES_ACCESS_TOKEN
    : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;

  if (!token) {
    console.error(`[Square Verify] Missing token for ${branchId}`);
    return false;
  }

  try {
    const res = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Square-Version': '2024-08-21',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn('[Square Verify] Order fetch failed:', await res.text());
      return false;
    }

    const data = await res.json();
    const tenders = data?.order?.tenders || [];
    return tenders.length > 0;
  } catch (err) {
    console.error('[Square Verify] Exception:', err);
    return false;
  }
}
