'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  UtensilsCrossed,
  Star,
  Globe,
  Phone,
  Sparkles,
  Tag,
  ExternalLink,
  ArrowRight,
  Share2,
  Navigation,
  Clock,
  CheckCircle2,
  IceCream2,
} from 'lucide-react';

/* ── BRAND SVGs ── */
const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
  </svg>
);

const InstagramIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

/* ── BRANCH METADATA ── */
interface BranchConfig {
  id: 'slough' | 'hayes';
  name: string;
  tagline: string;
  address: string;
  postcode: string;
  phone: string;
  phoneDisplay: string;
  menuPath: string;
  whatsAppHref: string;
  googleReviewHref: string;
  googleMapsHref: string;
  hygieneRating: string;
}

const BRANCHES: Record<'slough' | 'hayes', BranchConfig> = {
  slough: {
    id: 'slough',
    name: 'Slough Branch',
    tagline: 'Farnham Road Dining & Takeaway',
    address: '260 Farnham Road, Slough',
    postcode: 'SL1 4XL',
    phone: '01753326341',
    phoneDisplay: '01753 326341',
    menuPath: '/slough/menu',
    whatsAppHref:
      "https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20view%20the%20menu%20and%20place%20an%20order.",
    googleReviewHref: 'https://g.page/r/CU4P6ZjGio6HEAE/review',
    googleMapsHref:
      'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+260+Farnham+Road+Slough+SL1+4XL',
    hygieneRating: '5 (Very Good)',
  },
  hayes: {
    id: 'hayes',
    name: 'Hayes Branch',
    tagline: 'Uxbridge Road Dining & Takeaway',
    address: '766B Uxbridge Road, Hayes',
    postcode: 'UB4 0RU',
    phone: '02034093786',
    phoneDisplay: '020 3409 3786',
    menuPath: '/hayes/menu',
    whatsAppHref:
      "https://wa.me/442034093786?text=Hi%20Taste%20of%20Village%20Hayes!%20I'd%20like%20to%20view%20the%20menu%20and%20place%20an%20order.",
    googleReviewHref: 'https://g.page/r/CU4P6ZjGio6HECE/review',
    googleMapsHref:
      'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+766B+Uxbridge+Road+Hayes+UB4+0RU',
    hygieneRating: '4 (Good)',
  },
};

export default function LinksPage() {
  const [activeBranch, setActiveBranch] = useState<'slough' | 'hayes'>('slough');
  const [copiedShare, setCopiedShare] = useState(false);
  const currentBranch = BRANCHES[activeBranch];

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Taste of Village · Direct Ordering & Links',
          text: 'Order direct from Taste of Village Slough & Hayes — menus, WhatsApp ordering, roasts and specials.',
          url: 'https://tasteofvillagerestaurants.co.uk/links',
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText('https://tasteofvillagerestaurants.co.uk/links');
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF5EE] text-[#1A3C34] selection:bg-[#8a3d2a] selection:text-white flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 overflow-x-hidden">
      {/* ── AMBIENT ATMOSPHERIC LIGHTING ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-b from-[#8a3d2a]/8 via-[#1A3C34]/4 to-transparent blur-3xl" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#8a3d2a]/5 blur-3xl" />
        <div className="absolute bottom-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[#1A3C34]/5 blur-3xl" />
        {/* Subtle authentic TOV diamond pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url('/assets/tov-pattern.svg')",
            backgroundSize: '80px 80px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        {/* ── TOP ACTION BAR (Share & Live Status) ── */}
        <div className="w-full flex items-center justify-between mb-4 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#1A3C34]/10 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#1A3C34]/80">
              Kitchens Open · Direct Orders
            </span>
          </div>

          <button
            onClick={handleShare}
            aria-label="Share this links page"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/10 shadow-xs backdrop-blur-md transition-all active:scale-95 text-xs font-semibold cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8a3d2a]" />
            <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
          </button>
        </div>

        {/* ── BRAND HERO / MONOGRAM CREST ── */}
        <header className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 group">
            <div className="absolute inset-0 rounded-full bg-[#8a3d2a]/20 blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#8a3d2a] via-[#c4735d] to-[#1A3C34] shadow-xl">
              <div className="w-full h-full rounded-full bg-[#FAF5EE] p-1 flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/tov-tree-badge-circle.png"
                  alt="Taste of Village Brand Crest"
                  width={112}
                  height={112}
                  priority
                  className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#1A3C34] text-white p-1 rounded-full border-2 border-[#FAF5EE] shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A3C34] uppercase drop-shadow-xs">
            Taste of Village
          </h1>
          <p className="text-xs sm:text-[13px] font-semibold text-[#8a3d2a] tracking-[0.2em] uppercase mt-1">
            Indo-British Charcoal Grill &amp; Traditional Roasts
          </p>
          <p className="text-[11px] font-mono text-[#1A3C34]/60 tracking-wider uppercase mt-0.5">
            Slough · Hayes · Direct Customer Portal
          </p>
        </header>

        {/* ── HERO SPOTLIGHT 1: SUNDAY ROAST SPECIALS ── */}
        <section aria-label="Sunday Roast Specials" className="w-full mb-3.5">
          <Link
            href="/slough-sunday-roast"
            className="group block relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A3C34] via-[#122A24] to-[#0A1814] text-white p-4 sm:p-5 border border-amber-400/40 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-amber-300 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            {/* Shimmer Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/20 transition-colors" />

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* Authentic Food Thumbnail */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border-2 border-amber-400/50 shadow-md">
                <Image
                  src="/assets/menu/sunday-roast/roast_special_2.jpg"
                  alt="Sunday Roast Specials at Taste of Village"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 80px, 96px"
                />
                <span className="absolute top-1 left-1 bg-[#8a3d2a] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm">
                  30% OFF
                </span>
              </div>

              {/* Text & Offer Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300 truncate">
                    Sunday Roast Specials · Grab Quick
                  </span>
                </div>
                <h2 className="font-serif text-base sm:text-lg font-bold text-white leading-tight mb-1 group-hover:text-amber-200 transition-colors">
                  30% OFF · First 5 Orders 50% OFF
                </h2>
                <p className="text-[11px] text-white/75 leading-snug line-clamp-2">
                  Slow-roasted British Beef, Half Chicken &amp; Lamb Shank with all trimmings. WhatsApp, online or phone!
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-amber-200 font-mono">
                    ⚡ Must mention loyalty to redeem
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-300 group-hover:translate-x-1 transition-transform">
                    Claim Offer <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* ── HERO SPOTLIGHT 2: OFFERS & REWARDS HUB ── */}
        <section aria-label="Offers Hub" className="w-full mb-4">
          <Link
            href="/offers"
            className="group block relative w-full rounded-2xl bg-white/90 hover:bg-white border border-[#8a3d2a]/20 shadow-md hover:shadow-lg p-3.5 sm:p-4 transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#8a3d2a]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#8a3d2a]/10 text-[#8a3d2a] flex items-center justify-center shrink-0 group-hover:bg-[#8a3d2a] group-hover:text-white transition-colors duration-200">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#1A3C34]">
                      All Deals &amp; Offers Hub
                    </h3>
                    <span className="bg-[#8a3d2a] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Save ££
                    </span>
                  </div>
                  <p className="text-[11px] text-[#1A3C34]/70 font-mono truncate mt-0.5">
                    £5 Welcome Pass · Student Discount · Direct Perks
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8a3d2a] shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* ── SEGMENTED BRANCH SELECTOR ── */}
        <div className="w-full mb-3">
          <div className="relative w-full bg-[#1A3C34]/8 p-1.5 rounded-2xl flex items-center border border-[#1A3C34]/10 shadow-inner">
            <button
              onClick={() => setActiveBranch('slough')}
              aria-pressed={activeBranch === 'slough'}
              className={`relative z-10 flex-1 py-3 px-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeBranch === 'slough'
                  ? 'text-white'
                  : 'text-[#1A3C34]/70 hover:text-[#1A3C34]'
              }`}
            >
              {activeBranch === 'slough' && (
                <motion.div
                  layoutId="branchPill"
                  className="absolute inset-0 bg-[#1A3C34] rounded-xl shadow-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                Slough (SL1)
              </span>
            </button>

            <button
              onClick={() => setActiveBranch('hayes')}
              aria-pressed={activeBranch === 'hayes'}
              className={`relative z-10 flex-1 py-3 px-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeBranch === 'hayes'
                  ? 'text-white'
                  : 'text-[#1A3C34]/70 hover:text-[#1A3C34]'
              }`}
            >
              {activeBranch === 'hayes' && (
                <motion.div
                  layoutId="branchPill"
                  className="absolute inset-0 bg-[#1A3C34] rounded-xl shadow-md"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-20 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
                Hayes (UB4)
              </span>
            </button>
          </div>

          {/* Location Details Bar */}
          <div className="mt-2 px-2 flex items-center justify-between text-[11px] text-[#1A3C34]/75">
            <span className="font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#8a3d2a]" />
              {currentBranch.address}
            </span>
            <a
              href={currentBranch.googleMapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8a3d2a] font-bold hover:underline inline-flex items-center gap-0.5"
            >
              Map <Navigation className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ── BRANCH ACTION CARDS (ANIMATED ON SWITCH) ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBranch.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col gap-2.5"
          >
            {/* 1. ORDER ONLINE MENU */}
            <Link
              href={currentBranch.menuPath}
              className="group relative w-full flex items-center justify-between p-4 rounded-2xl bg-[#1A3C34] text-white border border-[#1A3C34] shadow-md hover:shadow-xl hover:bg-[#122A24] transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base tracking-wide uppercase text-white">
                      Order Online ({currentBranch.id === 'slough' ? 'Slough' : 'Hayes'})
                    </span>
                    <span className="text-[10px] bg-amber-400 text-[#1A3C34] font-black uppercase px-2 py-0.5 rounded-full">
                      Direct
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-100/75 font-mono truncate mt-0.5">
                    Fast Delivery &amp; Collection · Best Prices Guaranteed
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* 2. WHATSAPP 1-TAP ORDERING */}
            <a
              href={currentBranch.whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white border border-[#25D366]/30 shadow-md hover:shadow-xl hover:brightness-105 transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#25D366]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-white/15 text-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm sm:text-base tracking-wide uppercase text-white">
                      WhatsApp 1-Tap Ordering
                    </span>
                    <span className="text-[10px] bg-[#25D366] text-white font-black uppercase px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 font-mono truncate mt-0.5">
                    1-Touch Chat Menu · Direct with kitchen team
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white/80 shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* 3. PHONE ORDERING */}
            <a
              href={`tel:${currentBranch.phone}`}
              className="group relative w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/15 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#1A3C34]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#8a3d2a]/10 text-[#8a3d2a] flex items-center justify-center shrink-0 group-hover:bg-[#8a3d2a] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#1A3C34] block">
                    Call Restaurant: {currentBranch.phoneDisplay}
                  </span>
                  <p className="text-[11px] text-[#1A3C34]/65 font-mono truncate mt-0.5">
                    Phone orders, table bookings &amp; allergy inquiries
                  </p>
                </div>
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#8a3d2a] shrink-0">
                CALL NOW
              </span>
            </a>

            {/* 4. GOOGLE 5-STAR REVIEW */}
            <a
              href={currentBranch.googleReviewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/15 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-white transition-colors">
                  <GoogleIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm uppercase tracking-wider text-[#1A3C34]">
                      Leave a Google Review
                    </span>
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#1A3C34]/65 font-mono truncate mt-0.5">
                    Rate your dining experience &amp; support our family team
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#1A3C34]/50 shrink-0 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </AnimatePresence>

        {/* ── SOCIALS & SISTER BRAND SECTION ── */}
        <section aria-label="Socials and Sister Lounge" className="w-full mt-6 pt-5 border-t border-[#1A3C34]/15 flex flex-col gap-2.5">
          <div className="px-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a3d2a] uppercase tracking-widest">
              Socials &amp; Sister Lounge
            </span>
            <span className="text-[10px] font-mono text-[#1A3C34]/50 uppercase">
              Official Channels
            </span>
          </div>

          {/* FALOODA & CO DESSERT LOUNGE (Sister Lounge Hub) */}
          <Link
            href="/falooda"
            className="group relative w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#2B1B17] via-[#3D2520] to-[#2B1B17] text-white border border-[#D1A054]/30 shadow-md hover:shadow-xl transition-all duration-200 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-amber-300"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D1A054]/20 text-[#D1A054] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <IceCream2 className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-xs sm:text-sm uppercase tracking-wider text-amber-200">
                    Falooda &amp; Co · Dessert Lounge
                  </span>
                  <span className="text-[9px] bg-[#D1A054] text-[#1A1A1A] font-black uppercase px-2 py-0.2 rounded-full">
                    Sister Café
                  </span>
                </div>
                <p className="text-[11px] text-amber-100/70 font-mono truncate mt-0.5">
                  Royal Falooda · Karak Chai · Artisanal Gelato
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-300 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* SOCIAL MEDIA 2-COLUMN GRID */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/tasteofvillageuk/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Taste of Village Instagram"
              className="group p-3 rounded-2xl bg-white/90 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/15 shadow-xs hover:shadow-md flex items-center gap-2.5 transition-all duration-200 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                <InstagramIcon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 text-left">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A3C34] block truncate">
                  Instagram
                </span>
                <span className="text-[10px] text-[#1A3C34]/60 font-mono block truncate">
                  @tasteofvillageuk
                </span>
              </div>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/profile.php?id=61590779182784"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Taste of Village Facebook"
              className="group p-3 rounded-2xl bg-white/90 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/15 shadow-xs hover:shadow-md flex items-center gap-2.5 transition-all duration-200 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0">
                <FacebookIcon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 text-left">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#1A3C34] block truncate">
                  Facebook
                </span>
                <span className="text-[10px] text-[#1A3C34]/60 font-mono block truncate">
                  Taste of Village
                </span>
              </div>
            </a>
          </div>

          {/* MAIN WEBSITE LINK */}
          <Link
            href="/"
            className="group relative w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/80 hover:bg-white text-[#1A3C34] border border-[#1A3C34]/15 shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1A3C34]/10 text-[#1A3C34] flex items-center justify-center shrink-0 group-hover:bg-[#1A3C34] group-hover:text-white transition-colors">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0 text-left">
                <span className="font-bold text-xs uppercase tracking-wider text-[#1A3C34] block">
                  Official Website
                </span>
                <span className="text-[11px] text-[#1A3C34]/60 font-mono block truncate">
                  tasteofvillagerestaurants.co.uk
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8a3d2a] shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer className="w-full mt-8 pt-4 pb-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#1A3C34]/20" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#8a3d2a]">
              Taste of Village &bull; Est. London
            </span>
            <span className="w-6 h-[1px] bg-[#1A3C34]/20" />
          </div>
          <p className="text-[10px] text-[#1A3C34]/50 font-mono tracking-wider">
            &copy; {new Date().getFullYear()} Taste of Village Restaurants. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
