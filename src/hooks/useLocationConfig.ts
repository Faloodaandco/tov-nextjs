'use client';
import { useState, useEffect } from 'react';
import { getActiveLocation, hasSelectedLocation } from '@/config/shopConfig';

export const useLocationConfig = () => {
  const [activeLocation, setActiveLocationState] = useState<any>(null);
  const [hasSelected, setHasSelected] = useState<boolean>(false);

  useEffect(() => {
    setActiveLocationState(getActiveLocation());
    setHasSelected(hasSelectedLocation());

    const handleLocationChange = () => {
      setActiveLocationState(getActiveLocation());
      setHasSelected(hasSelectedLocation());
    };
    window.addEventListener('tov_location_changed', handleLocationChange);
    return () => window.removeEventListener('tov_location_changed', handleLocationChange);
  }, []);

  return { activeLocation, hasSelected };
};
