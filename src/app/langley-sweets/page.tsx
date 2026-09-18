import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "South Asian Sweets & Desserts Near Langley",
  description: "Just down the road from Langley, Taste of Village serves authentic South Asian sweets, halal cookie dough, and premium Taste of Village for the whole family.",
  alternates: {
    canonical: "/langley-sweets"
  }
};

export default function SeoPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      
      
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Serving the Langley Community</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Traditional Sweets & Family Desserts</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Located just moments from Langley, Taste of Village provides a premium, family-friendly environment focusing on authentic South Asian dessert heritage and modern halal treats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">The Heritage Menu</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Share the authentic tastes of back home with the next generation. We specialize in traditional recipes that refuse to cut corners, offering the finest South Asian sweets and refreshing beverages in the area.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> The Royal Heritage Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Authentic Mango Lassi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Traditional Kulfi Cuts</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">Modern Halal Favorites</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Prefer something contemporary? Our kitchen also bakes incredible hot cookie dough, frothy milkshakes, and luxurious cheesecakes. 100% Halal certified, making it the perfect safe dining spot for Langley families.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Hot Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Kinder Bueno Milkshakes</li>
            </ul>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Your Local Dessert Spot</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Whether it's a post-dinner family outing or a quick catch-up over Karak Chai, we are Langley's closest premium dessert parlour.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open Daily until Midnight
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white text-pine rounded-full font-bold hover:shadow-lg transition-all">
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
