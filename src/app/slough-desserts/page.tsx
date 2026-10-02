import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, Coffee, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentic Halal Desserts & Kulfi in Slough | Taste of Village',
  description: 'Enjoy authentic Pakistani desserts on Farnham Road, Slough. Shahi Kulfi Falooda, Hot Gajar Ka Halwa, Rasmalai, and Karak Chai at Taste of Village (SL1 4XL).',
  alternates: {
    canonical: '/slough-desserts'
  },
  openGraph: {
    type: 'website',
    title: 'Authentic Halal Desserts & Kulfi in Slough | Taste of Village',
    description: 'Enjoy authentic Pakistani desserts on Farnham Road, Slough. Shahi Kulfi Falooda, Hot Gajar Ka Halwa, Rasmalai, and Karak Chai at Taste of Village (SL1 4XL).',
    url: 'https://tasteofvillagerestaurants.co.uk/slough-desserts',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function SloughDessertsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Slough - Authentic Halal Desserts",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-desserts",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XL",
          "addressCountry": "GB"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 51.5273, "longitude": -0.6128 },
        "servesCuisine": ["Pakistani", "Halal", "South Asian", "Desserts"],
        "priceRange": "££",
        "hasMenu": "https://tasteofvillagerestaurants.co.uk/slough/menu"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where can I get traditional Kulfi Falooda in Slough?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Taste of Village at 260 Farnham Road serves authentic Shahi Kulfi Falooda layered with handmade rabri kulfi, basil seeds, vermicelli, and fragrant Rooh Afza."
            }
          },
          {
            "@type": "Question",
            "name": "Do you serve warm winter Desi desserts like Gajar Ka Halwa?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we serve freshly prepared warm Gajar Ka Halwa slow-cooked with fresh khoya and roasted nuts, as well as syrup-soaked hot Gulab Jamun."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-sand min-h-screen pt-20 pb-20 font-sans">
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
            { "@type": "ListItem", "position": 2, "name": "Authentic Pakistani Halal Desserts in Slough", "item": "https://tasteofvillagerestaurants.co.uk/slough-desserts" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Farnham Road Sweet Treats</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Authentic Pakistani Halal Desserts in Slough</h1>
          <p className="text-lg text-pine leading-relaxed max-w-2xl mx-auto">
            From creamy Shahi Kulfi Falooda to slow-cooked Gajar Ka Halwa and steaming hot Karak Chai, complete your meal with traditional sub-continent sweetness on Farnham Road.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-10 rounded-[3rem] bg-pine text-white">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Traditional Sweets &amp; Kulfi</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our sweet plates celebrate authentic Lahori culinary traditions. Handcrafted daily with whole dairy, aromatic green cardamom, and toasted pistachios.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Shahi Kulfi Falooda with Rabri</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Warm Homemade Gajar Ka Halwa</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Hot Saffron Gulab Jamun</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Chilled Creamy Rasmalai</li>
            </ul>
          </div>

          <div className="p-10 rounded-[3rem] bg-white border border-pine/10">
            <h2 className="font-serif text-3xl mb-4 text-pine">Chai &amp; Evening Treats</h2>
            <p className="text-pine leading-relaxed mb-6">
              Nothing matches the pairing of fresh Desi sweets with a cup of freshly boiled Karak Chai or Pink Kashmiri Tea. Perfect for evening meetups and family dinners.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Coffee size={16} className="text-terracotta" /> Authentic Slow-Brewed Karak Chai</li>
              <li className="flex items-center gap-3"><Heart size={16} className="text-terracotta" /> Traditional Sweet &amp; Mango Lassi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Gourmet Ice Cream Scoops</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> 100% Halal Certified Ingredients</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Dine In or Order for Collection</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-10">
            Enjoy our full desserts and savory menu for dine-in or fast collection at 260 Farnham Road, Slough.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough SL1 4XL
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open 7 Days: 10:00 AM – 2:00 AM
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Slough Menu
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
