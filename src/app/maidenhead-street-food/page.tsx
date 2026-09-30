import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Indian Street Food & Chaat Near Maidenhead",
  description: "Craving late-night Indian street food near Maidenhead? Take a quick drive to Taste of Village in Slough for authentic Samosa Chaat, Gol Gappe, and Karak Chai.",
  alternates: {
    canonical: "/maidenhead-street-food"
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
            { "@type": "ListItem", "position": 2, "name": "Authentic Indian Street Food & Late Night Chaat", "item": "https://tasteofvillagerestaurants.co.uk/maidenhead-street-food" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div 
          className="text-center mb-16"
        >
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">A Quick Drive from Maidenhead</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Authentic Indian Street Food & Late Night Chaat</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            Maidenhead locals know that for truly authentic, late-night sub-continent flavors, a quick trip down the M4 to Farnham Road is worth every minute.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div 
            className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand text-white"
          >
            <h2 className="font-serif text-3xl mb-4 text-terracotta">The Real Taste of Mumbai</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              When you're craving that perfect mix of crunchy, sweet, and spicy, our Indian street food menu delivers. We specialize in late-night chaat that brings the vibrant streets of Mumbai to your table.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Samosa Chaat</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Aloo Tikki Chaat</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Dahi Bhalla</li>
            </ul>
          </div>

          <div 
            className="bg-sand p-10 rounded-[3rem]"
          >
            <h2 className="font-serif text-3xl mb-4 text-pine">Karak Chai & Desserts</h2>
            <p className="text-pine leading-relaxed mb-6">
              Pair your savory street food with the finest Karak Chai in Berkshire, brewed fresh every evening. Or finish off with our signature Halal desserts, including the Royal Heritage Taste of Village.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Authentic Karak Chai</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> The Royal Heritage Taste of Village</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh Hot Cookie Dough</li>
            </ul>
          </div>
        </div>

        <div 
          className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center"
        >
          <h2 className="font-serif text-4xl mb-6">Visit Us from Maidenhead</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Skip the local takeaways and experience premium dine-in street food. We're open late to satisfy all your savory and sweet cravings.
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
