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
    <div className="bg-bg-sand/95 backdrop-blur-xl shadow-sm sticky top-[48px] sm:top-[60px] z-40 border-b border-pine/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center gap-1 md:gap-6 py-1.5 md:py-0">
        
        {/* Quick Search Overlay */}
        <div className="relative shrink-0 md:w-64 py-1.5 md:py-3 border-b md:border-b-0 border-pine/5">
          <input 
            type="text" 
            placeholder="SEARCH MENU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 border border-pine/10 px-9 py-2 md:py-2.5 text-[10px] font-bold tracking-[0.2em] text-pine placeholder:text-pine/40 focus:outline-none focus:border-terracotta focus:bg-white transition-colors rounded-full"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine/40 w-3.5 h-3.5 pointer-events-none" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-pine/40 hover:text-terracotta">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category links */}
        <div id="category-nav-container" className="overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1 py-0.5" style={{ scrollBehavior: 'smooth' }}>
          <div className="flex space-x-5 px-1">
            {groupedMenu.map((cat) => (
              <button
                key={cat.id}
                id={`nav-btn-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={`py-2.5 md:py-4 font-sans uppercase text-[10px] font-black tracking-[0.18em] whitespace-nowrap transition-all duration-300 border-b-2 ${
                  activeCategory === cat.id
                  ? 'text-terracotta border-terracotta'
                  : 'text-pine/50 border-transparent hover:text-pine hover:border-pine/30'
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
