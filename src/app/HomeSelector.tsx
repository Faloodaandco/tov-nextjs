'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';
import { MapPin, Flame } from 'lucide-react';

export default function HomeSelector() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col relative font-sans text-pine selection:bg-terracotta/20">
      
      {/* Editorial Navbar */}
      <header className={`w-full py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50 transition-all duration-500 relative ${scrolled ? 'bg-[#F4F1EA]/90 backdrop-blur-md border-b-[0.5px] border-pine/20 shadow-sm' : 'bg-transparent border-transparent'}`}>
        
        {/* Left Nav */}
        <div className="flex-1 flex justify-start">
          <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.25em] font-medium text-pine/80 uppercase">
            <button onClick={() => router.push('/info')} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Explore</button>
            <button onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Menus</button>
            <button onClick={() => router.push('/info')} className="cursor-pointer hover:text-terracotta transition-colors uppercase tracking-[0.25em]">Catering</button>
          </nav>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
          <img 
            src="/assets/tov-logo-pine.png" 
            alt="Taste of Village" 
            className="h-10 md:h-12 w-auto pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>

        {/* Right Actions */}
        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/info')} className="px-6 py-2 border-[0.5px] border-pine text-pine text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-pine hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button className="text-[10px] tracking-[0.2em] uppercase border-b border-pine/30 pb-0.5">Menu</button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 w-full max-w-5xl mx-auto">
        
        {/* Editorial Heading */}
        <div className="flex flex-col items-center mb-16 animate-fade-in-up text-center">
          <h1 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light mb-6">
            Home-style flavours, made fresh daily
          </h1>
          
          {/* Typographic Divider */}
          <div className="flex items-center gap-5 mb-8">
            <div className="h-[0.5px] w-16 md:w-32 bg-gradient-to-r from-transparent to-pine/40"></div>
            <span className="text-xl text-terracotta/90 drop-shadow-sm">✤</span>
            <div className="h-[0.5px] w-16 md:w-32 bg-gradient-to-l from-transparent to-pine/40"></div>
          </div>
          
          <p className="text-pine/60 text-[10px] md:text-[11px] font-sans tracking-[0.3em] uppercase font-bold">
            Select your destination
          </p>
        </div>

        {/* Flat Editorial Arches */}
        <div className="relative w-full max-w-4xl mx-auto">
          
          {/* Decorative Leaf Sprigs */}
          <div className="absolute top-[20%] md:top-1/2 md:-translate-y-1/2 left-[-5%] md:left-0 opacity-[0.08] pointer-events-none w-48 md:w-64 h-auto rotate-[-10deg]">
            <img src="/assets/tov-tree.svg" alt="" className="w-full h-auto object-contain [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
          </div>
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-[0.08] pointer-events-none w-64 h-auto">
            <img src="/assets/tov-tree.svg" alt="" className="w-full h-auto object-contain [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
          </div>
          <div className="absolute bottom-[20%] md:top-1/2 md:-translate-y-1/2 right-[-5%] md:right-0 opacity-[0.08] pointer-events-none w-48 md:w-64 h-auto rotate-[10deg] scale-x-[-1]">
            <img src="/assets/tov-tree.svg" alt="" className="w-full h-auto object-contain [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-3xl mx-auto justify-items-center relative z-10">
          {Object.values(LOCATIONS).map((loc, index) => {
            const isSlough = loc.id === 'slough';
            
            return (
              <div 
                key={loc.id}
                className="flex flex-col items-center animate-fade-in-up w-full"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* The Arch - Flat, Print Aesthetic */}
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if(e.key === 'Enter') navigateTo(e as any, '/' + loc.id, loc.id, loc.name); }}
                  onClick={(e) => navigateTo(e, '/' + loc.id, loc.id, loc.name)}
                  className="group cursor-pointer relative w-full max-w-[280px] h-[420px] rounded-t-full rounded-b-none border-[0.5px] border-pine/30 transition-colors duration-500 flex flex-col items-center justify-between pt-10 pb-8 bg-[#FBF9F4] hover:bg-white"
                >
                  {/* Vintage Print Artwork: Central Motif */}
                  <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[120px] h-[120px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 z-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[90px] h-[90px] rotate-45 bg-[url('/assets/tov-pattern.svg')] bg-[length:90px] bg-center"></div>
                  </div>

                  {/* Vintage Print Artwork: Bottom Border */}
                  <div className="absolute bottom-0 left-0 w-full h-[30px] opacity-[0.08] group-hover:opacity-[0.06] transition-opacity duration-500 z-0 bg-[url('/assets/tov-pattern.svg')] bg-[length:45px] bg-repeat-x bg-bottom pointer-events-none"></div>

                  <div className="flex flex-col items-center h-full justify-between w-full relative z-10">
                    
                    {/* Top: Icon and Title */}
                    <div className="flex flex-col items-center gap-4 mt-2">
                      <div className="text-pine/40 group-hover:text-terracotta transition-colors duration-500">
                        {isSlough ? <Flame size={18} strokeWidth={1.2} /> : <MapPin size={18} strokeWidth={1.2} />}
                      </div>
                      <h2 className="font-display font-medium text-3xl text-pine tracking-[0.15em] text-center px-4 group-hover:text-terracotta transition-colors">
                        {loc.name.replace('Taste Of Village ', '').toUpperCase()}
                      </h2>
                    </div>

                    {/* Middle: Address Info */}
                    <div className="flex flex-col items-center gap-1.5 mt-2">
                      <div className="w-6 h-[0.5px] bg-pine/20 mb-3 group-hover:bg-terracotta/40 transition-colors duration-500"></div>
                      <p className="text-pine/70 font-sans text-[10px] tracking-[0.2em] uppercase text-center px-6 leading-relaxed">
                        {loc.address}
                      </p>
                      <p className="text-terracotta font-mono text-[9px] tracking-[0.3em] uppercase mt-1">
                        {loc.postcode}
                      </p>
                    </div>

                    {/* Bottom: Outline Editorial Button */}
                    <div className="flex flex-col items-center w-full mt-auto pt-6">
                      <button 
                        onClick={(e) => navigateTo(e, '/' + loc.id + '/menu', loc.id, loc.name)}
                        className="inline-flex items-center justify-center px-6 py-2 rounded-full border-[0.5px] border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-colors duration-300"
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
      </main>

      {/* Patterned Motif Footer */}
      <footer className="w-full relative py-12 mt-auto overflow-hidden bg-[#F4F1EA] border-t-[0.5px] border-pine/10">
        {/* Motif Wallpaper Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url('/assets/tov-motif-green.svg')`, backgroundSize: '90px 90px', backgroundRepeat: 'repeat', backgroundPosition: 'center top' }}></div>
        
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
        {/* Patterned Background for Dark Footer */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "url('/assets/tov-pattern.svg')", backgroundSize: '80px 80px', backgroundRepeat: 'repeat' }}></div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 relative z-10">
          
          {/* Brand & Copyright */}
          <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
            <span className="font-display text-terracotta text-[11px] md:text-xs tracking-[0.3em] uppercase font-semibold">Taste of Village</span>
            <span className="text-[#889B8D] text-[8px] md:text-[9px] tracking-[0.2em] uppercase font-sans">
              &copy; {new Date().getFullYear()} Taste of Village | Hayes & Slough
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8 text-[#889B8D] text-[9px] tracking-[0.25em] uppercase font-sans">
            <button onClick={() => router.push('/book')} className="hover:text-terracotta cursor-pointer transition-colors uppercase tracking-[0.25em]">Reservations</button>
            <button onClick={() => router.push('/info')} className="hover:text-terracotta cursor-pointer transition-colors uppercase tracking-[0.25em]">Contact</button>
          </div>

        </div>
      </footer>
    </div>
  );
}


