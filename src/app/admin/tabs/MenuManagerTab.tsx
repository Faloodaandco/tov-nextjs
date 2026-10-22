'use client';

import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Search,
  CheckCircle,
  XCircle,
  Tag,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import hayesMenu from '@/data/tov-menu.json';
import sloughMenu from '@/data/tov-menu-slough.json';

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

export const MenuManagerTab: React.FC<Props> = ({ selectedBranch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [stockOverrides, setStockOverrides] = useState<Record<string, boolean>>({});

  const branchKey = selectedBranch === 'slough' ? 'slough' : 'hayes';
  const menuList = branchKey === 'slough' ? (sloughMenu as any[]) : (hayesMenu as any[]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [menuList]);

  const toggleStock = (id: string, currentInStock: boolean) => {
    setStockOverrides((prev) => ({
      ...prev,
      [id]: !currentInStock,
    }));
  };

  const filteredDishes = useMemo(() => {
    return menuList.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuList, activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">Menu Availability & 86ing</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              {branchKey.toUpperCase()} Catalog
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Instantly toggle dishes in or out of stock across digital ordering, website, and WhatsApp menu bots.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#FAF6F0]/40" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14231B] border border-[#D3A762]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-xl">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#D3A762] text-[#0D1912] font-bold'
                : 'bg-[#14231B] text-[#FAF6F0]/70 hover:text-white border border-[#D3A762]/15'
            }`}
          >
            All Categories ({menuList.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all capitalize cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#D3A762] text-[#0D1912] font-bold'
                  : 'bg-[#14231B] text-[#FAF6F0]/70 hover:text-white border border-[#D3A762]/15'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => {
          const isOut = stockOverrides[dish.id] !== undefined ? !stockOverrides[dish.id] : false;
          const priceStr = typeof dish.price === 'number' ? `£${dish.price.toFixed(2)}` : '£9.95';

          return (
            <div
              key={dish.id}
              className={`bg-[#14231B] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                isOut
                  ? 'border-red-500/40 opacity-75'
                  : 'border-[#D3A762]/25 hover:border-[#D3A762]/50 shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {dish.name}
                    {dish.popular && <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </h3>
                  <span className="text-xs font-bold text-[#D3A762] shrink-0 font-mono">
                    {priceStr}
                  </span>
                </div>

                <p className="text-xs text-[#FAF6F0]/65 line-clamp-2 mb-3">
                  {dish.description || 'Authentic traditional recipe prepared with fresh ingredients and spices.'}
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0D1912] border border-[#D3A762]/20 text-[#FAF6F0]/70">
                    {dish.category?.replace(/_/g, ' ') || 'Specialty'}
                  </span>
                  {dish.allergens?.length > 0 && (
                    <span className="text-[10px] text-amber-300/80">
                      Contains: {dish.allergens.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Toggle Switch */}
              <div className="pt-3 border-t border-[#D3A762]/10 flex items-center justify-between">
                <span className="text-xs font-medium text-[#FAF6F0]/80 flex items-center gap-1.5">
                  {isOut ? (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 font-bold">86&apos;d (Out of Stock)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">In Stock &amp; Ordering</span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => toggleStock(dish.id, !isOut)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isOut
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-[#1C2D22] hover:bg-red-950/50 hover:text-red-300 text-[#FAF6F0]/80 border border-[#D3A762]/20'
                  }`}
                >
                  {isOut ? 'Restore to Menu' : '86 Dish'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
