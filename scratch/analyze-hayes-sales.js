const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const token = env.SQUARE_HAYES_ACCESS_TOKEN;
const locationId = 'LW0Z07P1KP8HB'; // Taste Of Village Hayes

if (!token) {
  console.error('Missing SQUARE_HAYES_ACCESS_TOKEN');
  process.exit(1);
}

// Convert UTC ISO to London hour (0-23) and day of week
function getLondonTimeDetails(isoString) {
  const d = new Date(isoString);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  
  const parts = formatter.formatToParts(d);
  const partMap = {};
  for (const p of parts) partMap[p.type] = p.value;

  const hour = parseInt(partMap.hour, 10);
  const month = `${partMap.year}-${partMap.month}`;
  const weekday = partMap.weekday;

  return { hour, month, weekday, d };
}

async function fetchAllPayments() {
  const beginTime = '2026-07-01T00:00:00Z';
  const endTime = '2026-09-30T23:59:59Z';
  let cursor = null;
  const allPayments = [];
  let page = 1;

  console.log('Fetching Hayes sales data from Square API (2026-07-01 to 2026-09-30)...');

  do {
    let url = `https://connect.squareup.com/v2/payments?location_id=${locationId}&begin_time=${beginTime}&end_time=${endTime}&limit=100`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Square-Version': '2026-07-15',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Page ${page} failed: ${res.status} - ${err}`);
      break;
    }

    const data = await res.json();
    const payments = data.payments || [];
    allPayments.push(...payments);
    cursor = data.cursor || null;

    process.stdout.write(`Page ${page}: ${payments.length} payments (Total so far: ${allPayments.length})\r`);
    page++;

    // Brief delay to stay well under rate limits
    if (cursor) {
      await new Promise(r => setTimeout(r, 150));
    }
  } while (cursor);

  console.log(`\nFetch complete! Total payments retrieved: ${allPayments.length}`);
  return allPayments;
}

function analyze(payments) {
  // Filter for completed payments with GBP amount
  const completed = payments.filter(p => p.status === 'COMPLETED' && p.amount_money?.amount);
  console.log(`Completed transactions: ${completed.length} (out of ${payments.length})`);

  let totalRevenuePence = 0;
  let totalTipPence = 0;

  // Monthly stats
  const monthly = {};

  // Hourly stats (0-23)
  const hourly = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: 0,
    revenuePence: 0,
  }));

  // Dayparts:
  // 1. Morning / Breakfast: 09:00 - 12:00 (Hours 9, 10, 11)
  // 2. Lunch: 12:00 - 15:00 (Hours 12, 13, 14)
  // 3. Afternoon / Happy Hours: 15:00 - 18:00 (Hours 15, 16, 17)
  // 4. Peak Dinner Rush: 18:00 - 22:00 (Hours 18, 19, 20, 21)
  // 5. Late Night: 22:00 - 03:00 (Hours 22, 23, 0, 1, 2)
  // 6. Closed / Early AM: 03:00 - 09:00 (Hours 3, 4, 5, 6, 7, 8)
  const dayparts = {
    morning_breakfast: { name: 'Morning / Breakfast (09:00 - 12:00)', hours: [9, 10, 11], count: 0, revenuePence: 0 },
    lunch: { name: 'Lunch Rush (12:00 - 15:00)', hours: [12, 13, 14], count: 0, revenuePence: 0 },
    happy_hours_afternoon: { name: 'Afternoon / Happy Hours (15:00 - 18:00)', hours: [15, 16, 17], count: 0, revenuePence: 0 },
    peak_dinner: { name: 'Peak Dinner Rush (18:00 - 22:00)', hours: [18, 19, 20, 21], count: 0, revenuePence: 0 },
    late_night: { name: 'Late Night (22:00 - 02:00)', hours: [22, 23, 0, 1], count: 0, revenuePence: 0 },
    other_early: { name: 'Overnight / Pre-Open (02:00 - 09:00)', hours: [2, 3, 4, 5, 6, 7, 8], count: 0, revenuePence: 0 },
  };

  // Payment methods
  const methods = {};

  for (const p of completed) {
    const amount = Number(p.amount_money.amount);
    const tip = Number(p.tip_money?.amount || 0);
    totalRevenuePence += amount;
    totalTipPence += tip;

    const source = p.source_type || 'OTHER';
    methods[source] = (methods[source] || 0) + amount;

    const { hour, month } = getLondonTimeDetails(p.created_at);

    // Monthly
    if (!monthly[month]) {
      monthly[month] = { count: 0, revenuePence: 0 };
    }
    monthly[month].count++;
    monthly[month].revenuePence += amount;

    // Hourly
    if (hourly[hour]) {
      hourly[hour].count++;
      hourly[hour].revenuePence += amount;
    }

    // Daypart
    for (const dp of Object.values(dayparts)) {
      if (dp.hours.includes(hour)) {
        dp.count++;
        dp.revenuePence += amount;
        break;
      }
    }
  }

  const totalRevenue = totalRevenuePence / 100;
  const avgOrderValue = completed.length > 0 ? (totalRevenue / completed.length) : 0;

  console.log('\n======================================================');
  console.log('       TASTE OF VILLAGE HAYES — SALES ANALYSIS        ');
  console.log('              (July 2026 – September 2026)           ');
  console.log('======================================================');
  console.log(`Total Gross Revenue:   £${totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`Total Transactions:    ${completed.length}`);
  console.log(`Overall AOV:           £${avgOrderValue.toFixed(2)}`);
  console.log(`Total Tips Recorded:   £${(totalTipPence / 100).toFixed(2)}`);

  console.log('\n── MONTHLY BREAKDOWN ──');
  for (const [m, stat] of Object.entries(monthly).sort()) {
    const rev = stat.revenuePence / 100;
    const aov = stat.count > 0 ? (rev / stat.count) : 0;
    const share = ((stat.revenuePence / totalRevenuePence) * 100).toFixed(1);
    console.log(`  ${m}: £${rev.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${stat.count} orders | AOV £${aov.toFixed(2)} (${share}%)`);
  }

  console.log('\n── DAYPART COMPARISON (Morning vs Happy Hours vs Peak) ──');
  for (const dp of Object.values(dayparts)) {
    const rev = dp.revenuePence / 100;
    const aov = dp.count > 0 ? (rev / dp.count) : 0;
    const share = totalRevenuePence > 0 ? ((dp.revenuePence / totalRevenuePence) * 100).toFixed(1) : '0';
    console.log(`  • ${dp.name.padEnd(42)}: £${rev.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(10)} | ${String(dp.count).padStart(5)} orders | AOV £${aov.toFixed(2).padStart(6)} | ${share.padStart(5)}% share`);
  }

  console.log('\n── HOURLY DISTRIBUTION (London Time) ──');
  console.log('  Hour  | Revenue (£) | Orders | AOV (£) | Share (%) | Visual Bar');
  console.log('  ------+-------------+--------+---------+-----------+-------------------------');
  const maxHourlyRev = Math.max(...hourly.map(h => h.revenuePence));
  for (const h of hourly) {
    const rev = h.revenuePence / 100;
    const aov = h.count > 0 ? (rev / h.count) : 0;
    const share = totalRevenuePence > 0 ? ((h.revenuePence / totalRevenuePence) * 100).toFixed(1) : '0';
    const barLen = maxHourlyRev > 0 ? Math.round((h.revenuePence / maxHourlyRev) * 25) : 0;
    const bar = '█'.repeat(barLen);
    const hourStr = `${String(h.hour).padStart(2, '0')}:00`;
    console.log(`  ${hourStr} | £${rev.toFixed(2).padStart(9)} | ${String(h.count).padStart(6)} | £${aov.toFixed(2).padStart(5)} | ${share.padStart(8)}% | ${bar}`);
  }

  console.log('\n── PAYMENT METHODS ──');
  for (const [method, pence] of Object.entries(methods)) {
    const rev = pence / 100;
    const share = ((pence / totalRevenuePence) * 100).toFixed(1);
    console.log(`  ${method}: £${rev.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${share}%)`);
  }

  // Save JSON summary for reference
  const summary = {
    branch: 'Taste Of Village Hayes',
    period: '2026-07-01 to 2026-09-30',
    totalRevenue,
    totalTransactions: completed.length,
    overallAOV: avgOrderValue,
    monthly,
    dayparts,
    hourly,
    methods,
  };

  fs.writeFileSync(path.resolve(__dirname, 'hayes-sales-report.json'), JSON.stringify(summary, null, 2));
  console.log('\nReport written to scratch/hayes-sales-report.json');
}

fetchAllPayments().then(analyze).catch(err => console.error('Analysis failed:', err));
