'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  side?: 'left' | 'right' | 'bottom';
}

export const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'max-w-md',
  side = 'right',
}) => {
  // Lock body scroll when open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
    return () => { 
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'; 
      }
    };
  }, [isOpen]);

  const isBottom = side === 'bottom';
  const slideDirection = side === 'right' ? 100 : side === 'left' ? -100 : 0;

  const panelClasses = isBottom
    ? `fixed bottom-0 left-0 right-0 w-full max-h-[90vh] bg-bg-sand shadow-2xl z-[101] flex flex-col rounded-t-3xl border-t border-pine/10`
    : `fixed top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full w-full ${width} bg-bg-sand shadow-2xl z-[101] flex flex-col border-${side === 'right' ? 'l' : 'r'} border-pine/10`;

  const motionProps = isBottom
    ? { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 } }
    : { initial: { x: `${slideDirection}%`, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: `${slideDirection}%`, opacity: 0 } };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-pine/80 backdrop-blur-sm"
          />
          <motion.div
            {...motionProps}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={panelClasses}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b shrink-0 bg-white border-pine/5">
              <h2 className="font-display text-2xl font-black uppercase tracking-[0.1em] text-pine">{title}</h2>
              <button
                onClick={onClose}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-pine/40 hover:text-terracotta hover:bg-terracotta/10 rounded-full transition-colors"
                aria-label="Close drawer"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
