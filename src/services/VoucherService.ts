import { adminDb } from '@/lib/firebaseAdmin';

// ── Types ──────────────────────────────────────────────────────────────

export interface Voucher {
  code: string;
  phone: string;
  branch: 'hayes' | 'slough' | 'all';
  type: 'FIRST_TIME_50' | 'RETURNING_30' | 'CAMPAIGN';
  discountPercent: number;
  minOrderPence: number;
  maxUses: number;
  usedCount: number;
  usedOrderIds: string[];
  expiresAt: string;
  createdAt: string;
  source: 'web_check_in' | 'auto_first_order' | 'qr_bag_insert' | 'admin_manual';
  status: 'active' | 'exhausted' | 'expired' | 'revoked';
}

export interface VoucherValidationResult {
  valid: boolean;
  discountPercent: number;
  reason: string;
  voucherId: string | null;
  voucherType: Voucher['type'] | null;
}

// ── Service ────────────────────────────────────────────────────────────

const COLLECTION = 'vouchers';

/**
 * Validates a voucher code against the Firestore voucher registry.
 *
 * Checks performed (in order):
 *  1. Code existence in Firestore
 *  2. Phone ownership (voucher belongs to this customer)
 *  3. Branch eligibility (50% is Hayes-only)
 *  4. Revocation status
 *  5. Expiry (30-day window from creation)
 *  6. Usage count (single-use per voucher document)
 *  7. Minimum order value (£50 for 50% vouchers)
 */
export async function validateVoucher(
  code: string,
  phone: string,
  branchId: string,
  subtotalPence: number,
): Promise<VoucherValidationResult> {
  const cleanCode = code.trim().toUpperCase();

  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('code', '==', cleanCode)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return { valid: false, discountPercent: 0, reason: 'Voucher code not found.', voucherId: null, voucherType: null };
  }

  const voucherDoc = snapshot.docs[0];
  const voucher = voucherDoc.data() as Voucher;

  // Phone ownership
  if (voucher.phone !== phone) {
    return { valid: false, discountPercent: 0, reason: 'This voucher belongs to a different account.', voucherId: null, voucherType: null };
  }

  // Branch eligibility (50% Hayes only)
  if (voucher.branch !== 'all' && voucher.branch !== branchId) {
    const branchName = voucher.branch === 'hayes' ? 'Hayes' : 'Slough';
    return { valid: false, discountPercent: 0, reason: `This voucher is only valid at our ${branchName} branch.`, voucherId: null, voucherType: null };
  }

  // Revoked
  if (voucher.status === 'revoked') {
    return { valid: false, discountPercent: 0, reason: 'This voucher has been revoked.', voucherId: null, voucherType: null };
  }

  // Expired
  if (new Date() > new Date(voucher.expiresAt)) {
    return { valid: false, discountPercent: 0, reason: 'This voucher has expired. Vouchers are valid for 30 days.', voucherId: null, voucherType: null };
  }

  // Already used (each voucher doc is single-use)
  if (voucher.usedCount >= voucher.maxUses) {
    return { valid: false, discountPercent: 0, reason: 'This voucher has already been used.', voucherId: null, voucherType: null };
  }

  // Minimum order
  if (subtotalPence < voucher.minOrderPence) {
    const minPounds = (voucher.minOrderPence / 100).toFixed(2);
    return { valid: false, discountPercent: 0, reason: `Minimum order of £${minPounds} required for this voucher.`, voucherId: null, voucherType: null };
  }

  return {
    valid: true,
    discountPercent: voucher.discountPercent,
    reason: 'Voucher applied successfully.',
    voucherId: voucherDoc.id,
    voucherType: voucher.type,
  };
}

/**
 * Marks a voucher as used after successful payment.
 * Called ONLY after Square payment confirmation — never before.
 */
export async function redeemVoucher(voucherId: string, orderId: string): Promise<void> {
  const voucherRef = adminDb.collection(COLLECTION).doc(voucherId);
  const voucherSnap = await voucherRef.get();
  if (!voucherSnap.exists) return;

  const voucher = voucherSnap.data() as Voucher;
  const newCount = voucher.usedCount + 1;

  await voucherRef.update({
    usedCount: newCount,
    usedOrderIds: [...voucher.usedOrderIds, orderId],
    status: newCount >= voucher.maxUses ? 'exhausted' : 'active',
  });

  console.info(`[Voucher] Redeemed ${voucher.code} for order ${orderId} (${newCount}/${voucher.maxUses} uses)`);
}

/**
 * Issues the first-time buyer voucher pack:
 *  - 3× TOV50-xxxx (50% off, Hayes only, min £50, single-use each)
 *  - 2× TOV30-xxxx (30% off, all branches, no min, single-use each)
 * All expire 30 days from now.
 */
export async function issueFirstTimeBuyerPack(
  phone: string,
  source: Voucher['source'] = 'auto_first_order',
): Promise<string[]> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const codes: string[] = [];

  const batch = adminDb.batch();

  // 3× 50% vouchers (Hayes only, min £50)
  for (let i = 0; i < 3; i++) {
    const code = `TOV50-${Math.floor(1000 + Math.random() * 9000)}`;
    const ref = adminDb.collection(COLLECTION).doc();
    batch.set(ref, {
      code,
      phone,
      branch: 'hayes',
      type: 'FIRST_TIME_50',
      discountPercent: 50,
      minOrderPence: 5000,
      maxUses: 1,
      usedCount: 0,
      usedOrderIds: [],
      expiresAt,
      createdAt: now.toISOString(),
      source,
      status: 'active',
    } satisfies Voucher);
    codes.push(code);
  }

  // 2× 30% vouchers (all branches, no minimum)
  for (let i = 0; i < 2; i++) {
    const code = `TOV30-${Math.floor(1000 + Math.random() * 9000)}`;
    const ref = adminDb.collection(COLLECTION).doc();
    batch.set(ref, {
      code,
      phone,
      branch: 'all',
      type: 'RETURNING_30',
      discountPercent: 30,
      minOrderPence: 0,
      maxUses: 1,
      usedCount: 0,
      usedOrderIds: [],
      expiresAt,
      createdAt: now.toISOString(),
      source,
      status: 'active',
    } satisfies Voucher);
    codes.push(code);
  }

  await batch.commit();
  console.info(`[Voucher] Issued first-time buyer pack to ${phone}: ${codes.join(', ')}`);
  return codes;
}

/**
 * Checks if a phone number has any prior completed orders.
 * Used to determine first-time buyer eligibility.
 */
export async function isFirstTimeBuyer(phone: string): Promise<boolean> {
  const snapshot = await adminDb
    .collection('orders')
    .where('customerPhone', '==', phone)
    .where('status', '==', 'paid')
    .limit(1)
    .get();

  return snapshot.empty;
}

/**
 * Checks if a phone number already has active (non-exhausted, non-expired) vouchers.
 * Prevents duplicate voucher pack issuance.
 */
export async function hasActiveVouchers(phone: string): Promise<boolean> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('phone', '==', phone)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  return !snapshot.empty;
}
