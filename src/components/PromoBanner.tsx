'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, Clock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useLocationConfig } from '@/hooks/useLocationConfig';
import { ACTIVE_PROMO, isBreakfastPromoTime } from '@/config/shopConfig';

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isPromoHours, setIsPromoHours] = useState(() => isBreakfastPromoTime());
  const { setActivePromo } = useStore();
  const { activeLocation } = useLocationConfig();

  // Periodically re-check whether we are currently within the 09:00 - 14:00 window
  useEffect(() => {
    const timer = setInterval(() => {
      setIsPromoHours(isBreakfastPromoTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible || !ACTIVE_PROMO.enabled) return null;

  const handleApplyPromo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPromoHours) {
      setStatusMessage('⏰ Weekend promo: Valid Saturdays & Sundays from 10:00 AM till 2:00 PM!');
      setTimeout(() => setStatusMessage(null), 4500);
      return;
    }

    setActivePromo('BREAKFAST40');
    setStatusMessage('✓ 40% OFF CODE APPLIED TO BREAKFAST ITEMS!');
    setTimeout(() => setStatusMessage(null), 4500);
  };

  const isHayes = activeLocation?.id === 'hayes';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="w-full bg-terracotta text-white pointer-events-auto border-b border-white/10 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-3 py-3 sm:py-2.5 flex items-center justify-between gap-2">
            <button 
              onClick={handleApplyPromo}
              className="flex-1 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-[11px] sm:text-xs font-bold tracking-wider text-center py-3"
            >
              {isPromoHours ? (
                <Ticket size={14} className="animate-pulse flex-shrink-0" />
              ) : (
                <Clock size={14} className="opacity-80 flex-shrink-0" />
              )}
              <span className="uppercase font-black">
                {ACTIVE_PROMO.bannerHeadline} (Sat &amp; Sun till 2:00 PM) {isHayes ? '• Hayes' : '• Slough'}
              </span>
              <span className="hidden sm:inline opacity-75">•</span>
              <span className="hidden sm:inline underline decoration-white/80 underline-offset-2">
                {statusMessage ? (
                  statusMessage
                ) : isPromoHours ? (
                  'Tap to apply code BREAKFAST40'
                ) : (
                  'Valid Weekends 10am–2pm on all breakfast items'
                )}
              </span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="hover:bg-white/20 rounded-full transition-colors flex-shrink-0 min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
