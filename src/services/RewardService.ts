/**
 * Loyalty Reward Redemption Service
 *
 * Handles the lifecycle of redeemable loyalty rewards:
 *  1. Customer accumulates points via orders
 *  2. Customer claims a reward (points → reward voucher)
 *  3. System generates a unique REWARD-XXXX code + QR link
 *  4. Staff scans QR at restaurant → confirms → reward marked redeemed
 *
 * Firestore collection: 'reward_redemptions'
 */
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { phoneToDocId, TIER_NAMES } from './serverCustomerService';

const COLLECTION = 'reward_redemptions';

// ── Rewards Catalogue ──────────────────────────────────────────────────

export interface RewardTier {
  id: string;
  pointsCost: number;
  title: string;
  description: string;
  icon: string;
  /** If set, generates a £X discount voucher instead of a free item */
  discountPounds?: number;
}

export const REWARDS_CATALOGUE: RewardTier[] = [
  { id: 'voucher_5', pointsCost: 100, title: '£5 OFF Voucher', description: 'Redeemable on any order', icon: '🎫', discountPounds: 5 },
  { id: 'free_dessert', pointsCost: 200, title: 'Free Dessert', description: 'Gulab Jamun or Rasmalai', icon: '🍨' },
  { id: 'free_mixed_grill', pointsCost: 500, title: 'Free Mixed Grill', description: 'Sizzling Charcoal Platter', icon: '🥩' },
  { id: 'vip_chefs_table', pointsCost: 1000, title: "VIP Chef's Table", description: 'Exclusive dining for two', icon: '👑' },
];

// ── Reward Redemption Document ─────────────────────────────────────────

export interface RewardRedemption {
  code: string;
  phone: string;
  customerName: string;
  rewardId: string;            // e.g. 'free_dessert'
  rewardTitle: string;
  rewardDescription: string;
  pointsSpent: number;
  status: 'active' | 'redeemed' | 'expired';
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  redeemedBy?: string;         // staff identifier
  redeemedAtBranch?: string;
  /** For discount-type rewards — used by Square checkout */
  discountPounds?: number;
}

// ── Claim a Reward (points → voucher) ──────────────────────────────────

/**
 * Claims a reward for a customer. Deducts points and creates a
 * reward redemption document with a unique short code.
 *
 * Returns the reward code and redemption URL.
 *
 * @throws Error if insufficient points or invalid reward
 */
export async function claimReward(
  phone: string,
  rewardId: string,
): Promise<{ code: string; reward: RewardRedemption; redeemUrl: string }> {
  const reward = REWARDS_CATALOGUE.find(r => r.id === rewardId);
  if (!reward) {
    throw new Error(`Unknown reward: ${rewardId}`);
  }

  const docId = phoneToDocId(phone);
  const customerRef = adminDb.collection('customers').doc(docId);

  // Use a transaction to atomically check + deduct points
  const result = await adminDb.runTransaction(async (tx) => {
    const customerSnap = await tx.get(customerRef);
    if (!customerSnap.exists) {
      throw new Error('Customer account not found. Place an order first to start earning points.');
    }

    const customer = customerSnap.data()!;
    const currentPoints = customer.loyaltyPoints || 0;

    if (currentPoints < reward.pointsCost) {
      throw new Error(
        `Not enough points. You have ${currentPoints} but need ${reward.pointsCost} for ${reward.title}.`
      );
    }

    // Generate a short, memorable code
    const code = `RWD-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90-day expiry

    const redemption: RewardRedemption = {
      code,
      phone,
      customerName: customer.confirmedName || customer.name || 'Customer',
      rewardId: reward.id,
      rewardTitle: reward.title,
      rewardDescription: reward.description,
      pointsSpent: reward.pointsCost,
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ...(reward.discountPounds ? { discountPounds: reward.discountPounds } : {}),
    };

    // Deduct points
    tx.update(customerRef, {
      loyaltyPoints: FieldValue.increment(-reward.pointsCost),
      updatedAt: now.toISOString(),
    });

    // Create redemption document (use code as doc ID for fast lookups)
    const redeemRef = adminDb.collection(COLLECTION).doc(code);
    tx.set(redeemRef, redemption);

    return { code, redemption };
  });

  const redeemUrl = `https://tasteofvillagerestaurants.co.uk/redeem/${result.code}`;

  console.info(`[Reward] ${result.code} claimed by ${phone} — ${reward.title} (${reward.pointsCost} pts)`);

  return {
    code: result.code,
    reward: result.redemption,
    redeemUrl,
  };
}

// ── Validate a Reward Code (staff-side lookup) ────────────────────────

/**
 * Looks up a reward redemption by its code.
 * Used by the staff-facing /redeem/[code] page.
 */
export async function getRedemption(code: string): Promise<RewardRedemption | null> {
  const cleanCode = code.trim().toUpperCase();
  const snap = await adminDb.collection(COLLECTION).doc(cleanCode).get();

  if (!snap.exists) return null;

  const redemption = snap.data() as RewardRedemption;

  // Auto-expire if past expiry date
  if (redemption.status === 'active' && new Date() > new Date(redemption.expiresAt)) {
    await snap.ref.update({ status: 'expired' });
    return { ...redemption, status: 'expired' };
  }

  return redemption;
}

// ── Redeem a Reward (staff confirms) ──────────────────────────────────

/**
 * Staff confirms the reward has been given to the customer.
 * Marks the redemption as used — irreversible.
 *
 * @param code The reward code
 * @param staffId Identifier for the staff member (e.g. "counter", "manager")
 * @param branch The branch where redeemed
 */
export async function redeemReward(
  code: string,
  staffId: string,
  branch: string,
): Promise<RewardRedemption> {
  const cleanCode = code.trim().toUpperCase();
  const ref = adminDb.collection(COLLECTION).doc(cleanCode);

  const result = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      throw new Error('Reward code not found.');
    }

    const redemption = snap.data() as RewardRedemption;

    if (redemption.status === 'redeemed') {
      throw new Error(`Already redeemed on ${redemption.redeemedAt} at ${redemption.redeemedAtBranch}.`);
    }

    if (redemption.status === 'expired' || new Date() > new Date(redemption.expiresAt)) {
      throw new Error('This reward has expired.');
    }

    const now = new Date().toISOString();
    tx.update(ref, {
      status: 'redeemed',
      redeemedAt: now,
      redeemedBy: staffId,
      redeemedAtBranch: branch,
    });

    return { ...redemption, status: 'redeemed' as const, redeemedAt: now, redeemedBy: staffId, redeemedAtBranch: branch };
  });

  console.info(`[Reward] ${cleanCode} redeemed by ${staffId} at ${branch}`);

  return result;
}

// ── Get All Active Rewards for a Customer ──────────────────────────────

export async function getCustomerRewards(phone: string): Promise<RewardRedemption[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where('phone', '==', phone)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  return snapshot.docs.map(doc => doc.data() as RewardRedemption);
}
