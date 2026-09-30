import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/cron/discount-report
 *
 * Weekly discount report — called by Vercel Cron every Monday at 8 AM UK time.
 * Queries Square Orders API for both Hayes and Slough branches,
 * aggregates discount usage, and emails a branded summary.
 *
 * Protected by CRON_SECRET in the Authorization header.
 */

const SQUARE_BASE_URL = 'https://connect.squareup.com';
const SQUARE_API_VERSION = '2026-07-15';
const REPORT_RECIPIENT = 'info@tasteofvillagerestaurants.co.uk';

interface BranchConfig {
  name: string;
  locationId: string;
  tokenEnvKey: 'SQUARE_HAYES_ACCESS_TOKEN' | 'SQUARE_SLOUGH_ACCESS_TOKEN';
}

const BRANCHES: BranchConfig[] = [
  { name: 'Hayes', locationId: 'LW0Z07P1KP8HB', tokenEnvKey: 'SQUARE_HAYES_ACCESS_TOKEN' },
  { name: 'Slough', locationId: 'LD40KJ3QHAPGK', tokenEnvKey: 'SQUARE_SLOUGH_ACCESS_TOKEN' },
];

interface DiscountAggregate {
  name: string;
  totalAmountPence: number;
  orderCount: number;
}

interface BranchReport {
  branchName: string;
  totalOrders: number;
  discountedOrders: number;
  discounts: DiscountAggregate[];
  totalDiscountPence: number;
}

interface SquareDiscount {
  name?: string;
  applied_money?: { amount?: number; currency?: string };
  type?: string;
}

interface SquareOrder {
  id: string;
  created_at?: string;
  discounts?: SquareDiscount[];
}

interface SquareOrdersSearchResponse {
  orders?: SquareOrder[];
  cursor?: string;
}

/**
 * Fetches all orders from Square for a branch within the given date range.
 * Handles cursor-based pagination.
 */
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
      console.error(`[Discount Report] Square API error for ${locationId}:`, errData);
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

/**
 * Aggregates discounts from a list of orders into a branch report.
 */
function aggregateDiscounts(branchName: string, orders: SquareOrder[]): BranchReport {
  const discountMap = new Map<string, DiscountAggregate>();
  let discountedOrders = 0;
  let totalDiscountPence = 0;

  for (const order of orders) {
    if (!order.discounts || order.discounts.length === 0) continue;

    discountedOrders++;

    for (const discount of order.discounts) {
      const discountName = discount.name || 'Unnamed Discount';
      const amountPence = discount.applied_money?.amount ?? 0;
      totalDiscountPence += amountPence;

      const existing = discountMap.get(discountName);
      if (existing) {
        existing.totalAmountPence += amountPence;
        existing.orderCount += 1;
      } else {
        discountMap.set(discountName, {
          name: discountName,
          totalAmountPence: amountPence,
          orderCount: 1,
        });
      }
    }
  }

  // Sort by total discount amount descending
  const discounts = Array.from(discountMap.values()).sort(
    (a, b) => b.totalAmountPence - a.totalAmountPence,
  );

  return {
    branchName,
    totalOrders: orders.length,
    discountedOrders,
    discounts,
    totalDiscountPence,
  };
}

/** Formats pence as a GBP string, e.g. 1250 → "£12.50" */
function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

/** Formats a date as "DD MMM YYYY" */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Builds the HTML email body for the weekly discount report.
 */
function buildEmailHtml(reports: BranchReport[], periodStart: Date, periodEnd: Date): string {
  const grandTotalDiscountPence = reports.reduce((sum, r) => sum + r.totalDiscountPence, 0);
  const grandTotalDiscountedOrders = reports.reduce((sum, r) => sum + r.discountedOrders, 0);
  const grandTotalOrders = reports.reduce((sum, r) => sum + r.totalOrders, 0);

  const branchSections = reports.map((report) => {
    if (report.discounts.length === 0) {
      return `
        <div style="margin-bottom: 28px;">
          <h2 style="font-size: 18px; color: #1C2D22; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #a64036;">
            📍 ${report.branchName}
          </h2>
          <p style="font-size: 14px; color: #5A4A3E;">
            ${report.totalOrders} orders processed — <strong>no discounts applied</strong> this period.
          </p>
        </div>
      `;
    }

    const discountRows = report.discounts.map((d) => {
      const avgPence = d.orderCount > 0 ? Math.round(d.totalAmountPence / d.orderCount) : 0;
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0eae1; color: #1C2D22; font-size: 13px;">${d.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0eae1; text-align: center; color: #5A4A3E; font-size: 13px;">${d.orderCount}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0eae1; text-align: right; color: #a64036; font-weight: bold; font-size: 13px;">${formatPence(d.totalAmountPence)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #f0eae1; text-align: right; color: #5A4A3E; font-size: 13px;">${formatPence(avgPence)}</td>
        </tr>
      `;
    }).join('');

    const discountRate = report.totalOrders > 0
      ? ((report.discountedOrders / report.totalOrders) * 100).toFixed(1)
      : '0.0';

    return `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 18px; color: #1C2D22; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #a64036;">
          📍 ${report.branchName}
        </h2>
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="background: #F4F8F5; border-radius: 8px; padding: 12px 16px; flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: 900; color: #1C2D22;">${report.totalOrders}</div>
            <div style="font-size: 11px; color: #8C7A6B; text-transform: uppercase; letter-spacing: 1px;">Total Orders</div>
          </div>
          <div style="background: #FDF9F3; border-radius: 8px; padding: 12px 16px; flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: 900; color: #a64036;">${report.discountedOrders}</div>
            <div style="font-size: 11px; color: #8C7A6B; text-transform: uppercase; letter-spacing: 1px;">Discounted (${discountRate}%)</div>
          </div>
          <div style="background: #FDF9F3; border-radius: 8px; padding: 12px 16px; flex: 1; text-align: center;">
            <div style="font-size: 22px; font-weight: 900; color: #a64036;">${formatPence(report.totalDiscountPence)}</div>
            <div style="font-size: 11px; color: #8C7A6B; text-transform: uppercase; letter-spacing: 1px;">Total Discounts</div>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #1C2D22;">
              <th style="padding: 10px 12px; text-align: left; color: #FAF6F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Discount Name</th>
              <th style="padding: 10px 12px; text-align: center; color: #FAF6F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Orders</th>
              <th style="padding: 10px 12px; text-align: right; color: #FAF6F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
              <th style="padding: 10px 12px; text-align: right; color: #FAF6F0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Avg/Order</th>
            </tr>
          </thead>
          <tbody>
            ${discountRows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #FAF6F0; border-radius: 16px; overflow: hidden; border: 1px solid #E6DFD5;">
      <div style="background-color: #1C2D22; padding: 24px; text-align: center;">
        <h1 style="color: #FAF6F0; margin: 0; font-size: 22px; letter-spacing: 1px;">TASTE OF VILLAGE</h1>
        <p style="color: #D3A762; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Weekly Discount Report</p>
      </div>
      <div style="padding: 24px;">
        <div style="background: #ffffff; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; border: 1px solid #E6DFD5;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #8C7A6B;">
            📅 <strong>Period:</strong> ${formatDate(periodStart)} — ${formatDate(periodEnd)}
          </p>
          <p style="margin: 0; font-size: 13px; color: #8C7A6B;">
            📊 <strong>Summary:</strong> ${grandTotalDiscountedOrders} discounted orders out of ${grandTotalOrders} total · <strong style="color: #a64036;">${formatPence(grandTotalDiscountPence)}</strong> in discounts
          </p>
        </div>
        ${branchSections}
      </div>
      <div style="padding: 16px 24px; background: #1C2D22; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #8C9B89;">
          Automated weekly report · Taste of Village · Generated ${formatDate(new Date())}
        </p>
      </div>
    </div>
  `;
}

/**
 * Builds a plain-text version of the report for email clients without HTML.
 */
function buildEmailText(reports: BranchReport[], periodStart: Date, periodEnd: Date): string {
  const lines: string[] = [
    'TASTE OF VILLAGE — Weekly Discount Report',
    '='.repeat(50),
    `Period: ${formatDate(periodStart)} — ${formatDate(periodEnd)}`,
    '',
  ];

  for (const report of reports) {
    lines.push(`── ${report.branchName} ──`);
    lines.push(`Total Orders: ${report.totalOrders}`);
    lines.push(`Discounted Orders: ${report.discountedOrders}`);
    lines.push(`Total Discounts: ${formatPence(report.totalDiscountPence)}`);
    lines.push('');

    if (report.discounts.length === 0) {
      lines.push('No discounts applied this period.');
    } else {
      for (const d of report.discounts) {
        const avgPence = d.orderCount > 0 ? Math.round(d.totalAmountPence / d.orderCount) : 0;
        lines.push(`• ${d.name}: ${d.orderCount} orders, ${formatPence(d.totalAmountPence)} total, ${formatPence(avgPence)} avg`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

export async function GET(req: NextRequest) {
  try {
    // ── Auth: verify Vercel Cron secret ──────────────────────────────
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Discount Report] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Date range: past 7 days ─────────────────────────────────────
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startAt = sevenDaysAgo.toISOString();
    const endAt = now.toISOString();

    console.info(`[Discount Report] Generating report for ${startAt} → ${endAt}`);

    // ── Fetch orders from both branches in parallel ─────────────────
    const branchReports: BranchReport[] = [];

    const fetchPromises = BRANCHES.map(async (branch) => {
      const token = process.env[branch.tokenEnvKey];
      if (!token) {
        console.error(`[Discount Report] Missing token for ${branch.name} (${branch.tokenEnvKey})`);
        return aggregateDiscounts(branch.name, []);
      }

      const orders = await fetchOrders(token, branch.locationId, startAt, endAt);
      console.info(`[Discount Report] ${branch.name}: fetched ${orders.length} orders`);
      return aggregateDiscounts(branch.name, orders);
    });

    const results = await Promise.all(fetchPromises);
    branchReports.push(...results);

    // ── Build email ─────────────────────────────────────────────────
    const subject = `📊 Weekly Discount Report — ${formatDate(sevenDaysAgo)} to ${formatDate(now)}`;
    const html = buildEmailHtml(branchReports, sevenDaysAgo, now);
    const text = buildEmailText(branchReports, sevenDaysAgo, now);

    // ── Queue email via Firestore mail collection ───────────────────
    await adminDb.collection('mail').add({
      to: [REPORT_RECIPIENT],
      message: { subject, text, html },
      reportType: 'weekly_discount',
      periodStart: startAt,
      periodEnd: endAt,
      timestamp: now.toISOString(),
      status: 'pending',
    });

    const grandTotal = branchReports.reduce((s, r) => s + r.totalDiscountPence, 0);
    const grandDiscountedOrders = branchReports.reduce((s, r) => s + r.discountedOrders, 0);

    console.info(
      `[Discount Report] Email queued: ${grandDiscountedOrders} discounted orders, ${formatPence(grandTotal)} total discounts`,
    );

    return NextResponse.json({
      success: true,
      period: { start: startAt, end: endAt },
      branches: branchReports.map((r) => ({
        name: r.branchName,
        totalOrders: r.totalOrders,
        discountedOrders: r.discountedOrders,
        totalDiscount: formatPence(r.totalDiscountPence),
        discountCount: r.discounts.length,
      })),
    });
  } catch (err) {
    console.error('[Discount Report] Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to generate discount report' }, { status: 500 });
  }
}
