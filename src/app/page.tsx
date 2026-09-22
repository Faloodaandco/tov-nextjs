'use client';

import Link from 'next/link';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';
import { MapPin, Flame, ArrowRight } from 'lucide-react';

export default function SplashSelector() {
  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tov_selected_location', branchId);
    }
    trackBranchSelect(branchId, branchName);
  };

  return (
    <main className="min-h-screen bg-bg-sand flex flex-col items-center relative overflow-hidden pt-12 md:pt-20 px-4 md:px-8">
      {/* Top Terracotta Bar */}
      <div className="absolute top-0 left-0 right-0 h-3 md:h-4 bg-terracotta w-full z-50 shadow-md"></div>
      
      {/* Subtle brand glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-terracotta/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center mt-6 md:mt-10">
        
        {/* Solid Arch Logo */}
        <div className="bg-terracotta rounded-t-[100px] p-4 md:p-5 mb-8 shadow-lg w-20 h-24 md:w-24 md:h-28 flex flex-col items-center justify-end relative z-10 border-b border-terracotta pb-4 md:pb-6">
           <img 
            src="/assets/tov-tree.svg" 
            alt="Taste of Village Tree" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain brightness-0 invert"
          />
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-[56px] text-pine tracking-[0.2em] uppercase mb-5 relative z-10">
          TASTE OF VILLAGE
        </h1>
        
        <p className="text-pine/70 text-base md:text-lg max-w-2xl mx-auto mb-16 relative z-10 italic font-serif">
          Select your destination to explore our rich Punjab culinary heritage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
          {Object.values(LOCATIONS).map((loc) => {
            const isSlough = loc.id === 'slough';
            
            return (
              <Link
                key={loc.id}
                href={`/${loc.id}`}
                onClick={() => handleBranchSelect(loc.id, loc.name)}
                className="group relative bg-white rounded-3xl p-10 text-left transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(138,61,42,0.15)] hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-bg-sand shadow-sm"
              >
                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="p-3.5 bg-bg-sand/60 rounded-full text-pine/70 group-hover:bg-terracotta/10 group-hover:text-terracotta transition-colors duration-300">
                    {isSlough ? <Flame size={24} strokeWidth={1.5} /> : <MapPin size={24} strokeWidth={1.5} />}
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent border border-pine/10 group-hover:border-terracotta/30 transition-colors">
                    <ArrowRight className="text-pine/40 group-hover:text-terracotta transition-transform group-hover:translate-x-1" size={20} strokeWidth={1.5} />
                  </div>
                </div>

                <h2 className="font-display font-bold text-2xl md:text-3xl text-pine tracking-[0.05em] mb-4 border-b border-pine/5 pb-5 relative z-10">
                  {loc.name.replace('Taste Of Village ', '').toUpperCase()} BRANCH
                </h2>
                
                <div className="relative z-10 flex-grow">
                  <div className="flex items-center gap-2.5 text-pine/70 font-sans text-sm md:text-base">
                    <span className="w-1 h-1 rounded-full bg-terracotta"></span>
                    <span>{loc.address}</span>
                  </div>
                  <p className="text-pine/40 font-mono text-xs mt-1.5 tracking-wider uppercase ml-3.5">{loc.postcode}</p>
                  
                  <p className="text-terracotta font-mono text-xs mt-4 tracking-widest ml-3.5 font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {loc.phone}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-pine/5 flex items-center justify-between relative z-10">
                  <div className="bg-terracotta text-white font-bold tracking-[0.1em] text-xs md:text-sm px-6 py-3 rounded-full uppercase shadow-md group-hover:bg-pine transition-colors">
                    ORDER {loc.name.replace('Taste Of Village ', '').toUpperCase()} MENU
                  </div>
                  <span className="text-pine/40 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase group-hover:text-terracotta/60 transition-colors hidden sm:block">
                    EXPLORE BRANCH &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
