const fs = require('fs');
const path = require('path');

// Parse .env.local manually
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
const locationId = 'LW0Z07P1KP8HB';

if (!token) {
  console.error('Missing SQUARE_HAYES_ACCESS_TOKEN');
  process.exit(1);
}

async function testFetch() {
  const beginTime = '2026-07-01T00:00:00Z';
  const endTime = '2026-09-30T23:59:59Z';
  const url = `https://connect.squareup.com/v2/payments?location_id=${locationId}&begin_time=${beginTime}&end_time=${endTime}&limit=100`;

  console.log('Fetching payments from Square...');
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Square-Version': '2026-07-15',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Square API error:', res.status, text);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`First page received. Payments count: ${data.payments?.length || 0}`);
  if (data.cursor) {
    console.log('Pagination cursor present:', data.cursor.slice(0, 20) + '...');
  }
}

testFetch();
