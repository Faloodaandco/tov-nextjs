// @ts-nocheck
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChefHat, UtensilsCrossed, Clock, MapPin, ChevronDown, ChevronUp, Flame, CheckCircle, HelpCircle, ArrowRight, Sparkles, Phone } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { SHOP_CONFIG, LOCATIONS } from '@/config/shopConfig';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';
import { useLocationConfig } from '@/hooks/useLocationConfig';
import { getBranchSeoMeta, getRestaurantSchema, getFaqSchema } from '@/lib/seoData';

const HERO_IMAGES = [
  '/assets/bg-food.webp',
  '/assets/interior/interior_main.webp',
  '/assets/interior/interior_2.webp'
];

export default function TOVHome() {
  const router = useRouter();
  const params = useParams();
  const routeLocationId = ((params?.locationId as string) || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  const { activeLocation } = useLocationConfig();
  const branchLoc = LOCATIONS[routeLocationId] || activeLocation || LOCATIONS.hayes;
  const isSlough = branchLoc.id === 'slough';
  const seoMeta = getBranchSeoMeta(branchLoc.id);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Postcode Proximity / Fast Collection Checker State
  const [postcode, setPostcode] = useState('');
  const [postcodeStatus, setPostcodeStatus] = useState<'idle' | 'checked'>('idle');
  const [nearestBranch, setNearestBranch] = useState<{ id: string; name: string; address: string; time: string } | null>(null);

  const checkPostcode = () => {
    if (!postcode.trim()) return;
    const p = postcode.toUpperCase().replace(/\s+/g, '');
    
    // Slough & Berkshire: SL1, SL2, SL3, SL4, RG
    const isSlough = ['SL', 'RG'].some(prefix => p.startsWith(prefix));

    if (isSlough) {
      setPostcodeStatus('checked');
      setNearestBranch({
        id: 'slough',
        name: 'Taste of Village Slough',
        address: '260 Farnham Road, Slough SL1 4XL',
        time: 'Ready for Collection in ~20 mins'
      });
    } else {
      // Default / West London / Hayes: UB, TW, W, HA
      setPostcodeStatus('checked');
      setNearestBranch({
        id: 'hayes',
        name: 'Taste of Village Hayes',
        address: '766B Uxbridge Rd, Hayes UB4 0RU',
        time: 'Ready for Collection in ~20 mins'
      });
    }
  };

  const handleCategoryClick = (cat: string) => {
    sessionStorage.setItem('home_scroll_pos', window.scrollY.toString());
    router.push(`/${activeLocation.id}/menu?cat=${cat}`);
  };

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('home_scroll_pos');
    if (savedScroll) {
      sessionStorage.removeItem('home_scroll_pos');
      const targetY = parseInt(savedScroll, 10);
      if (!isNaN(targetY)) {
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'instant' });
        }, 150);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-sand text-brand-text font-sans uppercase">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getRestaurantSchema(branchLoc.id)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqSchema(branchLoc.id)) }} />

      {/* Progressive Hero Section */}
      <section className="relative min-h-[85vh] md:min-h-[92vh] w-full flex items-center justify-center overflow-hidden bg-pine">
        
        {/* Full-width Cinematic Image Background */}
        <div className="absolute inset-0 w-full h-full z-10 overflow-hidden">
          <motion.div style={{ y: yBg }} className="absolute inset-0 w-full h-full">
            {HERO_IMAGES.map((src, index) => (
              <img 
                key={src}
                src={src} 
                alt="Taste of Village Signature Dish" 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-[2500ms] ease-in-out
                  ${index === currentImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                style={{ transformOrigin: 'center center' }}
              />
            ))}
          </motion.div>
          
          {/* Subtle multi-layer cinematic vignette for text clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-pine/90 via-black/45 to-pine/95 z-10"></div>
          <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/70 z-10"></div>
        </div>

        {/* Typography overlay & CTA */}
        <div className="relative z-20 flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 pt-24 sm:pt-28 md:pt-32 pb-16 text-center max-w-4xl mx-auto w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col items-center mb-6"
          >
            <img 
              src="/assets/tov-logo-full-terracotta-alpha.png"
              alt="Taste of Village"
              className="w-56 sm:w-72 md:w-88 h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] brightness-0 invert"
            />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs sm:text-sm md:text-lg text-bg-sand/95 mb-8 sm:mb-10 font-bold tracking-[0.22em] max-w-2xl uppercase border-y border-white/20 py-3.5"
          >
            Authentic Punjabi Flavors · Crafted Over Live Fire
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md"
          >
            <Link
              href={`/${branchLoc.id}/menu`}
              className="w-full sm:w-auto bg-terracotta text-white py-3.5 px-8 font-sans uppercase font-black text-xs sm:text-sm hover:bg-terracotta-light hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-[0_6px_20px_rgba(209,72,54,0.45)] tracking-[0.18em] rounded-full border border-terracotta-light/30 flex items-center justify-center gap-2.5"
            >
              <UtensilsCrossed size={16} />
              <span>Order {branchLoc.id === 'hayes' ? 'Hayes' : 'Slough'} Menu</span>
              <ArrowRight size={16} />
            </Link>
            <button aria-label="Button" 
              onClick={() => setIsLocationModalOpen(true)}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-bg-sand py-3.5 px-6 font-sans uppercase font-bold text-xs sm:text-sm hover:bg-white/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all shadow-md tracking-[0.15em] rounded-full border border-white/20 flex items-center justify-center gap-2"
            >
              <MapPin size={15} className="text-amber-300" />
              <span>Switch Branch</span>
            </button>
          </motion.div>

          {/* Local Trust Badges & Direct Action Row */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold text-bg-sand/90"
          >
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-amber-300">
              <span>⭐</span>
              <span>{isSlough ? 'Food Hygiene Rating 5 (Very Good)' : 'Food Hygiene Rating 4 (Good)'}</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-emerald-300">
              <span>✓</span>
              <span>100% Halal Certified</span>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-bg-sand">
              <MapPin size={12} className="text-terracotta" />
              <span>{branchLoc.address}</span>
            </span>
          </motion.div>

          {/* Quick Phone & Directions Dock */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-3"
          >
            <a aria-label="Phone"
              href={`tel:${branchLoc.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold tracking-wider uppercase border border-white/20 transition-all hover:scale-105"
            >
              <Phone size={13} className="text-green-400" />
              <span>Call: {branchLoc.phone}</span>
            </a>
            <a aria-label="Google Maps Directions"
              href={isSlough 
                ? 'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+260+Farnham+Road+Slough+SL1+4XL'
                : 'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+766B+Uxbridge+Rd+Hayes+UB4+0RU'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold tracking-wider uppercase border border-white/20 transition-all hover:scale-105"
            >
              <MapPin size={13} className="text-amber-300" />
              <span>Get Directions</span>
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-bold tracking-wider uppercase border border-white/20 transition-all hover:scale-105"
            >
              <span>Book Table</span>
            </Link>
          </motion.div>

        </div>

        {/* Global Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden md:block opacity-60 hover:opacity-100 transition-opacity">
          <ChevronDown size={28} className="text-bg-sand" />
        </div>
      </section>

      {/* Branch Proximity & Fast Collection Checker Section */}
      <section className="bg-pine text-bg-sand py-8 px-4 border-y border-white/10 relative z-20">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-amber-300 mb-2">
            <MapPin size={16} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Check Nearest Branch for Collection</span>
          </div>
          <p className="text-xs text-bg-sand/70 mb-4 max-w-md font-medium">
            Enter your postcode to see your closest kitchen (Hayes or Slough) with fresh prep time.
          </p>
          <div className="w-full bg-white/10 backdrop-blur-md p-1.5 pl-4 rounded-full flex items-center shadow-lg border border-white/20 focus-within:border-amber-300 transition-colors">
            <MapPin className="text-terracotta mr-2 flex-shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Enter Postcode (e.g. UB3, SL1)" 
              className="bg-transparent border-none outline-none flex-1 text-white font-bold uppercase placeholder:text-white/40 w-full text-xs sm:text-sm"
              value={postcode}
              onChange={e => {
                setPostcode(e.target.value);
                if (postcodeStatus !== 'idle') setPostcodeStatus('idle');
              }}
              onKeyDown={e => e.key === 'Enter' && checkPostcode()}
            />
            <button aria-label="Button" 
              onClick={checkPostcode}
              className="bg-terracotta hover:bg-terracotta-light text-white px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all flex-shrink-0 shadow-md"
            >
              Find Branch
            </button>
          </div>
          <AnimatePresence>
            {postcodeStatus === 'checked' && nearestBranch && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 w-full bg-black/40 backdrop-blur-md text-white p-4 rounded-2xl border border-terracotta/60 shadow-xl text-left"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
                        Nearest Branch: {nearestBranch.name}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-1 font-medium">{nearestBranch.address}</p>
                    <p className="text-[10px] text-green-300 font-bold mt-1 uppercase tracking-wide">
                      ⚡ {nearestBranch.time} • Collection & Dine-In
                    </p>
                  </div>
                  <Link
                    href={`/${nearestBranch.id}/menu`}
                    className="bg-terracotta hover:bg-terracotta-light text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full transition-all shadow-md flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    Order Collection →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── REAL STORE INTERIOR & ATMOSPHERE SHOWCASE ─── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#18110D] text-bg-sand border-y-4 border-terracotta relative overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-terracotta/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-terracotta/20 border border-terracotta/40 rounded-full text-terracotta-light text-xs font-black tracking-widest uppercase mb-4">
              <Flame size={14} className="text-terracotta" />
              <span>{isSlough ? 'The Slough Sanctuary • 260 Farnham Road' : 'Authentic Punjabi Craft • Hayes & Slough'}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-[0.12em] uppercase leading-tight mb-4">
              {isSlough ? 'The Slough Sanctuary' : 'The Dining Sanctuary'}
            </h2>
            <div className="w-24 h-1 bg-terracotta mx-auto mb-6" />
            <p className="font-serif italic text-base sm:text-lg md:text-xl text-bg-sand/80 max-w-2xl mx-auto normal-case leading-relaxed">
              Step into an authentic celebration of Punjabi hospitality. Sizzling charcoal grills, slow-simmered handis, and warm tandoori breads served in a welcoming, comfortable atmosphere.
            </p>
          </div>

          {/* Two-Column Grand Architecture Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
            
            {/* Card 1: Grand Banquet Dining Hall */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group bg-[#231A15] border-2 border-pine/40 hover:border-terracotta transition-all duration-500 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Image Frame */}
              <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                <img 
                  src="/assets/interior/interior_1.webp" 
                  alt="Taste of Village - Grand Banquet Dining & Celebrations" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231A15] via-transparent to-transparent opacity-80" />
              </div>

              {/* Text & Badges */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-terracotta/20 text-terracotta-light border border-terracotta/30">
                      Grand Dining Hall
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-900/30 text-amber-300 border border-amber-600/30">
                      Family Banquets
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-rose-900/30 text-rose-300 border border-rose-600/30">
                      Warm Hospitality
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase mb-2 group-hover:text-terracotta transition-colors">
                    Grand Family Gatherings
                  </h3>
                  <p className="normal-case text-bg-sand/75 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                    Spacious banqueting tables designed for celebrations, milestone dinners, and sharing authentic culinary heritage with the entire family in comfort.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-amber-300/80 font-mono font-bold uppercase tracking-wider">
                    Family Banquets • Groups
                  </span>
                  <Link 
                    href="/book"
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-terracotta-light group-hover:text-white transition-colors"
                  >
                    <span>Reserve a Table</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Card 2: The Carved Alcove & Cozy Booths */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group bg-[#231A15] border-2 border-pine/40 hover:border-terracotta transition-all duration-500 flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Image Frame */}
              <div className="relative overflow-hidden aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]">
                <img 
                  src="/assets/interior/interior_2.webp" 
                  alt="Taste of Village - Cozy Booths & Private Alcove Dining" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231A15] via-transparent to-transparent opacity-80" />
              </div>

              {/* Text & Badges */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-terracotta/20 text-terracotta-light border border-terracotta/30">
                      Cozy Booths
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">
                      Freshly Prepared
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 bg-amber-900/30 text-amber-300 border border-amber-600/30">
                      Cast-Iron Karahis
                    </span>
                  </div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide uppercase mb-2 group-hover:text-terracotta transition-colors">
                    Intimate Dining & Sharing Feasts
                  </h3>
                  <p className="normal-case text-bg-sand/75 text-sm sm:text-base leading-relaxed mb-6 font-medium">
                    Enjoy our signature cast-iron karahis simmering beside sizzling charcoal-grilled platters, rich copper handis, and freshly baked garlic naans in private booth comfort.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-amber-300/80 font-mono font-bold uppercase tracking-wider">
                    Dine-In • Booth Seating
                  </span>
                  <Link 
                    href={`/${branchLoc.id}/menu`}
                    className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-terracotta-light group-hover:text-white transition-colors"
                  >
                    <span>View Menu</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>

          {/* 3-Card Atmosphere Gallery for the remaining real interior views */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gallery View 1: Heritage Archways & Warm Ambiance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group bg-[#231A15] border border-white/10 hover:border-terracotta/60 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src="/assets/interior/interior_main.webp" 
                  alt="Taste of Village - Heritage Archways & Dining Ambiance" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231A15] via-transparent to-transparent opacity-70" />
                <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                  Heritage Decor
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-black text-lg text-white uppercase tracking-wider mb-1.5 group-hover:text-terracotta transition-colors">
                    Heritage Archways
                  </h4>
                  <p className="text-xs text-bg-sand/70 font-medium normal-case leading-relaxed">
                    Traditional Lahori architectural arches and custom artisan murals creating an authentic Desi dining atmosphere.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Gallery View 2: Atmospheric Evening Dining */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group bg-[#231A15] border border-white/10 hover:border-terracotta/60 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src="/assets/interior/interior_3.webp" 
                  alt="Taste of Village - Atmospheric Evening Dining" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231A15] via-transparent to-transparent opacity-70" />
                <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                  Evening Glow
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-black text-lg text-white uppercase tracking-wider mb-1.5 group-hover:text-terracotta transition-colors">
                    The Dining Sanctuary
                  </h4>
                  <p className="text-xs text-bg-sand/70 font-medium normal-case leading-relaxed">
                    Warm ambient lighting tailored for unhurried dinners, celebrations, and memorable gatherings with family and friends.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Gallery View 3: Architectural Warmth & Craft */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group bg-[#231A15] border border-white/10 hover:border-terracotta/60 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src="/assets/interior/interior_4.webp" 
                  alt="Taste of Village - Authentic Punjabi Craft & Seating" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231A15] via-transparent to-transparent opacity-70" />
                <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/60 backdrop-blur-md text-rose-300 border border-rose-500/30">
                  Village Craft
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-black text-lg text-white uppercase tracking-wider mb-1.5 group-hover:text-terracotta transition-colors">
                    Authentic Punjabi Craft
                  </h4>
                  <p className="text-xs text-bg-sand/70 font-medium normal-case leading-relaxed">
                    Rich terracotta tones, intricate detailing, and true Punjabi village hospitality across every corner of our restaurant.
                  </p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── LOCAL FLAGSHIP VISITOR & LOCAL HUB ─── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-pine text-bg-sand border-b-4 border-terracotta relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-amber-300 text-xs font-black uppercase tracking-[0.25em] block mb-2">
              {isSlough ? 'Farnham Road Flagship • SL1 4XL' : 'Uxbridge Road Flagship • UB4 0RU'}
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-wider mb-4">
              {isSlough ? 'Visit Taste of Village Slough' : 'Visit Taste of Village Hayes'}
            </h2>
            <p className="text-bg-sand/75 text-sm sm:text-base font-medium normal-case max-w-xl mx-auto">
              {isSlough 
                ? 'Join us at 260 Farnham Road for authentic Lahori & Gujranwala cooking, sizzling mixed grills, and weekend Desi Nashta.'
                : 'Experience traditional Lahori hospitality and wok-fired iron karahis at 766B Uxbridge Road.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Address & Parking */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-terracotta/60 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center text-amber-300 mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wide mb-2">
                  Address &amp; Parking
                </h3>
                <p className="text-xs text-bg-sand/80 normal-case leading-relaxed mb-2 font-medium">
                  <strong>{branchLoc.address}, {branchLoc.city} {branchLoc.postcode}</strong>
                </p>
                <p className="text-[11px] text-bg-sand/65 normal-case leading-relaxed font-normal">
                  {isSlough 
                    ? 'Convenient street and bay parking available directly outside along Farnham Road and adjacent side avenues.'
                    : 'Customer street parking available along Uxbridge Road parade.'}
                </p>
              </div>
              <a aria-label="Google Maps Directions" 
                href={isSlough 
                  ? 'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+260+Farnham+Road+Slough+SL1+4XL'
                  : 'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+766B+Uxbridge+Rd+Hayes+UB4+0RU'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-terracotta-light hover:text-white transition-colors"
              >
                <span>Google Maps Directions &rarr;</span>
              </a>
            </div>

            {/* Card 2: Collection & Turnaround */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-terracotta/60 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-4">
                  <Clock size={20} />
                </div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wide mb-2">
                  Fast Collection
                </h3>
                <p className="text-xs text-bg-sand/80 normal-case leading-relaxed mb-2 font-medium">
                  <strong>15–20 Mins Kitchen Turnaround</strong>
                </p>
                <p className="text-[11px] text-bg-sand/65 normal-case leading-relaxed font-normal">
                  All karahis and naan are cooked fresh to order. Skip marketplace commissions by ordering direct on our website with 1-tap Apple/Google Pay.
                </p>
              </div>
              <Link
                href={`/${branchLoc.id}/menu`}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-terracotta-light hover:text-white transition-colors"
              >
                <span>Order Collection &rarr;</span>
              </Link>
            </div>

            {/* Card 3: Delivery Coverage */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-terracotta/60 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-4">
                  <Sparkles size={20} />
                </div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wide mb-2">
                  Own Driver Fleet
                </h3>
                <p className="text-xs text-bg-sand/80 normal-case leading-relaxed mb-2 font-medium">
                  <strong>{isSlough ? 'Free Delivery Over £30 (SL1–SL4)' : 'Free Delivery Over £30 (UB)'}</strong>
                </p>
                <p className="text-[11px] text-bg-sand/65 normal-case leading-relaxed font-normal">
                  {isSlough 
                    ? 'Delivering across Slough, Burnham, Langley, and Windsor. Sealed containers keep your food piping hot straight from the pass.'
                    : 'Delivering across Hayes, Harlington, Hillingdon, and Uxbridge.'}
                </p>
              </div>
              <Link
                href={`/${branchLoc.id}/menu`}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-terracotta-light hover:text-white transition-colors"
              >
                <span>Order Delivery &rarr;</span>
              </Link>
            </div>

            {/* Card 4: FSA Rating & Contact */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-terracotta/60 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-4">
                  <CheckCircle size={20} />
                </div>
                <h3 className="font-display font-black text-lg text-white uppercase tracking-wide mb-2">
                  {isSlough ? '5★ Hygiene Rating' : '4★ Hygiene Rating'}
                </h3>
                <p className="text-xs text-bg-sand/80 normal-case leading-relaxed mb-2 font-medium">
                  <strong>100% Halal Certified</strong>
                </p>
                <p className="text-[11px] text-bg-sand/65 normal-case leading-relaxed font-normal">
                  Open 7 Days (10:00 AM – 2:00 AM). Call our team directly for table bookings, large family feasts, or catering.
                </p>
              </div>
              <a aria-label="Phone"
                href={`tel:${branchLoc.phone.replace(/\s+/g, '')}`}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-terracotta-light hover:text-white transition-colors"
              >
                <span>Call {branchLoc.phone} &rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-32 px-6 bg-bg-sand text-pine relative tov-feature-wall"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 pr-8">
            <div className="flex flex-col items-start gap-4">
              <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="" className="h-16 md:h-20 w-auto object-contain opacity-90 drop-shadow-[0_4px_12px_rgba(138,61,42,0.15)]" />
              <h2 className="font-display text-4xl md:text-5xl font-black tracking-[0.15em] text-pine">OUR HERITAGE</h2>
            </div>
            <div className="tov-frieze w-32"></div>
            <p className="text-xl leading-relaxed text-pine/80 font-medium normal-case">
              Our journey began in 2017 with <strong>"Hayes Paan and Snacks Corner"</strong>. Driven by a relentless passion for the rich, authentic flavours of Pakistani Punjab—specifically Lahore, the region's food capital, and Gujranwala, its culinary haven—we evolved.
            </p>
            <p className="text-xl leading-relaxed text-pine/80 font-medium normal-case">
              In 2022, we rebranded as <strong className="text-terracotta">Taste of Village</strong> to reflect our true calling: bringing the warmth, spice, and uncompromising quality of traditional, village-style Desi cooking to London.
            </p>
            <blockquote className="text-2xl leading-relaxed text-terracotta font-serif italic border-l-4 border-terracotta pl-8 normal-case mt-8">
              "Authentic Flavours. Charcoal Perfection. We don't just cook food; we share our culture, our home, and our history on every plate."
            </blockquote>
          </div>
          <div className="relative h-[600px] w-full overflow-hidden border-8 border-bg-sand shadow-[16px_16px_0px_rgba(20,40,29,1)] bibi-hover-container group rounded-none">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src="/assets/lamb_karahi_hero.webp" 
                alt="Authentic Lamb Karahi sizzling over open fire" 
                className="w-full h-full object-cover bibi-hover-image"
              />
            </motion.div>
            {/* Geometric Architectural Corner Accents */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-bg-sand z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-bg-sand z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </motion.section>

      {/* Frieze Divider */}
      <div className="tov-frieze w-full"></div>

      {/* Signature Dishes Highlight */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 px-6 bg-pine text-bg-sand border-t-[12px] border-terracotta relative tov-pattern-light overflow-hidden"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-5xl md:text-7xl font-black mb-6 tracking-[0.15em] drop-shadow-lg"
          >
            SIGNATURES OF THE HOUSE
          </motion.h2>
          <p className="text-bg-sand/80 max-w-2xl mx-auto mb-20 text-xl md:text-2xl font-serif italic normal-case tracking-wide drop-shadow-sm">
            Masterpieces of slow cooking and open-flame grilling, prepared fresh daily.
          </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dish 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-10 bg-white/5 border-2 border-white/10 hover:border-terracotta/60 hover:bg-white/10 transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-[8px_8px_0px_rgba(20,40,29,1)] hover:shadow-[16px_16px_0px_rgba(20,40,29,1)] hover:-translate-y-2 hover:-translate-x-2 flex flex-col items-center text-center rounded-none"
              onClick={() => handleCategoryClick(isSlough ? 'mains___village_classics' : 'curries_salan_se')}
            >
              <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-4 rounded-none border-2 border-white/10 bg-white/5 mb-8 group-hover:bg-terracotta/20 transition-colors duration-500">
                <UtensilsCrossed className="w-10 h-10 text-bg-sand group-hover:text-terracotta-light group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 drop-shadow-md" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-[0.1em] text-white">AUTHENTIC KARAHI</h3>
              <p className="text-bg-sand/70 text-base leading-relaxed mb-8 normal-case font-medium">
                Chicken and Lamb Karahi, cooked to order in traditional iron woks with fresh tomatoes, ginger, and our secret spice blend.
              </p>
              <span className="mt-auto text-terracotta-light font-bold uppercase tracking-[0.2em] text-sm group-hover:text-white transition-colors">Explore Category →</span>
            </motion.div>

            {/* Dish 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-10 bg-white/5 border-2 border-white/10 hover:border-terracotta/60 hover:bg-white/10 transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-[8px_8px_0px_rgba(20,40,29,1)] hover:shadow-[16px_16px_0px_rgba(20,40,29,1)] hover:-translate-y-2 hover:-translate-x-2 flex flex-col items-center text-center rounded-none"
              onClick={() => handleCategoryClick(isSlough ? 'breakfast___desi_nashta' : 'curries_salan_se')}
            >
              <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100"></div>
              <div className="p-4 rounded-none border-2 border-white/10 bg-white/5 mb-8 group-hover:bg-terracotta/20 transition-colors duration-500">
                <ChefHat className="w-10 h-10 text-bg-sand group-hover:text-terracotta-light group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 drop-shadow-md" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-[0.1em] text-white">HALEEM & NIHARI</h3>
              <p className="text-bg-sand/70 text-base leading-relaxed mb-8 normal-case font-medium">
                The pride of Lahore. Slow-cooked overnight for unparalleled richness, tender meat, and deep, complex flavors.
              </p>
              <span className="mt-auto text-terracotta-light font-bold uppercase tracking-[0.2em] text-sm group-hover:text-white transition-colors">Explore Category →</span>
            </motion.div>

            {/* Dish 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="p-10 bg-white/5 border-2 border-white/10 hover:border-terracotta/60 hover:bg-white/10 transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-[8px_8px_0px_rgba(20,40,29,1)] hover:shadow-[16px_16px_0px_rgba(20,40,29,1)] hover:-translate-y-2 hover:-translate-x-2 flex flex-col items-center text-center rounded-none"
              onClick={() => handleCategoryClick(isSlough ? 'starters_n_charcoal_grill' : 'bbq_platter')}
            >
              <div className="absolute inset-0 border-2 border-white/5 pointer-events-none rounded-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200"></div>
              <div className="p-4 rounded-none border-2 border-white/10 bg-white/5 mb-8 group-hover:bg-terracotta/20 transition-colors duration-500">
                <Flame className="w-10 h-10 text-bg-sand group-hover:text-terracotta-light group-hover:scale-110 transition-all duration-500 drop-shadow-md" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 tracking-[0.1em] text-white">SIZZLING MIX GRILLS</h3>
              <p className="text-bg-sand/70 text-base leading-relaxed mb-8 normal-case font-medium">
                Succulent kebabs and tikka, marinated in robust spices and seared over open charcoal for that perfect smokey char.
              </p>
              <span className="mt-auto text-terracotta-light font-bold uppercase tracking-[0.2em] text-sm group-hover:text-white transition-colors">Explore Category →</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* AEO/SEO Story Section: Specialties & Nashta */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 bg-bg-sand text-pine border-t-[1px] border-pine/10 relative"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
          <div className="flex-1 space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-[0.1em] text-pine uppercase">
              Our Speciality Dishes
            </h2>
            <div className="tov-frieze w-20"></div>
            <p className="text-lg leading-relaxed text-pine/80 font-medium normal-case">
              At Taste of Village, we are constantly elevating our menu with exclusive signature plates. Our <strong className="text-terracotta">Beef Brisket & Truffle Fries</strong> offers a rich, melt-in-your-mouth experience, while our <strong className="text-terracotta">Proper Dum Chargha</strong> brings the authentic, steam-roasted flavors of Lahore straight to your table.
            </p>
            <p className="text-lg leading-relaxed text-pine/80 font-medium normal-case">
              For meat lovers, our premium <strong className="text-terracotta">Ribeye Steak</strong> and slow-cooked <strong className="text-terracotta">Turkey Roast</strong> are highly recommended. If you are dining with a group, you cannot go wrong with our massive <strong className="text-pine">Grilled Platter for Family</strong>, perfectly portioned for 5-6 servings at just £64.
            </p>
          </div>
          
          <div className="flex-1 space-y-6 bg-white/50 p-8 border-l-4 border-terracotta shadow-sm">
            <h2 className="font-display text-3xl md:text-4xl font-black tracking-[0.1em] text-pine uppercase">
              Original Desi Nashta
            </h2>
            <div className="tov-frieze w-20"></div>
            <p className="text-lg leading-relaxed text-pine/80 font-medium normal-case">
              Weekend mornings are sacred, and there is no better way to start your day than with our <a href="/menu#desi-lahori-nashta" className="text-terracotta font-bold hover:underline">Desi Lahori Nashta</a>. We serve a traditional, deeply authentic breakfast menu that transports you back home.
            </p>
            <p className="text-lg leading-relaxed text-pine/80 font-medium normal-case">
              Wake up to the slow-cooked perfection of our <strong className="text-pine">Nihari</strong>, rich <strong className="text-pine">Lamb Paya</strong>, and our famous <strong className="text-pine">Haleem</strong>. For those craving classic street-style breakfasts, we serve fresh, hot <strong className="text-terracotta">Halwa Puri</strong>, crispy <strong className="text-pine">Chana Paratha</strong>, and perfectly spiced <strong className="text-pine">Pathora Chana</strong>. It is the ultimate authentic Desi Original Nashta experience in town.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Reviews Masonry Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="py-32 px-6 bg-white text-pine border-t-[12px] border-pine relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-[0.15em] text-pine mb-4">WHAT OUR GUESTS SAY</h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500 mb-4">
              {[...Array(5)].map((_, i) => <span key={i} className="text-2xl">★</span>)}
            </div>
            <p className="font-serif italic text-xl text-pine/60 normal-case">Over 1,000+ happy customers on UberEats and Google</p>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              { text: "Absolutely fantastic! The Lamb Charsi Karahi is incredibly authentic and the meat is perfectly cooked. Best we've had.", author: "Google Reviewer", platform: "Google" },
              { text: "One of the best Pakistani restaurants in Slough. The food is always fresh and the staff, especially Simran, go out of their way to make you feel welcome.", author: "Google Reviewer", platform: "Google" },
              { text: "Amazing service and great food. Special thanks to Arsh and Zia for their extremely attentive and friendly service!", author: "Google Reviewer", platform: "Google" },
              { text: "The Lamb Biryani and fresh kebabs are highly recommended. A genuinely clean, warm, and welcoming environment for families.", author: "Google Reviewer", platform: "Google" },
              { text: "Their traditional Charsi Karahi is unmatched. The atmosphere is warm, and you can tell they care about their hygiene and food quality.", author: "Google Reviewer", platform: "Google" },
              { text: "Consistently good food. The mixed kebabs are perfect, and the customer service is always professional and fast.", author: "Google Reviewer", platform: "Google" }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-bg-sand p-8 rounded-3xl border border-pine/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all inline-block w-full break-inside-avoid relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-terracotta scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-t-3xl"></div>
                <div className="text-yellow-500 mb-4 text-sm tracking-widest">★★★★★</div>
                <p className="text-lg leading-relaxed text-pine/90 font-medium normal-case mb-6">"{review.text}"</p>
                <div className="flex justify-between items-end border-t border-pine/10 pt-4 mt-auto">
                  <span className="font-black text-pine text-sm uppercase tracking-widest">{review.author}</span>
                  <span className="text-[10px] font-bold text-pine/40 uppercase tracking-[0.2em] px-2 py-1 bg-white rounded-md">{review.platform}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 🌟 Local Diner & SEO FAQs */}
      <section className="py-20 px-6 bg-white border-t border-pine/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pine/5 text-pine rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              <HelpCircle size={14} className="text-terracotta" /> Frequently Asked Questions
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-pine tracking-wide uppercase">
              Everything You Need to Know
            </h2>
            <p className="text-pine/60 font-sans text-sm md:text-base mt-3 normal-case max-w-xl mx-auto">
              Got questions about our 100% Halal certification, authentic Lahori cooking methods, or collection orders? We've got you covered.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Is all meat at Taste of Village 100% Halal certified?",
                a: "Yes, 100%. All meat, poultry, and ingredients across both our Hayes and Slough branches are strictly Halal certified and sourced from accredited, trusted UK suppliers."
              },
              {
                q: `Can I order online for collection at ${branchLoc.name}?`,
                a: `Yes! You can order directly on our website for fast collection at ${branchLoc.address}. We support 1-tap Apple Pay, Google Pay, and major cards with zero marketplace commission fees.`
              },
              {
                q: "Do you serve traditional weekend Pakistani breakfast (Nashta)?",
                a: "Yes! We are renowned for our authentic weekend Lahori Nashta: freshly fried Halwa Puri with spiced Chana, slow-simmered Special Nihari, Paye, and piping hot Roghani Naan alongside fresh Karak Chai."
              },
              {
                q: `Where is Taste of Village located and is there parking?`,
                a: `${isSlough ? 'Our Slough branch is at 260 Farnham Road (SL1 4XL) with convenient street and local bay parking.' : 'Our Hayes branch is at 766B Uxbridge Road (UB4 0RU) with nearby customer and street parking along the parade.'}`
              },
              {
                q: "Can I book a table for large family parties or catering?",
                a: `Yes! Table reservations can be booked instantly online via our table booking page. For large gatherings, birthday celebrations, or catering orders, you can also call us directly on ${isSlough ? '01753 326341' : '020 3409 3786'}.`
              },
              {
                q: `Do you deliver food across ${isSlough ? 'Slough, Burnham, Langley & Windsor' : 'Hayes, Hillingdon & Uxbridge'}?`,
                a: `Yes! We run our own dedicated driver fleet delivering hot meals within a 5-mile radius (including postcodes ${isSlough ? 'SL1, SL2, SL3, and SL4' : 'UB3, UB4, UB8, and UB10'}). Free delivery is available on orders over £30.`
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-pine/10 rounded-2xl overflow-hidden transition-all bg-bg-sand/30 hover:bg-bg-sand/60"
              >
                <button aria-label="Button"
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-display font-bold text-base md:text-lg text-pine tracking-wide uppercase cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  <div className="p-2 rounded-full bg-white shadow-sm text-pine flex-shrink-0">
                    {openFaq === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-pine font-sans text-sm md:text-base leading-relaxed normal-case border-t border-pine/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-terracotta py-16 px-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-around items-center gap-12 text-bg-sand relative z-10">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-6 group cursor-pointer">
            <div className="p-4 bg-bg-sand/10 rounded-none border-2 border-bg-sand/30 group-hover:bg-bg-sand/20 transition-colors">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-[0.1em]">OPEN 7 DAYS</div>
              <div className="text-bg-sand/90 normal-case font-medium text-lg mt-1">10:00 AM – 2:00 AM</div>
            </div>
          </motion.div>
          <div className="hidden md:block w-px h-16 bg-bg-sand/30"></div>
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="flex items-center gap-6 group cursor-pointer" 
            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(branchLoc.address + ' ' + branchLoc.postcode)}`, '_blank')}
          >
            <div className="p-4 bg-bg-sand/10 rounded-none border-2 border-bg-sand/30 group-hover:bg-bg-sand/20 transition-colors bg-pine">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl tracking-[0.1em] text-white">FIND US / GET DIRECTIONS</div>
              <div className="text-white/90 normal-case font-medium text-lg mt-1">{branchLoc.address}, {branchLoc.postcode}</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <LocationSelectorModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        destination="/menu"
      />
    </div>
  );
};

