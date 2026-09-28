import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Coffee } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Desi Breakfast & Halwa Puri in Slough | Taste of Village",
  description: "Authentic Gujranwala-style Pakistani breakfast on Farnham Road. Fresh Halwa Puri, Nihari, Paya, and Karak Chai. The best Desi Nashta in Slough.",
  alternates: {
    canonical: "/slough-breakfast"
  },
  openGraph: {
    type: 'website',
    title: "Desi Breakfast & Halwa Puri in Slough | Taste of Village",
    description: "Authentic Gujranwala-style Pakistani breakfast on Farnham Road. Fresh Halwa Puri, Nihari, Paya, and Karak Chai. The best Desi Nashta in Slough.",
    url: 'https://tasteofvillagerestaurants.co.uk/slough-breakfast',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function SloughBreakfastPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Slough - Authentic Breakfast",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-breakfast",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XQ",
          "addressCountry": "GB"
        },
        "servesCuisine": ["Pakistani", "Halal", "South Asian", "Gujranwala Breakfast"],
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
                { "@type": "MenuItem", "name": "Authentic Beef Nihari" },
                { "@type": "MenuItem", "name": "Traditional Paya" }
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
            "name": "Where can I find Halwa Puri on Farnham Road?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Taste of Village at 260 Farnham Road serves authentic, fresh-fried Halwa Puri alongside Chana and Aloo bhujia for breakfast."
            }
          },
          {
            "@type": "Question",
            "name": "Do you serve traditional Pakistani breakfast dishes?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Our breakfast and brunch menu features overnight slow-cooked beef Nihari, traditional Siri Paya, and authentic Karak Chai, prepared exactly like in Gujranwala."
            }
          },
          {
            "@type": "Question",
            "name": "Is your breakfast Halal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, our entire menu, including our traditional Pakistani breakfast, is 100% Halal certified."
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
            { "@type": "ListItem", "position": 2, "name": "Desi Breakfast in Slough", "item": "https://tasteofvillagerestaurants.co.uk/slough-breakfast" }
          ]
        }) }}
      />
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
              Taste of Village at 260 Farnham Road serves authentic, fresh-fried Halwa Puri alongside Chana and Aloo bhujia for breakfast.
            </div>
            <div>
              <strong className="text-pine block">Do you serve traditional Pakistani breakfast dishes?</strong>
              Yes. Our breakfast and brunch menu features overnight slow-cooked beef Nihari, traditional Siri Paya, and authentic Karak Chai, prepared exactly like in Gujranwala.
            </div>
            <div>
              <strong className="text-pine block">Is your breakfast Halal?</strong>
              Yes, our entire menu, including our traditional Pakistani breakfast, is 100% Halal certified.
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
              <MapPin className="text-terracotta" /> 260 Farnham Road, SL1 4XQ
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
