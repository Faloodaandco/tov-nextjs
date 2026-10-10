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
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col relative font-sans text-pine selection:bg-terracotta/20 overflow-x-hidden">

      {/* Rose Top Border Strip — matches reference pink header border */}
      <div className="w-full h-[3px] bg-[#F0C6BD] flex-shrink-0" aria-hidden="true" />

      {/* Cinematic Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(0,0,0,0.02)_100%)] pointer-events-none z-0" />
      {/* Fine film grain */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />

      {/* Editorial Navbar */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b-[0.5px] border-pine/20 relative z-50">

        {/* Left Nav */}
        <div className="flex-1 flex justify-start">
          <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.25em] font-medium text-pine/80 uppercase">
            <button aria-label="Scroll to branch selector" onClick={() => document.getElementById('branch-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Explore</button>
            <button aria-label="View Hayes menu" onClick={() => router.push('/hayes/menu')} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Menus</button>
            <button aria-label="View offers" onClick={() => router.push('/offers')} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Offers</button>
            <button aria-label="Catering enquiry" onClick={() => { window.location.href = 'mailto:info@tasteofvillagerestaurants.co.uk?subject=Catering%20Inquiry'; }} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Catering</button>
          </nav>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
          <img
            src="/assets/tov-logo-pine.png"
            alt="Taste of Village"
            className="h-10 md:h-12 w-auto cursor-pointer object-cover"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
          <span className="text-pine italic font-serif text-[8px] md:text-[9px] mt-1 hidden md:block">
            Authentic Pakistani Restaurant
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center gap-6">
            <button aria-label="Contact us via email" onClick={() => window.location.href='mailto:info@tasteofvillagerestaurants.co.uk'} className="px-6 py-2 border-[0.5px] border-pine text-pine text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-pine hover:text-white transition-colors duration-300">
              Contact Us
            </button>
          </div>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button aria-label="Open mobile menu" className="text-[10px] tracking-[0.2em] uppercase border-b border-pine/30 pb-0.5">Menu</button>
          </div>
        </div>
      </header>

      <main id="branch-selector" className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pt-12 pb-16 px-4 sm:px-6">

        {/* Select Destination Text */}
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-terracotta/50" />
          <p className="text-pine text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase font-bold drop-shadow-sm">
            Select your destination
          </p>
          <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-terracotta/50" />
        </div>

        {/* Arch Cards */}
        <div className="relative w-full max-w-5xl mx-auto flex justify-center">

          {/* Left Vine */}
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

          {/* Right Vine */}
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
                    {/* Single Clean Arch Border — matches reference editorial flatness */}
                    <div
                      className="absolute inset-0 bg-white/25 backdrop-blur-sm border-[0.5px] border-pine/10 shadow-[0_8px_32px_-8px_rgba(26,60,52,0.08)] group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_-8px_rgba(26,60,52,0.12)] transition-all duration-500 z-10 pointer-events-none"
                      style={{ borderRadius: '160px 160px 0 0' }}
                    />

                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 md:p-8 text-center pt-12 pb-8">
                      <div className="flex flex-col items-center">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-pine/5 group-hover:bg-terracotta/10">
                          {isSlough ? <Flame size={15} className="text-terracotta transition-colors duration-500" /> : <MapPin size={15} className="text-pine/70 group-hover:text-terracotta transition-colors duration-500" />}
                        </div>

                        <h2 className="font-display text-2xl md:text-3xl text-pine tracking-widest uppercase mb-3 md:mb-4 group-hover:text-terracotta transition-colors duration-500">
                          {loc.city}
                        </h2>

                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-pine/80 text-[10px] md:text-[11px] tracking-[0.15em] font-medium uppercase">{loc.address}</span>
                          <span className="text-terracotta font-bold text-[10px] md:text-[11px] tracking-[0.3em] uppercase">{loc.postcode}</span>
                          <span className="text-pine/70 font-medium text-[11px] tracking-[0.1em] mt-0.5">{loc.phone}</span>
                        </div>
                      </div>

                      {/* Elevated Solid Accent Pill Button */}
                      <div className="w-full flex justify-center pt-4">
                        <button
                          aria-label={`Order now from ${loc.city}`}
                          onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}
                          className="px-7 py-3 rounded-full bg-pine text-[#FDF9F1] group-hover:bg-terracotta transition-all duration-300 shadow-[0_4px_16px_rgba(26,60,52,0.18)] group-hover:shadow-[0_6px_22px_rgba(138,61,42,0.28)] group-hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                        >
                          <span className="font-sans font-bold text-[10px] tracking-[0.25em] uppercase">Order Now</span>
                          <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
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

      {/* Editorial Trust Ribbon & Warm Gradient Transition into Footer */}
      <div className="w-full bg-gradient-to-b from-[#F4F1EA] via-[#ECE6DA] to-[#0E1F1A] pt-10 pb-5 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-pine/70">
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
            <span>100% Halal Certified · Prepared Fresh Daily · Hayes &amp; Slough</span>
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
          </div>
        </div>
      </div>

      {/* Unified Editorial Footer in Deep Heritage Pine */}
      <footer className="w-full bg-[#0E1F1A] text-[#889B8D] relative overflow-hidden border-t border-terracotta/20">
        {/* Authentic Diamond Cross-Stitch Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/tov-pattern-light.svg')",
            backgroundSize: '80px 80px',
            backgroundRepeat: 'repeat',
            opacity: 0.7,
          }}
        />
        
        {/* Subtle Top Rose Hairline Glow */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-terracotta/40 to-transparent pointer-events-none" />

        {/* FHRS Official Food Hygiene Badges Tier — Side-by-Side on Mobile */}
        <div className="relative z-10 border-b border-white/10 py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-xl mx-auto">
            <p className="text-center text-[#889B8D]/80 text-[8px] sm:text-[9px] font-mono tracking-[0.3em] uppercase mb-4">
              Official Food Standards Agency Ratings
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 items-center justify-center">
              {/* Hayes Badge Container */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 sm:py-3.5 sm:px-5 flex flex-col items-center gap-1.5 backdrop-blur-sm hover:bg-white/[0.08] transition-all">
                <span className="text-[#A2B5A7] text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium">Hayes Branch</span>
                <img src="/assets/fhrs-badge-4-horizontal.svg" alt="Hayes Food Hygiene Rating 4 - Good" className="h-5 sm:h-7 w-auto opacity-90 hover:opacity-100 transition-opacity" loading="lazy" />
              </div>

              {/* Slough Badge Container */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 sm:py-3.5 sm:px-5 flex flex-col items-center gap-1.5 backdrop-blur-sm hover:bg-white/[0.08] transition-all">
                <span className="text-[#A2B5A7] text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-medium">Slough Branch</span>
                <img src="/assets/fhrs-badge-5-horizontal.svg" alt="Slough Food Hygiene Rating 5 - Very Good" className="h-5 sm:h-7 w-auto opacity-90 hover:opacity-100 transition-opacity" loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand Copyright & Nav Tier */}
        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 relative z-10">
          <div className="flex flex-col gap-1.5 items-center md:items-start text-center md:text-left">
            <span className="font-display text-terracotta text-xs tracking-[0.3em] uppercase font-semibold">Taste of Village</span>
            <span className="text-[#889B8D] text-[9px] tracking-[0.2em] uppercase font-sans">
              &copy; {new Date().getFullYear()} Taste of Village | Authentic Pakistani Cuisine
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[#889B8D] text-[9px] tracking-[0.25em] uppercase font-sans">
            <button aria-label="View menus" onClick={() => router.push('/hayes/menu')} className="hover:text-terracotta cursor-pointer transition-colors duration-300 uppercase tracking-[0.25em]">Menu</button>
            <button aria-label="View offers" onClick={() => router.push('/offers')} className="hover:text-terracotta cursor-pointer transition-colors duration-300 uppercase tracking-[0.25em]">Offers</button>
            <button aria-label="Make a reservation" onClick={() => router.push('/book')} className="hover:text-terracotta cursor-pointer transition-colors duration-300 uppercase tracking-[0.25em]">Reservations</button>
            <button aria-label="Quick links hub" onClick={() => router.push('/links')} className="hover:text-terracotta cursor-pointer transition-colors duration-300 uppercase tracking-[0.25em]">Quick Links</button>
            <button aria-label="Contact us" onClick={() => window.location.href='mailto:info@tasteofvillagerestaurants.co.uk'} className="hover:text-terracotta cursor-pointer transition-colors duration-300 uppercase tracking-[0.25em]">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
