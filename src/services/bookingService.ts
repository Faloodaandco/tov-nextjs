import { Booking } from '@/types';

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  id: string;
  message?: string;
}

/**
 * Creates a table booking by calling the server-side /api/bookings route.
 * Replaces direct client-side Firestore writes with validated server execution.
 */
export const createBooking = async (booking: Partial<Booking> | Booking): Promise<BookingResponse> => {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Booking request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};
