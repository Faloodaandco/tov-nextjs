/**
 * Square Checkout — Creates itemised payment links via Square Payment Links API.
 *
 * Uses the inline Order approach: one API call creates both the Order (with
 * individual line items visible on POS/KDS) and the hosted payment link.
 *
 * Replaces the old quick_pay approach which showed a single lump sum.
 */

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
    idempotency_key: crypto.randomUUID(),
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
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[Square] Payment link error:', JSON.stringify(data.errors || data));
      return { url: null, orderId: null, referenceId };
    }

    return {
      url: data.payment_link?.long_url || data.payment_link?.url || null,
      orderId: data.payment_link?.order_id || referenceId,
      referenceId,
    };
  } catch (error) {
    console.error('[Square] Fetch error:', error);
    return { url: null, orderId: null, referenceId };
  }
}
