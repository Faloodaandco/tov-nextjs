'use client';

import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';
import { MapPin, Flame, ArrowRight } from 'lucide-react';

export default function HomeSelector() {
  const router = useRouter();
  
  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tov_selected_location', branchId);
    }
    trackBranchSelect(branchId, branchName);
  };

  const navigateTo = (e: React.MouseEvent, path: string, branchId: string, branchName: string) => {
    e.stopPropagation();
    handleBranchSelect(branchId, branchName);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-bg-sand flex flex-col items-center justify-center relative overflow-hidden py-6 md:py-10">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/assets/tov-cfd-bg.webp')] bg-cover bg-center opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#FDFBF7]/80 via-[#FDFBF7]/40 to-[#FDFBF7] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Brand Lockup */}
        <div className="flex flex-col items-center mb-6 md:mb-10 animate-fade-in-up">
          <img 
            src="/assets/tov-logo-pine.png" 
            alt="Taste of Village" 
            className="w-48 md:w-64 lg:w-72 h-auto mb-4"
          />
          <div className="flex items-center gap-4">
            <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-terracotta/50"></div>
            <p className="text-pine/70 text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase font-bold drop-shadow-sm">
              Select your destination
            </p>
            <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-terracotta/50"></div>
          </div>
        </div>

        {/* Heritage Archway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full">
          {Object.values(LOCATIONS).map((loc, index) => {
            const isSlough = loc.id === 'slough';
            
            return (
              <div 
                key={loc.id}
                className="flex flex-col items-center animate-fade-in-up"
                style={{ animationDelay: ${index * 150}ms }}
              >
                {/* The Arch */}
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if(e.key === 'Enter') navigateTo(e as any, '/' + loc.id, loc.id, loc.name); }}
                  onClick={(e) => navigateTo(e, '/' + loc.id, loc.id, loc.name)}
                  className="group cursor-pointer relative w-full max-w-[320px] h-[240px] md:h-[280px] rounded-t-[140px] rounded-b-xl border border-pine/15 hover:border-terracotta/40 transition-all duration-700 overflow-hidden flex flex-col items-center justify-end pb-8 bg-white/20 hover:bg-white/40 shadow-[0_4px_30px_rgba(26,60,52,0.02)] hover:shadow-[0_20px_60px_rgba(138,61,42,0.08)] backdrop-blur-sm hover:-translate-y-2"
                >
                  {/* Special Arch Art Background (CNC Carved Pattern) */}
                  <div className="absolute inset-0 bg-[url('/assets/tov-pattern.svg')] bg-[length:160px] bg-repeat opacity-[0.03] group-hover:opacity-[0.05] mix-blend-multiply transition-opacity duration-700 pointer-events-none z-0"></div>

                  {/* Golden Hour Stage Glow inside Arch */}
                  <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-terracotta/15 via-terracotta/5 to-transparent pointer-events-none z-0 group-hover:from-terracotta/25 transition-colors duration-700"></div>

                  {/* Icon */}
                  <div className="absolute top-8 w-12 h-12 rounded-full border border-pine/10 flex items-center justify-center text-pine/40 group-hover:text-terracotta transition-colors duration-500 z-10">
                    {isSlough ? <Flame size={20} strokeWidth={1.5} /> : <MapPin size={20} strokeWidth={1.5} />}
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-bold text-3xl md:text-4xl text-pine tracking-[0.1em] mb-2 relative z-10 group-hover:text-terracotta transition-colors drop-shadow-sm">
                    {loc.name.replace('Taste Of Village ', '').toUpperCase()}
                  </h2>

                  {/* Enter Link */}
                  <div className="relative z-10 flex items-center gap-2 text-pine/40 group-hover:text-terracotta transition-colors text-[9px] font-black tracking-[0.2em] uppercase">
                    <span>Enter</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Info Below Arch */}
                <div className="mt-5 flex flex-col items-center gap-3 w-full text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-pine/70 font-sans text-xs tracking-wide leading-relaxed">
                      {loc.address}
                    </p>
                    <p className="text-terracotta font-mono text-[9px] tracking-[0.2em] uppercase font-bold mt-1">
                      {loc.postcode}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-terracotta border border-terracotta shadow-sm transition-all text-white hover:bg-pine hover:border-pine hover:scale-105 duration-300"
                  >
                    <span className="font-black text-[9px] tracking-[0.2em] uppercase">Order Now</span>
                  </button>

                  <img
                    src={isSlough ? '/assets/fhrs-badge-5-horizontal.svg' : '/assets/fhrs-badge-4-horizontal.svg'}
                    alt={Food Hygiene Rating }
                    className="h-5 w-auto opacity-70 mt-1"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}