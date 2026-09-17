'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SHOP_CONFIG } from '@/config/shopConfig';

export interface StoreSettings {
  isOpen: boolean;
  announcement: string | null;
  deliveryFee: number;
}

export const useStoreSettings = (locationId: string = 'camden') => {
  const [settings, setSettings] = useState<StoreSettings>({
    isOpen: true,
    announcement: null,
    deliveryFee: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const locationConfig = SHOP_CONFIG.locations.find(l => l.id === locationId);
    if (!locationConfig) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'settings', locationId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as StoreSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching store settings', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [locationId]);

  return { settings, loading };
};
