import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface CartItemType {
  id: string;
  _cartKey?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  modifiers?: {
    size?: string;
    [key: string]: any;
  };
}

interface CartItemRowProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (key: string, qty: number) => void;
  onAddToCart: (item: CartItemType) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  index,
  onUpdateQuantity,
  onAddToCart,
}) => {
  const isFallback = !item.image || item.image.includes('tov-logo-tree');
  const cartKey = item._cartKey || item.id;

  return (
    <div
      className="flex items-center gap-4 animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
    >
      <div className="relative w-20 h-20 rounded-2xl shadow-sm border border-pine/10 overflow-hidden flex-shrink-0 bg-white">
        <img
          src={item.image || '/assets/tov-logo-tree-terracotta-alpha.png'}
          alt={item.name}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png';
            e.target.className =
              'w-full h-full object-contain p-3 opacity-40 transition-transform duration-700 group-hover:scale-110';
          }}
          className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${
            isFallback ? 'object-contain p-3 opacity-40' : 'object-cover'
          }`}
        />
        <div className="absolute inset-0 bg-pine/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-display font-bold text-base md:text-lg tracking-wider text-pine leading-tight truncate">
          {item.name}
        </h4>
        {item.modifiers?.size && (
          <p className="text-[10px] text-pine/60 mt-0.5 uppercase tracking-widest">
            {item.modifiers.size}
          </p>
        )}
        <p className="text-terracotta text-sm font-black mt-0.5 tabular-nums">
          {formatCurrency(item.price * item.quantity)}
          {item.quantity > 1 && (
            <span className="text-pine/40 text-xs font-semibold ml-1.5">
              ({item.quantity} × {formatCurrency(item.price)})
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3 bg-white border border-pine/20 px-3 py-1.5 rounded-full shadow-sm shrink-0">
        <button
          type="button"
          aria-label="Decrease quantity"
          className="text-pine/60 hover:text-terracotta transition-colors font-black cursor-pointer"
          title="Decrease quantity"
          onClick={() => onUpdateQuantity(cartKey, item.quantity - 1)}
        >
          <Minus size={16} strokeWidth={3} />
        </button>
        <span className="font-black text-sm text-pine w-4 text-center tabular-nums">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          className="text-pine/60 hover:text-terracotta transition-colors font-black cursor-pointer"
          title="Increase quantity"
          onClick={() => onAddToCart(item)}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
