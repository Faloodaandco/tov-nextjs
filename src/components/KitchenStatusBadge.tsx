'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Flame, AlertCircle } from 'lucide-react';
import { type LocationId } from '@/config/shopConfig';

interface KitchenStatus {
  isOpen: boolean;
  isLastOrders: boolean;
  message: string;
  minutesUntilClose?: number;
  prepEstimateMinutes: { min: number; max: number };
}

export function KitchenStatusBadge({ branchId = 'hayes' }: { branchId?: LocationId }) {
  const [status, setStatus] = useState<KitchenStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/kitchen/status?branch=${branchId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStatus(data);
        }
      } catch (err) {
        // Fallback default
        if (isMounted) {
          setStatus({
            isOpen: true,
            isLastOrders: false,
            message: 'Kitchen Open',
            prepEstimateMinutes: { min: 20, max: 25 },
          });
        }
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // refresh every min
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [branchId]);

  if (!status) return null;

  if (!status.isOpen) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/10 text-stone-700 text-xs font-bold border border-stone-300">
        <Clock size={13} className="text-stone-500" />
        <span>Kitchen Closed · Opens 10:00 AM</span>
      </div>
    );
  }

  if (status.isLastOrders) {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold border border-amber-500/30 animate-pulse">
        <AlertCircle size={14} className="text-amber-600" />
        <span>Last Orders ({status.minutesUntilClose}m left for collection)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-900 text-xs font-bold border border-emerald-500/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="flex items-center gap-1">
        <Flame size={12} className="text-emerald-600" />
        Kitchen Live · Prep: {status.prepEstimateMinutes.min}–{status.prepEstimateMinutes.max} mins
      </span>
    </div>
  );
}
