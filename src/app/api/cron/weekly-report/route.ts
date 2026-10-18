import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendTelegramMessage } from '@/lib/telegramService';

/**
 * GET /api/cron/weekly-report?period=weekly|monthly
 *
 * Comprehensive KPI report — called by Vercel Cron:
 *  - Weekly: every Sunday at 9 AM UK time
 *  - Monthly: 1st of each month at 9 AM UK time
 *
 * Aggregates data from Square Orders API (both branches) and Firestore
 * (customers, reward_redemptions, vouchers), then sends an HTML summary
 * to the owner via Telegram.
 *
 * Protected by CRON_SECRET in the Authorization header.
 */

const SQUARE_BASE_URL = 'https://connect.squareup.com';
const SQUARE_API_VERSION = '2024-08-21';

interface BranchConfig {
  name: string;
  locationId: string;
  tokenEnvKey: 'SQUARE_HAYES_ACCESS_TOKEN' | 'SQUARE_SLOUGH_ACCESS_TOKEN';
}

const BRANCHES: BranchConfig[] = [
  { name: 'Hayes', locationId: 'LW0Z07P1KP8HB', tokenEnvKey: 'SQUARE_HAYES_ACCESS_TOKEN' },
  { name: 'Slough', locationId: 'LD40KJ3QHAPGK', tokenEnvKey: 'SQUARE_SLOUGH_ACCESS_TOKEN' },
];

// ── Square Types ─────────────────────────────────────────────────────────

interface SquareLineItem {
  name?: string;
  quantity?: string;
  total_money?: { amount?: number; currency?: string };
}

interface SquareOrder {
  id: string;
  created_at?: string;
  total_money?: { amount?: number; currency?: string };
  line_items?: SquareLineItem[];
  state?: string;
}

interface SquareOrdersSearchResponse {
  orders?: SquareOrder[];
  cursor?: string;
}

// ── Branch Stats ─────────────────────────────────────────────────────────

interface BranchStats {
  branchName: string;
  totalOrders: number;
  totalRevenuePence: number;
  aovPence: number;
  topDishes: { name: string; quantity: number }[];
}

// ── Fetch Orders from Square ─────────────────────────────────────────────

async function fetchOrders(
  token: string,
  locationId: string,
  startAt: string,
  endAt: string,
): Promise<SquareOrder[]> {
  const allOrders: SquareOrder[] = [];
  let cursor: string | undefined;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_API_VERSION,
  };

  do {
    const body: Record<string, unknown> = {
      location_ids: [locationId],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: startAt,
              end_at: endAt,
            },
          },
          state_filter: {
            states: ['COMPLETED'],
          },
        },
        sort: { sort_field: 'CREATED_AT', sort_order: 'DESC' },
      },
      limit: 500,
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const res = await fetch(`${SQUARE_BASE_URL}/v2/orders/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`[Weekly Report] Square API error for ${locationId}:`, errData);
      break;
    }

    const data = (await res.json()) as SquareOrdersSearchResponse;
    if (data.orders) {
      allOrders.push(...data.orders);
    }
    cursor = data.cursor;
  } while (cursor);

  return allOrders;
}

// ── Aggregate Branch Stats ───────────────────────────────────────────────

function aggregateBranchStats(branchName: string, orders: SquareOrder[]): BranchStats {
  let totalRevenuePence = 0;
  const dishCounts = new Map<string, number>();

  for (const order of orders) {
    totalRevenuePence += order.total_money?.amount ?? 0;

    if (order.line_items) {
      for (const item of order.line_items) {
        const name = item.name || 'Unknown Item';
        const qty = parseInt(item.quantity || '1', 10);
        dishCounts.set(name, (dishCounts.get(name) || 0) + qty);
      }
    }
  }

  // Top 5 dishes by quantity
  const topDishes = Array.from(dishCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  const aovPence = orders.length > 0 ? Math.round(totalRevenuePence / orders.length) : 0;

  return {
    branchName,
    totalOrders: orders.length,
    totalRevenuePence,
    aovPence,
    topDishes,
  };
}

// ── Firestore Queries ────────────────────────────────────────────────────

async function getCustomerStats(startAt: string, endAt: string) {
  const customersRef = adminDb.collection('customers');

  // Total customers
  const totalSnap = await customersRef.count().get();
  const totalCustomers = totalSnap.data().count;

  // New customers in the period
  const newCustomersSnap = await customersRef
    .where('createdAt', '>=', startAt)
    .where('createdAt', '<=', endAt)
    .count()
    .get();
  const newCustomers = newCustomersSnap.data().count;

  // Active loyalty members (those with loyaltyPoints > 0)
  const loyaltySnap = await customersRef
    .where('loyaltyPoints', '>', 0)
    .count()
    .get();
  const activeLoyalty = loyaltySnap.data().count;

  // Total loyalty points issued across all customers
  // We sum the loyaltyPoints field; this gives current balances (not lifetime issued),
  // but it's the best available metric without a separate ledger.
  const allCustomersSnap = await customersRef
    .where('loyaltyPoints', '>', 0)
    .select('loyaltyPoints')
    .get();
  let totalPointsBalance = 0;
  allCustomersSnap.forEach(doc => {
    totalPointsBalance += doc.data().loyaltyPoints || 0;
  });

  return {
    totalCustomers,
    newCustomers,
    activeLoyalty,
    totalPointsBalance,
  };
}

async function getRewardStats(startAt: string, endAt: string) {
  const redemptionsRef = adminDb.collection('reward_redemptions');

  // Rewards claimed (created) in this period
  const claimedSnap = await redemptionsRef
    .where('createdAt', '>=', startAt)
    .where('createdAt', '<=', endAt)
    .count()
    .get();
  const claimed = claimedSnap.data().count;

  // Rewards redeemed (used at restaurant) in this period
  const redeemedSnap = await redemptionsRef
    .where('redeemedAt', '>=', startAt)
    .where('redeemedAt', '<=', endAt)
    .count()
    .get();
  const redeemed = redeemedSnap.data().count;

  return { claimed, redeemed };
}

async function getVoucherStats(startAt: string, endAt: string) {
  const vouchersRef = adminDb.collection('vouchers');

  // First-time packs issued in this period (source = 'auto_first_order' or 'web_check_in', type = 'FIRST_TIME_50')
  const firstTimeSnap = await vouchersRef
    .where('type', '==', 'FIRST_TIME_50')
    .where('createdAt', '>=', startAt)
    .where('createdAt', '<=', endAt)
    .count()
    .get();
  // Each pack has 3 FIRST_TIME_50 vouchers, so divide by 3 for pack count
  const firstTimeVouchersIssued = firstTimeSnap.data().count;
  const firstTimePacksIssued = Math.round(firstTimeVouchersIssued / 3);

  // Vouchers redeemed (usedCount > 0) in this period
  // Since vouchers don't have a 'redeemedAt' field, we check status='exhausted'
  // and createdAt within range for newly issued+used ones.
  // Better approach: count all vouchers with usedCount >= 1 that were created in this period.
  const redeemedSnap = await vouchersRef
    .where('status', '==', 'exhausted')
    .where('createdAt', '>=', startAt)
    .where('createdAt', '<=', endAt)
    .count()
    .get();
  const codesRedeemed = redeemedSnap.data().count;

  return {
    firstTimePacksIssued,
    codesRedeemed,
  };
}

// ── Formatting Helpers ───────────────────────────────────────────────────

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Build Telegram HTML Report ───────────────────────────────────────────

function buildTelegramReport(
  period: 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date,
  branches: BranchStats[],
  customerStats: Awaited<ReturnType<typeof getCustomerStats>>,
  rewardStats: Awaited<ReturnType<typeof getRewardStats>>,
  voucherStats: Awaited<ReturnType<typeof getVoucherStats>>,
): string {
  const periodLabel = period === 'weekly' ? 'Weekly' : 'Monthly';
  const periodNoun = period === 'weekly' ? 'week' : 'month';

  const totalOrders = branches.reduce((s, b) => s + b.totalOrders, 0);
  const totalRevenuePence = branches.reduce((s, b) => s + b.totalRevenuePence, 0);
  const overallAov = totalOrders > 0 ? Math.round(totalRevenuePence / totalOrders) : 0;

  // Branch sections
  const branchLines = branches.map(b =>
    `🏪 <b>${b.branchName}</b>\n` +
    `• Orders: ${b.totalOrders} | Revenue: ${formatPence(b.totalRevenuePence)} | AOV: ${formatPence(b.aovPence)}`
  ).join('\n\n');

  // Top dishes across all branches (combined)
  const combinedDishes = new Map<string, number>();
  for (const b of branches) {
    for (const d of b.topDishes) {
      combinedDishes.set(d.name, (combinedDishes.get(d.name) || 0) + d.quantity);
    }
  }
  const topDishesLines = Array.from(combinedDishes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty], i) => `  ${i + 1}. ${name} (×${qty})`)
    .join('\n');

  const enrollmentRate = customerStats.totalCustomers > 0
    ? ((customerStats.activeLoyalty / customerStats.totalCustomers) * 100).toFixed(1)
    : '0.0';

  return [
    `📊 <b>TOV ${periodLabel} Report</b>`,
    `📅 ${formatDate(startDate)} — ${formatDate(endDate)}`,
    '',
    `📈 <b>Overview</b>`,
    `• Total orders: ${totalOrders} | Revenue: ${formatPence(totalRevenuePence)} | AOV: ${formatPence(overallAov)}`,
    '',
    branchLines,
    '',
    `👥 <b>Customers</b>`,
    `• Total: ${customerStats.totalCustomers} | New this ${periodNoun}: ${customerStats.newCustomers}`,
    `• Active loyalty: ${customerStats.activeLoyalty} (${enrollmentRate}%) | Points balance: ${customerStats.totalPointsBalance.toLocaleString()}`,
    '',
    `🎁 <b>Rewards</b>`,
    `• Claimed: ${rewardStats.claimed} | Redeemed: ${rewardStats.redeemed}`,
    '',
    `🎫 <b>Vouchers</b>`,
    `• First-time packs issued: ${voucherStats.firstTimePacksIssued}`,
    `• Codes redeemed: ${voucherStats.codesRedeemed}`,
    '',
    `🍽️ <b>Top Dishes</b>`,
    topDishesLines || '  No order data available',
  ].join('\n');
}

// ── Route Handler ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    // ── Auth: verify Vercel Cron secret ────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Determine period ──────────────────────────────────────────────
    const periodParam = req.nextUrl.searchParams.get('period') || 'weekly';
    const period: 'weekly' | 'monthly' = periodParam === 'monthly' ? 'monthly' : 'weekly';

    const now = new Date();
    let startDate: Date;

    if (period === 'monthly') {
      // First day of the previous month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else {
      // 7 days ago
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startAt = startDate.toISOString();
    const endAt = now.toISOString();

    console.info(`[Weekly Report] Generating ${period} report for ${startAt} → ${endAt}`);

    // ── Fetch all data in parallel ────────────────────────────────────
    const [branchResults, customerStats, rewardStats, voucherStats] = await Promise.all([
      // Square orders for each branch
      Promise.all(
        BRANCHES.map(async (branch) => {
          const token = process.env[branch.tokenEnvKey];
          if (!token) {
            console.error(`[Weekly Report] Missing token for ${branch.name} (${branch.tokenEnvKey})`);
            return aggregateBranchStats(branch.name, []);
          }
          const orders = await fetchOrders(token, branch.locationId, startAt, endAt);
          console.info(`[Weekly Report] ${branch.name}: fetched ${orders.length} completed orders`);
          return aggregateBranchStats(branch.name, orders);
        }),
      ),
      // Firestore: customer metrics
      getCustomerStats(startAt, endAt),
      // Firestore: reward redemptions
      getRewardStats(startAt, endAt),
      // Firestore: vouchers
      getVoucherStats(startAt, endAt),
    ]);

    // ── Build and send Telegram report ────────────────────────────────
    const reportHtml = buildTelegramReport(
      period,
      startDate,
      now,
      branchResults,
      customerStats,
      rewardStats,
      voucherStats,
    );

    const chatId = process.env.TELEGRAM_OWNER_CHAT_ID;
    if (!chatId) {
      console.error('[Weekly Report] TELEGRAM_OWNER_CHAT_ID not set');
      return NextResponse.json({ error: 'TELEGRAM_OWNER_CHAT_ID not configured' }, { status: 500 });
    }

    const sendResult = await sendTelegramMessage(chatId, reportHtml, 'HTML');

    if (!sendResult.ok) {
      console.error(`[Weekly Report] Failed to send Telegram message: ${sendResult.error}`);
      return NextResponse.json(
        { error: 'Failed to send Telegram report', detail: sendResult.error },
        { status: 500 },
      );
    }

    console.info(`[Weekly Report] ${period} report sent to Telegram (msgId: ${sendResult.messageId})`);

    // ── Return summary ────────────────────────────────────────────────
    const totalOrders = branchResults.reduce((s, b) => s + b.totalOrders, 0);
    const totalRevenuePence = branchResults.reduce((s, b) => s + b.totalRevenuePence, 0);

    return NextResponse.json({
      success: true,
      period,
      dateRange: { start: startAt, end: endAt },
      summary: {
        totalOrders,
        totalRevenue: formatPence(totalRevenuePence),
        newCustomers: customerStats.newCustomers,
        rewardsClaimed: rewardStats.claimed,
        rewardsRedeemed: rewardStats.redeemed,
        telegramMessageId: sendResult.messageId,
      },
      branches: branchResults.map(b => ({
        name: b.branchName,
        orders: b.totalOrders,
        revenue: formatPence(b.totalRevenuePence),
        aov: formatPence(b.aovPence),
      })),
    });
  } catch (err) {
    console.error('[Weekly Report] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
