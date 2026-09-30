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
const sloughToken = env.SQUARE_SLOUGH_ACCESS_TOKEN;

async function checkRecentPayments(tokenName, locationToken) {
  if (!locationToken) return;
  const url = `https://connect.squareup.com/v2/payments?sort_order=DESC&limit=15`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${locationToken}`,
      'Square-Version': '2023-12-13',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) return;

  const data = await res.json();
  const payments = data.payments || [];
  console.log(`\n--- ${tokenName} (Last 15) ---`);
  
  for (const p of payments) {
    const amount = p.amount_money ? (p.amount_money.amount / 100).toFixed(2) : '0.00';
    let details = '';
    if (p.card_details && p.card_details.card) {
       details = `Card: ${p.card_details.card.card_brand} ${p.card_details.card.last_4} | Wallet: ${p.card_details.wallet_details ? p.card_details.wallet_details.status : 'None'} | Entry: ${p.card_details.entry_method}`;
    } else if (p.wallet_details) {
       details = `Wallet: ${JSON.stringify(p.wallet_details)}`;
    } else if (p.cash_details) {
       details = `Cash`;
    } else {
       details = `Other`;
    }
    console.log(`£${amount} | ${new Date(p.created_at).toLocaleTimeString('en-GB')} | ${p.status} | ${details}`);
  }
}

async function run() {
  await checkRecentPayments('HAYES', token);
  await checkRecentPayments('SLOUGH', sloughToken);
}
run();
