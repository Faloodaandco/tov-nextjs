import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Authentic Taste of Village Near High Wycombe",
  description: "Looking for the best Taste of Village near High Wycombe? Just a short drive away, Taste of Village serves authentic Royal Taste of Village and the finest house-made chaat in the region.",
  alternates: {
    canonical: "/high-wycombe-taste-of-village"
  }
};

export default function SeoPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      
      
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">A Short Drive from High Wycombe</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Finally. An Authentic Taste of Village Experience.</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            High Wycombe locals know that finding a truly authentic Taste of Village or traditional Dahi Bhalla nearby is almost impossible. That's why we invite you to make the short trip to Farnham Road. We do it the traditional way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">The Royal Heritage Taste of Village</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              You won't find generic syrups or corner-cutting here. Our signature Royal Heritage Taste of Village is crafted with luxury traditional kulfi, rich basil seeds, and authentic Rooh Afza, delivering that brilliant nostalgic taste you've been searching for.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Authentic Mughal Recipes</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Pistachio & Mango Variants</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> 100% Halal Certified</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">London's Best Chaat?</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              We say yes. We refuse to use tinned chickpeas. Our Samosa Chaat and Dahi Bhallay feature chickpeas slow-cooked for hours to perfection. Everything from the papdi to the bhallas is made fresh in-house, never store-bought, guaranteeing an unbeatable authentic crunch.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Slow-Cooked Chickpeas (No Tins)</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh In-House Papdi & Bhalla</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Secret Hand-Ground Spice Blends</li>
            </ul>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Come Taste the Difference</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Don't settle for mediocre street food. Take the quick drive down to Slough and experience the most authentic Taste of Village and handcrafted Chaat available outside of South Asia.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 268 Farnham Road, Slough
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open until Midnight
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
