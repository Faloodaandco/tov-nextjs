import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CUSTOMERS_COLLECTION = 'customers';

export interface CustomerRecord {
  id: string;
  phone: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  loyaltyPoints: number;
  lastOrderAt: string;
  createdAt: string;
}

/** Strips non-digit chars and forces 44 format */
export function phoneToDocId(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('07')) {
    digits = '44' + digits.substring(1);
  }
  return digits;
}

/** Lookup customer by phone. Returns null if not found or phone too short. */
export async function getCustomer(phone: string): Promise<CustomerRecord | null> {
  try {
    if (!phone || phone.length < 5) return null;
    const docId = phoneToDocId(phone);
    const snap = await getDoc(doc(db, CUSTOMERS_COLLECTION, docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as CustomerRecord;
  } catch (error) {
    console.error('getCustomer error:', error);
    return null;
  }
}

/**
 * Create or update a customer after an order.
 * If exists: increment totalSpent, orderCount, loyaltyPoints (1 pt per £1), update lastOrderAt and name.
 * If new: create with initial values.
 * Non-fatal on error.
 */
export async function upsertCustomerOnOrder(
  phone: string,
  name: string,
  orderTotal: number
): Promise<void> {
  try {
    const docId = phoneToDocId(phone);
    const ref = doc(db, CUSTOMERS_COLLECTION, docId);
    const snap = await getDoc(ref);
    const now = new Date().toISOString();
    const points = Math.floor(orderTotal);

    if (snap.exists()) {
      await updateDoc(ref, {
        name,
        totalSpent: increment(orderTotal),
        orderCount: increment(1),
        loyaltyPoints: increment(points),
        lastOrderAt: now,
      });
    } else {
      await setDoc(ref, {
        phone,
        name,
        totalSpent: orderTotal,
        orderCount: 1,
        loyaltyPoints: points,
        lastOrderAt: now,
        createdAt: now,
      });
    }
  } catch (error) {
    console.error('upsertCustomerOnOrder error:', error);
  }
}
