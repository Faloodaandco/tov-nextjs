'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { MenuItem } from '@/types';
import { ShoppingBag, Share2 } from 'lucide-react';

interface DishCTAProps {
  item: MenuItem;
  locationId: string;
}

export function DishCTA({ item, locationId }: DishCTAProps) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    addToCart(item);
    router.push(`/${locationId}/menu?added=${encodeURIComponent(item.name)}`);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${locationId}/menu/${window.location.pathname.split('/').pop()}`;
    const text = `${item.name} — £${item.price.toFixed(2)} at Taste of Village`;

    if (navigator.share) {
      try {
        await navigator.share({ title: item.name, text, url });
      } catch {
        // User cancelled share — do nothing
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={handleAdd}
        disabled={isAdding}
        className="group relative inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-terracotta px-8 font-bold text-white transition-all active:scale-[0.98] disabled:opacity-70 hover:bg-terracotta/90 flex-1 sm:flex-initial"
      >
        <ShoppingBag className="h-5 w-5" />
        <span>{isAdding ? 'Adding...' : 'Order This Dish'}</span>
      </button>

      <button
        onClick={handleShare}
        className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-pine/20 px-6 font-medium text-pine/70 hover:text-pine hover:border-pine/40 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </button>
    </div>
  );
}
