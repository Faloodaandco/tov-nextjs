import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';

export const createBooking = async (booking: Booking): Promise<void> => {
  await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: Timestamp.now()
  });
};
