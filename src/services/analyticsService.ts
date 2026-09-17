import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const logTableScan = async (tableNumber: string, userAgent: string) => {
  try {
    await addDoc(collection(db, 'analytics_events'), {
      type: 'table_scan',
      table: tableNumber,
      timestamp: serverTimestamp(),
      userAgent
    });
  } catch (error) {
    console.error('Failed to log table scan:', error);
  }
};

export const logSessionDuration = async (tableNumber: string, durationSeconds: number) => {
  try {
    if (durationSeconds < 5) return;
    
    await addDoc(collection(db, 'analytics_events'), {
      type: 'session_end',
      table: tableNumber,
      durationSeconds,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to log session duration:', error);
  }
};
