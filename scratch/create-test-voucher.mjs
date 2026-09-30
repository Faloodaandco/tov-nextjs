/**
 * Create test vouchers in Firestore using ADC.
 * Run: node scratch/create-test-voucher.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({ projectId: 'taste-of-village-21052' });
const db = getFirestore(app);

const testPhone = '+447000000001';
const now = new Date();
const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

const vouchers = [
  {
    code: 'TOV50-TEST-0001',
    phone: testPhone,
    discountPercent: 50,
    type: 'first_time_buyer',
    branch: 'hayes',
    minOrderPence: 5000,
    usageCount: 0,
    maxUsage: 1,
    issuedAt: now.toISOString(),
    expiresAt: thirtyDaysLater.toISOString(),
    revoked: false,
    source: 'manual_test',
  },
  {
    code: 'TOV30-TEST-0001',
    phone: testPhone,
    discountPercent: 30,
    type: 'returning_buyer',
    branch: 'hayes',
    minOrderPence: 0,
    usageCount: 0,
    maxUsage: 1,
    issuedAt: now.toISOString(),
    expiresAt: thirtyDaysLater.toISOString(),
    revoked: false,
    source: 'manual_test',
  },
];

console.log('Creating test vouchers...');

for (const v of vouchers) {
  const ref = await db.collection('vouchers').add(v);
  console.log(`  Created ${v.code} -> doc ID: ${ref.id}`);
}

console.log(`\nTest phone: ${testPhone}`);
console.log('Done.');
process.exit(0);
