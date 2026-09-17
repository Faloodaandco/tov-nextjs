import { doc, getDoc, setDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  points: number;
  ordersCount: number;
  totalSpent: number;
}

export const getCustomer = async (customerId: string): Promise<Customer | null> => {
  const docRef = doc(db, 'customers', customerId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Customer;
  }
  return null;
};

export const upsertCustomerOnOrder = async (
  customerId: string, 
  customerData: Partial<Customer>, 
  orderAmount: number
): Promise<void> => {
  const customerRef = doc(db, 'customers', customerId);
  const docSnap = await getDoc(customerRef);
  
  if (docSnap.exists()) {
    await updateDoc(customerRef, {
      ...customerData,
      ordersCount: increment(1),
      totalSpent: increment(orderAmount),
      points: increment(Math.floor(orderAmount))
    });
  } else {
    await setDoc(customerRef, {
      ...customerData,
      ordersCount: 1,
      totalSpent: orderAmount,
      points: Math.floor(orderAmount)
    });
  }
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const customersRef = collection(db, 'customers');
  const snapshot = await getDocs(customersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
};

export const redeemPoints = async (customerId: string, points: number): Promise<void> => {
  const customerRef = doc(db, 'customers', customerId);
  await updateDoc(customerRef, {
    points: increment(-points)
  });
};
