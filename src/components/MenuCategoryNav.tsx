'use client';
import React from 'react';
import { Search, X } from 'lucide-react';

interface MenuCategoryNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  groupedMenu: any[];
  activeCategory: string;
  scrollToCategory: (id: string) => void;
}

export const MenuCategoryNav: React.FC<MenuCategoryNavProps> = ({
  searchQuery,
  setSearchQuery,
  groupedMenu,
  activeCategory,
  scrollToCategory
}) => {
  return (
    <div className="bg-[#FDFBF7]/95 backdrop-blur-xl shadow-md sticky top-[48px] sm:top-[60px] z-40 border-b border-pine/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-6 py-1.5 md:py-0">
        
        {/* Quick Search */}
        <div className="relative shrink-0 md:w-64 py-1.5 md:py-3 border-b md:border-b-0 border-pine/5">
          <input 
            type="text" 
            placeholder="SEARCH MENU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-pine/10 px-9 py-3 md:py-3 text-[10px] font-bold tracking-[0.2em] text-pine placeholder:text-pine/40 focus:outline-none focus:border-terracotta focus:shadow-[0_0_15px_rgba(138,61,42,0.1)] transition-all rounded-full min-h-[48px]"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine/40 w-3.5 h-3.5 pointer-events-none" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-1 top-1/2 -translate-y-1/2 text-pine/40 hover:text-terracotta min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div id="category-nav-container" className="overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1 py-1" style={{ scrollBehavior: 'smooth' }}>
          <div className="flex gap-2 px-1">
            {groupedMenu.map((cat) => (
              <button
                key={cat.id}
                id={`nav-btn-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={`min-h-[48px] px-4 py-2.5 font-sans uppercase text-[10px] font-black tracking-[0.18em] whitespace-nowrap transition-all duration-300 rounded-full border ${
                  activeCategory === cat.id
                  ? 'bg-terracotta border-terracotta text-white shadow-[0_4px_15px_rgba(138,61,42,0.3)] scale-105'
                  : 'bg-white border-pine/10 text-pine/60 hover:text-terracotta hover:border-terracotta/30 hover:bg-terracotta/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
