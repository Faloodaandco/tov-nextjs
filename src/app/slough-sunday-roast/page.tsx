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
  { name: 'Half Chicken Roast', price: '15.99', desc: 'Golden-roasted half chicken, tender and juicy, served with all the traditional trimmings.', image: null },
  { name: 'Lamb Shank Roast', price: '16.99', desc: 'Slow-cooked lamb shank falling off the bone, served with roast or mashed potatoes, seasonal veg, gravy & Yorkshire pudding.', image: '/assets/menu/sunday-roast/sunday_roast_lamb_shank.webp' },
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
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
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
      <div className="relative w-full h-[420px] sm:h-[520px] md:h-[600px] overflow-hidden">
        <Image
          src="/assets/menu/sunday-roast/sunday_roast_hero.webp"
          alt="Sunday Roast spread at Taste of Village — beef, lamb shank, Yorkshire pudding, roasted vegetables and rich gravy"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Cinematic gradient: dark bottom for text, subtle vignette top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 sm:pb-20 px-6 text-center">
          <span className="inline-block bg-terracotta/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-5">
            Every Sunday · 12 – 5 PM
          </span>
          <h1 className="font-serif text-[2.5rem] sm:text-6xl md:text-7xl text-white mb-4 leading-[1.05] drop-shadow-2xl">
            Sunday Roast
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
            Slow-roasted. Halal certified. Served with all the trimmings every Sunday at Farnham Road.
          </p>
          <Link
            href="/slough/menu#sunday_roast"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-pine rounded-full font-black text-xs uppercase tracking-wider hover:bg-terracotta hover:text-white transition-all duration-300 shadow-xl active:scale-95"
          >
            Order Now
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>

      {/* ── AVAILABILITY PILL ── Floats between hero and content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 mb-16">
        <div className="bg-pine text-white p-5 sm:p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-amber-300" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-widest text-amber-300 block">Sunday Only</span>
              <span className="text-white/70 text-xs">12:00 PM – 5:00 PM · Pre-order any day</span>
            </div>
          </div>
          <Link
            href="/slough/menu#sunday_roast"
            className="px-6 py-2.5 bg-terracotta text-white rounded-full font-black text-[11px] uppercase tracking-wider hover:bg-terracotta/80 transition-all active:scale-95 shrink-0"
          >
            View Menu
          </Link>
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
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-serif text-3xl text-pine">Beef Roast</h3>
              <span className="text-terracotta font-black text-2xl">£14.99</span>
            </div>
            <div className="w-12 h-0.5 bg-terracotta/40 mb-4" />
            <p className="text-pine/70 leading-relaxed mb-6">
              Succulent slow-roasted British beef, carved thick and served with your choice of roast or creamy mashed potatoes, seasonal vegetables, rich gravy &amp; a golden Yorkshire pudding.
            </p>
            <Link href="/slough/menu#sunday_roast" className="text-terracotta font-bold text-sm hover:underline inline-flex items-center gap-1">
              Add to order →
            </Link>
          </div>
        </div>

        {/* Half Chicken — Text Only, Centered */}
        <div className="bg-pine rounded-[2rem] p-8 sm:p-12 text-center mb-8 md:mb-14">
          <div className="flex items-baseline justify-center gap-4 mb-3">
            <h3 className="font-serif text-3xl text-white">Half Chicken Roast</h3>
            <span className="text-amber-300 font-black text-2xl">£15.99</span>
          </div>
          <div className="w-12 h-0.5 bg-terracotta/60 mx-auto mb-4" />
          <p className="text-white/70 leading-relaxed max-w-lg mx-auto mb-6">
            Golden-roasted half chicken, tender and juicy, served with roast potatoes, seasonal veg, rich gravy and a freshly baked Yorkshire pudding. The classic done right.
          </p>
          <Link href="/slough/menu#sunday_roast" className="text-amber-300 font-bold text-sm hover:underline inline-flex items-center gap-1">
            Add to order →
          </Link>
        </div>

        {/* Lamb Shank — Image Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 items-center">
          <div className="order-2 md:order-1 p-6 sm:p-8 md:p-0">
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-serif text-3xl text-pine">Lamb Shank Roast</h3>
              <span className="text-terracotta font-black text-2xl">£16.99</span>
            </div>
            <div className="w-12 h-0.5 bg-terracotta/40 mb-4" />
            <p className="text-pine/70 leading-relaxed mb-6">
              Slow-cooked lamb shank, falling off the bone in its own rich juices. Served with creamy mash or roast potatoes, seasonal veg, gravy &amp; Yorkshire pudding.
            </p>
            <Link href="/slough/menu#sunday_roast" className="text-terracotta font-bold text-sm hover:underline inline-flex items-center gap-1">
              Add to order →
            </Link>
          </div>
          <div className="order-1 md:order-2 relative aspect-[4/3] rounded-[2rem] overflow-hidden">
            <Image
              src="/assets/menu/sunday-roast/sunday_roast_lamb_shank.webp"
              alt="Lamb Shank Roast with vine tomatoes, Yorkshire pudding, mash and roasted vegetables"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
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

      {/* ── CTA FOOTER ── Dark editorial block */}
      <div className="bg-pine text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
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
        </div>
      </div>
    </div>
  );
}
