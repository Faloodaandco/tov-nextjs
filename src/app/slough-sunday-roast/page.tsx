import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sunday Roast in Slough | Taste of Village – Every Sunday 12–5 PM",
  description: "A classic British Sunday Roast in the heart of Slough. Slow-roasted Beef, Half Chicken, or Lamb Shank with all the trimmings. Every Sunday, 12:00 PM – 5:00 PM at 260 Farnham Road. Pre-order online.",
  alternates: {
    canonical: "/slough-sunday-roast"
  },
  openGraph: {
    type: 'website',
    title: "Sunday Roast in Slough | Taste of Village",
    description: "Slow-roasted Beef, Half Chicken, or Lamb Shank with Yorkshire Pudding, roast potatoes, seasonal vegetables & rich gravy. Every Sunday 12–5 PM.",
    url: 'https://tasteofvillagerestaurants.co.uk/slough-sunday-roast',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Sunday Roast' }],
  },
};

const ROAST_MAINS = [
  { name: 'Beef Roast', price: '14.99', desc: 'Succulent slow-roasted British beef, served with your choice of roast or creamy mashed potatoes, seasonal vegetables, rich gravy & Yorkshire pudding.', image: '/assets/menu/sunday-roast/sunday_roast_beef.webp' },
  { name: 'Half Chicken Roast', price: '15.99', desc: 'Golden-roasted half chicken, tender and juicy, served with all the traditional trimmings.', image: null },
  { name: 'Lamb Shank Roast', price: '16.99', desc: 'Slow-cooked lamb shank falling off the bone, served with roast or mashed potatoes, seasonal veg, gravy & Yorkshire pudding.', image: '/assets/menu/sunday-roast/sunday_roast_lamb_shank.webp' },
];

const EXTRAS = [
  { name: 'Special Homemade Cheesecake', price: '4.99' },
  { name: 'Eton Mess', price: '5.49' },
  { name: 'Apple Crumble', price: '6.49', note: 'with custard or ice cream' },
  { name: 'Creamy Mashed Potatoes', price: '3.49' },
  { name: 'Seasonal Vegetables with Roasted Brussels', price: '2.49' },
  { name: 'Rich Gravy', price: '1.49' },
  { name: 'Yorkshire Pudding', price: '1.49' },
  { name: 'Peppercorn Sauce', price: '1.99' },
  { name: 'Garlic Mushroom Sauce', price: '1.99' },
  { name: 'Roast Potatoes', price: '2.49' },
];

export default function SloughSundayRoastPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "name": "Taste of Village Slough - Sunday Roast",
        "image": "https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg",
        "url": "https://tasteofvillagerestaurants.co.uk/slough-sunday-roast",
        "telephone": "+441753326341",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "260 Farnham Road",
          "addressLocality": "Slough",
          "addressRegion": "Berkshire",
          "postalCode": "SL1 4XL",
          "addressCountry": "GB"
        },
        "servesCuisine": ["British", "Halal", "Sunday Roast"],
        "priceRange": "££",
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Sunday",
          "opens": "12:00",
          "closes": "17:00",
          "description": "Sunday Roast service hours"
        },
        "hasMenu": {
          "@type": "Menu",
          "name": "Sunday Roast Menu",
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Roast Mains",
              "hasMenuItem": [
                { "@type": "MenuItem", "name": "Beef Roast", "offers": { "@type": "Offer", "price": "14.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Half Chicken Roast", "offers": { "@type": "Offer", "price": "15.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Lamb Shank Roast", "offers": { "@type": "Offer", "price": "16.99", "priceCurrency": "GBP" } }
              ]
            },
            {
              "@type": "MenuSection",
              "name": "Desserts & Extras",
              "hasMenuItem": [
                { "@type": "MenuItem", "name": "Special Homemade Cheesecake", "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Eton Mess", "offers": { "@type": "Offer", "price": "5.49", "priceCurrency": "GBP" } },
                { "@type": "MenuItem", "name": "Apple Crumble", "offers": { "@type": "Offer", "price": "6.49", "priceCurrency": "GBP" } }
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
            "name": "Does Taste of Village do Sunday Roast in Slough?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Taste of Village at 260 Farnham Road, Slough serves a classic British Sunday Roast every Sunday from 12:00 PM to 5:00 PM. Choose from Beef Roast (£14.99), Half Chicken Roast (£15.99), or Lamb Shank Roast (£16.99), all served with traditional trimmings."
            }
          },
          {
            "@type": "Question",
            "name": "What time is the Sunday Roast available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our Sunday Roast is served exclusively on Sundays between 12:00 PM and 5:00 PM. We recommend pre-ordering online to guarantee your meal."
            }
          },
          {
            "@type": "Question",
            "name": "Can I pre-order the Sunday Roast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can pre-order your Sunday Roast through our website any day of the week. Simply select your items from the Sunday Roast section on our menu and choose a Sunday collection or delivery time at checkout."
            }
          },
          {
            "@type": "Question",
            "name": "Is the Sunday Roast Halal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Our entire menu, including all Sunday Roast dishes, is 100% Halal certified. All meat is sourced from trusted Halal suppliers."
            }
          },
          {
            "@type": "Question",
            "name": "What comes with the Sunday Roast?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Each roast main is served with your choice of roast or creamy mashed potatoes, seasonal vegetables with roasted Brussels sprouts, rich gravy, and a Yorkshire pudding. Additional sides and sauces like Peppercorn Sauce (£1.99) and Garlic Mushroom Sauce (£1.99) are available separately."
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
            { "@type": "ListItem", "position": 2, "name": "Slough", "item": "https://tasteofvillagerestaurants.co.uk/slough" },
            { "@type": "ListItem", "position": 3, "name": "Sunday Roast", "item": "https://tasteofvillagerestaurants.co.uk/slough-sunday-roast" }
          ]
        }) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Hero Image Banner */}
        <div className="relative rounded-[2rem] overflow-hidden mb-16 -mx-2 sm:mx-0">
          <Image
            src="/assets/menu/sunday-roast/sunday_roast_hero.webp"
            alt="Sunday Roast spread at Taste of Village — beef, lamb shank, Yorkshire pudding, roasted vegetables and rich gravy"
            width={1400}
            height={900}
            className="w-full h-[280px] sm:h-[360px] md:h-[440px] object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pine/90 via-pine/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-12 px-6 text-center">
            <span className="text-amber-300 font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-3 block">Every Sunday · 12:00 PM – 5:00 PM</span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-4 drop-shadow-lg">Sunday Roast in Slough</h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              A proper British Sunday Roast, made with care and served with all the trimmings at our Farnham Road restaurant.
            </p>
          </div>
        </div>

        {/* Availability Notice */}
        <div className="bg-pine text-white p-6 sm:p-8 rounded-[2rem] shadow-lg mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock size={20} className="text-amber-300" />
            <span className="font-black text-sm uppercase tracking-widest text-amber-300">Sunday Only · 12:00 PM – 5:00 PM</span>
          </div>
          <p className="text-white/80 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            Our Sunday Roast is freshly prepared each week and available for dine-in, collection, or delivery every Sunday between 12:00 PM and 5:00 PM.
            Pre-order any day of the week to guarantee your roast.
          </p>
          <Link
            href="/slough/menu#sunday_roast"
            className="inline-block px-8 py-3.5 bg-terracotta text-white rounded-full font-black text-xs uppercase tracking-wider hover:bg-terracotta/90 transition-all shadow-md active:scale-95"
          >
            View Sunday Roast Menu
          </Link>
        </div>

        {/* Roast Mains */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 h-px bg-terracotta/30 max-w-[60px]" />
            <h2 className="font-serif text-3xl text-pine text-center">Roast Mains</h2>
            <div className="flex-1 h-px bg-terracotta/30 max-w-[60px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ROAST_MAINS.map((item) => (
              <div key={item.name} className="bg-white rounded-[2rem] border border-pine/8 hover:border-terracotta/30 transition-colors overflow-hidden">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={400}
                    height={300}
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                )}
                <div className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-serif text-xl text-pine font-bold">{item.name}</h3>
                    <span className="text-terracotta font-black text-lg shrink-0 ml-3">£{item.price}</span>
                  </div>
                  <p className="text-pine/70 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desserts & Extras */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 h-px bg-terracotta/30 max-w-[60px]" />
            <h2 className="font-serif text-3xl text-pine text-center">Desserts & Extras</h2>
            <div className="flex-1 h-px bg-terracotta/30 max-w-[60px]" />
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-pine/8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {EXTRAS.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-pine/5 last:border-0">
                  <div>
                    <span className="text-pine font-semibold text-sm">{item.name}</span>
                    {item.note && <span className="text-pine/50 text-xs block">{item.note}</span>}
                  </div>
                  <span className="text-terracotta font-bold text-sm shrink-0 ml-4">£{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ / AEO Block */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-pine/5 mb-16">
          <h2 className="font-serif text-2xl mb-6 text-pine">Frequently Asked Questions</h2>
          <div className="space-y-5 text-pine/80">
            <div>
              <strong className="text-pine block mb-1">Does Taste of Village do Sunday Roast in Slough?</strong>
              Yes. Taste of Village at 260 Farnham Road, Slough serves a classic British Sunday Roast every Sunday from 12:00 PM to 5:00 PM. Choose from Beef Roast (£14.99), Half Chicken Roast (£15.99), or Lamb Shank Roast (£16.99), all served with traditional trimmings.
            </div>
            <div>
              <strong className="text-pine block mb-1">What time is the Sunday Roast available?</strong>
              Our Sunday Roast is served exclusively on Sundays between 12:00 PM and 5:00 PM. We recommend pre-ordering online to guarantee your meal.
            </div>
            <div>
              <strong className="text-pine block mb-1">Can I pre-order the Sunday Roast?</strong>
              Yes. You can pre-order your Sunday Roast through our website any day of the week. Simply select your items from the Sunday Roast section on our menu and choose a Sunday collection time at checkout.
            </div>
            <div>
              <strong className="text-pine block mb-1">Is the Sunday Roast Halal?</strong>
              Yes. Our entire menu, including all Sunday Roast dishes, is 100% Halal. All meat is sourced from trusted Halal suppliers.
            </div>
            <div>
              <strong className="text-pine block mb-1">What comes with the Sunday Roast?</strong>
              Each roast main is served with your choice of roast or creamy mashed potatoes, seasonal vegetables with roasted Brussels sprouts, rich gravy, and a Yorkshire pudding. Additional sides and sauces are available separately.
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-pine/5 text-center">
          <h2 className="font-serif text-4xl mb-4 text-pine">Your Sunday Sorted</h2>
          <p className="text-pine leading-relaxed max-w-xl mx-auto mb-8">
            Gather the family, skip the cooking, and enjoy a proper roast. Pre-order online for a guaranteed table or collection slot.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-pine font-bold">
              <MapPin className="text-terracotta" /> 260 Farnham Road, SL1 4XL
            </div>
            <div className="flex items-center gap-2 text-pine font-bold">
              <Clock className="text-terracotta" /> Sundays 12:00 PM – 5:00 PM
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/slough/menu#sunday_roast" className="px-8 py-4 bg-terracotta text-white rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
              Order Sunday Roast
            </Link>
            <Link href="/book" className="px-8 py-4 bg-pine text-white rounded-full font-bold hover:shadow-lg transition-all active:scale-95">
              Book a Table
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
