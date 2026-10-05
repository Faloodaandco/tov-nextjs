import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Halal Desserts near Windsor",
  description: "Craving late-night halal desserts near Windsor? Take a short 10-minute drive to Taste of Village for luxury cookie dough, milkshakes, and Indian street food.",
  alternates: {
    canonical: "/windsor-desserts"
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
            { "@type": "ListItem", "position": 2, "name": "Windsor's Premier Choice for Late-Night Halal Desserts", "item": "https://tasteofvillagerestaurants.co.uk/windsor-desserts" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Just 10 Minutes from Windsor Castle</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Windsor's Premier Choice for Late-Night Halal Desserts</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            Windsor is beautiful, but when the late-night cravings hit, the options can be limited. Just a short drive away on the vibrant Farnham Road, Taste of Village offers the ultimate luxury dessert experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Late Night Luxury</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Skip the noisy chains and treat yourself to a premium dine-in experience. We serve freshly baked cookie dough, artisan milkshakes, and the famous San Sebastian cheesecake — all 100% Halal and available until midnight.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Freshly Baked Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Luxury Milkshakes</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> San Sebastian Cheesecake</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">A Taste of the East</h2>
            <p className="text-pine leading-relaxed mb-6">
              Looking for something more exotic than standard ice cream? Our renowned Royal Shahi Kulfi Falooda is the perfect blend of sweet basil seeds, Rooh Afza, and rich Kulfi, bridging the gap between traditional South Asian sweets and modern luxury.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Pistachio Kulfi Falooda</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Traditional Kulfi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Late Night Karak Chai</li>
            </ul>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Make the Short Trip from Windsor Today</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Hop onto the A332 and join us for the ultimate dessert experience. Plenty of parking nearby and a luxurious dine-in atmosphere waiting for you.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open until Midnight
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
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
