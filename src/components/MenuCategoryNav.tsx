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
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // It's stuck at top-[60px], so scrollY > 60 means it's definitely sticking
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`bg-bg-sand/95 backdrop-blur-xl sticky top-[48px] sm:top-[60px] z-40 transition-all duration-300 ${scrolled ? 'border-b border-pine/8 shadow-sm' : 'border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3 md:gap-4 py-2">
        
        {/* Quick Search */}
        <div className="relative shrink-0 w-48 md:w-56">
          <input 
            type="text" 
            placeholder="SEARCH MENU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 border border-pine/10 px-8 py-2.5 text-[10px] font-bold tracking-[0.2em] text-pine placeholder:text-pine/40 focus:outline-none focus:border-terracotta transition-all rounded-full min-h-[44px]"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine/40 w-3.5 h-3.5 pointer-events-none" />
          {searchQuery && (
            <button  onClick={() => setSearchQuery('')} className="absolute right-1 top-1/2 -translate-y-1/2 text-pine/40 hover:text-terracotta min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div id="category-nav-container" className="overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1" style={{ scrollBehavior: 'smooth' }}>
          <div className="flex gap-2 px-1">
            {groupedMenu.map((cat) => (
              <button 
                key={cat.id}
                id={`nav-btn-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={`min-h-[40px] px-3.5 py-2 font-sans uppercase text-[10px] font-black tracking-[0.18em] whitespace-nowrap transition-all duration-300 rounded-full border ${
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
