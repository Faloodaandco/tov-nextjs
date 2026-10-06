/**
 * Taste of Village Hayes — Comprehensive Restaurant Knowledge Base & FAQs
 *
 * Injected into Gemini 2.5 Flash context for high-accuracy RAG (Retrieval-Augmented Generation).
 * Covers brand history, food ethics, allergens, location, parking, events, and dish profiles.
 */

export interface FAQItem {
  category: 'food' | 'allergens' | 'location' | 'operations' | 'catering' | 'payments';
  topic: string;
  question: string;
  answer: string;
}

export const TOV_KNOWLEDGE_BASE: FAQItem[] = [
  // ── Food Ethics & Halal ──────────────────────────────────────────
  {
    category: 'food',
    topic: 'Halal Certification',
    question: 'Is your food halal?',
    answer: 'Yes, 100% Halal certified. All our meats (chicken, lamb, beef) and ingredients are sourced exclusively from certified suppliers and prepared in accordance with strict halal standards. No alcohol or non-halal items are stored or used.',
  },
  {
    category: 'food',
    topic: 'Cuisine Style',
    question: 'What kind of food do you serve?',
    answer: 'Authentic Pakistani & North Indian Punjabi cuisine. Our specialties include traditional wok-cooked Karahi (cooked on high flame with tomatoes, ginger, and green chilies), sizzling tandoori BBQ grills, dum biryanis, and fresh tandoori naans.',
  },
  {
    category: 'food',
    topic: 'Spice Levels',
    question: 'Can I adjust the spice level?',
    answer: 'Our dishes are prepared to authentic village medium spice. If you prefer mild (for children or mild palates) or extra spicy desi-style, please let us know in your order notes.',
  },

  // ── Dietary & Allergens ──────────────────────────────────────────
  {
    category: 'allergens',
    topic: 'Vegetarian Options',
    question: 'Do you have vegetarian dishes?',
    answer: 'Yes! We have an extensive vegetarian selection including Muttar Paneer, Saag Paneer, Chana Masala, Aloo Gobi, Tadka Daal, Veg Samosas, and vegetable biryani.',
  },
  {
    category: 'allergens',
    topic: 'Nut Allergies',
    question: 'Are there nuts in your food?',
    answer: 'Most of our traditional karahis and BBQ items do not contain nuts. However, some rich curry gravies (like Butter Chicken or Korma) may use cashew paste or almonds. Please specify any severe allergies so the kitchen can take precautions.',
  },
  {
    category: 'allergens',
    topic: 'Gluten Free',
    question: 'Do you have gluten free options?',
    answer: 'All our plain rice dishes, biryanis, and most karahis/curries are naturally gluten-free. Naans, rotis, kulchas, and fried samosa pastries contain wheat/gluten.',
  },

  // ── Operations & Timings ─────────────────────────────────────────
  {
    category: 'operations',
    topic: 'Opening Hours',
    question: 'What are your opening hours?',
    answer: 'We are open 7 days a week from 12:00 PM (Noon) to 11:00 PM. Hot food is served continuously throughout the day.',
  },
  {
    category: 'operations',
    topic: 'Collection Time',
    question: 'How long does collection take?',
    answer: 'Collection orders are typically prepared fresh and ready for pickup within 20 to 25 minutes.',
  },
  {
    category: 'operations',
    topic: 'Delivery Time & Radius',
    question: 'Where do you deliver and how long does it take?',
    answer: 'We deliver within 4 miles of our Hayes restaurant (UB4 0RU) covers Hayes, Southall, Harlington, West Drayton, Northolt, and Hillingdon. Delivery takes approximately 35–45 minutes. Free delivery on orders over £30 (otherwise £3.99).',
  },

  // ── Location & Parking ───────────────────────────────────────────
  {
    category: 'location',
    topic: 'Address & Directions',
    question: 'Where are you located?',
    answer: 'Taste of Village Hayes is located at 766B Uxbridge Road, Hayes, UB4 0RU, London (near the Hayes End shopping parade on Uxbridge Road).',
  },
  {
    category: 'location',
    topic: 'Parking',
    question: 'Is there parking available?',
    answer: 'There is pay-and-display parking on Uxbridge Road, and free street parking on adjacent residential roads (including Lansbury Drive and Kingsway) after 6:30 PM.',
  },
  {
    category: 'location',
    topic: 'Contact Phone',
    question: 'What is your restaurant phone number?',
    answer: 'You can reach us at 020 8848 0211 or WhatsApp us directly on +44 7424 216045.',
  },

  // ── Catering & Events ────────────────────────────────────────────
  {
    category: 'catering',
    topic: 'Party & Catering Platters',
    question: 'Do you do catering or large party orders?',
    answer: 'Yes! We cater for family events, birthdays, corporate lunches, and weddings. We offer large Village Special Platters, BBQ feast boxes, and bulk Biryani / Karahi trays for 10 to 100+ guests. Contact us for custom quotes.',
  },

  // ── Payments & Ordering ──────────────────────────────────────────
  {
    category: 'payments',
    topic: 'Payment Methods',
    question: 'How do I pay for my order?',
    answer: 'We provide an instant, secure Square checkout link in WhatsApp that supports Apple Pay, Google Pay, and all major debit/credit cards. Once paid, the order prints directly in our kitchen.',
  },
];
