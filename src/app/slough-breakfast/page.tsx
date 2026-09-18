import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Coffee } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Desi Breakfast & Halwa Puri in Slough | Taste of Village",
  description: "Authentic Gujranwala-style Pakistani breakfast on Farnham Road. Fresh Halwa Puri, Nihari, Paya, and Karak Chai. The best Desi Nashta in Slough.",
  alternates: {
    canonical: "/slough-breakfast"
  }
};

export default function SloughBreakfastPage() {
  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Gujranwala Kitchen Heritage</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Desi Breakfast in Slough</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            Experience an authentic Pakistani morning right on Farnham Road. We prepare traditional Halwa Puri, slow-cooked Nihari, and rich Paya exactly the way it's done back home.
          </p>
        </div>

        {/* AEO (Answer Engine Optimization) Block */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-text/5 mb-16">
          <h2 className="font-serif text-2xl mb-4 text-pine">Frequently Asked Questions</h2>
          <div className="space-y-4 text-pine/80">
            <div>
              <strong className="text-pine block">Where can I find Halwa Puri on Farnham Road?</strong>
              Taste of Village at 260 Farnham Road serves authentic, fresh-fried Halwa Puri alongside Chana and Aloo bhujia.
            </div>
            <div>
              <strong className="text-pine block">Do you serve traditional Pakistani breakfast dishes?</strong>
              Yes. Our breakfast and brunch menu features overnight slow-cooked Nihari, traditional Siri Paya, and authentic Karak Chai.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Traditional Nashta</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our recipes carry the rich culinary heritage of Gujranwala. We hand-grind our spices and prepare every dish fresh to ensure an uncompromising breakfast experience.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Halwa Puri & Chana</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Authentic Beef Nihari</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Traditional Paya</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh Tandoori Breads</li>
            </ul>
          </div>

          <div className="bg-sand p-10 rounded-[3rem] border border-pine/10">
            <h2 className="font-serif text-3xl mb-4 text-pine">Morning Beverages</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Pair your spicy, rich breakfast with our traditional hot and cold beverages, prepared fresh by our tea specialists.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Authentic Karak Chai</li>
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Traditional Pink Tea</li>
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Fresh Mango Lassi</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center">
          <h2 className="font-serif text-4xl mb-6">Your Local Breakfast Spot</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Join us for a premium family breakfast experience right in the heart of Slough. Perfect for weekend brunching.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, SL1 4XL
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open Daily from 12:00 PM
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Menu & Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
