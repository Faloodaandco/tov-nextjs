import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Coffee } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Traditional Pakistani Breakfast in Hayes | Halwa Puri & Nihari",
  description: "Authentic Lahori Nashta in Hayes. Fresh Halwa Puri, slow-cooked Nihari, Paya, and Karak Chai. The best Desi breakfast and weekend brunch in UB4.",
  alternates: {
    canonical: "/hayes-breakfast"
  },
  openGraph: {
    type: 'website',
    title: "Traditional Pakistani Breakfast in Hayes | Halwa Puri & Nihari",
    description: "Authentic Lahori Nashta in Hayes. Fresh Halwa Puri, slow-cooked Nihari, Paya, and Karak Chai. The best Desi breakfast and weekend brunch in UB4.",
    url: 'https://tasteofvillagerestaurants.co.uk/hayes-breakfast',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function HayesBreakfastPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Hayes - Authentic Breakfast",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/hayes-breakfast",
        "telephone": "+442034093786",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "766B Uxbridge Road",
          "addressLocality": "Hayes",
          "addressRegion": "London",
          "postalCode": "UB4 0RU",
          "addressCountry": "GB"
        },
        "servesCuisine": ["Pakistani", "Halal", "South Asian", "Lahori Breakfast"],
        "priceRange": "££",
        "hasMenu": {
          "@type": "Menu",
          "name": "Breakfast Menu",
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Traditional Nashta",
              "hasMenuItem": [
                { "@type": "MenuItem", "name": "Halwa Puri & Chana" },
                { "@type": "MenuItem", "name": "Lahori Beef Nihari" },
                { "@type": "MenuItem", "name": "Traditional Siri Paya" }
              ]
            }
          ]
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where can I get authentic Halwa Puri in Hayes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Taste of Village at 766B Uxbridge Road serves fresh, traditional Halwa Puri with Chana and Aloo bhujia. Our puris are fried fresh to order."
            }
          },
          {
            "@type": "Question",
            "name": "Do you serve Nihari and Paya for breakfast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. We slow-cook our traditional Nihari and Siri Paya overnight to achieve the authentic rich texture and deep spice profile expected from a true Lahori Desi Nashta."
            }
          },
          {
            "@type": "Question",
            "name": "Is your breakfast Halal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our entire menu, including our traditional Pakistani breakfast, is 100% Halal certified."
            }
          },
          {
            "@type": "Question",
            "name": "Do you offer discounts on weekend breakfast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Taste of Village offers 40% OFF all breakfast items every Saturday and Sunday until 2:00 PM with code BREAKFAST40 when ordering online or for collection."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
      {/* JSON-LD Schema for SEO/AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tasteofvillagerestaurants.co.uk" },
            { "@type": "ListItem", "position": 2, "name": "Traditional Breakfast in Hayes", "item": "https://tasteofvillagerestaurants.co.uk/hayes-breakfast" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Authentic Lahori Nashta</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Traditional Breakfast in Hayes</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            Experience the true taste of a Lahori morning. We prepare fresh Halwa Puri, slow-cook our Nihari overnight, and brew authentic Karak Chai for the ultimate Desi breakfast experience in West London.
          </p>
        </div>

        {/* Weekend 40% Off Promotional Banner */}
        <div className="bg-gradient-to-r from-terracotta to-terracotta/90 text-white p-6 sm:p-8 rounded-[2rem] shadow-lg mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="inline-block bg-white/20 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1">
              Weekend Exclusive Offer
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">40% OFF Weekend Breakfast</h2>
            <p className="text-white/80 text-sm max-w-md">
              Enjoy 40% off all breakfast items every Saturday &amp; Sunday till 2:00 PM with code <strong className="text-white underline decoration-white/50">BREAKFAST40</strong>.
            </p>
          </div>
          <Link
            href="/hayes/menu?promo=BREAKFAST40"
            className="px-6 py-3 bg-white text-terracotta font-black text-xs uppercase tracking-wider rounded-full hover:bg-pine hover:text-white transition-all shadow-md shrink-0 active:scale-95"
          >
            Claim 40% Off
          </Link>
        </div>

        {/* AEO (Answer Engine Optimization) Block */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-brand-text/5 mb-16">
          <h2 className="font-serif text-2xl mb-4 text-pine">Frequently Asked Questions</h2>
          <div className="space-y-4 text-pine/80">
            <div>
              <strong className="text-pine block">Where can I get authentic Halwa Puri in Hayes?</strong>
              Taste of Village at 766B Uxbridge Road serves fresh, traditional Halwa Puri with Chana and Aloo bhujia. Our puris are fried fresh to order.
            </div>
            <div>
              <strong className="text-pine block">Do you serve Nihari and Paya for breakfast?</strong>
              Yes. We slow-cook our traditional Nihari and Siri Paya overnight to achieve the authentic rich texture and deep spice profile expected from a true Lahori Desi Nashta.
            </div>
            <div>
              <strong className="text-pine block">Is your breakfast Halal?</strong>
              Yes, our entire menu, including our traditional Pakistani breakfast, is 100% Halal certified.
            </div>
            <div>
              <strong className="text-pine block">Do you offer discounts on weekend breakfast?</strong>
              Yes! We run <strong>40% OFF all breakfast menu items every Saturday &amp; Sunday from 10:00 AM till 2:00 PM</strong>. Use promo code <strong className="text-terracotta">BREAKFAST40</strong> at checkout or claim it directly through our website.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">The Breakfast Menu</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our kitchen refuses to cut corners. Every puri is fried fresh to order, and our spices are hand-ground to match traditional recipes.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Fresh Halwa Puri & Chana</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Overnight Slow-Cooked Nihari</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Traditional Siri Paya</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Freshly Baked Tandoori Naan</li>
            </ul>
          </div>

          <div className="bg-sand p-10 rounded-[3rem] border border-pine/10">
            <h2 className="font-serif text-3xl mb-4 text-pine">Proper Karak Chai</h2>
            <p className="text-pine leading-relaxed mb-6">
              A Desi breakfast is incomplete without tea. We brew strong, authentic Karak Chai, slowly simmered to achieve the perfect golden color and rich flavor profile.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Traditional Karak Chai</li>
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Kashmiri Pink Tea</li>
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Sweet Lassi</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-brand-text/5 text-center">
          <h2 className="font-serif text-4xl mb-6">Join Us for Breakfast</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Bring your family and enjoy the most authentic Pakistani breakfast spread in Hayes. Available for dine-in or collection.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 766B Uxbridge Road, UB4 0RU
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open Daily from 10:00 AM
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/hayes/menu?promo=BREAKFAST40" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              Order Breakfast (40% Off Weekends)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
