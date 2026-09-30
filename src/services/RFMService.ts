import { LocationId, LOCATIONS } from '@/config/shopConfig';

export interface RFMResult {
  segment: 'VIP' | 'At-Risk' | 'Lapsed' | 'New' | 'Regular';
  recency: number;
  frequency: number;
  monetary: number;
}

export async function calculateRFMSegment(phone: string, branch: LocationId): Promise<RFMResult> {
  const token = branch === 'hayes'
    ? process.env.SQUARE_HAYES_ACCESS_TOKEN
    : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;

  if (!token) {
    throw new Error(`Missing Square access token for branch: ${branch}`);
  }

  const loc = LOCATIONS[branch];
  const locationId = loc.square.locationId;
  const squareBaseUrl = 'https://connect.squareup.com';
  const squareHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': '2026-07-15',
  };

  // Format phone
  let formattedPhone = String(phone || '').trim().replace(/\s+/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '+44' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('44') && !formattedPhone.startsWith('+')) {
    formattedPhone = '+' + formattedPhone;
  }

  // 1. Find Customer ID by phone
  const searchCustomerRes = await fetch(`${squareBaseUrl}/v2/customers/search`, {
    method: 'POST',
    headers: squareHeaders,
    body: JSON.stringify({
      query: { filter: { phone_number: { exact: formattedPhone } } }
    }),
  });

  let customerId: string | null = null;
  if (searchCustomerRes.ok) {
    const searchCustomerData = await searchCustomerRes.json();
    if (searchCustomerData.customers && searchCustomerData.customers.length > 0) {
      customerId = searchCustomerData.customers[0].id;
    }
  }

  if (!customerId) {
    return { segment: 'New', recency: 0, frequency: 0, monetary: 0 };
  }

  // 2. Fetch Orders for customer
  const searchOrdersRes = await fetch(`${squareBaseUrl}/v2/orders/search`, {
    method: 'POST',
    headers: squareHeaders,
    body: JSON.stringify({
      location_ids: [locationId],
      query: {
        filter: {
          customer_filter: {
            customer_ids: [customerId]
          },
          state_filter: {
            states: ['COMPLETED']
          }
        },
        sort: {
          sort_field: 'CREATED_AT',
          sort_order: 'DESC'
        }
      }
    }),
  });

  if (!searchOrdersRes.ok) {
    throw new Error('Failed to fetch orders from Square');
  }

  const ordersData = await searchOrdersRes.json();
  const orders = ordersData.orders || [];

  if (orders.length === 0) {
    return { segment: 'New', recency: 0, frequency: 0, monetary: 0 };
  }

  // Calculate RFM
  const now = new Date().getTime();
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
  
  let recency = Infinity;
  let frequency = 0;
  let totalMonetary = 0;
  let validOrdersCount = 0;

  for (const order of orders) {
    if (!order.created_at) continue;
    const orderTime = new Date(order.created_at).getTime();
    
    // Recency: days since last order
    const daysSince = (now - orderTime) / (1000 * 60 * 60 * 24);
    if (daysSince < recency) {
      recency = daysSince;
    }

    // Frequency: orders in last 90 days
    if (orderTime >= ninetyDaysAgo) {
      frequency++;
    }

    // Monetary
    const amount = order.total_money?.amount ? Number(order.total_money.amount) / 100 : 0;
    totalMonetary += amount;
    validOrdersCount++;
  }

  if (recency === Infinity) {
    recency = 0;
  }
  
  const monetary = validOrdersCount > 0 ? totalMonetary / validOrdersCount : 0;

  // Segment Classification
  // VIP (R<=7, F>=8, M>=avg*1.5) - Wait, we don't have global average here. We'll assume a threshold or just compare against their own average? The instructions say "M>=avg*1.5" - let's assume a hardcoded avg like 30, so 45. Or we can just omit the strict M check if we don't have global avg, or use 30 as avg. I'll use 30 as avg (45 threshold).
  // Instruction: VIP (R<=7, F>=8, M>=avg*1.5), At-Risk (R>=30, F>=3), Lapsed (R>=60), New (F<=2)
  const GLOBAL_AVG_ORDER = 30; // Approximation

  let segment: RFMResult['segment'] = 'Regular';

  if (recency <= 7 && frequency >= 8 && monetary >= (GLOBAL_AVG_ORDER * 1.5)) {
    segment = 'VIP';
  } else if (recency >= 60) {
    segment = 'Lapsed';
  } else if (recency >= 30 && frequency >= 3) {
    segment = 'At-Risk';
  } else if (frequency <= 2) {
    segment = 'New';
  }

  return {
    segment,
    recency: Math.floor(recency),
    frequency,
    monetary: Number(monetary.toFixed(2))
  };
}
