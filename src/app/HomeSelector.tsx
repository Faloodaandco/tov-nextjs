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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center relative overflow-hidden py-6 md:py-10">
      {/* Warm Sandy Gradient & Grain */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#F8EFE3] to-[#F1E3D3] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* 15% Restaurant Ambience Photo (Warmer Blend) */}
      <div className="absolute inset-0 bg-[url('/assets/tov-cfd-bg.webp')] bg-cover bg-center opacity-15 pointer-events-none mix-blend-multiply"></div>
      
      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Brand Lockup */}
        <div className="flex flex-col items-center mb-6 md:mb-10 animate-fade-in-up">
          <img 
            src="/assets/tov-logo-pine.png" 
            alt="Taste of Village" 
            className="w-48 md:w-64 lg:w-72 h-auto mb-3"
          />
          <p className="text-pine/90 font-serif italic text-[15px] md:text-[17px] tracking-wide mb-6 drop-shadow-sm">
            Home-style flavours, made fresh daily
          </p>
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
                className="flex flex-col items-center animate-fade-in-up w-full relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Left Leaf Sprig */}
                <div className="absolute -left-2 md:-left-6 top-1/4 w-10 md:w-12 h-40 md:h-48 pointer-events-none opacity-[0.25] z-0">
                  <svg viewBox="0 0 40 160" fill="none" stroke="#1A3C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25,160 Q10,120 20,80 T25,0" />
                    <path d="M22,140 Q32,135 32,125 Q27,125 22,130" />
                    <path d="M15,110 Q5,105 5,95 Q10,95 15,100" />
                    <path d="M22,80 Q32,75 32,65 Q27,65 22,70" />
                    <path d="M18,40 Q8,35 8,25 Q13,25 18,30" />
                    <path d="M24,15 Q34,10 34,0 Q29,0 24,5" />
                  </svg>
                </div>
                
                {/* Right Leaf Sprig */}
                <div className="absolute -right-2 md:-right-6 top-1/3 w-10 md:w-12 h-40 md:h-48 pointer-events-none opacity-[0.25] transform scale-x-[-1] translate-y-8 z-0">
                  <svg viewBox="0 0 40 160" fill="none" stroke="#1A3C34" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25,160 Q10,120 20,80 T25,0" />
                    <path d="M22,140 Q32,135 32,125 Q27,125 22,130" />
                    <path d="M15,110 Q5,105 5,95 Q10,95 15,100" />
                    <path d="M22,80 Q32,75 32,65 Q27,65 22,70" />
                    <path d="M18,40 Q8,35 8,25 Q13,25 18,30" />
                    <path d="M24,15 Q34,10 34,0 Q29,0 24,5" />
                  </svg>
                </div>

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