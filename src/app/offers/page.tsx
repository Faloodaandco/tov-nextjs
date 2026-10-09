import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Tag, Sparkles, Clock, Phone, ArrowRight, CheckCircle2, Gift, Percent } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Exclusive Offers & Dining Deals | Taste of Village',
  description: 'Special dining offers at Taste of Village Hayes & Slough. Sunday Roast specials (30% to 50% off), £5 welcome vouchers, student perks, and direct-order savings.',
  alternates: {
    canonical: '/offers',
  },
  openGraph: {
    type: 'website',
    title: 'Offers & Specials | Taste of Village',
    description: 'Sunday Roast specials, £5 welcome vouchers, and direct order perks for Taste of Village restaurants.',
    url: 'https://tasteofvillagerestaurants.co.uk/offers',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Offers' }],
  },
};

export default function OffersPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    'name': 'Taste of Village Special Offers',
    'text': 'Sunday Roast 30% OFF (first 5 orders 50% OFF), £5 welcome voucher, and student discounts at Taste of Village Slough and Hayes.',
    'url': 'https://tasteofvillagerestaurants.co.uk/offers',
    'provider': {
      '@type': 'Restaurant',
      'name': 'Taste of Village',
      'url': 'https://tasteofvillagerestaurants.co.uk',
    },
  };

  return (
    <div className="bg-[#FDF9F1] min-h-screen font-sans text-pine selection:bg-terracotta/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Editorial Header */}
      <header className="border-b border-pine/10 bg-white/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest uppercase text-pine">
              Taste of Village
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/links"
              className="text-xs uppercase font-bold tracking-widest text-pine/80 hover:text-terracotta transition-colors px-3 py-1.5"
            >
              Quick Links
            </Link>
            <Link
              href="/"
              className="text-xs uppercase font-bold tracking-widest bg-pine text-white px-4 py-2 rounded-full hover:bg-pine/90 transition-all"
            >
              Order Online
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-10 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta/10 text-terracotta text-xs font-black tracking-widest uppercase mb-4">
          <Sparkles size={14} /> Official Specials &amp; Perks
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-pine font-bold uppercase tracking-tight mb-4">
          Current Offers
        </h1>
        <p className="text-pine/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Order direct to unlock exclusive savings across our Hayes &amp; Slough kitchens. Authentic dishes, zero third-party markups.
        </p>
      </section>

      {/* Main Offers Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-24 space-y-10">

        {/* FEATURED: Sunday Roast Special */}
        <div className="bg-gradient-to-br from-[#1A3C34] to-[#122A24] text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-amber-400/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
            {/* Left Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                <span className="bg-[#D14836] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Sunday Only · 12 PM – 5 PM
                </span>
                <span className="bg-amber-400 text-pine text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                  Slough Branch
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mb-3">
                Sunday Roast Specials
              </h2>
              <div className="inline-block bg-amber-400/15 border border-amber-400/30 rounded-2xl px-4 py-2 mb-4">
                <p className="text-amber-300 font-bold text-base sm:text-lg">
                  🔥 Grab Yours Quick! 30% OFF · First 5 Orders 50% OFF
                </p>
              </div>

              <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4 max-w-xl">
                Slow-roasted Beef, Half Chicken, or Lamb Shank served with golden Yorkshire puddings, roast or creamy mashed potatoes, seasonal vegetables, and rich gravy.
              </p>

              {/* Crucial Instruction Box */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-6 text-left">
                <p className="text-xs text-amber-200 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-amber-400" /> How to Redeem:
                </p>
                <p className="text-xs text-white/90 leading-relaxed">
                  Order via <strong className="text-white">WhatsApp</strong>, our <strong className="text-white">Website</strong>, or call <strong className="text-white">01753 326341</strong>.
                  <span className="text-amber-300 block mt-1 font-semibold">
                    👉 Simply tell our colleague to log it under your loyalty program account to redeem this offer.
                  </span>
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#25D366] text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all flex items-center gap-2 shadow-lg active:scale-95"
                >
                  Order on WhatsApp
                </a>
                <Link
                  href="/slough-sunday-roast"
                  className="px-6 py-3 bg-white text-pine rounded-full font-black text-xs uppercase tracking-wider hover:bg-terracotta hover:text-white transition-all shadow-lg active:scale-95"
                >
                  View Roast Details
                </Link>
                <a
                  href="tel:01753326341"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all border border-white/20"
                >
                  Call 01753 326341
                </a>
              </div>
            </div>

            {/* Right Roast Image Thumbnail */}
            <div className="w-full sm:w-80 h-64 relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 shrink-0">
              <Image
                src="/assets/menu/sunday-roast/sunday_roast_hero.webp"
                alt="Sunday Roast Platter"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Grid: £5 Welcome Voucher & Direct Ordering Perks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* £5 Welcome Voucher Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-pine/10 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-6">
                <Gift size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-terracotta block mb-2">
                New &amp; Returning Guests
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-pine mb-3">
                Claim £5 Welcome Voucher
              </h3>
              <p className="text-pine/70 text-xs sm:text-sm leading-relaxed mb-6">
                Sign in with your mobile number to unlock an instant £5 digital voucher for your next order or table visit at Hayes or Slough.
              </p>
            </div>
            <Link
              href="/check-in"
              className="w-full py-3.5 bg-pine text-white text-center rounded-full font-bold text-xs uppercase tracking-wider hover:bg-terracotta transition-all flex items-center justify-center gap-2"
            >
              Claim £5 Voucher <ArrowRight size={16} />
            </Link>
          </div>

          {/* Student Perk Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-pine/10 shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-6">
                <Percent size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block mb-2">
                Student Privilege
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-pine mb-3">
                15% Student Discount
              </h3>
              <p className="text-pine/70 text-xs sm:text-sm leading-relaxed mb-6">
                Valid for Brunel, Uxbridge College, and local students. Show your student ID or claim your pass online for 15% off dine-in and collection.
              </p>
            </div>
            <Link
              href="/students"
              className="w-full py-3.5 bg-pine text-white text-center rounded-full font-bold text-xs uppercase tracking-wider hover:bg-terracotta transition-all flex items-center justify-center gap-2"
            >
              Get Student Pass <ArrowRight size={16} />
            </Link>
          </div>

        </div>

        {/* Direct Order Guarantees Tier */}
        <div className="bg-[#FAF6ED] rounded-[2rem] p-8 border border-pine/10 text-center">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-pine mb-2">
            Why Always Order Direct?
          </h3>
          <p className="text-pine/60 text-xs sm:text-sm mb-6 max-w-lg mx-auto">
            Third-party delivery apps add hefty markups. Ordering direct ensures fresh preparation and the lowest prices.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-pine/5">
              <span className="text-terracotta font-black text-sm block mb-1">✓ Lowest Menu Prices</span>
              <span className="text-pine/70 text-xs">Save up to 15%–20% compared to third-party delivery apps.</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-pine/5">
              <span className="text-terracotta font-black text-sm block mb-1">✓ Priority Kitchen Queue</span>
              <span className="text-pine/70 text-xs">Direct orders are cooked fresh and dispatched immediately.</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-pine/5">
              <span className="text-terracotta font-black text-sm block mb-1">✓ Loyalty Rewards</span>
              <span className="text-pine/70 text-xs">Every order earns credit toward free dishes and vouchers.</span>
            </div>
          </div>
        </div>

        {/* Bottom Hub Navigation */}
        <div className="text-center pt-8">
          <Link
            href="/links"
            className="inline-flex items-center gap-2 text-terracotta font-bold text-sm tracking-wider uppercase hover:underline"
          >
            ← View All Social &amp; Location Links on Quick Hub
          </Link>
        </div>

      </main>
    </div>
  );
}
