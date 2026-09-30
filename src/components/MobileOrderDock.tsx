'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/utils/formatters';
import { LOCATIONS } from '@/config/shopConfig';

export const MobileOrderDock = () => {
  const { cartTotal, cartCount, isCartOpen, setIsCartOpen } = useStore();
  const pathname = usePathname();

  // Hide on certain routes and when cart is open
  if (['/checkout', '/check-in', '/thank-you'].includes(pathname) || isCartOpen) {
    return null;
  }

  const minOrder = LOCATIONS.hayes.delivery.minOrder || 15;
  const progressPercent = Math.min(100, (cartTotal / minOrder) * 100);
  const remaining = Math.max(0, minOrder - cartTotal);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-sand border-t border-pine/10 pb-[env(safe-area-inset-bottom)]">
      {cartCount > 0 && (
        <div className="px-4 py-2 bg-pine-light/10 border-b border-pine/10">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-pine">Delivery minimum</span>
            {remaining > 0 ? (
              <span className="text-terracotta">Add {formatCurrency(remaining)} to reach minimum</span>
            ) : (
              <span className="text-emerald-600">Minimum met!</span>
            )}
          </div>
          <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${remaining === 0 ? 'bg-emerald-500' : 'bg-terracotta'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 p-4 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {/* TODO: Update WhatsApp number if TOV gets a distinct one. Using Falooda's for now. */}
        <a 
          href="https://wa.me/447387755853?text=Hi%20Taste%20of%20Village,%20I%20have%20a%20question"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-[#25D366] text-white shadow-sm"
        >
          <MessageCircle size={24} />
        </a>
        
        {cartCount === 0 ? (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex-1 h-12 rounded-xl bg-pine text-white font-medium flex items-center justify-center shadow-sm"
          >
            Order Online
          </button>
        ) : (
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex-1 h-12 rounded-xl bg-terracotta text-white font-medium flex items-center justify-between px-4 shadow-sm"
          >
            <span>View Bag ({cartCount})</span>
            <span>{formatCurrency(cartTotal)}</span>
          </button>
        )}
      </div>
    </div>
  );
};
