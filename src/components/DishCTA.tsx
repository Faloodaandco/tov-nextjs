'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { MenuItem } from '@/types';
import { ShoppingBag } from 'lucide-react';

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
    // Redirect back to the menu page so they can continue shopping or checkout
    router.push(`/${locationId}/menu?added=${item.id}`);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdding}
      className="group relative inline-flex h-14 items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 font-medium text-white transition-transform active:scale-[0.98] disabled:opacity-70 w-full sm:w-auto"
    >
      <ShoppingBag className="h-5 w-5" />
      <span>{isAdding ? 'Adding to Order...' : 'Order This Dish'}</span>
    </button>
  );
}
