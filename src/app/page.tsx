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
    <main className="min-h-screen bg-bg-sand tov-pattern flex flex-col items-center justify-center relative overflow-hidden py-12 px-4 md:px-8">
      {/* Subtle brand glow behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[400px] bg-terracotta/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
        <img 
          src="/assets/tov-logo-arch-terracotta-alpha.png" 
          alt="Taste of Village" 
          className="w-24 md:w-32 h-auto object-contain mb-8 relative z-10 drop-shadow-[0_10px_20px_rgba(138,61,42,0.15)]"
        />

        <h1 className="font-display font-black text-4xl md:text-6xl text-pine tracking-[0.15em] uppercase mb-4 relative z-10">
          TASTE OF VILLAGE
        </h1>
        
        <p className="text-pine/70 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-16 relative z-10 italic font-serif">
          Select your destination to explore our rich Punjab culinary heritage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
          {Object.values(LOCATIONS).map((loc) => (
            <Link
              key={loc.id}
              href={`/${loc.id}`}
              onClick={() => handleBranchSelect(loc.id, loc.name)}
              className="group relative bg-white/70 backdrop-blur-xl rounded-[40px] p-10 text-left transition-all duration-700 hover:bg-white/95 shadow-[0_15px_40px_-15px_rgba(138,61,42,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(138,61,42,0.2)] hover:-translate-y-2 border border-terracotta/10 overflow-hidden flex flex-col h-full"
            >
              {/* Subtle brand gradient background */}
              <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="p-4 bg-terracotta/10 rounded-full text-terracotta group-hover:bg-terracotta group-hover:text-bg-sand transition-all duration-500 shadow-inner group-hover:shadow-[0_10px_20px_rgba(138,61,42,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 border border-pine/10 group-hover:border-terracotta/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pine/40 group-hover:text-terracotta transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>

              <h2 className="font-display font-black text-2xl md:text-3xl text-pine tracking-[0.1em] mb-4 uppercase border-b border-pine/10 pb-4 group-hover:border-terracotta/30 transition-colors relative z-10">
                {loc.name.replace('Taste Of Village ', '')} BRANCH
              </h2>
              
              <div className="relative z-10 flex-grow">
                <div className="flex items-center gap-3 text-pine/80 font-medium normal-case">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
                  <span>{loc.address}</span>
                </div>
                <p className="text-pine/50 font-mono text-sm mt-2 tracking-wider uppercase ml-4">{loc.postcode}</p>
                
                <p className="text-terracotta/90 font-mono text-sm mt-4 tracking-widest ml-4 font-bold flex items-center gap-2">
                  📞 {loc.phone}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-pine/5 flex items-center justify-between relative z-10">
                <div className="bg-terracotta text-white font-bold tracking-wider text-sm px-6 py-3 rounded-full uppercase shadow-lg shadow-terracotta/20 group-hover:bg-pine transition-colors">
                  ORDER {loc.name.replace('Taste Of Village ', '').toUpperCase()} MENU
                </div>
                <span className="text-pine/40 text-xs font-bold tracking-[0.2em] uppercase hidden sm:block group-hover:text-terracotta/60 transition-colors">
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
