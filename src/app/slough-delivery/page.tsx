import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Truck, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Halal Food Delivery in Slough | Taste of Village',
  description: 'Order authentic Gujranwala-style Pakistani food for delivery in Slough, Langley & Windsor. Karahi, Haleem, BBQ delivered to your door. Free delivery over £30.',
  alternates: {
    canonical: '/slough-delivery'
  }
};

export default function SloughDeliveryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FoodEstablishment",
        "name": "Taste of Village Slough Delivery",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-delivery",
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
          { "@type": "PostalCode", "postalCode": "SL1" },
          { "@type": "PostalCode", "postalCode": "SL2" },
          { "@type": "PostalCode", "postalCode": "SL3" },
          { "@type": "PostalCode", "postalCode": "SL4" }
        ],
        "potentialAction": {
          "@type": "OrderAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://tasteofvillagerestaurants.co.uk/slough/menu",
            "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
          },
          "deliveryMethod": "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Which areas in Slough do you deliver to?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our dedicated delivery fleet delivers within a 5-mile radius covering postcodes SL1, SL2, SL3, and SL4 (Slough, Burnham, Langley, Datchet, and Windsor)."
            }
          },
          {
            "@type": "Question",
            "name": "What is the minimum order and free delivery threshold for Slough?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The minimum delivery order is £20, and all orders over £30 qualify for 100% free delivery directly to your door."
            }
          },
          {
            "@type": "Question",
            "name": "Is the delivered food freshly prepared?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, every dish is cooked fresh to order in our kitchen at 260 Farnham Road and delivered in thermal sealed packaging to arrive piping hot."
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
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Now Delivering Across SL1–SL4</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Halal Food Delivery in Slough</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Our own drivers deliver Gujranwala-style Pakistani food from 260 Farnham Road to your door. Karahi, Haleem, BBQ — all within a 5-mile radius. Free delivery on orders over £30.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Our Own Driver Fleet</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We skip the third-party apps entirely. Our trained drivers collect your order from the kitchen pass and deliver it hot to your door. You track every step through our site.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> Free delivery over £30</li>
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> 5-mile radius from Slough</li>
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> Live order tracking</li>
            </ul>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-pine/5">
            <h2 className="font-serif text-3xl mb-4 text-pine">Delivery Zones</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              We cover Slough, Langley, Colnbrook, Burnham, Datchet, and Farnham Royal. All SL1 through SL4 postcodes sit inside our delivery radius. Most orders arrive within 40 minutes.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Slough &amp; Langley</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Colnbrook &amp; Burnham</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Datchet &amp; Farnham Royal</li>
            </ul>
          </div>
        </div>

        <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand mb-16">
          <h2 className="font-serif text-3xl mb-4 text-terracotta text-center">Popular Delivery Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Chicken Karahi</h3>
              <p className="text-white/60 text-sm">Wok-fired with crushed tomatoes, green chillies, and freshly pounded spices.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Haleem</h3>
              <p className="text-white/60 text-sm">Slow-cooked lentil and lamb stew, finished with fried onions and fresh lime.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Mixed BBQ Platter</h3>
              <p className="text-white/60 text-sm">Seekh kebab, lamb chops, and chicken tikka fired over charcoal.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Order Delivery Now</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Browse the full Slough menu, add to basket, and check out. Our kitchen fires your order fresh and our driver brings it to you — every day, 12 PM to 11 PM.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough SL1 4XL
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> 12 PM – 11 PM Daily
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Slough Menu
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
