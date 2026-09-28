'use client';

import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';
import { MapPin, Flame, ArrowRight } from 'lucide-react';

export default function HomeSelector() {
  const router = useRouter();
  
  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('tov_selected_location', branchId); } catch (e) { console.warn('localStorage blocked'); }
    }
    trackBranchSelect(branchId, branchName);
  };

  const navigateTo = (e: React.MouseEvent, path: string, branchId: string, branchName: string) => {
    e.stopPropagation();
    handleBranchSelect(branchId, branchName);
    window.location.href = path;
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl mx-auto justify-items-center">
          {Object.values(LOCATIONS).map((loc, index) => {
            const isSlough = loc.id === 'slough';
            
            return (
              <div 
                key={loc.id}
                className="flex flex-col items-center animate-fade-in-up w-full"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* The Arch - Replica of the physical restaurant interior arches */}
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if(e.key === 'Enter') navigateTo(e as any, '/' + loc.id, loc.id, loc.name); }}
                  onClick={(e) => navigateTo(e, '/' + loc.id, loc.id, loc.name)}
                  className="group cursor-pointer relative w-full max-w-[280px] h-[440px] rounded-t-full rounded-b-none border border-white/60 transition-all duration-700 flex flex-col items-center justify-between pt-10 pb-6 bg-[#FCFAF5] shadow-[0_4px_20px_rgba(26,60,52,0.02)] hover:-translate-y-2"
                >
                  {/* LED Inner Rim Glow (Replicating the physical lighting) */}
                  <div className="absolute inset-0 rounded-t-full rounded-b-none shadow-[inset_0_0_30px_rgba(211,167,98,0.15)] group-hover:shadow-[inset_0_0_40px_rgba(211,167,98,0.25)] transition-shadow duration-700 pointer-events-none z-0"></div>

                  {/* CNC Artwork: Central Diamond Motif */}
                  <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[140px] h-[140px] opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-700 z-0 flex items-center justify-center pointer-events-none mix-blend-multiply">
                    <div className="w-[90px] h-[90px] rotate-45 bg-[url('/assets/tov-pattern.svg')] bg-[length:90px] bg-center"></div>
                  </div>

                  {/* CNC Artwork: Bottom Border Motif */}
                  <div className="absolute bottom-0 left-0 w-full h-[36px] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700 z-0 bg-[url('/assets/tov-pattern.svg')] bg-[length:54px] bg-repeat-x bg-bottom pointer-events-none mix-blend-multiply"></div>

                  <div className="flex flex-col items-center h-full justify-between w-full relative z-10">
                    
                    {/* Top: Icon and Title */}
                    <div className="flex flex-col items-center gap-4 transition-transform duration-700 group-hover:-translate-y-1">
                      <div className="text-pine/50 group-hover:text-terracotta transition-colors duration-500 bg-white/80 w-12 h-12 rounded-full flex items-center justify-center shadow-sm border border-pine/5">
                        {isSlough ? <Flame size={20} strokeWidth={1.5} /> : <MapPin size={20} strokeWidth={1.5} />}
                      </div>
                      <h2 className="font-display font-semibold text-3xl text-pine tracking-[0.15em] text-center px-4 group-hover:text-terracotta transition-colors">
                        {loc.name.replace('Taste Of Village ', '').toUpperCase()}
                      </h2>
                    </div>

                    {/* Middle: Address Info */}
                    <div className="flex flex-col items-center gap-1.5 transition-transform duration-700 group-hover:-translate-y-1 mt-4">
                      <div className="w-8 h-[1px] bg-terracotta/30 mb-3 group-hover:bg-terracotta/50 transition-colors duration-500"></div>
                      <p className="text-pine/70 font-sans text-[11px] tracking-[0.2em] uppercase text-center px-6 leading-relaxed">
                        {loc.address}
                      </p>
                      <p className="text-terracotta font-mono text-[9px] tracking-[0.3em] uppercase mt-1">
                        {loc.postcode}
                      </p>
                    </div>

                    {/* Bottom: Solid Inviting Button and Badge */}
                    <div className="flex flex-col items-center gap-6 w-full mt-auto pt-8">
                      <button 
                        onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}
                        className="inline-flex items-center justify-center px-7 py-2.5 rounded-full bg-terracotta border border-terracotta text-white shadow-md shadow-terracotta/20 hover:bg-pine hover:border-pine transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <span className="font-sans font-bold text-[10px] tracking-[0.25em] uppercase">Order Now</span>
                      </button>
                      
                      <img
                        src={isSlough ? '/assets/fhrs-badge-5-horizontal.svg' : '/assets/fhrs-badge-4-horizontal.svg'}
                        alt="Food Hygiene Rating"
                        className="h-[16px] w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 relative z-10 bg-white/50 backdrop-blur-sm rounded-sm px-1 py-0.5"
                        loading="lazy"
                      />
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}