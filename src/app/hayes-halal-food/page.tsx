import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Halal Restaurant in Hayes | Taste of Village',
  description: 'Halal certified Pakistani restaurant in Hayes. Hand-ground spice curries, clay-oven tandoori, sizzling Karahi. Dine in or order online for collection & delivery.',
  alternates: {
    canonical: '/hayes-halal-food'
  },
  openGraph: {
    type: 'website',
    title: 'Best Halal Restaurant in Hayes | Taste of Village',
    description: 'Halal certified Pakistani restaurant in Hayes. Hand-ground spice curries, clay-oven tandoori, sizzling Karahi. Dine in or order online for collection & delivery.',
    url: 'https://tasteofvillagerestaurants.co.uk/hayes-halal-food',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function HayesHalalFoodPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tasteofvillagerestaurants.co.uk" },
            { "@type": "ListItem", "position": 2, "name": "Authentic Halal Pakistani Food in Hayes", "item": "https://tasteofvillagerestaurants.co.uk/hayes-halal-food" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Halal Certified · Hayes</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Authentic Halal Pakistani Food in Hayes</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            Every cut of meat we serve carries full halal certification. Our chefs grind spices in-house daily and fire every Karahi to order. Dine in with your family or order online for collection and delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Halal You Can Trust</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We source all meat from certified halal suppliers and display our certificates in-restaurant. Our kitchen maintains strict halal-only preparation — no cross-contamination, no compromise.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-terracotta" /> Fully halal certified kitchen</li>
              <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-terracotta" /> Certified supplier chain</li>
              <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-terracotta" /> Certificates displayed on-site</li>
            </ul>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-pine/5">
            <h2 className="font-serif text-3xl mb-4 text-pine">Menu Highlights</h2>
            <p className="text-pine leading-relaxed mb-6">
              Our kitchen runs a tight menu built around dishes we perfected over decades. Hand-ground spices, clay-oven tandoori, and wok-fired Karahi define every service.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Sizzling Chicken &amp; Lamb Karahi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Slow-Cooked Lamb Nihari</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Charcoal Lamb Chops</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Crispy Fish Pakora</li>
            </ul>
          </div>
        </div>

        <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand mb-16">
          <h2 className="font-serif text-3xl mb-4 text-terracotta text-center">Family Dining &amp; NFC Ordering</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Family Tables</h3>
              <p className="text-white/60 text-sm">Spacious seating for large groups. Walk in or book ahead for weekend dinners.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Tap-to-Order</h3>
              <p className="text-white/60 text-sm">Tap the NFC tag at your table to browse the menu and order directly from your phone.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Collection &amp; Delivery</h3>
              <p className="text-white/60 text-sm">Order online for rapid collection or get it delivered by our own drivers across Hayes.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Visit Us in Hayes</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Walk in for lunch, bring the family for dinner, or order online. We cook every dish fresh — open daily, 12 PM to 11 PM.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 766B Uxbridge Road, Hayes UB4 0RU
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> 12 PM – 11 PM Daily
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/hayes/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Hayes Menu
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
