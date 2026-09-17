import { collection, addDoc, doc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
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

export const streamBookings = (callback: (bookings: Booking[]) => void) => {
  const bookingsRef = collection(db, 'bookings');
  return onSnapshot(bookingsRef, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
    callback(bookings);
  });
};
