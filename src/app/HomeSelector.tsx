'use client';

import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';
import { MapPin, Flame } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col relative font-sans text-pine selection:bg-terracotta/20 overflow-x-hidden">
      
      {/* Cinematic End-to-End Background Texture */}
      {/* Soft cinematic vignette / lighting wash */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(0,0,0,0.02)_100%)] pointer-events-none z-0"></div>
      {/* High-end fine film grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
      
      {/* Editorial Navbar (Static at top, not sticky, with solid border) */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b-[0.5px] border-pine/20 relative z-50">
        
        {/* Left Nav */}
        <div className="flex-1 flex justify-start">
          <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.25em] font-medium text-pine/80 uppercase">
            <button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Explore</button>
            <button onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Menus</button>
            <button onClick={() => { window.location.href = 'mailto:info@tasteofvillagerestaurants.co.uk?subject=Catering%20Inquiry'; }} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Catering</button>
          </nav>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
          <img 
            src="/assets/tov-logo-pine.png" 
            alt="Taste of Village" 
            className="h-10 md:h-12 w-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          {/* Tagline under logo as requested */}
          <span className="text-pine/70 italic font-serif text-[8px] md:text-[9px] mt-1 hidden md:block">
            Home-style flavours, made fresh daily
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => window.location.href='mailto:info@tasteofvillagerestaurants.co.uk'} className="px-6 py-2 border-[0.5px] border-pine text-pine text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-pine hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button className="text-[10px] tracking-[0.2em] uppercase border-b border-pine/30 pb-0.5">Menu</button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pt-12 pb-16 px-4 sm:px-6">
        
        {/* Select Destination Text */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-terracotta/50"></div>
          <p className="text-pine/70 text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase font-bold drop-shadow-sm">
            Select your destination
          </p>
          <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-terracotta/50"></div>
        </div>

        {/* Flat Editorial Arches */}
        <div className="relative w-full max-w-5xl mx-auto flex justify-center">
          
          {/* Left Vines */}
          <div className="absolute top-[30%] md:top-[20%] left-[5%] md:left-[10%] opacity-40 pointer-events-none w-10 md:w-12 h-auto rotate-[-5deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain animate-tov-float-left" />
          </div>

          {/* Middle Vines */}
          <div className="hidden md:block absolute top-[15%] left-[48%] -translate-x-1/2 opacity-40 pointer-events-none w-12 h-auto rotate-[2deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain animate-tov-float-left" />
          </div>
          <div className="hidden md:block absolute top-[30%] left-[52%] -translate-x-1/2 opacity-30 pointer-events-none w-10 h-auto rotate-[-8deg] scale-x-[-1] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain animate-tov-float-left" />
          </div>

          {/* Right Vines */}
          <div className="absolute bottom-[30%] md:top-[25%] right-[5%] md:right-[10%] opacity-40 pointer-events-none w-10 md:w-12 h-auto rotate-[8deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain scale-x-[-1] animate-tov-float-right" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 w-full max-w-3xl mx-auto justify-items-center relative z-10">
            {Object.values(LOCATIONS).map((loc) => {
              const isSlough = loc.id === 'slough';
              return (
                <div 
                  key={loc.id}
                  className="flex flex-col items-center animate-fade-in-up w-full"
                >
                  <div className="relative w-full max-w-[280px] md:max-w-[320px] aspect-[4/5] group cursor-pointer" onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}>
                    {/* Liquid Glass Arch */}
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-t-[140px] md:rounded-t-[160px] border-[0.5px] border-white/60 shadow-[0_25px_50px_-12px_rgba(26,60,52,0.12)] shadow-inner-[0_1.5px_1px_0_rgba(255,255,255,0.9)] group-hover:-translate-y-2 group-hover:scale-[1.015] transition-all duration-500 z-10 pointer-events-none"></div>
                    <div className="absolute inset-2 rounded-t-[137px] md:rounded-t-[155px] border-[0.5px] border-pine/15 group-hover:border-terracotta/30 transition-colors duration-500 z-10 pointer-events-none"></div>
                    
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 md:p-8 text-center pt-16">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-6 transition-all duration-500">
                        {isSlough ? <Flame size={14} className="text-pine/60" /> : <MapPin size={14} className="text-pine/60" />}
                      </div>
                      
                      <h2 className="font-display text-2xl md:text-3xl text-pine tracking-widest uppercase mb-4 md:mb-6 group-hover:text-terracotta transition-colors duration-500">
                        {loc.city}
                      </h2>
                      
                                            <div className="flex flex-col items-center gap-2 mb-8 md:mb-10">
                        <span className="text-pine/80 text-[10px] md:text-[11px] tracking-[0.15em] font-medium uppercase">{loc.address}</span>
                        <span className="text-terracotta font-bold text-[10px] md:text-[11px] tracking-[0.3em] uppercase">{loc.postcode}</span>
                        <span className="text-pine/80 font-medium text-[11px] tracking-[0.1em] mt-1">{loc.phone}</span>
                      </div>
                      
                      <div className="mt-auto mb-6">
                        <button 
                          onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}
                          className="px-6 py-2 rounded-full border-[0.5px] border-pine/40 group-hover:border-terracotta text-pine group-hover:text-terracotta transition-all duration-500 flex items-center gap-2 bg-transparent"
                        >
                          <span className="font-sans font-bold text-[9px] tracking-[0.25em] uppercase">Order Now</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Patterned Motif Footer */}
      <footer className="w-full relative py-12 mt-auto overflow-hidden bg-[#F4F1EA] border-t-[0.5px] border-pine/10">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('/assets/tov-motif-green.svg')", backgroundSize: '90px 90px', backgroundRepeat: 'repeat', backgroundPosition: 'center top' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24">
          <div className="flex flex-col items-center gap-2">
            <span className="text-pine/60 text-[8px] uppercase tracking-[0.3em] font-bold">Hayes Branch</span>
            <img src="/assets/fhrs-badge-4-horizontal.svg" alt="Hayes Food Hygiene Rating 4" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" loading="lazy" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-pine/60 text-[8px] uppercase tracking-[0.3em] font-bold">Slough Branch</span>
            <img src="/assets/fhrs-badge-5-horizontal.svg" alt="Slough Food Hygiene Rating 5" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300" loading="lazy" />
          </div>
        </div>
      </footer>

      {/* Luxury Dark Footer */}
      <footer className="w-full bg-[#0B140F] py-10 px-8 md:px-16 border-t border-[#0B140F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url('/assets/tov-pattern.svg')", backgroundSize: '80px 80px', backgroundRepeat: 'repeat' }}></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 relative z-10">
          
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <span className="font-display text-terracotta text-[11px] md:text-xs tracking-[0.3em] uppercase font-semibold">Taste of Village</span>
            <span className="text-[#889B8D] text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-sans">
              &copy; {new Date().getFullYear()} Taste of Village | Hayes & Slough
            </span>
          </div>

          <div className="flex gap-8 text-[#889B8D] text-[9px] tracking-[0.25em] uppercase font-sans">
            <button onClick={() => router.push('/book')} className="hover:text-terracotta cursor-pointer transition-colors uppercase tracking-[0.25em]">Reservations</button>
            <button onClick={() => window.location.href='mailto:info@tasteofvillagerestaurants.co.uk'} className="hover:text-terracotta cursor-pointer transition-colors uppercase tracking-[0.25em]">Contact</button>
          </div>

        </div>
      </footer>
    </div>
  );
}











