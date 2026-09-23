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
  side?: 'left' | 'right';
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

  const slideDirection = side === 'right' ? 100 : -100;

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
            initial={{ x: `${slideDirection}%`, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${slideDirection}%`, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full w-full ${width} bg-bg-sand shadow-2xl z-[101] flex flex-col border-${side === 'right' ? 'l' : 'r'} border-pine/10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b shrink-0 bg-white border-pine/5">
              <h2 className="font-display text-2xl font-black uppercase tracking-[0.1em] text-pine">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-pine/40 hover:text-terracotta hover:bg-terracotta/10 rounded-full transition-colors"
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
