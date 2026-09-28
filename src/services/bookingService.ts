import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types';
import { sendBookingNotificationEmail } from '@/services/emailService';

export const createBooking = async (booking: Booking): Promise<void> => {
  try {
    await addDoc(collection(db, 'bookings'), {
      ...booking,
      createdAt: Timestamp.now()
    });
    
    await sendBookingNotificationEmail(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};
