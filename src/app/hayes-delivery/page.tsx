import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Truck, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Halal Food Delivery in Hayes | Taste of Village',
  description: 'Order authentic Pakistani food for delivery in Hayes, Southall & Uxbridge. Karahi, Nihari, BBQ platters delivered by our own drivers. Free delivery over £30.',
  alternates: {
    canonical: '/hayes-delivery'
  }
};

export default function HayesDeliveryPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Now Delivering Across UB1–UB5</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Halal Food Delivery in Hayes</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Our own drivers deliver hand-cooked Pakistani food straight from 766B Uxbridge Road to your door. Karahi, Nihari, BBQ platters — all within a 5-mile radius. Free delivery on orders over £30.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Our Own Driver Fleet</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              We never use third-party apps. Our trained drivers handle every order from kitchen to doorstep, keeping your food hot and your packaging intact. You track your order directly through our site.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> Free delivery over £30</li>
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> 5-mile radius from Hayes</li>
              <li className="flex items-center gap-3"><Truck size={16} className="text-terracotta" /> Live order tracking</li>
            </ul>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-pine/5">
            <h2 className="font-serif text-3xl mb-4 text-pine">Delivery Zones</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              We cover Hayes, Southall, Uxbridge, West Drayton, Yeading, and Hillingdon. All UB1 through UB5 postcodes fall inside our delivery radius. Most orders arrive within 40 minutes.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Hayes &amp; Yeading</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Southall &amp; Hillingdon</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Uxbridge &amp; West Drayton</li>
            </ul>
          </div>
        </div>

        <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-sand mb-16">
          <h2 className="font-serif text-3xl mb-4 text-terracotta text-center">Popular Delivery Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Chicken Karahi</h3>
              <p className="text-white/60 text-sm">Wok-fired with fresh tomatoes, green chillies, and hand-ground garam masala.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Lamb Nihari</h3>
              <p className="text-white/60 text-sm">Slow-cooked overnight. Rich bone-marrow gravy finished with fresh ginger.</p>
            </div>
            <div>
              <h3 className="font-serif text-xl text-sand mb-2">Mixed BBQ Platter</h3>
              <p className="text-white/60 text-sm">Seekh kebab, lamb chops, and chicken tikka straight from the charcoal grill.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Order Delivery Now</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Browse the full Hayes menu, add to basket, and check out. Our kitchen fires your order fresh and our driver brings it to you — every day, 12 PM to 11 PM.
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
