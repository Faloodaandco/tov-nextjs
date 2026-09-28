import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Halal Pakistani Restaurant in Slough | Taste of Village",
  description: "Halal certified Gujranwala-style Pakistani cuisine on Farnham Road, Slough. Karahi, Haleem, Nihari, BBQ Platters. Order online or visit us.",
  alternates: {
    canonical: "/slough-halal-food"
  },
  openGraph: {
    type: 'website',
    title: "Halal Pakistani Restaurant in Slough | Taste of Village",
    description: "Halal certified Gujranwala-style Pakistani cuisine on Farnham Road, Slough. Karahi, Haleem, Nihari, BBQ Platters. Order online or visit us.",
    url: 'https://tasteofvillagerestaurants.co.uk/slough-halal-food',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village' }],
  },
};

export default function SeoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Slough - 100% Halal Pakistani Cuisine",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-halal-food",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XQ",
          "addressCountry": "GB"
        },
        "geo": { "@type": "GeoCoordinates", "latitude": 51.5273, "longitude": -0.6128 },
        "servesCuisine": ["Pakistani", "Halal", "South Asian", "Lahori", "Gujranwala"],
        "priceRange": "££",
        "hasMenu": "https://tasteofvillagerestaurants.co.uk/slough/menu",
        "hasCredential": {
          "@type": "EducationalOccupationalCredential",
          "name": "Food Hygiene Rating 5 — Very Good",
          "credentialCategory": "Food Hygiene Rating Scheme (FHRS)",
          "recognizedBy": {
            "@type": "GovernmentOrganization",
            "name": "Food Standards Agency",
            "url": "https://www.food.gov.uk/"
          },
          "url": "https://ratings.food.gov.uk/business/1963386/taste-of-village-slough"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is all the food at Taste of Village Slough 100% Halal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, 100%. All meats (chicken, lamb, beef) and ingredients at Taste of Village Slough are strictly Halal certified, sourced from accredited British halal meat suppliers."
            }
          },
          {
            "@type": "Question",
            "name": "What authentic Pakistani dishes are served at the Slough restaurant?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We specialize in Gujranwala and Lahori specialties: freshly wok-tossed Lamb and Chicken Karahi, slow-simmered overnight Beef Nihari, Shahi Haleem, and charcoal-grilled Seekh Kebabs."
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
            { "@type": "ListItem", "position": 2, "name": "Halal Pakistani Restaurant in Slough", "item": "https://tasteofvillagerestaurants.co.uk/slough-halal-food" }
          ]
        }) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-terracotta font-bold tracking-widest uppercase text-xs mb-4 block">Certified Halal &bull; Farnham Road</span>
          <h1 className="font-serif text-5xl md:text-6xl text-pine mb-6">Halal Pakistani Restaurant in Slough</h1>
          <p className="text-lg text-pine/70 leading-relaxed max-w-2xl mx-auto">
            We serve fully Halal certified Gujranwala-style Pakistani cuisine from our kitchen on Farnham Road. Every dish honours the bold, rustic traditions of Punjab — prepared fresh and served with pride.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white">
            <h2 className="font-serif text-3xl mb-4 text-terracotta">Gujranwala Kitchen Heritage</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Our recipes draw directly from Gujranwala's legendary food culture — slow-cooked Nihari simmered overnight, copper-pot Karahi finished with fresh tomatoes and green chillies, and rich Haleem ground to silky perfection.
            </p>
            <ul className="space-y-3 font-semibold text-sand">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Lamb Karahi</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Beef Nihari</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Chicken Haleem</li>
            </ul>
          </div>

          <div className="bg-sand p-10 rounded-[3rem] border border-pine/10">
            <h2 className="font-serif text-3xl mb-4 text-pine">BBQ Platters & Tandoor</h2>
            <p className="text-pine/70 leading-relaxed mb-6">
              Our tandoor fires up daily for charcoal-grilled Seekh Kebabs, Lamb Chops, and mixed BBQ platters. We marinate every cut in-house using whole spices — no shortcuts, no pre-made pastes.
            </p>
            <ul className="space-y-3 font-semibold text-pine">
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Mixed Grill Platter</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Seekh Kebab</li>
              <li className="flex items-center gap-3"><Sparkles size={16} className="text-terracotta" /> Tandoori Lamb Chops</li>
            </ul>
          </div>
        </div>

        <div className="obsidian-card p-10 rounded-[3rem] bg-pine text-white mb-16">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} className="text-terracotta" />
            <h2 className="font-serif text-3xl text-terracotta">Our Halal Commitment</h2>
          </div>
          <p className="text-white/70 leading-relaxed">
            Every ingredient that enters our kitchen meets strict Halal sourcing standards. We work with certified suppliers and maintain full traceability across our meat supply chain. Families trust us because we never compromise on this promise.
          </p>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-6 text-pine">Dine In or Order for Delivery</h2>
          <p className="text-pine/70 leading-relaxed max-w-xl mx-auto mb-10">
            Bring the whole family for an authentic Pakistani dining experience, or order online and enjoy Gujranwala-style cuisine at home. We welcome large party bookings for private events.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, Slough SL1 4XQ
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Open until Midnight
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/slough/menu" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all">
              View Full Menu
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
