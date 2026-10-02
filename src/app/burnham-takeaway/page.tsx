import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Truck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Pakistani Takeaway Near Burnham | Taste of Village Slough",
  description: "Closest authentic Pakistani takeaway to Burnham. Sizzling Karahi, Tandoori BBQ, fresh Naan. Collection from Slough or delivery to your door.",
  alternates: {
    canonical: "/burnham-takeaway"
  },
  openGraph: {
    type: 'website',
    title: "Pakistani Takeaway Near Burnham | Taste of Village Slough",
    description: "Closest authentic Pakistani takeaway to Burnham. Sizzling Karahi, Tandoori BBQ, fresh Naan. Collection from Slough or delivery to your door.",
    url: 'https://tasteofvillagerestaurants.co.uk/burnham-takeaway',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function SeoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village - Pakistani Takeaway Serving Burnham",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/burnham-takeaway",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XL",
          "addressCountry": "GB"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 51.5273, "longitude": -0.6128 },
        "servesCuisine": ["Pakistani", "Halal", "South Asian", "Lahori", "Gujranwala"],
        "priceRange": "££",
        "hasMenu": "https://tasteofvillagerestaurants.co.uk/slough/menu",
        "areaServed": [
          { "@type": "AdministrativeArea", "name": "Burnham" },
          { "@type": "AdministrativeArea", "name": "Taplow" }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How far is Taste of Village from Burnham?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Taste of Village at 260 Farnham Road is located just 5–10 minutes down the A4 from Burnham, offering fast collection and direct home delivery."
            }
          },
          {
            "@type": "Question",
            "name": "Do you deliver hot Pakistani food to Burnham?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our own drivers deliver freshly cooked Karahi, Biryani, and Tandoori BBQ straight to Burnham and Taplow with free delivery on orders over £30."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
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
            { "@type": "ListItem", "position": 2, "name": "Pakistani Takeaway Near Burnham", "item": "https://tasteofvillagerestaurants.co.uk/burnham-takeaway" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Minutes from Burnham</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Pakistani Takeaway Near Burnham</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            Burnham residents order from us every week. We sit just a short drive down the A4 — collect from our Farnham Road kitchen or get hot delivery straight to your door in Burnham.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Sizzling Karahi & Curries</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our Karahi arrives sizzling in the wok — cooked to order with fresh tomatoes, ginger, and whole spices. Choose from chicken, lamb, or king prawn, each paired with freshly baked Naan from our tandoor.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Chicken Karahi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Lamb Karahi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> King Prawn Karahi</li>
            </ul>
          </div>

          <div className="bg-sand p-10 rounded-[3rem] border border-pine/10">
            <h2 className="font-serif text-3xl mb-4 text-pine">Tandoori BBQ & Sides</h2>
            <p className="text-pine leading-relaxed mb-6">
              Fire up your evening with charcoal Tandoori BBQ. We prepare every kebab and tikka fresh — never frozen, never reheated. Add our signature Raita and Chutney trio on the side.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Seekh Kebab Roll</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Chicken Tikka</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh Tandoori Naan</li>
            </ul>
          </div>
        </div>

        <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Truck size={24} className="text-terracotta" />
            <h2 className="font-serif text-3xl text-terracotta">Collection & Delivery</h2>
          </div>
          <p className="text-white/70 leading-relaxed">
            Order online and collect from our Farnham Road kitchen in minutes, or choose delivery and we bring your meal to Burnham, Taplow, and surrounding areas. We pack every order in sealed containers to keep your food piping hot on arrival.
          </p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Order Your Takeaway Now</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Skip the ordinary takeaways. Taste authentic Pakistani cuisine made fresh on Farnham Road — Burnham's closest source for genuine Karahi, BBQ, and Naan.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough SL1 4XL
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open until Midnight
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Full Menu
            </Link>
            <Link href="/book" className="px-8 py-4 bg-transparent border-2 border-pine/10 text-pine rounded-full font-bold hover:bg-pine/5 transition-all">
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
