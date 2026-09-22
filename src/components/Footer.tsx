'use client';
import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, MessageCircle, Clock } from 'lucide-react';

const Instagram = ({ size = 20, ...props }: { size?: number; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Facebook = ({ size = 20, ...props }: { size?: number; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
import { SHOP_CONFIG, LOCATIONS, buildWhatsAppLink } from '@/config/shopConfig';
import { useLocationConfig } from '@/hooks/useLocationConfig';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { activeLocation } = useLocationConfig();
  const loc = activeLocation || LOCATIONS.hayes;

  return (
    <footer className="relative bg-pine text-bg-sand pt-24 pb-12 mt-20 border-t border-terracotta/20 overflow-hidden">
      {/* Absolute Background Pattern */}
      <div className="absolute inset-0 tov-feature-wall-light opacity-[0.02] pointer-events-none animate-ken-burns origin-center"></div>
      
      {/* Massive Background Monogram */}
      <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="" className="absolute -bottom-40 -right-40 w-[600px] h-[600px] opacity-[0.02] transform -rotate-12 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1 flex flex-col items-start">
            <Link href="/" className="inline-flex flex-col items-start gap-5 mb-8 group">
              <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="Taste of Village" className="h-14 w-auto object-contain brightness-0 invert opacity-90 group-hover:scale-105 transition-transform duration-500" />
            </Link>
            <p className="text-bg-sand/60 text-sm leading-relaxed mb-8 font-medium normal-case tracking-wide">
              Bringing the authentic Desi taste of Lahore and Gujranwala straight to {SHOP_CONFIG.name.replace('Taste Of Village ', '')}. Curries, Karahis, and Grills crafted with passion and zero shortcuts.
            </p>
            <div className="flex gap-4">
              <a href={SHOP_CONFIG.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <Instagram size={20} />
              </a>
              <a href={SHOP_CONFIG.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <Facebook size={20} />
              </a>
              <a href={buildWhatsAppLink('Hello! I have a question.')} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-bg-sand/20 text-bg-sand flex items-center justify-center hover:bg-terracotta hover:border-terracotta hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Links Quick */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/40">Explore</h4>
            <ul className="space-y-5">
              <li><Link href={`/${loc.id}/home`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Home</Link></li>
              <li><Link href={`/${loc.id}/menu`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Our Menu</Link></li>
              <li><Link href={`/${loc.id}/menu`} className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Order Takeaway</Link></li>
              <li><Link href="/book" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Book A Table</Link></li>
            </ul>
          </div>

          {/* Legal / Policy Hub */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/40">Legal & Policies</h4>
            <ul className="space-y-5">
              <li><Link href="/info?tab=allergies" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Allergy Guide</Link></li>
              <li><Link href="/info?tab=terms" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Terms & Conditions</Link></li>
              <li><Link href="/info?tab=privacy" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>Privacy Policy</Link></li>
              <li><Link href="/info?tab=faq" className="text-bg-sand/70 hover:text-terracotta transition-colors font-bold text-xs uppercase tracking-[0.15em] flex items-center gap-2 group"><span className="w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-4"></span>FAQs</Link></li>
            </ul>
          </div>

          {/* Find Us */}
          <div>
            <h4 className="font-sans font-bold text-xs mb-8 tracking-[0.2em] uppercase text-bg-sand/40">Find Us</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin size={20} className="text-terracotta flex-shrink-0 mt-0.5" />
                <span className="text-bg-sand/70 leading-relaxed font-medium text-sm normal-case tracking-wide">
                  {SHOP_CONFIG.address}<br/>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-bg-sand">{SHOP_CONFIG.postcode}</span>
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone size={20} className="text-terracotta flex-shrink-0" />
                <span className="text-bg-sand/70 font-medium text-sm tracking-widest">{SHOP_CONFIG.phoneNumber}</span>
              </li>
              
              <li className="mt-8">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SHOP_CONFIG.address + ', ' + SHOP_CONFIG.postcode)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden flex items-center justify-center w-full h-32 bg-bg-sand/5 border border-terracotta/20 transition-all duration-500 hover:border-terracotta"
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle at center, #8a3d2a 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                  <div className="relative z-20 flex flex-col items-center gap-3">
                    <MapPin size={24} className="text-terracotta group-hover:-translate-y-2 transition-transform duration-500" />
                    <span className="font-sans font-black tracking-[0.2em] text-xs uppercase text-white">Get Directions</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* #3 SEO Footer — Keyword-Rich Description for Google */}
        <div className="border-t border-bg-sand/10 pt-12 mb-8 flex justify-center text-center">
          <p className="text-bg-sand/20 text-[10px] leading-relaxed font-medium normal-case max-w-5xl tracking-widest text-justify md:text-center">
            {SHOP_CONFIG.name} is a halal Pakistani restaurant and takeaway located at {SHOP_CONFIG.address}, {SHOP_CONFIG.postcode}. 
            We specialise in authentic Lahori and Gujranwala cuisine including Chicken Karahi, Lamb Karahi, Haleem, Nihari, 
            Samosa Chaat, Dahi Bhalla, Biryani, BBQ platters, Seekh Kebab, Chapli Kebab, fresh Naan, Roti and Paratha. 
            Our chefs prepare every dish with traditional slow-cooking methods using fresh ingredients — no shortcuts, no tinned 
            chickpeas, no store-bought papdi. Whether you're looking for a halal restaurant near {SHOP_CONFIG.name.replace('Taste Of Village ', '')}, 
            Pakistani food in {SHOP_CONFIG.postcode.split(' ')[0]}, or the best Karahi in the area, {SHOP_CONFIG.name} delivers the real taste of the village to your plate. 
            Open Monday to Sunday, 12 PM – 11 PM. Order online for collection or dine in with us.
          </p>
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
              className="h-16 md:h-20 w-auto"
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
          <p className="text-bg-sand/40 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
            © {currentYear} Taste Of Village. All rights reserved.
          </p>
          <p className="text-bg-sand/50 text-[10px] md:text-xs font-medium tracking-wide">
            Built with love by <a href="https://marketricks.co.uk" target="_blank" rel="noopener noreferrer" className="text-terracotta hover:underline font-bold">Marketricks</a>
          </p>
        </div>
      </div>

      {/* Massive Structural Anchor Typography */}
      <div className="w-full overflow-hidden flex justify-center mt-8 mb-[-2vw] opacity-[0.03] pointer-events-none select-none relative z-0">
        <h1 className="font-display text-[22vw] leading-[0.8] whitespace-nowrap text-bg-sand tracking-tighter mix-blend-overlay">
          {SHOP_CONFIG.name.replace('Taste Of Village ', '').toUpperCase()}
        </h1>
      </div>
    </footer>
  );
};
