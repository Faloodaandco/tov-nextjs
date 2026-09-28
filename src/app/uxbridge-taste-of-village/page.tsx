import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Car } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Taste of Village & Halal Desserts near Uxbridge | Taste of Village",
  description: "Looking for authentic falooda and halal desserts near Uxbridge? Taste of Village in Slough is just 25 minutes away — luxury halal desserts, Indian street food, and chaats until midnight.",
  alternates: {
    canonical: "/uxbridge-taste-of-village"
  }
};

export default function SeoPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tasteofvillagerestaurants.co.uk" },
            { "@type": "ListItem", "position": 2, "name": "Uxbridge's Favourite Taste of Village Destination", "item": "https://tasteofvillagerestaurants.co.uk/uxbridge-taste-of-village" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">25 Minutes from Uxbridge</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Uxbridge's Favourite Taste of Village Destination</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Uxbridge has chains, but nothing like Taste of Village. A short drive along the A4020 and M40 brings you to Slough's most talked-about dessert parlour — where every falooda is hand-crafted and every chaat is made fresh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">The Taste of Village Experience</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our faloodas aren't just drinks — they're a layered dessert experience. From the signature Rose Falooda to the indulgent Pistachio Royale, each glass is assembled to order with premium kulfi, vermicelli, and aromatic syrups.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Rose Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Pistachio Royale Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh Samosa & Dahi Puri Chaat</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">Quick Drive, Big Reward</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Whether you're coming from Uxbridge town centre, Brunel University, or Hillingdon, you can be here in under 25 minutes. We're right on Farnham Road with easy access and local parking.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-pine font-bold">
                <Car size={20} className="text-terracotta" /> 25 min via A4020 / M40 from Uxbridge
              </div>
              <div className="flex items-center gap-3 text-pine font-bold">
                <Clock size={20} className="text-terracotta" /> Open until midnight, 7 days a week
              </div>
              <div className="flex items-center gap-3 text-pine font-bold">
                <MapPin size={20} className="text-terracotta" /> 260 Farnham Road, Slough SL1 4XQ
              </div>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Visit Us from Uxbridge Today</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Join the growing number of Uxbridge locals who've made Taste of Village their go-to spot for authentic halal desserts and Indian street food classics.
          </p>
          
          <div className="flex justify-center gap-4">
            <Link href="/hayes/menu" className="px-8 py-4 bg-terracotta text-white text-pine rounded-full font-bold hover:shadow-lg transition-all">
              View Full Menu
            </Link>
            <Link href="/book" className="px-8 py-4 bg-transparent border-2 border-brand-text/10 text-pine rounded-full font-bold hover:bg-brand-text/5 transition-all">
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  
  );
}
