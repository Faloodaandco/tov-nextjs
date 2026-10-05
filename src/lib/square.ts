export async function createQuickPayFallback(
  isDelivery: boolean,
  basePence: number,
  orderRef: string,
  deliveryFeePence: number = 0
) {
  // STRICT SEPARATION: Using explicit Hayes environment variables
  const token = process.env.SQUARE_HAYES_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_HAYES_LOCATION_ID;

  if (!token || !locationId) {
    console.error('[Square API] Missing SQUARE_HAYES_ACCESS_TOKEN or SQUARE_HAYES_LOCATION_ID in .env');
    return { url: 'https://tasteofvillagerestaurants.co.uk/menu', orderId: null };
  }

  const idempotencyKey = crypto.randomUUID();
  const orderId = `TOV-${Date.now()}`;

  const lineItems = [
    {
      name: orderRef,
      quantity: '1',
      base_price_money: { amount: basePence, currency: 'GBP' },
    }
  ];

  if (isDelivery && deliveryFeePence > 0) {
    lineItems.push({
      name: 'Private Driver Delivery Fee',
      quantity: '1',
      base_price_money: { amount: deliveryFeePence, currency: 'GBP' },
    });
  }

  const payload = {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: `Taste of Village Hayes - ${isDelivery ? 'Delivery' : 'Collection'}`,
      price_money: {
        amount: basePence + (isDelivery ? deliveryFeePence : 0),
        currency: 'GBP'
      },
      location_id: locationId
    },
    checkout_options: {
      ask_for_shipping_address: isDelivery,
      accepted_payment_methods: {
        apple_pay: true,
        google_pay: true,
      }
    }
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
    return { url: data.payment_link?.url || null, orderId };
  } catch (error) {
    console.error('[Square API] Fetch error:', error);
    return { url: null, orderId: null };
  }
}
