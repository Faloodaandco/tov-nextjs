'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MenuItem } from '@/types';
import type { FullMenuItem } from '@/components/CustomisationModal';
import { slugify } from '@/utils/slugify';

interface MenuItemCardProps {
  item: FullMenuItem | any;
  index: number;
  isPlaceholder: boolean;
  quantityInCart?: number;
  onClick: () => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index, isPlaceholder, quantityInCart = 0, onClick }) => {
  const params = useParams();
  const locationId = ((params?.locationId as string) || 'hayes').toLowerCase();
  const dishUrl = `/${locationId}/menu/${slugify(item.name)}`;

  return (
    <div
      key={item.id}
      role="button"
      tabIndex={0}
      aria-label={`${item.name} — £${item.price?.toFixed(2) || '0.00'}${item.is86d ? ' (Sold out)' : ''}`}
      className={`bg-[#FDFBF7] group shadow-sm hover:shadow-xl p-0 flex flex-col cursor-pointer transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden animate-fade-in-up rounded-[20px] ${item.is86d ? 'opacity-60 grayscale' : ''}`}
      style={{ animationDelay: `${(index % 12) * 40}ms`, animationFillMode: 'both' }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {/* Hover Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-terracotta transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 z-20"></div>

      {/* Visual Section: Real Photo OR Ambient Culinary Card */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-pine">
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
            className="w-full h-full transition-transform duration-1000 group-hover:scale-110 object-cover relative z-10"
          />
        ) : null}

        {/* Ambient Culinary Backdrop for placeholder items or fallback */}
        <div 
          className={`ambient-fallback absolute inset-0 bg-gradient-to-br from-[#1d352b] via-[#244337] to-[#12221b] flex flex-col items-center justify-center p-4 text-center ${!isPlaceholder ? 'hidden' : 'flex'}`}
        >
          <div className="absolute inset-0 bg-[url('/assets/tov-new-pattern.webp')] bg-repeat opacity-15 mix-blend-overlay"></div>
          <img 
            src="/assets/tov-full-logo-transparent-inverted.webp" 
            alt="Taste of Village"
            className="w-20 md:w-24 h-auto opacity-30 group-hover:opacity-60 transition-opacity duration-500 mb-2 transform group-hover:scale-105"
          />
          <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-amber-200/60 relative z-10">
            Taste of Village • Authentic Recipe
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-pine/50 via-transparent to-transparent z-10 pointer-events-none"></div>

        {/* Popular / Sold Out Badges */}
        {item.popular && !item.is86d && (
          <span className="absolute top-3 left-3 bg-terracotta text-white text-[9px] font-black tracking-widest px-3 py-1 shadow-md z-20 rounded-full">
            POPULAR
          </span>
        )}

        {item.is86d && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] z-20">
            <span className="bg-red-500/90 text-white text-[10px] font-black tracking-[4px] uppercase px-5 py-2 shadow-xl rounded-full">
              SOLD OUT
            </span>
          </div>
        )}

        {/* In-Bag Badge */}
        {quantityInCart > 0 && (
          <span className="absolute top-3 right-3 bg-pine text-white text-[10px] font-black tracking-wider px-3 py-1 shadow-lg z-20 rounded-full flex items-center gap-1 border border-white/20 animate-fade-in">
            ✓ {quantityInCart} in bag
          </span>
        )}
      </div>

      {/* Text Section */}
      <div className={`p-6 md:p-8 flex flex-col flex-1 relative bg-transparent transition-colors ${isPlaceholder ? 'pt-8' : ''}`}>
        
        {/* Watermark for Placeholder Items */}
        {isPlaceholder && (
          <img 
            src="/assets/tov-logo-tree-terracotta-alpha.png" 
            alt="" 
            className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none transform -rotate-12"
          />
        )}

        <div className="flex justify-between items-start mb-4 gap-4 relative z-10">
          <div>
            {isPlaceholder && item.popular && !item.is86d && (
              <span className="text-[9px] uppercase font-black tracking-widest text-terracotta mb-3 inline-block bg-terracotta/5 px-3 py-1 rounded-full">Popular</span>
            )}
            {isPlaceholder && item.is86d && (
              <span className="text-[9px] uppercase font-black tracking-widest text-red-500 mb-3 inline-block bg-red-500/5 px-3 py-1 rounded-full">Sold Out</span>
            )}
            <h3 className="font-display text-xl md:text-2xl font-bold text-pine leading-tight group-hover:text-terracotta transition-colors">{item.name}</h3>
          </div>
          <div className="flex flex-col items-end shrink-0 pt-1">
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-pine/40 line-through text-[10px] font-bold mb-0.5">£{item.originalPrice.toFixed(2)}</span>
            )}
            <span className="font-sans font-black text-terracotta text-lg tracking-wider">
              {item.price === 0 ? 'FREE' : `£${item.price.toFixed(2)}`}
            </span>
          </div>
        </div>
        
        {item.dietary && item.dietary.length > 0 && (
          <div className="flex gap-1.5 mb-3 relative z-10 flex-wrap">
            {item.dietary.map((d: string) => (
              <span key={d} className="text-[8px] uppercase font-black tracking-[0.2em] px-2 py-0.5 rounded-sm border border-pine/10 text-pine/60 bg-white shadow-sm flex items-center gap-1">
                {d === 'vegan' && <span className="text-green-600">🌱</span>}
                {d === 'vegetarian' && <span className="text-yellow-600">🧀</span>}
                {d === 'halal' && <span className="text-emerald-600">🌙</span>}
                {d === 'gluten-free' && <span className="text-amber-700">🌾</span>}
                {d === 'spicy' && <span className="text-red-500">🌶️</span>}
                {d}
              </span>
            ))}
          </div>
        )}

        {item.description && (
          <p className={`text-pine/70 font-medium text-[13px] leading-loose mb-6 flex-1 relative z-10 ${['bbq_platters', 'platters'].includes(item.category) ? '' : 'line-clamp-3'}`}>
            {item.description}
          </p>
        )}
        
        <div className="mt-auto relative z-10 pt-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-pine/30 font-black uppercase tracking-[0.2em]">{item.category.replace(/_/g, ' ')}</span>
            <Link
              href={dishUrl}
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] text-terracotta/50 hover:text-terracotta font-bold uppercase tracking-[0.15em] transition-colors"
            >
              View &amp; Share →
            </Link>
          </div>
          <div className={`px-4 py-2 rounded-full flex justify-center items-center gap-1.5 text-[10px] font-black tracking-[0.15em] uppercase transition-all duration-300 border ${
            item.is86d 
              ? 'bg-black/5 text-pine/30 border-transparent' 
              : quantityInCart > 0
                ? 'bg-pine text-white border-pine shadow-sm'
                : 'bg-transparent text-terracotta border-terracotta/30 group-hover:bg-terracotta group-hover:text-white group-hover:border-terracotta shadow-sm group-hover:shadow-md'
          }`}>
            <span>{item.is86d ? 'Sold Out' : quantityInCart > 0 ? `+ Add (${quantityInCart})` : '+ Add'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
