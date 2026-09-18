import { collection, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';

export const createBooking = async (booking: Booking): Promise<void> => {
  await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: Timestamp.now()
  });
};

export const updateBookingStatus = async (bookingId: string, status: string): Promise<void> => {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status,
    updatedAt: Timestamp.now()
  });
};
