'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Flame, ArrowRight, Phone, MessageCircle, Star, Instagram, Facebook, Globe } from 'lucide-react';

const BRANCHES = {
  slough: {
    id: 'slough',
    name: 'Slough Branch',
    city: 'Slough',
    tagline: 'Farnham Road Dining & Takeaway',
    address: '260 Farnham Road, Slough',
    postcode: 'SL1 4XL',
    phone: '01753326341',
    phoneDisplay: '01753 326341',
    menuPath: '/slough/menu',
    whatsAppHref: "https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20view%20the%20menu%20and%20place%20an%20order.",
    googleReviewHref: 'https://g.page/r/CU4P6ZjGio6HEAE/review',
  },
  hayes: {
    id: 'hayes',
    name: 'Hayes Branch',
    city: 'Hayes',
    tagline: 'Uxbridge Road Dining & Takeaway',
    address: '766B Uxbridge Road, Hayes',
    postcode: 'UB4 0RU',
    phone: '02034093786',
    phoneDisplay: '020 3409 3786',
    menuPath: '/hayes/menu',
    whatsAppHref: "https://wa.me/442034093786?text=Hi%20Taste%20of%20Village%20Hayes!%20I'd%20like%20to%20view%20the%20menu%20and%20place%20an%20order.",
    googleReviewHref: 'https://share.google/t7BsnOEW5Zxb87xRv',
  },
};

export default function LinksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col relative font-sans text-pine selection:bg-terracotta/20 overflow-x-hidden">
      {/* Rose Top Border Strip */}
      <div className="w-full h-[3px] bg-[#F0C6BD] flex-shrink-0" aria-hidden="true" />

      {/* Cinematic Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3)_0%,rgba(0,0,0,0.02)_100%)] pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none z-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }} />

      {/* Editorial Navbar */}
      <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b-[0.5px] border-pine/20 relative z-50">
        <div className="flex-1 flex justify-start">
          <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.25em] font-medium text-pine/80 uppercase">
            <button onClick={() => router.push('/')} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Explore</button>
            <button onClick={() => router.push('/offers')} className="cursor-pointer hover:text-terracotta transition-colors duration-300 uppercase tracking-[0.25em]">Offers</button>
          </nav>
        </div>

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

        <div className="flex-1 flex justify-end">
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => window.location.href='mailto:info@tasteofvillagerestaurants.co.uk'} className="px-6 py-2 border-[0.5px] border-pine text-pine text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-pine hover:text-white transition-colors duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full pt-12 pb-16 px-4 sm:px-6">
        
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-terracotta/50" />
          <p className="text-pine text-[10px] md:text-xs font-sans tracking-[0.3em] uppercase font-bold drop-shadow-sm">
            Quick Links &amp; Ordering
          </p>
          <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-terracotta/50" />
        </div>

        <div className="relative w-full max-w-5xl mx-auto flex justify-center">
          {/* Vines */}
          <div className="absolute top-[30%] md:top-[20%] left-[5%] md:left-[10%] opacity-40 pointer-events-none w-10 md:w-12 h-auto rotate-[-5deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain animate-tov-float-left" />
          </div>
          <div className="hidden md:block absolute top-[15%] left-[48%] -translate-x-1/2 opacity-40 pointer-events-none w-12 h-auto rotate-[2deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain animate-tov-float-left" />
          </div>
          <div className="absolute bottom-[30%] md:top-[25%] right-[5%] md:right-[10%] opacity-40 pointer-events-none w-10 md:w-12 h-auto rotate-[8deg] z-0">
            <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain scale-x-[-1] animate-tov-float-right" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 w-full max-w-3xl mx-auto justify-items-center relative z-10">
            {Object.values(BRANCHES).map((loc) => {
              const isSlough = loc.id === 'slough';
              return (
                <div key={loc.id} className="flex flex-col items-center animate-fade-in-up w-full">
                  <div className="relative w-full max-w-[300px] md:max-w-[340px] aspect-[3/4.5] group flex flex-col">
                    {/* Clean Arch Border */}
                    <div
                      className="absolute inset-0 bg-white/30 backdrop-blur-sm border-[0.5px] border-pine/10 shadow-[0_8px_32px_-8px_rgba(26,60,52,0.08)] group-hover:-translate-y-1 group-hover:shadow-[0_12px_40px_-8px_rgba(26,60,52,0.12)] transition-all duration-500 z-10 pointer-events-none"
                      style={{ borderRadius: '160px 160px 24px 24px' }}
                    />

                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-start p-6 md:p-8 text-center pt-12 pb-8">
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-500 bg-pine/5 group-hover:bg-terracotta/10">
                          {isSlough ? <Flame size={15} className="text-terracotta transition-colors duration-500" /> : <MapPin size={15} className="text-pine/70 group-hover:text-terracotta transition-colors duration-500" />}
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl text-pine tracking-widest uppercase mb-2 group-hover:text-terracotta transition-colors duration-500">
                          {loc.city}
                        </h2>
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-pine/80 text-[10px] md:text-[11px] tracking-[0.15em] font-medium uppercase">{loc.address}</span>
                          <span className="text-pine/70 font-medium text-[11px] tracking-[0.1em] mt-0.5">{loc.phoneDisplay}</span>
                        </div>
                      </div>

                      {/* Links Stack */}
                      <div className="w-full flex flex-col gap-3 mt-2 px-2">
                        <Link href={loc.menuPath} className="w-full px-5 py-3 rounded-full bg-pine text-[#FDF9F1] hover:bg-terracotta transition-all duration-300 shadow-[0_4px_16px_rgba(26,60,52,0.18)] hover:shadow-[0_6px_22px_rgba(138,61,42,0.28)] flex items-center justify-center gap-2">
                          <span className="font-sans font-bold text-[9px] md:text-[10px] tracking-[0.25em] uppercase">Order Online</span>
                        </Link>
                        
                        <a href={loc.whatsAppHref} target="_blank" rel="noopener noreferrer" className="w-full px-5 py-3 rounded-full bg-[#128C7E] text-white hover:bg-[#075E54] transition-all duration-300 shadow-[0_4px_16px_rgba(37,211,102,0.2)] flex items-center justify-center gap-2">
                          <MessageCircle size={14} />
                          <span className="font-sans font-bold text-[9px] md:text-[10px] tracking-[0.25em] uppercase">WhatsApp Order</span>
                        </a>

                        <a href={`tel:${loc.phone}`} className="w-full px-5 py-3 rounded-full bg-white text-pine border border-pine/20 hover:border-terracotta hover:text-terracotta transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                          <Phone size={14} />
                          <span className="font-sans font-bold text-[9px] md:text-[10px] tracking-[0.25em] uppercase">Call Branch</span>
                        </a>

                        <a href={loc.googleReviewHref} target="_blank" rel="noopener noreferrer" className="w-full px-5 py-3 rounded-full bg-white text-pine border border-pine/20 hover:border-[#F4B400] hover:text-[#F4B400] transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                          <Star size={14} />
                          <span className="font-sans font-bold text-[9px] md:text-[10px] tracking-[0.25em] uppercase">Review Us</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Socials & Sister Brand Section matching the new aesthetic */}
        <div className="mt-16 w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-pine/20" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-pine/70">Connect With Us</span>
            <span className="w-8 h-px bg-pine/20" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 w-full">
            <Link href="/falooda" className="px-6 py-3 rounded-full bg-white border border-pine/10 hover:border-terracotta hover:text-terracotta transition-all text-[9px] tracking-[0.2em] uppercase font-bold text-pine flex items-center gap-2 shadow-sm">
              Falooda & Co Dessert Lounge
            </Link>
            <a href="https://www.instagram.com/tasteofvillageuk/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white border border-pine/10 hover:border-terracotta hover:text-terracotta transition-all text-[9px] tracking-[0.2em] uppercase font-bold text-pine flex items-center gap-2 shadow-sm">
              <Instagram size={14} /> Instagram
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590779182784" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-white border border-pine/10 hover:border-terracotta hover:text-terracotta transition-all text-[9px] tracking-[0.2em] uppercase font-bold text-pine flex items-center gap-2 shadow-sm">
              <Facebook size={14} /> Facebook
            </a>
          </div>
        </div>
      </main>

      {/* Editorial Trust Ribbon */}
      <div className="w-full bg-gradient-to-b from-[#F4F1EA] via-[#ECE6DA] to-[#0E1F1A] pt-10 pb-5 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-pine/70">
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
            <span>100% Halal Certified · Prepared Fresh Daily · Hayes &amp; Slough</span>
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
          </div>
        </div>
      </div>

      {/* Unified Editorial Footer */}
      <footer className="w-full bg-[#0E1F1A] text-[#889B8D] relative overflow-hidden border-t border-terracotta/20">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/assets/tov-pattern.svg')", backgroundSize: '80px 80px', backgroundRepeat: 'repeat' }} />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-terracotta/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto py-8 px-6 sm:px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0 relative z-10">
          <div className="flex flex-col gap-1.5 items-center md:items-start text-center md:text-left">
            <span className="font-display text-terracotta text-xs tracking-[0.3em] uppercase font-semibold">Taste of Village</span>
            <span className="text-[#889B8D] text-[9px] tracking-[0.2em] uppercase font-sans">
              &copy; {new Date().getFullYear()} Taste of Village Restaurants. All rights reserved.<br/>
              <span className="text-[7.5px] tracking-[0.1em] opacity-60">Built by Marketricks</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[#889B8D] text-[9px] tracking-[0.25em] uppercase font-sans">
            <button onClick={() => router.push('/hayes/menu')} className="hover:text-terracotta transition-colors duration-300">Menu</button>
            <button onClick={() => router.push('/offers')} className="hover:text-terracotta transition-colors duration-300">Offers</button>
            <button onClick={() => router.push('/book')} className="hover:text-terracotta transition-colors duration-300">Reservations</button>
            <button onClick={() => router.push('/')} className="hover:text-terracotta transition-colors duration-300">Official Website</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
