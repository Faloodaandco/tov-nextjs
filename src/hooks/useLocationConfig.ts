'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getActiveLocation, hasSelectedLocation, LOCATIONS } from '@/config/shopConfig';

export const useLocationConfig = () => {
  const pathname = usePathname() || '';
  
  const [activeLocation, setActiveLocationState] = useState<any>(() => {
    // Determine location from pathname on both server and client
    const pathParts = pathname.split('/');
    if (pathParts.length > 1) {
      const possibleLoc = pathParts[1].toLowerCase();
      if (possibleLoc === 'hayes' || possibleLoc === 'slough') {
        return LOCATIONS[possibleLoc];
      }
    }
    // Fallback to window on client (if needed) or hayes
    if (typeof window !== 'undefined') {
       return getActiveLocation() || LOCATIONS.hayes;
    }
    return LOCATIONS.hayes;
  });

  const [hasSelected, setHasSelected] = useState<boolean>(false);

  useEffect(() => {
    const loc = getActiveLocation();
    if (loc && activeLocation.id !== loc.id) {
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
