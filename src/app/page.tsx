'use client';

import Link from 'next/link';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';

export default function SplashSelector() {
  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tov_selected_location', branchId);
    }
    trackBranchSelect(branchId, branchName);
  };

  return (
    <main className="min-h-[100dvh] bg-bg-sand tov-pattern flex flex-col items-center justify-start sm:justify-center relative overflow-hidden py-6 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
      {/* Subtle brand glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[350px] bg-terracotta/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center my-auto sm:my-0">
        <img 
          src="/assets/tov-tree.svg" 
          alt="Taste of Village" 
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain mb-3 sm:mb-4 relative z-10 drop-shadow-[0_8px_16px_rgba(138,61,42,0.18)]"
        />

        <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-pine tracking-[0.12em] uppercase mb-2 sm:mb-3 relative z-10 leading-tight">
          TASTE OF VILLAGE
        </h1>
        
        <p className="text-pine/75 text-sm sm:text-base md:text-lg font-medium max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 relative z-10 italic font-serif leading-relaxed">
          Select your destination to explore our rich Punjab culinary heritage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl relative z-10">
          {Object.values(LOCATIONS).map((loc) => (
            <Link
              key={loc.id}
              href={`/${loc.id}`}
              onClick={() => handleBranchSelect(loc.id, loc.name)}
              className="group relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl md:rounded-[32px] p-5 sm:p-7 md:p-8 text-left transition-all duration-500 hover:bg-white/95 shadow-[0_10px_30px_-10px_rgba(138,61,42,0.12)] hover:shadow-[0_20px_45px_-12px_rgba(138,61,42,0.22)] hover:-translate-y-1 border border-terracotta/15 overflow-hidden flex flex-col h-full"
            >
              {/* Subtle brand gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-4 sm:mb-6 relative z-10">
                <div className="p-3 sm:p-3.5 bg-terracotta/10 rounded-full text-terracotta group-hover:bg-terracotta group-hover:text-bg-sand transition-all duration-300 shadow-inner group-hover:shadow-[0_8px_16px_rgba(138,61,42,0.25)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 border border-pine/10 group-hover:border-terracotta/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pine/40 group-hover:text-terracotta transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>

              <h2 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-pine tracking-[0.08em] mb-3 sm:mb-4 uppercase border-b border-pine/10 pb-3 group-hover:border-terracotta/30 transition-colors relative z-10">
                {loc.name.replace('Taste Of Village ', '')} BRANCH
              </h2>
              
              <div className="relative z-10 flex-grow">
                <div className="flex items-start gap-2.5 text-pine/80 font-medium text-sm sm:text-base normal-case">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 flex-shrink-0"></span>
                  <span>{loc.address}</span>
                </div>
                <p className="text-pine/50 font-mono text-xs sm:text-sm mt-1.5 tracking-wider uppercase ml-4">{loc.postcode}</p>
                
                <p className="text-terracotta/90 font-mono text-xs sm:text-sm mt-3 tracking-widest ml-4 font-bold flex items-center gap-2">
                  📞 {loc.phone}
                </p>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-pine/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                <div className="w-full sm:w-auto bg-terracotta text-white font-bold tracking-wider text-xs sm:text-sm py-3 px-5 sm:px-6 rounded-full uppercase shadow-md shadow-terracotta/25 group-hover:bg-pine transition-all text-center flex items-center justify-center gap-2 whitespace-nowrap">
                  <span>ORDER {loc.name.replace('Taste Of Village ', '').toUpperCase()} MENU</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <span className="text-pine/50 text-xs font-bold tracking-[0.15em] uppercase hidden lg:inline-block group-hover:text-terracotta transition-colors">
                  EXPLORE BRANCH
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
