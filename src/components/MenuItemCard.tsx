import React from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface MenuItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onClick: () => void;
  index: number;
  params?: any;
}

const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, quantityInCart, onClick, index, params }) => {
  const isPlaceholder = item.image.includes('tov-logo');
  const locationId = ((params?.locationId as string) || 'hayes').toLowerCase();
  const dishUrl = `/${locationId}/menu/${slugify(item.name)}`;

  return (
    <div
      key={item.id}
      role="button"
      tabIndex={0}
      aria-label={`${item.name} - ${formatCurrency(item.price || 0)}${item.is86d ? ' (Sold out)' : ''}`}
      className={`group flex flex-col cursor-pointer transition-all duration-700 relative animate-fade-in-up ${item.is86d ? 'opacity-60 grayscale' : ''}`}
      style={{ animationDelay: `${(index % 12) * 40}ms`, animationFillMode: 'both' }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Visual Section: Editorial Floating Image */}
      <div className="relative w-full aspect-[4/3] rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#EAE0D5] mb-6 shadow-[0_10px_30px_rgba(26,60,52,0.06)] group-hover:shadow-[0_20px_50px_rgba(138,61,42,0.12)] group-hover:-translate-y-2 transition-all duration-700">
        {!isPlaceholder ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={(e: any) => { 
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.ambient-fallback') as HTMLElement;
              if (fallback) fallback.classList.remove('hidden');
            }}
            // CSS crop to hide baked-in Canva text at top/bottom of images
            className="absolute inset-0 w-full h-full object-cover object-[50%_70%] scale-[1.3] transition-transform duration-1000 group-hover:scale-[1.35] z-0 origin-[50%_70%]"
          />
        ) : null}

        {/* Anti-Text Gradient Overlay to perfectly erase Canva text at the top */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#EAE0D5] via-[#EAE0D5]/90 to-transparent z-10 pointer-events-none"></div>

        {/* Ambient Culinary Backdrop for placeholder items or fallback */}
        <div 
          className={`ambient-fallback absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#F5EFE6] to-[#EAE0D5] flex flex-col items-center justify-center p-4 text-center ${!isPlaceholder ? 'hidden' : 'flex'}`}
        >
          <div className="absolute inset-0 bg-[url('/assets/tov-new-pattern.webp')] bg-contain bg-center bg-no-repeat opacity-[0.04] mix-blend-multiply"></div>
          <img 
            src="/assets/tov-logo-pine.png" 
            alt="Taste of Village"
            className="w-20 md:w-24 h-auto opacity-20 group-hover:opacity-40 transition-opacity duration-700 mb-2 transform group-hover:scale-105"
          />
          <span className="text-[9px] font-display font-bold uppercase tracking-[0.3em] text-pine/30 relative z-10">
            Taste of Village
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Popular Badge */}
        {item.popular && !item.is86d && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-terracotta text-[9px] font-black tracking-widest px-4 py-1.5 shadow-sm z-20 rounded-full border border-terracotta/10">
            POPULAR
          </span>
        )}

        {item.is86d && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-20">
            <span className="bg-red-600 text-white text-[10px] font-black tracking-[4px] uppercase px-5 py-2 shadow-xl rounded-full">
              SOLD OUT
            </span>
          </div>
        )}

        {/* In-Bag Badge */}
        {quantityInCart > 0 && (
          <span className="absolute top-4 right-4 bg-pine/90 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-3 py-1.5 shadow-lg z-20 rounded-full border border-pine-light/30">
            <span role="img" aria-label="cart">🛒</span> {quantityInCart}
          </span>
        )}
      </div>

      {/* Text Section: Clean Editorial Typography */}
      <div className="px-2 flex flex-col flex-1 relative">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-display text-xl md:text-2xl font-bold text-pine leading-tight group-hover:text-terracotta transition-colors pr-2">
            {item.name}
          </h3>
          <div className="flex flex-col items-end shrink-0 pt-1">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-pine/40 line-through text-[10px] font-bold mb-0.5">{formatCurrency(item.originalPrice)}</span>
            )}
            <span className="font-sans font-black text-terracotta text-lg tracking-wider">
              {item.price === 0 ? 'FREE' : `${formatCurrency(item.price)}`}
            </span>
          </div>
        </div>
        
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {item.dietary.map((d: string) => (
              <span key={d} className="text-[8px] uppercase font-black tracking-[0.25em] px-2.5 py-0.5 rounded-full border border-pine/15 text-pine/70 bg-transparent flex items-center gap-1">
                {d === 'vegan' && <span className="text-green-600" role="img" aria-label="vegan">🌱</span>}
                {d === 'vegetarian' && <span className="text-yellow-600" role="img" aria-label="vegetarian">🧀</span>}
                {d === 'halal' && <span className="text-emerald-600" role="img" aria-label="halal">☪</span>}
                {d === 'gluten-free' && <span className="text-amber-700" role="img" aria-label="gluten-free">🌾</span>}
                {d === 'spicy' && <span className="text-red-600" role="img" aria-label="spicy">🌶️</span>}
                {d}
              </span>
            ))}
          </div>
        )}

        {item.description && (
          <p className={`text-pine/70 font-medium text-[13px] leading-relaxed mb-6 flex-1 ${['bbq_platters', 'platters'].includes(item.category) ? '' : 'line-clamp-2'}`}>
            {item.description}
          </p>
        )}
        
        <div className="mt-auto pt-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex items-center gap-2">
            <Link
              href={dishUrl}
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-pine/50 hover:text-terracotta font-bold uppercase tracking-[0.2em] transition-colors"
            >
              Details →
            </Link>
          </div>
          <div className={`px-5 py-2 rounded-full flex justify-center items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${
            item.is86d 
              ? 'text-pine/40' 
              : quantityInCart > 0
                ? 'bg-pine text-white shadow-md'
                : 'bg-terracotta/5 text-terracotta group-hover:bg-terracotta group-hover:text-white group-hover:shadow-[0_4px_15px_rgba(138,61,42,0.25)]'
          }`}>
            <span>{item.is86d ? 'Sold Out' : quantityInCart > 0 ? `Add More` : 'Add To Order'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};