'use client';
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, MessageCircle } from 'lucide-react';

const Instagram = ({ size = 20, ...props }: { size?: number; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Facebook = ({ size = 20, ...props }: { size?: number; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
import { SHOP_CONFIG, LOCATIONS } from '@/config/shopConfig';
import { useLocationConfig } from '@/hooks/useLocationConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { activeLocation } = useLocationConfig();
  const loc = activeLocation || LOCATIONS.hayes;

  return (
    <footer className="relative bg-pine text-bg-sand pt-24 pb-12 mt-20 overflow-hidden">
      {/* CNC Diamond Pattern — IMPROVEMENT: radial mask fades center for readability */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: "url('/assets/tov-pattern-light.svg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '80px 80px',
          opacity: 0.5,
          WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 15%, black 65%)',
          maskImage: 'radial-gradient(ellipse at center, transparent 15%, black 65%)',
        }}
      />
      {/* Gradient fade from page background into footer */}
      <div className="absolute top-0 left-0 w-full h-16 md:h-20 bg-gradient-to-b from-bg-sand to-transparent pointer-events-none" />
      {/* Absolute Background Pattern */}
      <div className="absolute inset-0 tov-feature-wall-light opacity-[0.04] pointer-events-none animate-ken-burns origin-center"></div>
      
      {/* Massive Background Monogram */}
      <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="" className="absolute -bottom-40 -right-40 w-[600px] h-[600px] opacity-[0.02] transform -rotate-12 pointer-events-none object-cover" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Link href="/" className="inline-flex flex-col items-start gap-5 mb-8 group">
              <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="Taste of Village" className="h-14 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <p className="text-bg-sand/60 text-sm leading-relaxed mb-8 font-medium normal-case tracking-wide">
              Bringing the authentic Desi taste of Lahore and Gujranwala straight to Hayes &amp; Slough. Curries, Karahis, and Grills crafted with passion and zero shortcuts.
            </p>
            <div className="flex gap-4">
              <a aria-label="Instagram" href={SHOP_CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <Instagram size={20} />
              </a>
              <a aria-label="Facebook" href={SHOP_CONFIG.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <Facebook size={20} />
              </a>
              <a aria-label="WhatsApp Hayes" href="https://wa.me/442034093786" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg" title="WhatsApp Hayes">
                <MessageCircle size={20} />
              </a>
              <a aria-label="WhatsApp Slough" href="https://wa.me/441753326341" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg" title="WhatsApp Slough">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links Quick */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/70">Explore</h4>
            <ul className="space-y-5">
              <li><Link href={`/${loc.id}`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Home</Link></li>
              <li><Link href={`/${loc.id}/menu`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Our Menu</Link></li>
              <li><Link href={`/${loc.id}/menu`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Order Takeaway</Link></li>
              <li><Link href="/book" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Book A Table</Link></li>
            </ul>
          </div>

          {/* Legal / Policy Hub */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/70">Legal & Policies</h4>
            <ul className="space-y-5">
              <li><Link href="/info?tab=allergies" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Allergy Guide</Link></li>
              <li><Link href="/info?tab=terms" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Terms & Conditions</Link></li>
              <li><Link href="/info?tab=privacy" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Privacy Policy</Link></li>
              <li><Link href="/info?tab=faq" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>FAQs</Link></li>
            </ul>
          </div>

          {/* Find Us */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/70">Find Us</h4>
            <div className="space-y-6">
              {Object.values(LOCATIONS).map((branch) => (
                <div key={branch.id} className="mb-6">
                  <h5 className="text-terracotta font-bold text-xs uppercase tracking-widest mb-3">{branch.name}</h5>
                  <div className="flex items-start gap-4 mb-3">
                    <MapPin size={20} className="text-terracotta flex-shrink-0 mt-0.5" />
                    <span className="text-bg-sand/70 leading-relaxed font-medium text-sm normal-case tracking-wide">
                      {branch.address}<br/>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-bg-sand">{branch.postcode}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <Phone size={20} className="text-terracotta flex-shrink-0" />
                    <span className="text-bg-sand/70 font-medium text-sm tracking-widest">{branch.phone}</span>
                  </div>
                  <div>
                    <a aria-label={`Get directions to ${branch.name}`} 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(branch.address + ', ' + branch.postcode)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden flex items-center justify-center w-full h-12 bg-bg-sand/5 border border-terracotta/20 transition-all duration-500 hover:border-terracotta"
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                      <div className="relative z-20 flex flex-col items-center gap-2">
                        <span className="font-sans font-black tracking-[0.2em] text-[10px] uppercase text-white">Get Directions</span>
                      </div>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* #4 FSA Food Hygiene Rating Badge — Official Trust Signal */}
        <div className="border-t border-bg-sand/10 pt-8 mb-8 flex flex-col items-center gap-4">
          <a
            href={loc.id === 'slough'
              ? 'https://ratings.food.gov.uk/business/1963386/taste-of-village-slough'
              : 'https://ratings.food.gov.uk/business/653844/a-taste-of-village'}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
            aria-label={`Food Hygiene Rating ${loc.id === 'slough' ? '5 — Very Good' : '4 — Good'}. Verified by the Food Standards Agency.`}
          >
            <img
              src={loc.id === 'slough' ? '/assets/fhrs-badge-5.svg' : '/assets/fhrs-badge-4.svg'}
              alt={`Food Hygiene Rating ${loc.id === 'slough' ? '5 — Very Good' : '4 — Good'}`}
              width={146}
              height={81}
              className="h-16 md:h-20 w-auto object-cover"
              loading="lazy"
            />
            <span className="text-[9px] text-bg-sand/30 font-bold uppercase tracking-[0.2em]">
              {loc.id === 'slough'
                ? 'Inspected 21 July 2026 · Food Standards Agency'
                : 'Inspected 25 June 2026 · Food Standards Agency'}
            </span>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-bg-sand/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-bg-sand/70 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
            © {currentYear} Taste Of Village. All rights reserved.
          </p>
          <p className="text-bg-sand/80 text-[10px] md:text-xs font-medium tracking-wide">
            Built with love by <a aria-label="Marketricks" href="https://marketricks.co.uk" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline font-bold">Marketricks</a>
          </p>
        </div>
      </div>

      {/* Massive Structural Anchor Typography */}
      <div className="w-full overflow-hidden flex justify-center mt-8 mb-[-2vw] opacity-[0.03] pointer-events-none select-none relative z-0">
        <span aria-hidden="true" className="font-display text-[22vw] leading-[0.8] whitespace-nowrap text-bg-sand tracking-tighter mix-blend-overlay">
          {SHOP_CONFIG.name.replace('Taste Of Village ', '').toUpperCase()}
        </span>
      </div>
    </footer>
  );
};

