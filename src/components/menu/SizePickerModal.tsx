import React from 'react';
import { X } from 'lucide-react';
import { MenuItem } from '@/types';
import { WEB_SIZE_ITEMS } from '@/data/menuStaticData';
import { formatCurrency } from '@/utils/formatters';

interface SizePickerModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: any) => void;
  setToastMessage: (msg: string) => void;
}

export function SizePickerModal({ item, onClose, onAddToCart, setToastMessage }: SizePickerModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#FDFBF7] rounded-[28px] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-pine/10 animate-fade-up">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-pine/5 text-pine/40 hover:text-pine rounded-full transition-colors">
          <X size={20} />
        </button>
        
        <div className="text-center mb-6">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-md border border-pine/10" 
            onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; }} 
          />
          <h3 className="font-display text-xl font-bold text-pine leading-tight">{item.name}</h3>
          <p className="text-pine/50 text-xs font-semibold uppercase tracking-wider mt-1">Choose your option</p>
        </div>
        
        <div className="space-y-3">
          {(() => {
            const sizes = WEB_SIZE_ITEMS[item.name];
            const regularPrice = sizes ? sizes.regular : item.price;
            
            let largePrice = sizes ? sizes.large : item.price + 2.99;
            if (!sizes) {
              if (item.category === 'rolls') {
                largePrice = item.price + 2.50;
              } else if (item.category === 'burgers') {
                largePrice = item.price + 2.99;
              }
            }
            
            const isMeal = item.category === 'burgers';
            const largeLabel = isMeal ? 'Make it a Meal' : 'Large';
            const largeDesc = isMeal ? 'Add Chips & Drink' : 'Extra portion';

            return (
              <>
                <button
                  onClick={() => {
                    onAddToCart({ ...item, id: `${item.id}_regular`, name: `${item.name} (Regular)`, price: regularPrice });
                    onClose();
                    setToastMessage(`Added ${item.name} (Regular) to order`);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-pine/15 hover:border-terracotta hover:bg-terracotta/5 transition-all group shadow-sm hover:shadow-md"
                >
                  <div className="text-left">
                    <p className="font-bold text-pine group-hover:text-terracotta transition-colors">Regular</p>
                    <p className="text-pine/40 text-xs">Standard serving</p>
                  </div>
                  <span className="font-sans font-black text-terracotta text-lg">{formatCurrency(regularPrice)}</span>
                </button>
                <button
                  onClick={() => {
                    onAddToCart({ ...item, id: `${item.id}_large`, name: `${item.name} (${isMeal ? 'Meal' : 'Large'})`, price: largePrice });
                    onClose();
                    setToastMessage(`Added ${item.name} (${largeLabel}) to order`);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-pine/15 hover:border-pine hover:bg-pine/5 transition-all group shadow-sm hover:shadow-md mt-3"
                >
                  <div className="text-left">
                    <p className="font-bold text-pine group-hover:text-terracotta transition-colors">{largeLabel}</p>
                    <p className="text-pine/40 text-xs">{largeDesc}</p>
                  </div>
                  <span className="font-sans font-black text-pine text-lg">{formatCurrency(largePrice)}</span>
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
