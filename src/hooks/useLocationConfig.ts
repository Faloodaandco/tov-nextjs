'use client';
import { useState, useEffect } from 'react';
import { getActiveLocation, hasSelectedLocation, LOCATIONS } from '@/config/shopConfig';

export const useLocationConfig = () => {
  const [activeLocation, setActiveLocationState] = useState<any>(() => {
    return getActiveLocation() || LOCATIONS.hayes;
  });
  const [hasSelected, setHasSelected] = useState<boolean>(() => {
    return hasSelectedLocation();
  });

  useEffect(() => {
    const loc = getActiveLocation();
    if (loc) {
      setActiveLocationState(loc);
    }
    setHasSelected(hasSelectedLocation());

    const handleLocationChange = () => {
      setActiveLocationState(getActiveLocation() || LOCATIONS.hayes);
      setHasSelected(hasSelectedLocation());
    };
    window.addEventListener('tov_location_changed', handleLocationChange);
    return () => window.removeEventListener('tov_location_changed', handleLocationChange);
  }, []);

  return { activeLocation: activeLocation || LOCATIONS.hayes, hasSelected };
};
