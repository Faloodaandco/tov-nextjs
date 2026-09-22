import { LOCATIONS, LocationId, SHOP_CONFIG } from '@/config/shopConfig';
import { MenuItem } from '@/types';

/**
 * Returns branch-specific Meta Titles & Descriptions targeting high-intent local keywords.
 */
export function getBranchSeoMeta(locationId: string) {
  const isSlough = locationId === 'slough';

  if (isSlough) {
    return {
      homeTitle: 'Authentic Pakistani & Halal Restaurant Slough | Farnham Rd',
      homeDescription: 'Taste of Village Slough serves authentic Lahori & Gujranwala cuisine on Farnham Road (SL1). Enjoy fresh Karahi, Slow-Cooked Nihari, Haleem, Sizzling BBQ & Weekend Desi Nashta.',
      menuTitle: 'Full Menu & Prices | Taste of Village Slough',
      menuDescription: 'View the official Taste of Village Slough takeaway menu. Order fresh Chicken & Lamb Karahi, Biryani, Tandoori Naan, and BBQ online for collection on Farnham Rd.',
      canonicalBase: '/slough'
    };
  }

  // Default: Hayes (Uxbridge Road)
  return {
    homeTitle: 'Authentic Lahori Karahi & Halal Restaurant Hayes | Uxbridge Rd',
    homeDescription: 'Taste of Village Hayes brings traditional Lahori cooking to Uxbridge Road (UB4). 100% Halal certified. Indulge in Iron-Wok Karahi, Nihari, Haleem, BBQ Grill & Fresh Naan.',
    menuTitle: 'Full Menu & Prices | Taste of Village Hayes',
    menuDescription: 'Browse the full takeaway menu for Taste of Village Hayes. Order signature Lamb Karahi, Chicken Tikka, Biryani, and Karak Chai online for quick collection.',
    canonicalBase: '/hayes'
  };
}

/**
 * Generates Schema.org Restaurant definition with exact branch coordinates and details.
 */
export function getRestaurantSchema(locationId: string) {
  const loc = (LOCATIONS as Record<string, any>)[locationId] || LOCATIONS.hayes;
  const isSlough = locationId === 'slough';

  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SHOP_CONFIG.website}/${loc.id}#restaurant`,
    "name": loc.name,
    "image": [
      `${SHOP_CONFIG.website}/assets/chicken_karahi_hero.webp`,
      `${SHOP_CONFIG.website}/assets/lamb_karahi_hero.webp`,
      `${SHOP_CONFIG.website}/assets/nihari_hero.webp`
    ],
    "url": `${SHOP_CONFIG.website}/${loc.id}`,
    "telephone": loc.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": loc.address,
      "addressLocality": isSlough ? "Slough" : "Hayes",
      "addressRegion": isSlough ? "Berkshire" : "Greater London",
      "postalCode": loc.postcode,
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": isSlough ? 51.5230 : 51.5127,
      "longitude": isSlough ? -0.6136 : -0.4211
    },
    "servesCuisine": [
      "Pakistani",
      "Halal",
      "South Asian",
      "Lahori",
      "Punjabi",
      "Barbecue"
    ],
    "priceRange": "££",
    "currenciesAccepted": "GBP",
    "paymentAccepted": "Cash, Credit Card, Apple Pay, Google Pay",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "12:00",
        "closes": "23:00"
      }
    ],
    "menu": `${SHOP_CONFIG.website}/${loc.id}/menu`,
    "acceptsReservations": "True",
    "hasMenu": `${SHOP_CONFIG.website}/${loc.id}/menu`,
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": isSlough ? "Food Hygiene Rating 5 — Very Good" : "Food Hygiene Rating 4 — Good",
      "credentialCategory": "Food Hygiene Rating Scheme (FHRS)",
      "recognizedBy": {
        "@type": "GovernmentOrganization",
        "name": "Food Standards Agency",
        "url": "https://www.food.gov.uk/"
      },
      "url": isSlough
        ? "https://ratings.food.gov.uk/business/1963386/taste-of-village-slough"
        : "https://ratings.food.gov.uk/business/653844/a-taste-of-village"
    }
  };
}

/**
 * Generates Schema.org Menu schema featuring real, delicious Taste of Village dishes with prices.
 */
export function getMenuSchema(locationId: string, menuItems?: MenuItem[]) {
  const loc = (LOCATIONS as Record<string, any>)[locationId] || LOCATIONS.hayes;

  // Curate top signature dishes that customers actively search for
  const signatureDishes = [
    {
      name: "Lahori Lamb Karahi",
      description: "Our signature iron-wok dish. Tender bone-in spring lamb simmered with crushed tomatoes, garlic, ginger, and coarse black pepper. Prepared fresh to order in traditional Lahori style.",
      price: "16.99",
      category: "Karahi & Handi",
      image: `${SHOP_CONFIG.website}/assets/lamb_karahi_hero.webp`
    },
    {
      name: "Special Lahori Nihari",
      description: "Slow-cooked tender beef shank stewed overnight in a velvety, deeply aromatic spiced gravy. Garnished with fresh ginger juliennes, green chillies, and lemon.",
      price: "11.99",
      category: "Traditional Specialities",
      image: `${SHOP_CONFIG.website}/assets/nihari_hero.webp`
    },
    {
      name: "Shahi Haleem",
      description: "Royal slow-stewed shredded meat, cracked wheat, barley, and mixed lentils cooked for hours to a silky porridge texture. Topped with golden fried onions, chaat masala, and mint.",
      price: "9.99",
      category: "Traditional Specialities",
      image: `${SHOP_CONFIG.website}/assets/haleem_hero.webp`
    },
    {
      name: "Chef's Mixed Grill",
      description: "Sizzling platter of marinated lamb chops, tandoori chicken seekh kebabs, succulent chicken tikka boti, and malai boti roasted in the blazing clay tandoor.",
      price: "19.99",
      category: "Tandoori BBQ",
      image: `${SHOP_CONFIG.website}/assets/mix_grill_hero.webp`
    },
    {
      name: "Chicken Karahi (Desi Style)",
      description: "Fresh chicken wok-cooked at high heat with ripe tomatoes, green chillies, aromatic fenugreek, and freshly crushed coriander seeds.",
      price: "13.99",
      category: "Karahi & Handi",
      image: `${SHOP_CONFIG.website}/assets/chicken_karahi_hero.webp`
    },
    {
      name: "Fresh Roghani Naan",
      description: "Traditional soft leavened clay-oven bread patterned by hand, brushed with melted butter and toasted sesame seeds.",
      price: "2.49",
      category: "Tandoori Breads",
      image: `${SHOP_CONFIG.website}/assets/placeholder.webp`
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SHOP_CONFIG.website}/${loc.id}/menu#menu`,
    "name": `${loc.name} Takeaway & Collection Menu`,
    "url": `${SHOP_CONFIG.website}/${loc.id}/menu`,
    "mainEntityOfPage": `${SHOP_CONFIG.website}/${loc.id}/menu`,
    "inLanguage": "en-GB",
    "hasMenuItem": signatureDishes.map(dish => ({
      "@type": "MenuItem",
      "name": dish.name,
      "description": dish.description,
      "image": dish.image,
      "suitableForDiet": "https://schema.org/HalalDiet",
      "offers": {
        "@type": "Offer",
        "price": dish.price,
        "priceCurrency": "GBP",
        "availability": "https://schema.org/InStock",
        "url": `${SHOP_CONFIG.website}/${loc.id}/menu`
      }
    }))
  };
}

/**
 * Generates Schema.org FAQPage structured data to unlock Google's expandable FAQ snippets.
 */
export function getFaqSchema(locationId: string) {
  const loc = (LOCATIONS as Record<string, any>)[locationId] || LOCATIONS.hayes;
  const isSlough = locationId === 'slough';

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is all meat at Taste of Village 100% Halal certified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all meat, poultry, and ingredients served across both our Hayes and Slough branches are 100% Halal certified, prepared in accordance with strict Islamic dietary standards."
        }
      },
      {
        "@type": "Question",
        "name": `Can I order online for collection at ${loc.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes! You can order directly through our official website for fast collection at ${loc.address}. We support 1-tap Apple Pay, Google Pay, and major cards with zero marketplace surcharges.`
        }
      },
      {
        "@type": "Question",
        "name": "Do you serve traditional weekend Pakistani breakfast (Nashta)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we serve traditional weekend breakfast featuring freshly fried Halwa Puri with spiced Chana, slow-simmered Special Nihari, Paye, and piping hot Roghani Naan alongside Karak Chai."
        }
      },
      {
        "@type": "Question",
        "name": `What are the opening hours for Taste of Village in ${isSlough ? 'Slough' : 'Hayes'}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We are open 7 days a week, Monday through Sunday from 12:00 PM to 11:00 PM."
        }
      },
      {
        "@type": "Question",
        "name": "Can I book a table for large family gatherings or parties?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, table reservations can be made instantly online via our website booking tool or by calling our branch directly on ${loc.phone}.`
        }
      }
    ]
  };
}
