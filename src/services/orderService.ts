import { doc, onSnapshot, setDoc, updateDoc, getDoc, Timestamp, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, CartItem } from '@/types';

export const createOrder = async (order: Order): Promise<void> => {
  if (!order.id) {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...order,
      createdAt: Timestamp.now()
    });
    order.id = docRef.id;
  } else {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      createdAt: Timestamp.now()
    });
  }
};

export const updateOrderGeneric = async (orderId: string, data: Partial<Order>): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
};

export const appendItemsToOrder = async (orderId: string, newItems: CartItem[]): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);
  
  if (orderSnap.exists()) {
    const orderData = orderSnap.data() as Order;
    const updatedItems = [...orderData.items, ...newItems];
    await updateDoc(orderRef, {
      items: updatedItems,
      updatedAt: Timestamp.now()
    });
  } else {
    throw new Error('Order not found');
  }
};

export const streamSingleOrder = (orderId: string, callback: (order: Order | null) => void) => {
  const orderRef = doc(db, 'orders', orderId);
  return onSnapshot(orderRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Order);
    } else {
      callback(null);
    }
  });
};
