import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Best Halal Desserts in Slough",
  description: "Looking for the best desserts in Slough? Taste of Village on Farnham Road serves luxury halal desserts, hot cookie dough, and our signature Taste of Village until midnight.",
  alternates: {
    canonical: "/slough-desserts"
  }
};

export default function SeoPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      
      
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">The Jewel of Farnham Road</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Slough's Best Late Night Halal Desserts</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Right in the heart of Slough, Taste of Village is redefining the local dessert scene. From intensely rich Pistachio Taste of Village to freshly baked hot cookie dough, we serve pure luxury.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Signature Halal Desserts</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Every item on our menu is 100% Halal and crafted with uncompromising quality. We've sourced the finest ingredients to bring upscale dessert parlor vibes straight to Slough.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Signature Hot Cookie Dough</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Authentic San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Premium Milkshakes</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">The Famous Taste of Village</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Our namesake dessert is what put us on the map. The Royal Heritage Taste of Village is the ultimate late-night street food treat, perfectly balancing Rooh Afza, basil seeds, and rich traditional Kulfi.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> The Royal Heritage Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Pistachio Royale Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> The Salted Sunset</li>
            </ul>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Dine In or Order for Collection</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Enjoy a luxurious dine-in experience or easily book a table online. We're open late, making us the perfect post-dinner destination in Slough.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open every day until Midnight
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/menu" className="px-8 py-4 bg-terracotta text-white text-pine rounded-full font-bold hover:shadow-lg transition-all">
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
