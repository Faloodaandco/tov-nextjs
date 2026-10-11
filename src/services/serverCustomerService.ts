/**
 * Server-side customer profile service (Firebase Admin SDK).
 *
 * Used by Square webhooks and WABA webhooks — runs server-side only.
 * The client-side customerService.ts uses the client SDK for /rewards page.
 * Both write to the same Firestore 'customers' collection.
 */
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const CUSTOMERS_COLLECTION = 'customers';

export interface ServerCustomerRecord {
  phone: string;
  name: string;
  confirmedName?: string | null;
  totalSpent: number;
  orderCount: number;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold';
  lastOrderAt: string;
  lastOrderItems?: string[];
  preferredBranch?: string;
  branchOrderCounts?: Record<string, number>;
  marketingOptIn?: boolean;
  marketingConsentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Strips non-digit chars and forces UK 44 format */
export function phoneToDocId(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('07')) {
    digits = '44' + digits.substring(1);
  }
  return digits;
}

/** Calculate loyalty tier from points */
export function calculateLoyaltyTier(points: number): 'bronze' | 'silver' | 'gold' {
  if (points >= 1000) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

/** Tier display names matching /rewards page */
export const TIER_NAMES: Record<string, string> = {
  bronze: 'Silver Village',
  silver: 'Gold Heritage',
  gold: 'Platinum Reserve',
};

/**
 * Create or update a customer after a paid order (server-side).
 * Returns the updated customer record for use in confirmation messages.
 *
 * Non-fatal on error — NEVER blocks the payment confirmation.
 */
export async function serverUpsertCustomerOnOrder(
  phone: string,
  name: string,
  orderTotalPounds: number,
  branchId: string,
  itemNames: string[],
): Promise<ServerCustomerRecord | null> {
  try {
    const docId = phoneToDocId(phone);
    const ref = adminDb.collection(CUSTOMERS_COLLECTION).doc(docId);
    const snap = await ref.get();
    const now = new Date().toISOString();
    const pointsEarned = Math.max(1, Math.floor(orderTotalPounds));

    if (snap.exists) {
      const existing = snap.data() as Partial<ServerCustomerRecord>;
      const newPoints = (existing.loyaltyPoints || 0) + pointsEarned;
      const newOrderCount = (existing.orderCount || 0) + 1;
      const newTotalSpent = (existing.totalSpent || 0) + orderTotalPounds;

      // Update branch affinity
      const branchCounts = existing.branchOrderCounts || {};
      branchCounts[branchId] = (branchCounts[branchId] || 0) + 1;
      const preferredBranch = Object.entries(branchCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || branchId;

      await ref.update({
        name: existing.confirmedName ? existing.name : name, // Don't overwrite confirmed name
        totalSpent: FieldValue.increment(orderTotalPounds),
        orderCount: FieldValue.increment(1),
        loyaltyPoints: FieldValue.increment(pointsEarned),
        loyaltyTier: calculateLoyaltyTier(newPoints),
        lastOrderAt: now,
        lastOrderItems: itemNames.slice(0, 10),
        preferredBranch,
        branchOrderCounts: branchCounts,
        updatedAt: now,
      });

      return {
        phone,
        name: existing.confirmedName || existing.name || name,
        confirmedName: existing.confirmedName || null,
        totalSpent: newTotalSpent,
        orderCount: newOrderCount,
        loyaltyPoints: newPoints,
        loyaltyTier: calculateLoyaltyTier(newPoints),
        lastOrderAt: now,
        lastOrderItems: itemNames,
        preferredBranch,
        branchOrderCounts: branchCounts,
        marketingOptIn: existing.marketingOptIn,
        marketingConsentAt: existing.marketingConsentAt || null,
        createdAt: existing.createdAt || now,
        updatedAt: now,
      };
    } else {
      // New customer
      const newRecord: ServerCustomerRecord = {
        phone,
        name,
        confirmedName: null,
        totalSpent: orderTotalPounds,
        orderCount: 1,
        loyaltyPoints: pointsEarned,
        loyaltyTier: 'bronze',
        lastOrderAt: now,
        lastOrderItems: itemNames,
        preferredBranch: branchId,
        branchOrderCounts: { [branchId]: 1 },
        marketingOptIn: false,
        marketingConsentAt: null,
        createdAt: now,
        updatedAt: now,
      };
      await ref.set(newRecord);
      return newRecord;
    }
  } catch (error) {
    console.error('[serverUpsertCustomerOnOrder] Non-fatal error:', error);
    return null;
  }
}

/** Confirm customer's preferred name (called from WABA webhook) */
export async function confirmCustomerName(phone: string, confirmedName: string): Promise<void> {
  try {
    const docId = phoneToDocId(phone);
    await adminDb.collection(CUSTOMERS_COLLECTION).doc(docId).update({
      confirmedName,
      name: confirmedName,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[confirmCustomerName] Error:', error);
  }
}

/** Set marketing opt-in with GDPR timestamp */
export async function setMarketingOptIn(phone: string, optIn: boolean): Promise<void> {
  try {
    const docId = phoneToDocId(phone);
    await adminDb.collection(CUSTOMERS_COLLECTION).doc(docId).update({
      marketingOptIn: optIn,
      marketingConsentAt: optIn ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[setMarketingOptIn] Error:', error);
  }
}
