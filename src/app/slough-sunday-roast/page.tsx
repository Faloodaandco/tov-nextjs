import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sunday Roast in Slough | Taste of Village – Every Sunday 12–5 PM",
  description: "A classic British Sunday Roast in the heart of Slough. Slow-roasted Beef, Half Chicken, or Lamb Shank with all the trimmings. Every Sunday, 12:00 PM – 5:00 PM at 260 Farnham Road. Pre-order online.",
  alternates: {
    canonical: "/slough-sunday-roast"
  },
  openGraph: {
    type: 'website',
    title: "Sunday Roast in Slough | Taste of Village",
    description: "Slow-roasted Beef, Half Chicken, or Lamb Shank with Yorkshire Pudding, roast potatoes, seasonal vegetables & rich gravy. Every Sunday 12–5 PM.",
    url: 'https://tasteofvillagerestaurants.co.uk/slough-sunday-roast',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Sunday Roast' }],
  },
};

const ROAST_MAINS = [
  { name: 'Beef Roast', price: '14.99', desc: 'Succulent slow-roasted British beef, served with your choice of roast or creamy mashed potatoes, seasonal vegetables, rich gravy & Yorkshire pudding.', image: '/assets/menu/sunday-roast/sunday_roast_beef.webp' },
  { name: 'Half Chicken Roast', price: '15.99', desc: 'Golden-roasted half chicken on ceramic platter, tender and juicy, served with Yorkshire pudding, roast carrots, broccoli, potatoes & rich gravy.', image: '/assets/menu/sunday-roast/roast_special_2.jpg' },
  { name: 'Lamb Shank Roast', price: '16.99', desc: 'Slow-cooked lamb shank falling off the bone, served with roast or mashed potatoes, vine tomatoes, seasonal veg, gravy & Yorkshire pudding.', image: '/assets/menu/sunday-roast/roast_special_1.jpg' },
];

const EXTRAS = [
  { name: 'Special Homemade Cheesecake', price: '4.99' },
  { name: 'Eton Mess', price: '5.49' },
  { name: 'Apple Crumble', price: '6.49', note: 'with custard or ice cream' },
  { name: 'Creamy Mashed Potatoes', price: '3.49' },
  { name: 'Seasonal Vegetables with Roasted Brussels', price: '2.49' },
  { name: 'Rich Gravy', price: '1.49' },
  { name: 'Yorkshire Pudding', price: '1.49' },
  { name: 'Peppercorn Sauce', price: '1.99' },
  { name: 'Garlic Mushroom Sauce', price: '1.99' },
  { name: 'Roast Potatoes', price: '2.49' },
];

export default function SloughSundayRoastPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Slough - Sunday Roast",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/menu/sunday-roast/roast_special_3.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-sunday-roast",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XL",
          "addressCountry": "GB"
        },
        "servesCuisine": ["British", "Halal", "Sunday Roast"],
        "priceRange": "££",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "12:00",
          "closes": "17:00",
          "description": "Sunday Roast service hours"
        },
        "hasMenu": {
          "@type": "Menu",
          "name": "Sunday Roast Menu",
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Roast Mains",
              "hasMenuItem": [
                { "@type": "MenuItem", "name": "Beef Roast", "offers": { "@type": "Offer", "price": "14.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Half Chicken Roast", "offers": { "@type": "Offer", "price": "15.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Lamb Shank Roast", "offers": { "@type": "Offer", "price": "16.99", "priceCurrency": "GBP" } }
              ]
            },
            {
              "@type": "MenuSection",
              "name": "Desserts & Extras",
              "hasMenuItem": [
                { "@type": "MenuItem", "name": "Special Homemade Cheesecake", "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Eton Mess", "offers": { "@type": "Offer", "price": "5.49", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Apple Crumble", "offers": { "@type": "Offer", "price": "6.49", "priceCurrency": "GBP" } }
              ]
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Does Taste of Village do Sunday Roast in Slough?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Taste of Village at 260 Farnham Road, Slough serves a classic British Sunday Roast every Sunday from 12:00 PM to 5:00 PM. Choose from Beef Roast (£14.99), Half Chicken Roast (£15.99), or Lamb Shank Roast (£16.99), all served with traditional trimmings."
            }
          },
          {
            "@type": "Question",
            "name": "What time is the Sunday Roast available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our Sunday Roast is served exclusively on Sundays between 12:00 PM and 5:00 PM. We recommend pre-ordering online to guarantee your meal."
            }
          },
          {
            "@type": "Question",
            "name": "Can I pre-order the Sunday Roast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can pre-order your Sunday Roast through our website any day of the week. Simply select your items from the Sunday Roast section on our menu and choose a Sunday collection or delivery time at checkout."
            }
          },
          {
            "@type": "Question",
            "name": "Is the Sunday Roast Halal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Our entire menu, including all Sunday Roast dishes, is 100% Halal certified. All meat is sourced from trusted Halal suppliers."
            }
          },
          {
            "@type": "Question",
            "name": "What comes with the Sunday Roast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Each roast main is served with your choice of roast or creamy mashed potatoes, seasonal vegetables with roasted Brussels sprouts, rich gravy, and a Yorkshire pudding. Additional sides and sauces like Peppercorn Sauce (£1.99) and Garlic Mushroom Sauce (£1.99) are available separately."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-sand min-h-screen font-sans">
      {/* JSON-LD Schema for SEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tasteofvillagerestaurants.co.uk" },
            { "@type": "ListItem", "position": 2, "name": "Slough", "item": "https://tasteofvillagerestaurants.co.uk/slough" },
            { "@type": "ListItem", "position": 3, "name": "Sunday Roast", "item": "https://tasteofvillagerestaurants.co.uk/slough-sunday-roast" }
          ]
        }) }}
      />

      {/* ── HERO ── Full-bleed cinematic banner */}
      <div className="relative w-full h-[460px] sm:h-[560px] md:h-[620px] overflow-hidden">
        <Image
          src="/assets/menu/sunday-roast/roast_special_3.jpg"
          alt="Sunday Roast feast spread at Taste of Village Slough — lamb shank, half chicken, beef, Yorkshire pudding, roast potatoes, seasonal vegetables and rich gravy"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Cinematic gradient: dark bottom for text, subtle vignette top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 sm:pb-16 px-4 sm:px-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="inline-block bg-[#D14836] text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg animate-pulse">
              Sunday Special · 30% OFF
            </span>
            
          </div>

          <h1 className="font-serif text-[2.5rem] sm:text-6xl md:text-7xl text-white mb-3 leading-[1.05] drop-shadow-2xl">
            Sunday Roast
          </h1>
          <p className="text-white/85 text-xs sm:text-base leading-relaxed max-w-lg mx-auto mb-6 drop-shadow">
            Slow-roasted. Halal certified. All the trimmings. Enjoy <strong className="text-amber-300">30% OFF</strong> all Sunday long!
          </p>

          {/* 3-Way Order CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xl">
            <a
              href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-xl active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              WhatsApp Order
            </a>

            <Link
              href="/slough/menu#sunday_roast"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pine rounded-full font-black text-xs uppercase tracking-wider hover:bg-terracotta hover:text-white transition-all duration-300 shadow-xl active:scale-95"
            >
              Website Order
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>

            <a
              href="tel:01753326341"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/15 backdrop-blur-md text-white border border-white/30 rounded-full font-black text-xs uppercase tracking-wider hover:bg-white hover:text-pine transition-all shadow-xl active:scale-95"
            >
              📞 01753 326341
            </a>
          </div>

          <p className="text-[11px] text-amber-200/90 font-mono tracking-wider mt-4">
            ★ Tell our team to apply under your loyalty program account to redeem
          </p>
        </div>
      </div>

      {/* ── PROMO HIGHLIGHT CARD ── Clear rules and redemption */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 mb-12">
        <div className="bg-pine text-white p-6 sm:p-7 rounded-3xl shadow-2xl border border-amber-400/30">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="bg-amber-400 text-pine text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Limited Availability
                </span>
                <span className="text-amber-200 text-xs font-mono font-bold">
                  Every Sunday 12:00 PM – 5:00 PM
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-bold leading-tight">
                Sunday Roast Specials — Grab Yours Quick! <span className="text-amber-300 block text-lg sm:text-xl mt-1">30% OFF</span>
              </h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Order via WhatsApp, online, or call <span className="text-amber-300 font-bold">01753 326341</span>.
                <strong className="text-white block mt-1">
                  ⚡ Must tell our colleague to log it under your loyalty program account to redeem the offer!
                </strong>
              </p>
            </div>

            <div className="flex flex-row lg:flex-col gap-2 shrink-0">
              <a
                href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#25D366] text-white rounded-full font-black text-[11px] uppercase tracking-wider hover:bg-[#20ba59] transition-all text-center flex items-center justify-center gap-1.5"
              >
                1-Tap WhatsApp
              </a>
              <Link
                href="/offers"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-[11px] uppercase tracking-wider transition-all text-center border border-white/20"
              >
                All TOV Offers
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── EDITORIAL MAINS ── Alternating image+text layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-12">
          <span className="text-terracotta font-bold tracking-widest uppercase text-[10px] block mb-3">Choose Your Roast</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-pine">The Mains</h2>
        </div>

        {/* Beef Roast — Image Left */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 items-center mb-8 md:mb-14">
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
            <Image
              src="/assets/menu/sunday-roast/sunday_roast_beef.webp"
              alt="Beef Roast with Yorkshire pudding, mashed potatoes and seasonal vegetables"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="p-6 sm:p-8 md:p-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h3 className="font-serif text-3xl text-pine">Beef Roast</h3>
              <div className="text-right">
                <span className="text-pine/40 line-through text-sm mr-2">£14.99</span>
                <span className="text-terracotta font-black text-2xl">£10.49</span>
                <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  1st 5 Orders: £7.50
                </span>
              </div>
            </div>
            <div className="w-12 h-0.5 bg-terracotta/40 mb-4" />
            <p className="text-pine/70 leading-relaxed mb-6">
              Succulent slow-roasted British beef, carved thick and served with your choice of roast or creamy mashed potatoes, seasonal vegetables, rich gravy &amp; a golden Yorkshire pudding.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/slough/menu#sunday_roast" className="text-terracotta font-bold text-sm hover:underline inline-flex items-center gap-1">
                Order Online →
              </Link>
              <a href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Beef%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program." target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold text-sm hover:underline inline-flex items-center gap-1">
                WhatsApp Order →
              </a>
            </div>
          </div>
        </div>

        {/* Half Chicken Roast — Featured Platter */}
        <div className="bg-pine text-white rounded-[2.5rem] p-6 sm:p-10 mb-8 md:mb-14 overflow-hidden border border-pine-light/30 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
            <div className="order-2 md:order-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-amber-400 text-pine text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  ★ Crowd Favourite
                </span>
                <span className="text-amber-200 text-xs font-mono font-bold tracking-wider">
                  Halal Certified
                </span>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <h3 className="font-serif text-3xl sm:text-4xl text-white">Half Chicken Roast</h3>
                <div className="text-right">
                  <span className="text-white/40 line-through text-sm mr-2">£15.99</span>
                  <span className="text-amber-300 font-black text-2xl sm:text-3xl">£11.19</span>
                  <span className="block text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                    1st 5 Orders: £8.00
                  </span>
                </div>
              </div>
              <div className="w-12 h-0.5 bg-amber-400/60 mb-4" />
              <p className="text-white/80 leading-relaxed mb-6 text-sm sm:text-base">
                Succulent roasted half chicken served on traditional ceramic, tender and crispy-skinned. Accompanied by crisp Yorkshire pudding, roasted sweet carrots, parsnips, tender broccoli, fluffy potatoes and house gravy.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/slough/menu#sunday_roast" className="px-6 py-3 bg-white text-pine rounded-full font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg inline-flex items-center gap-1.5 active:scale-95">
                  Order Online →
                </Link>
                <a href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Half%20Chicken%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program." target="_blank" rel="noopener noreferrer" className="px-5 py-3 bg-[#25D366] text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-[#20ba59] transition-all shadow-lg inline-flex items-center gap-1.5 active:scale-95">
                  WhatsApp Order →
                </a>
              </div>
            </div>
            <div className="order-1 md:order-2 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
              <Image
                src="/assets/menu/sunday-roast/roast_special_2.jpg"
                alt="Golden Half Chicken Roast on floral ceramic platter with Yorkshire pudding, roast carrots, broccoli, and rich gravy"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>

        {/* Lamb Shank — Image Left, Text Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 items-center">
          <div className="order-1 md:order-1 relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl mb-6 md:mb-0">
            <Image
              src="/assets/menu/sunday-roast/roast_special_1.jpg"
              alt="Slow-cooked Lamb Shank Roast with vine tomatoes, Yorkshire pudding, mash and roasted potatoes"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-2 md:order-2 p-6 sm:p-8 md:p-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h3 className="font-serif text-3xl text-pine">Lamb Shank Roast</h3>
              <div className="text-right">
                <span className="text-pine/40 line-through text-sm mr-2">£16.99</span>
                <span className="text-terracotta font-black text-2xl">£11.89</span>
                <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                  1st 5 Orders: £8.50
                </span>
              </div>
            </div>
            <div className="w-12 h-0.5 bg-terracotta/40 mb-4" />
            <p className="text-pine/70 leading-relaxed mb-6">
              Slow-cooked bone-in lamb shank, braised until melt-in-the-mouth tender in rosemary jus. Served with roast potatoes, creamy mash, vine tomatoes, golden Yorkshire pudding &amp; rich gravy.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/slough/menu#sunday_roast" className="text-terracotta font-bold text-sm hover:underline inline-flex items-center gap-1">
                Order Online →
              </Link>
              <a href="https://wa.me/441753326341?text=Hi%20Taste%20of%20Village%20Slough!%20I'd%20like%20to%20order%20the%20Lamb%20Shank%20Sunday%20Roast%20special%20offer.%20Please%20put%20it%20under%20my%20loyalty%20program." target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold text-sm hover:underline inline-flex items-center gap-1">
                WhatsApp Order →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL-WIDTH DIVIDER IMAGE ── Overhead lamb shot */}
      <div className="relative w-full h-[200px] sm:h-[280px] overflow-hidden my-4">
        <Image
          src="/assets/menu/sunday-roast/sunday_roast_lamb_overhead.webp"
          alt="Overhead view of Lamb Shank with vine tomatoes, Yorkshire pudding and seasonal vegetables"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sand via-transparent to-sand" />
      </div>

      {/* ── EXTRAS ── Desserts & Sides */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-10">
          <span className="text-terracotta font-bold tracking-widest uppercase text-[10px] block mb-3">Complete Your Roast</span>
          <h2 className="font-serif text-4xl sm:text-5xl text-pine">Extras & Desserts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Desserts Column */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pine/8">
            <h3 className="font-serif text-xl text-pine mb-5 flex items-center gap-2">
              <span className="text-2xl">🍰</span> Desserts
            </h3>
            <div className="space-y-3">
              {EXTRAS.slice(0, 3).map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-pine/5 last:border-0">
                  <div>
                    <span className="text-pine font-semibold text-sm">{item.name}</span>
                    {item.note && <span className="text-pine/40 text-xs block">{item.note}</span>}
                  </div>
                  <span className="text-terracotta font-black text-sm shrink-0 ml-4">£{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sides & Sauces Column */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-pine/8">
            <h3 className="font-serif text-xl text-pine mb-5 flex items-center gap-2">
              <span className="text-2xl">🥘</span> Sides & Sauces
            </h3>
            <div className="space-y-3">
              {EXTRAS.slice(3).map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-pine/5 last:border-0">
                  <div>
                    <span className="text-pine font-semibold text-sm">{item.name}</span>
                  </div>
                  <span className="text-terracotta font-black text-sm shrink-0 ml-4">£{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ / AEO ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl text-pine">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          {[
            { q: 'Does Taste of Village do Sunday Roast in Slough?', a: 'Yes. Taste of Village at 260 Farnham Road, Slough serves a classic British Sunday Roast every Sunday from 12:00 PM to 5:00 PM. Choose from Beef Roast (£14.99), Half Chicken Roast (£15.99), or Lamb Shank Roast (£16.99), all served with traditional trimmings.' },
            { q: 'What time is the Sunday Roast available?', a: 'Our Sunday Roast is served exclusively on Sundays between 12:00 PM and 5:00 PM. We recommend pre-ordering online to guarantee your meal.' },
            { q: 'Can I pre-order the Sunday Roast?', a: 'Yes. You can pre-order your Sunday Roast through our website any day of the week. Simply select your items from the Sunday Roast section on our menu and choose a Sunday collection time at checkout.' },
            { q: 'Is the Sunday Roast Halal?', a: 'Yes. Our entire menu, including all Sunday Roast dishes, is 100% Halal. All meat is sourced from trusted Halal suppliers.' },
            { q: 'What comes with the Sunday Roast?', a: 'Each roast main is served with your choice of roast or creamy mashed potatoes, seasonal vegetables with roasted Brussels sprouts, rich gravy, and a Yorkshire pudding. Additional sides and sauces are available separately.' },
          ].map((faq) => (
            <div key={faq.q} className="border-l-2 border-terracotta/30 pl-5 sm:pl-6">
              <strong className="text-pine block mb-1.5 text-[15px]">{faq.q}</strong>
              <p className="text-pine/65 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GRADIENT TRANSITION ── Smooth fade from sand into deep heritage pine */}
      <div className="w-full bg-gradient-to-b from-sand via-[#EFE6DC] to-[#0E1F1A] pt-12 pb-6 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-pine/70">
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
            <span>100% Halal Certified · Prepared Fresh Daily · Slough</span>
            <span className="w-6 sm:w-10 h-px bg-terracotta/40" />
          </div>
        </div>
      </div>

      {/* ── CTA FOOTER ── Dark editorial block with subtle TOV diamond pattern */}
      <footer className="w-full bg-[#0E1F1A] text-white relative overflow-hidden border-t border-terracotta/20">
        {/* Authentic Diamond Cross-Stitch Pattern — Matching the first page */}
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

        {/* FHRS Official Food Hygiene Badges Tier — Side-by-Side as on First Page */}
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center relative z-10">
          <span className="text-terracotta font-bold tracking-widest uppercase text-[10px] block mb-4">260 Farnham Road, Slough</span>
          <h2 className="font-serif text-4xl sm:text-5xl mb-5">Your Sunday Sorted</h2>
          <p className="text-white/60 leading-relaxed max-w-md mx-auto mb-10">
            Gather the family, skip the cooking, and let us handle a proper roast. Pre-order online or book a table.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link href="/slough/menu#sunday_roast" className="w-full sm:w-auto px-10 py-4 bg-terracotta text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-terracotta/80 transition-all shadow-lg active:scale-95 text-center">
              Order Sunday Roast
            </Link>
            <Link href="/book" className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-white/20 transition-all border border-white/20 active:scale-95 text-center">
              Book a Table
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-terracotta" /> SL1 4XL
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-terracotta" /> Sundays 12 – 5 PM
            </div>
            <div className="flex items-center gap-2">
              📞 01753 326341
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <span className="font-display text-terracotta text-xs tracking-[0.3em] uppercase font-semibold block mb-1">
              Taste of Village
            </span>
            <span className="text-[#889B8D] text-[9px] tracking-[0.2em] uppercase font-sans">
              &copy; {new Date().getFullYear()} Taste of Village | Slough &bull; 260 Farnham Road
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
