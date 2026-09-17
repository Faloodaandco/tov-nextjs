import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Halal Desserts near Reading | Taste of Village",
  description: "Craving luxury halal desserts near Reading? Taste of Village in Slough is just 30 minutes away — serving artisan taste-of-villages, cookie dough, and chaats until midnight.",
  alternates: {
    canonical: "/reading-desserts"
  }
};

export default function SeoPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      
      
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Worth Every Mile from Reading</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Reading's Best-Kept Dessert Secret is in Slough</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Reading has plenty of restaurants, but when it comes to authentic South Asian luxury desserts, locals are making the easy 30-minute drive along the M4 to Taste of Village on Farnham Road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Why Reading Locals Love Us</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We're not your average dessert parlour. Our Royal Heritage Taste of Village uses premium ingredients — from hand-crushed pistachios to fragrant Rooh Afza — crafted by artisans who live and breathe South Asian dessert culture.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Artisan Taste of Village Collection</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> San Sebastian Cheesecake</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Late Night Indian Street Food</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">Easy M4 Access</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Jump on the M4 from Reading, exit at Junction 6, and you're on Farnham Road in under 30 minutes. Plenty of free parking nearby and a luxurious dine-in atmosphere that makes the journey worthwhile.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-pine font-bold">
                <Car size={20} className="text-terracotta" /> 30 min via M4 from Reading town centre
              </div>
              <div className="flex items-center gap-3 text-pine font-bold">
                <Clock size={20} className="text-terracotta" /> Open until midnight, 7 days a week
              </div>
              <div className="flex items-center gap-3 text-pine font-bold">
                <MapPin size={20} className="text-terracotta" /> 268 Farnham Road, Slough SL1 4XL
              </div>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Drive from Reading. Arrive in Luxury.</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Whether it's a date night, family outing, or late-night craving, Taste of Village delivers an experience that Reading dessert lovers are raving about.
          </p>
          
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
