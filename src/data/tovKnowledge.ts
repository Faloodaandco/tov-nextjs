/**
 * Taste of Village Hayes — Comprehensive Restaurant Knowledge Base, Culinary AI Brain & Sales Engine
 *
 * Canonical Domain: https://tasteofvillagerestaurants.co.uk/
 * Location: 766B Uxbridge Road, Hayes, UB4 0RU, London (Hayes End Parade)
 *
 * Injected into Gemini 2.5 Flash for conversational WhatsApp direct ordering, high-accuracy RAG,
 * multi-agent marketing copy generation, automated cross-sell/upsell psychology, and local AI SEO.
 */

// ── Types ────────────────────────────────────────────────────────────

export interface FAQItem {
  category: 'food' | 'allergens' | 'location' | 'operations' | 'catering' | 'payments';
  topic: string;
  question: string;
  answer: string;
  searchKeywords?: string[];
  relatedDishIds?: string[];
}

export interface DishSensoryProfile {
  id: string;
  name: string;
  category: string;
  price: number;
  heatLevel: 0 | 1 | 2 | 3 | 4 | 5; // 0 = mild/sweet, 3 = medium desi, 5 = fiery
  flavorNotes: string[];
  aromaProfile: string;
  cookingMethod: string;
  chefSecret: string;
  tastingHook: string; // Mouthwatering 1-liner for WhatsApp/sales
  pairingRecommendation: {
    bread: string;
    side: string;
    drink: string;
  };
  crossSellHook: string;
}

export interface PsychologicalDiagnosticQuestion {
  qualificationGoal: 'party_size' | 'spice_tolerance' | 'craving_type' | 'budget_tier';
  question: string;
  options: {
    label: string;
    customerProfile: string;
    suggestedDishIds: string[];
    recommendationPitch: string;
  }[];
}

export interface SalesTriggerRule {
  triggerIntent: 'curry_selected' | 'bbq_selected' | 'cart_subtotal_near_delivery' | 'group_undecided' | 'late_night_craving' | 'spice_hesitant';
  technique: 'assumptive_close' | 'loss_aversion' | 'palate_balance' | 'social_proof' | 'urgency_scarcity' | 'price_anchoring';
  psychologicalHook: string;
  suggestedActionQuestion: string;
  targetDishId?: string;
}

export interface ObjectionHandler {
  objection: string;
  rootFear: string;
  rapidChefResponse: string;
  closingQuestion: string;
}

export interface MultiAgentCampaignBlueprint {
  platform: 'meta_ads' | 'google_search' | 'tiktok_reels' | 'whatsapp_push';
  headline: string;
  hookBody: string;
  callToAction: string;
  targetAudience: string;
}

// ── 1. Canonical Brand DNA (Machine-Readable for all MKR Agents) ────────
export const TOV_BRAND_DNA = {
  brandName: 'Taste of Village',
  subBranch: 'Hayes',
  tagline: 'Authentic Pakistani & North Indian Punjabi Village Charcoal & Wok Cuisine',
  canonicalDomain: 'https://tasteofvillagerestaurants.co.uk/',
  address: {
    street: '766B Uxbridge Road',
    town: 'Hayes',
    postcode: 'UB4 0RU',
    city: 'London',
    borough: 'London Borough of Hillingdon',
    landmark: 'Hayes End shopping parade on Uxbridge Road',
    coordinates: {
      latitude: 51.5284,
      longitude: -0.4287,
    },
  },
  contact: {
    phone: '020 8848 0211',
    whatsapp: '+44 7424 216045',
  },
  hours: {
    summary: 'Open 7 days a week from 10:00 AM to 02:00 AM (Late Night Service)',
    monday: '10:00 AM – 02:00 AM',
    tuesday: '10:00 AM – 02:00 AM',
    wednesday: '10:00 AM – 02:00 AM',
    thursday: '10:00 AM – 02:00 AM',
    friday: '10:00 AM – 02:00 AM',
    saturday: '10:00 AM – 02:00 AM',
    sunday: '10:00 AM – 02:00 AM',
    hotFoodCutoff: '01:45 AM',
  },
  delivery: {
    radiusMiles: 4,
    zonesCovered: [
      'Hayes (UB3, UB4)',
      'Southall (UB1, UB2)',
      'Harlington (UB3)',
      'West Drayton (UB7)',
      'Northolt (UB5)',
      'Hillingdon (UB8, UB10)',
      'Heathrow North (TW6)',
    ],
    standardFeePence: 399,
    freeDeliveryThresholdPounds: 30.00,
    averageTimeMins: '35–45 minutes',
  },
  collection: {
    averagePrepMins: '20–25 minutes',
  },
  halalStatus: '100% Halal certified meat and ingredients. Strictly zero alcohol on premises or in cooking.',
  priceAdvantageOverAggregators: '15–20% cheaper prices than Deliveroo/UberEats when ordering direct via WhatsApp or website.',
} as const;

// ── 2. Master Culinary Knowledge Base & FAQs ───────────────────────────
export const TOV_KNOWLEDGE_BASE: FAQItem[] = [
  // ── Food Authenticity, Cooking Philosophy & Halal ─────────────────
  {
    category: 'food',
    topic: 'Halal Certification',
    question: 'Is your food halal?',
    answer: 'Yes, 100% Halal certified. All our meats (chicken, lamb, beef) and ingredients are sourced exclusively from certified British suppliers and prepared in accordance with strict halal standards. No alcohol or non-halal items are ever stored or used on site.',
    searchKeywords: ['halal', 'hmc', 'muslim', 'zabiha', 'clean', 'alcohol free'],
  },
  {
    category: 'food',
    topic: 'Cuisine Style & Provenance',
    question: 'What kind of food do you serve?',
    answer: 'Authentic Pakistani & North Indian Punjabi village cuisine. Our specialties are traditional cast-iron wok Karahi (cooked on roaring flame with fresh vine tomatoes, julienned ginger, and green chilies—never diluted buffet base gravy), authentic charcoal tandoor grills, dum-cooked biryanis, and clay-oven naans.',
    searchKeywords: ['cuisine', 'pakistani', 'punjabi', 'indian', 'curry', 'bbq', 'karahi', 'biryani'],
  },
  {
    category: 'food',
    topic: 'Karahi Authenticity vs Base Gravy',
    question: 'What makes your Karahi special?',
    answer: 'We prepare every Karahi fresh to order in heavy iron woks on high flame. We do not use commercial pre-made onion paste or watered-down curry sauce. Meat is seared in whole spices, reduced down with fresh tomatoes, green chilies, coriander seeds, and ginger for that intense authentic desi dhaba aroma.',
    searchKeywords: ['karahi', 'charsi', 'shinwari', 'wok', 'gravy', 'dhaba'],
    relatedDishIds: ['tov_item_1777480501499_hr587', 'tov_item_1777480501499_50gml'],
  },
  {
    category: 'food',
    topic: 'Spice Levels & Customisation',
    question: 'Can I adjust the spice level?',
    answer: 'Our dishes come prepared to authentic village medium spice. If you prefer mild (for kids or sensitive palates) or extra fiery desi-spicy with extra fresh green chillies and black pepper, just let our WhatsApp assistant know or add it in your order notes.',
    searchKeywords: ['spice', 'spicy', 'hot', 'mild', 'chilli', 'desi spicy'],
  },
  {
    category: 'food',
    topic: 'Freshness & Cooking Time',
    question: 'Is the food pre-cooked or made fresh?',
    answer: 'Every Karahi, BBQ skewer, and Naan is fired fresh when your order prints in the kitchen. We believe authentic Punjabi cooking cannot sit under heat lamps, which is why collection takes 20–25 minutes for sizzling, piping hot food.',
    searchKeywords: ['fresh', 'prep time', 'made to order', 'hot'],
  },

  // ── Dietary, Vegan & Allergens ────────────────────────────────────
  {
    category: 'allergens',
    topic: 'Vegetarian Options',
    question: 'Do you have vegetarian dishes?',
    answer: 'Yes! We have an extensive traditional vegetarian selection including Muttar Paneer, Saag Paneer, Chana Masala, Aloo Gobi, Tadka Daal, Chana Daal, Dal Makhani, Veg Samosas, and Vegetable Biryani.',
    searchKeywords: ['vegetarian', 'veg', 'paneer', 'daal', 'chana', 'aloo'],
  },
  {
    category: 'allergens',
    topic: 'Nut Allergies',
    question: 'Are there nuts in your food?',
    answer: 'Most traditional iron-wok karahis, BBQ grills, and plain biryanis are nut-free. However, royal Mughal dishes like Butter Chicken, Malai Tikka, or Korma may contain cashew nut paste or almonds. Please specify any severe nut allergies so our chef can take sterile precautions.',
    searchKeywords: ['nuts', 'peanut', 'cashew', 'almond', 'allergy'],
  },
  {
    category: 'allergens',
    topic: 'Gluten Free Options',
    question: 'Do you have gluten free options?',
    answer: 'All our plain basmati rice dishes, biryanis, and most traditional karahis and grilled tikkas are naturally gluten-free. Naans, rotis, kulchas, and crispy samosa pastries contain wheat flour (gluten).',
    searchKeywords: ['gluten', 'coeliac', 'wheat', 'gluten-free', 'flour'],
  },
  {
    category: 'allergens',
    topic: 'Dairy Free Options',
    question: 'Can I get dairy-free dishes?',
    answer: 'Our BBQ tikkas are marinated in yogurt. However, traditional dry-fry Charsi Karahi or Tadka Daal can be prepared with vegetable oil instead of butter/ghee upon request. Tell us in your order notes!',
    searchKeywords: ['dairy', 'lactose', 'butter', 'ghee', 'vegan'],
  },

  // ── Operations, Timings & Late Night ──────────────────────────────
  {
    category: 'operations',
    topic: 'Opening Hours & Late Night Food',
    question: 'What are your opening hours?',
    answer: 'We are open 7 days a week, Monday through Sunday, from 10:00 AM to 02:00 AM midnight. Hot food is served continuously throughout lunch, dinner, and late-night cravings across West London.',
    searchKeywords: ['hours', 'open', 'close', 'late night', 'midnight', 'time'],
  },
  {
    category: 'operations',
    topic: 'Collection Time',
    question: 'How long does collection take?',
    answer: 'Collection orders are typically prepared fresh and piping hot within 20 to 25 minutes of payment confirmation.',
    searchKeywords: ['collection', 'pickup', 'takeaway', 'wait time'],
  },
  {
    category: 'operations',
    topic: 'Delivery Time & Coverage Radius',
    question: 'Where do you deliver and how long does it take?',
    answer: 'We deliver within a 4-mile radius of our Hayes hub (UB4 0RU), including Hayes, Southall, Harlington, West Drayton, Northolt, and Hillingdon. Delivery takes approximately 35–45 minutes. Free delivery on orders over £30 (otherwise £3.99).',
    searchKeywords: ['delivery', 'radius', 'postcode', 'miles', 'free delivery', 'how long'],
  },
  {
    category: 'operations',
    topic: 'Direct Order Savings vs Deliveroo / UberEats',
    question: 'Why should I order on WhatsApp instead of Deliveroo or Just Eat?',
    answer: 'Ordering directly with us via WhatsApp or our official website saves you 15% to 20% compared to delivery app markups and hidden service charges. Plus, your order goes straight to our kitchen screen with custom chef notes.',
    searchKeywords: ['deliveroo', 'ubereats', 'just eat', 'discount', 'cheap', 'save'],
  },

  // ── Location & Parking ───────────────────────────────────────────
  {
    category: 'location',
    topic: 'Address & Directions',
    question: 'Where are you located?',
    answer: 'Taste of Village Hayes is located at 766B Uxbridge Road, Hayes, UB4 0RU, London (directly on the Hayes End shopping parade, easily accessible from the A4020 and Uxbridge Road).',
    searchKeywords: ['address', 'location', 'where', 'postcode', 'directions', 'hayes'],
  },
  {
    category: 'location',
    topic: 'Parking Availability',
    question: 'Is there parking available?',
    answer: 'There is convenient pay-and-display street parking directly outside on Uxbridge Road, and free street parking on adjacent residential roads (including Lansbury Drive and Kingsway) after 6:30 PM.',
    searchKeywords: ['parking', 'car park', 'street parking', 'lansbury'],
  },
  {
    category: 'location',
    topic: 'Contact Phone & WhatsApp',
    question: 'What is your restaurant phone number?',
    answer: 'You can call us directly on 020 8848 0211 or message us 24/7 on WhatsApp at +44 7424 216045.',
    searchKeywords: ['phone', 'contact', 'call', 'number', 'whatsapp'],
  },

  // ── Family Feasts, Catering & Large Gatherings ────────────────────
  {
    category: 'catering',
    topic: 'Family Platters & Value Feasts',
    question: 'What do you recommend for groups and families?',
    answer: 'For 2 people, the Village Special Platter (£19.99) or Tandoor E Khaas (£18.49) is unbeatable. For 4 people, the Village Special Platter Serves 4 (£29.99) includes generous sizzling lamb chops, seekh kebabs, chicken tikkas, and wings—saving over £14 compared to ordering single portions.',
    searchKeywords: ['family', 'platter', 'feast', 'group', 'sharing', 'portion'],
    relatedDishIds: ['tov_item_1777480501499_fv4wa', 'tov_item_1777480501499_zo6fe'],
  },
  {
    category: 'catering',
    topic: 'Party Trays & Event Catering',
    question: 'Do you cater for events, birthdays or weddings?',
    answer: 'Yes! We cater for family events, Nikah gatherings, corporate lunches, and birthdays from 10 to 150+ guests. We offer bulk trays of Dum Biryani, Shinwari Karahi, and BBQ Feast Boxes. Reach out via WhatsApp for a tailored quote.',
    searchKeywords: ['catering', 'party', 'wedding', 'event', 'bulk', 'buffet'],
  },
  {
    category: 'catering',
    topic: 'Weekend Brunch Specials',
    question: 'Do you serve traditional Pakistani breakfast or brunch?',
    answer: 'Yes! On weekends we serve authentic Halwa Puri (£7.49), Cholay Bhaturay (£7.99), and fragrant Chicken Pulao (£7.49). Available fresh from 10:00 AM.',
    searchKeywords: ['brunch', 'breakfast', 'halwa puri', 'cholay bhaturay', 'pulao'],
    relatedDishIds: ['tov_item_1777480501499_cv83y', 'tov_item_1777480501499_xs1ra'],
  },

  // ── Payments & Square Checkout ───────────────────────────────────
  {
    category: 'payments',
    topic: 'Payment Methods & Apple Pay',
    question: 'How do I pay for my WhatsApp order?',
    answer: 'We generate an instant, 1-tap secure Square checkout link directly inside WhatsApp. It supports Apple Pay, Google Pay, and all major debit/credit cards. Once paid, the order immediately prints on our kitchen station.',
    searchKeywords: ['payment', 'pay', 'apple pay', 'google pay', 'card', 'square'],
  },
  {
    category: 'payments',
    topic: 'Order Modifications & Cancellations',
    question: 'Can I add something after placing my order?',
    answer: 'Because our kitchen starts grilling immediately, please reply to our WhatsApp assistant or ring 020 8848 0211 straight away if you need to add an extra naan, drink, or side.',
    searchKeywords: ['modify', 'cancel', 'change', 'extra'],
  },
];

// ── 3. Chef Sensory & Food Taster Profiles (Culinary Authority) ─────────
export const TOV_CHEF_TASTING_PROFILES: DishSensoryProfile[] = [
  {
    id: 'tov_item_1777480501499_hr587',
    name: 'Lamb Charsi Karahi',
    category: 'karahi_e_khaas',
    price: 24.99,
    heatLevel: 4,
    flavorNotes: [
      'Smoky iron wok fond caramelization',
      'Rendered lamb marrow richness',
      'Sharp fresh ginger julienne',
      'Pounded coarse black peppercorn warmth',
      'Tangy vine tomato reduction',
    ],
    aromaProfile: 'Roaring flame searing with black pepper, natural lamb suet, and caramelized tomato glaze.',
    cookingMethod: 'Cooked Namak Mandi style in an authentic heavy iron karahi on screaming flame. Bone-in prime lamb renders in its own natural fat with sea salt, halved tomatoes, and slit green chillies. Zero water, zero artificial base gravy.',
    chefSecret: 'We never boil the meat beforehand. The lamb is braised directly in the wok so the bone marrow dissolves and enriches the tomato fond.',
    tastingHook: 'Peshawar’s legendary Namak Mandi style—succulent bone-in lamb sizzled in its own natural marrow richness with cracked black pepper and green chillies.',
    pairingRecommendation: {
      bread: 'Hot Roghani Naan or crisp Tandoori Roti',
      side: 'Chilled Cucumber & Mint Raita',
      drink: 'Cold Sweet Mango Lassi',
    },
    crossSellHook: 'Would you like a hot Butter Naan to scoop that rich marrow gravy, and a chilled Mango Lassi to cool the pepper heat?',
  },
  {
    id: 'tov_item_1777480501499_50gml',
    name: 'Shinwari Chicken Karahi',
    category: 'karahi_e_khaas',
    price: 19.99,
    heatLevel: 2,
    flavorNotes: [
      'Clean roasted garlic aroma',
      'Naturally sweet tomato umami',
      'Crisp green chili perfume without burning heat',
      'Pure Himalayan pink salt balance',
    ],
    aromaProfile: 'Fresh sweet tomato reduction with roasted whole garlic cloves and green chilli oils.',
    cookingMethod: 'Tribal Shinwari Afghan-border technique: fresh chicken flash-fried with whole garlic cloves and sweet tomatoes until the juices caramelize.',
    chefSecret: 'Zero turmeric or powdered garam masala. The pure taste comes exclusively from tomato reduction, chicken fats, and toasted garlic.',
    tastingHook: 'Tribal frontier perfection—bone-in chicken caramelized with sweet ripe vine tomatoes and whole roasted garlic cloves.',
    pairingRecommendation: {
      bread: 'Sesame Seed Roghani Naan',
      side: 'Kachumber Salad with Lemon Dressing',
      drink: 'Mango Lassi',
    },
    crossSellHook: 'Pair it with a hot Garlic Naan to scoop the garlic-tomato juices!',
  },
  {
    id: 'tov_item_1777480501499_scc48',
    name: 'White Chicken Karahi',
    category: 'karahi_e_khaas',
    price: 19.99,
    heatLevel: 1,
    flavorNotes: [
      'Velvety cultured yogurt',
      'Toasted fine white pepper warmth',
      'Fragrant green cardamom pods',
      'Blanched cashew creaminess',
      'Fresh chopped coriander',
    ],
    aromaProfile: 'Floral green cardamom and rich cream laced with toasted white pepper.',
    cookingMethod: 'Slow-simmered in whipped curd, green cardamom, cashew paste, and double cream in a sealed karahi.',
    chefSecret: 'Zero red chili powder or tomatoes. We use fine crushed white pepper and green cardamom pods for a gentle, luxurious royal Mughlai finish.',
    tastingHook: 'Royal Mughlai luxury—velvety chicken bathed in whipped yogurt, green cardamom, and toasted white pepper cream.',
    pairingRecommendation: {
      bread: 'Garlic & Coriander Naan',
      side: 'Jeera Pilau Rice',
      drink: 'Sweet Mango Lassi',
    },
    crossSellHook: 'Best scooped with our Garlic Naan—smooth, creamy, and completely child-friendly!',
  },
  {
    id: 'tov_item_1777480501499_qv0hq',
    name: 'Tawa Fish Karahi',
    category: 'karahi_e_khaas',
    price: 14.99,
    heatLevel: 3,
    flavorNotes: [
      'Crispy-edged fish fillets',
      'Ajwain (carom seed) earthy perfume',
      'Crushed coriander seed crunch',
      'Tangy dried amchur (green mango)',
    ],
    aromaProfile: 'Sizzling ajwain seeds and roasted dry spices on a flat iron tawa.',
    cookingMethod: 'Flash-seared on a heavy cast-iron tawa with crushed whole coriander, ajwain seeds, and tangy tomato reduction.',
    chefSecret: 'Seared on high heat for under 4 minutes to keep the fish flaky and juicy inside while forming a spicy spiced crust outside.',
    tastingHook: 'Sizzling tawa fish fillets flash-seared with aromatic ajwain, crushed coriander seeds, and tangy spiced tomatoes.',
    pairingRecommendation: {
      bread: 'Fresh Tandoori Roti',
      side: 'Fresh Onion Salad with Lemon Slices',
      drink: 'Cold Soda / Lassi',
    },
    crossSellHook: 'Shall I add a couple of fresh Tandoori Rotis to complete this seafood feast?',
  },
  {
    id: 'tov_item_1777480501499_37fer',
    name: 'Lamb Chops (4PC)',
    category: 'bbq_tandoor_se',
    price: 7.99,
    heatLevel: 3,
    flavorNotes: [
      'Smoky charcoal crust',
      'Tenderized juicy lamb marrow',
      'Kashmiri chili warmth',
      'Roasted cumin & coriander seed punch',
    ],
    aromaProfile: 'Woodsmoke, charred fat, roasted cumin, and sizzling garlic-ginger marinade.',
    cookingMethod: 'Cut fresh, tenderized for 24 hours in hung yogurt, raw papaya extract, crushed garlic, and roasted spices, then skewered over 450°C glowing hardwood lump charcoal.',
    chefSecret: 'Charcoal heat seals the meat instantly while caramelizing the spiced crust, leaving the meat butter-tender right to the bone.',
    tastingHook: 'Charcoal-kissed prime lamb chops, 24-hour spiced marinade, sizzling with smoky edges and tender juiciness.',
    pairingRecommendation: {
      bread: 'Hot Butter Naan',
      side: 'Mint & Coriander Chutney with Lachha Onions',
      drink: 'Thums Up or Salted Lassi',
    },
    crossSellHook: 'Our charcoal chops are sizzling right now—shall I pop an order in as a starter?',
  },
  {
    id: 'tov_item_1777480501499_kgfcu',
    name: 'Lamb Seekh Kebab (4PC)',
    category: 'bbq_tandoor_se',
    price: 6.49,
    heatLevel: 3,
    flavorNotes: [
      'Coarsely hand-ground spiced lamb',
      'Melted lamb suet succulence',
      'Fresh mint & green chili zing',
      'Roasted whole cumin crackle',
    ],
    aromaProfile: 'Smoky charcoal roast, roasted cumin, and fresh garden herbs.',
    cookingMethod: 'Double-ground lean lamb blended with 15% prime fat for melt-in-the-mouth texture, molded on flat iron skewers and roasted over open coals.',
    chefSecret: 'Spices are hand-toasted and crushed right before mixing so the aromatic oils bloom when hitting the live fire.',
    tastingHook: 'Melt-in-the-mouth spiced lamb kebabs, hand-molded and roasted over live charcoal for that unforgettable smoky bite.',
    pairingRecommendation: {
      bread: 'Puri Paratha or Tandoori Naan',
      side: 'Tangy Tamarind Dip & Mint Chutney',
      drink: 'Mango Lassi',
    },
    crossSellHook: 'Roll them into a hot Butter Naan with mint sauce for the ultimate bite!',
  },
  {
    id: 'tov_item_1777480501499_yhlq0',
    name: 'Chicken Tikka',
    category: 'bbq_tandoor_se',
    price: 7.49,
    heatLevel: 3,
    flavorNotes: [
      'Clay-oven tandoor char',
      'Tangy lemon-fenugreek marinade',
      'Juicy breast/thigh meat tenderization',
      'Vibrant Kashmiri chili glow',
    ],
    aromaProfile: 'Smoky tandoor char with roasted cumin, fenugreek, and mustard oil.',
    cookingMethod: 'Marinated in Greek yogurt, mustard oil, Kashmiri chilli, and fenugreek, roasted at high heat inside the clay tandoor.',
    chefSecret: 'Basted with melted butter and fresh lemon juice right as it exits the clay tandoor.',
    tastingHook: 'Tender chicken chunks marinated in mustard oil, fenugreek, and Kashmiri spices, roasted in the clay tandoor.',
    pairingRecommendation: {
      bread: 'Garlic Naan',
      side: 'Mint Raita',
      drink: 'Mango Lassi',
    },
    crossSellHook: 'Add a Garlic Naan and Raita to make it a complete grill meal!',
  },
  {
    id: 'tov_item_1777480501499_x4c7k',
    name: 'Malai Tikka',
    category: 'bbq_tandoor_se',
    price: 7.49,
    heatLevel: 1,
    flavorNotes: [
      'Velvety double cream marinade',
      'Mild green cardamom perfume',
      'Cashew-cheese tenderness',
      'Gentle white pepper warmth',
    ],
    aromaProfile: 'Sweet green cardamom, roasted cream, and mild tandoori smoke.',
    cookingMethod: 'Steeped in clotted cream, processed cheese, cashew paste, and green cardamom, gently roasted in the tandoor.',
    chefSecret: 'Zero red chillies. Superbly soft and creamy, loved by children and mild diners.',
    tastingHook: 'Melt-in-the-mouth chicken steeped in clotted cream, green cardamom, and mild cheese marinade.',
    pairingRecommendation: {
      bread: 'Butter Naan',
      side: 'Mixed Salad',
      drink: 'Mango Lassi',
    },
    crossSellHook: 'Mild, rich, and kid-approved—great to pair with any spicy Karahi on the table!',
  },
  {
    id: 'tov_item_1777480501499_fv4wa',
    name: 'Village Special Platter (Serves 2)',
    category: 'village_special_platters',
    price: 19.99,
    heatLevel: 3,
    flavorNotes: [
      'Mixed charcoal grill feast',
      'Sizzling lamb chops',
      'Seekh kebabs',
      'Chicken tikkas',
      'Crispy wings',
      'Bed of spiced onions',
    ],
    aromaProfile: 'Grand charcoal smoke and sizzling grilled onions.',
    cookingMethod: 'An assortment of our signature tandoori meats freshly roasted and assembled over sizzling caramelized onions with fresh lemon.',
    chefSecret: 'Synchronized grilling so every cut arrives at the peak of juiciness.',
    tastingHook: 'The perfect couple’s feast—charcoal lamb chops, seekh kebabs, chicken tikkas, and wings over sizzling onions.',
    pairingRecommendation: {
      bread: '2x Butter Naan',
      side: 'Mint Raita',
      drink: '2x Mango Lassi',
    },
    crossSellHook: 'Includes all our bestselling grills—shall I add 2 hot Butter Naans to go with it?',
  },
  {
    id: 'tov_item_1777480501499_zo6fe',
    name: 'Village Special Platter (Serves 4)',
    category: 'village_special_platters',
    price: 29.99,
    heatLevel: 3,
    flavorNotes: [
      'Massive family barbecue feast',
      'Double portion lamb chops',
      'Juicy seekh kebabs',
      'Golden chicken tikkas',
      'Spiced chicken wings',
    ],
    aromaProfile: 'Enormous charcoal-smoke feast aroma with lemon, mint, and charred spices.',
    cookingMethod: 'Curated sharing platter timed to perfection, piled high on a sizzling bed of spiced onions.',
    chefSecret: 'Saves over £14 compared to ordering each grill portion separately.',
    tastingHook: 'The ultimate village family feast—generous charcoal chops, seekh kebabs, succulent chicken tikkas, and wings. Feeds 4 generously!',
    pairingRecommendation: {
      bread: 'Basket of 4 Naans (Butter & Garlic)',
      side: '2x Fresh Mint Raita',
      drink: 'Family Jug of Sweet Mango Lassi',
    },
    crossSellHook: 'Feeding 4? This platter gives everyone their favourites and saves over £14 vs single orders.',
  },
  {
    id: 'tov_item_1777480501499_uovsq',
    name: 'Chicken Pulao (Weekend Special)',
    category: 'weekend_special',
    price: 7.49,
    heatLevel: 2,
    flavorNotes: [
      'Aromatic Yakhni (bone broth) basmati',
      'Whole roasted cumin and coriander seeds',
      'Fall-apart tender chicken',
      'Mild sweet caramelized onions',
    ],
    aromaProfile: 'Slow-simmered bone broth, roasted cumin, and black cardamom.',
    cookingMethod: 'Authentic Punjabi Yakhni Pulao: chicken is simmered in a spiced broth, then aged basmati rice absorbs the rich stock under dum.',
    chefSecret: 'Prepared in limited weekend batches. Light on the stomach yet deeply flavorful.',
    tastingHook: 'Traditional weekend Yakhni Pulao—aged basmati infused with rich slow-cooked chicken broth and roasted whole spices.',
    pairingRecommendation: {
      bread: 'Tandoori Roti',
      side: 'Fresh Zeera Raita & Salad',
      drink: 'Salted Lassi',
    },
    crossSellHook: 'Cooked fresh on weekends only—shall I reserve a portion before today’s batch sells out?',
  },
  {
    id: 'tov_item_1777480501499_cv83y',
    name: 'Halwa Puri (Weekend Special)',
    category: 'weekend_special',
    price: 7.49,
    heatLevel: 2,
    flavorNotes: [
      'Crispy puffed golden puris',
      'Sweet semolina halwa with cardamom',
      'Tangy Lahore-style spicy chana masala',
      'Spicy aloo bhujia with achar',
    ],
    aromaProfile: 'Sweet cardamom semolina, tangy pickle, and sizzling puffed dough.',
    cookingMethod: 'Fresh dough fried to golden puffiness to order, served with warm suji halwa and spiced Lahori chickpeas.',
    chefSecret: 'The ultimate Lahore breakfast tradition, prepared fresh every Saturday and Sunday from 10:00 AM.',
    tastingHook: 'Authentic Lahore weekend breakfast—piping hot puffed puris, sweet semolina halwa, and tangy spiced chana masala.',
    pairingRecommendation: {
      bread: 'Extra Puri (£1.50)',
      side: 'Mango Pickle (Achar)',
      drink: 'Doodh Patti Karak Chai or Sweet Lassi',
    },
    crossSellHook: 'Available fresh today until 2:00 PM! Shall I add Karak Chai with it?',
  },
];

// ── 4. Psychological Diagnostic Questions (Rapid Qualifier Engine) ────
export const TOV_PSYCHOLOGICAL_DIAGNOSTICS: PsychologicalDiagnosticQuestion[] = [
  {
    qualificationGoal: 'party_size',
    question: 'Are we cooking for just yourself tonight, a couple\'s dinner, or feeding the whole family?',
    options: [
      {
        label: 'Solo Dinner',
        customerProfile: 'Individual looking for quick, filling, satisfying comfort food.',
        suggestedDishIds: ['tov_item_1777480501499_hr587', 'tov_item_1777480501499_kgfcu'],
        recommendationPitch: 'Our Chicken Karahi or Seekh Kebab Naan combo is perfect for one—ready piping hot in 20 mins!',
      },
      {
        label: 'Dinner for Two',
        customerProfile: 'Couples or pairs wanting variety and generous portions.',
        suggestedDishIds: ['tov_item_1777480501499_fv4wa', 'tov_item_1777480501499_50gml'],
        recommendationPitch: 'For 2 people, our Village Special Platter (£19.99) with 2 Butter Naans gives you a taste of all our best grills!',
      },
      {
        label: 'Family Feast (3 to 6 people)',
        customerProfile: 'Families seeking maximum value, variety, and zero fuss.',
        suggestedDishIds: ['tov_item_1777480501499_zo6fe', 'tov_item_1777480501499_9veff'],
        recommendationPitch: 'Our Village Special Platter (Serves 4 - £29.99) feeds the whole family generously with chops, kebabs, tikkas, and wings—saving £14+ vs single dishes!',
      },
    ],
  },
  {
    qualificationGoal: 'spice_tolerance',
    question: 'Do you prefer authentic desi street heat with green chillies, or a smooth mild spice?',
    options: [
      {
        label: 'Desi Spicy / High Heat',
        customerProfile: 'Loves bold, sharp chili, black pepper, and high-heat wok flavors.',
        suggestedDishIds: ['tov_item_1777480501499_hr587', 'tov_item_1777480501499_37fer'],
        recommendationPitch: 'You’ll love our Lamb Charsi Karahi or Lamb Chops—wok-sizzled with cracked black pepper and green chillies!',
      },
      {
        label: 'Medium Authentic',
        customerProfile: 'Balanced palate, likes flavor and aroma without stinging heat.',
        suggestedDishIds: ['tov_item_1777480501499_50gml', 'tov_item_1777480501499_yhlq0'],
        recommendationPitch: 'Our Shinwari Chicken Karahi or Chicken Tikka is our village medium standard—deep tomato and garlic umami without overwhelming heat.',
      },
      {
        label: 'Mild / Kid Friendly',
        customerProfile: 'Sensitive to chili or ordering for children.',
        suggestedDishIds: ['tov_item_1777480501499_scc48', 'tov_item_1777480501499_x4c7k'],
        recommendationPitch: 'Our White Chicken Karahi and Malai Tikka are velvety, rich, and kid-safe—cooked with cream, green cardamom, and zero sharp chillies!',
      },
    ],
  },
  {
    qualificationGoal: 'craving_type',
    question: 'Are you craving a bold iron-wok Karahi with rich gravy, or sizzling charcoal grills straight off the coals?',
    options: [
      {
        label: 'Wok Karahi & Rich Curries',
        customerProfile: 'Wants saucy, deeply spiced food to scoop with hot naans.',
        suggestedDishIds: ['tov_item_1777480501499_hr587', 'tov_item_1777480501499_50gml'],
        recommendationPitch: 'Our Karahi is cooked to order on high flame with vine tomatoes and ginger—pair it with hot Butter Naan!',
      },
      {
        label: 'Charcoal BBQ Grills',
        customerProfile: 'Wants high-protein, smoky, low-carb, or grilled items.',
        suggestedDishIds: ['tov_item_1777480501499_37fer', 'tov_item_1777480501499_kgfcu'],
        recommendationPitch: 'Our charcoal chops and seekh kebabs are skewered over glowing 450°C lump wood coals—juicy, smoky, and irresistible!',
      },
    ],
  },
];

// ── 5. Marketing Psychology & Conversion Engine (The Elite Salesman) ───
export const TOV_SALES_PSYCHOLOGY_PLAYBOOK = {
  // Technique 1: The Assumptive Close (Choice Architecture)
  // Never ask: "Do you want anything else?" -> Ask: "Shall I add a crisp Butter Naan or fragrant Pilau Rice to scoop that rich gravy?"
  assumptiveBreads: {
    curryHook: 'Would you like a piping hot Butter Naan or fragrant Pilau Rice to scoop that rich Karahi masala?',
    bbqHook: 'Our charcoal grills are best enjoyed wrapped in a fluffy Tandoori Roti or Garlic Naan—which would you prefer?',
  },

  // Technique 2: The Palate Reset Upsell (Sensory Contrast & Thermal Balance)
  // Spicy Karahi -> Chilled Lassi / Cool Raita
  palateReset: {
    spicyDishHook: 'Our Karahi packs an authentic desi kick! Shall I add a chilled Mango Lassi (£2.50) or fresh Mint Raita (£1.20) to balance the heat?',
  },

  // Technique 3: Loss Aversion / Goal-Gradient on Free Delivery (£30 threshold)
  // If cart is between £20 and £29.99, nudge customer to save the £3.99 delivery charge
  deliveryThreshold: {
    buildPrompt: (remainingPounds: string) =>
      `You're only £${remainingPounds} away from FREE delivery! Adding a 2-piece Vegetable Samosa (£4.99) or Mango Lassi (£2.50) unlocks free delivery right now.`,
  },

  // Technique 4: Social Proof & Group Anchoring (Decoy / Compromise Effect)
  groupDiagnostic: {
    question: 'Are we cooking for just yourself tonight, a couple\'s dinner, or feeding the whole family?',
    familyPitch: 'If feeding 3 or 4, our *Village Special Platter* (£29.99) is our most ordered feast—it gives everyone sizzling chops, seekh kebabs, tikkas, and wings while saving over £14 vs single portions.',
  },

  // Technique 5: Fresh-Batch Urgency / Chef Exclusivity
  freshBatchUrgency: {
    weekendSpecials: 'Chef prepares our traditional Halwa Puri and Weekend Dum Pulao in limited morning batches—shall I lock one in before today\'s batch sells out?',
  },

  // Technique 6: The Sweet Finish (Micro-Decision)
  sweetFinish: {
    hook: 'Shall I add a warm Gulab Jamun or chilled Kheer to finish off your feast on a sweet note?',
  },
};

// ── 6. Objection Handling Matrix (Sub-Second Defense to Close) ─────────
export const TOV_OBJECTION_HANDLERS: ObjectionHandler[] = [
  {
    objection: 'Why does food take 20 to 25 minutes for collection?',
    rootFear: 'Thinks it is pre-cooked takeaway fast food sitting under heat lamps.',
    rapidChefResponse: 'Every single Karahi, BBQ skewer, and Naan is fired fresh to order on roaring iron woks and tandoors—we never serve pre-made buffet food. You get piping hot restaurant quality.',
    closingQuestion: 'Shall I get your order into the kitchen queue now so it’s ready right on time?',
  },
  {
    objection: 'Is the food too spicy for children or mild eaters?',
    rootFear: 'Fear of overpowering chili heat causing dinner distress.',
    rapidChefResponse: 'Not at all! Our Butter Chicken, Malai Tikka, and White Karahi are rich, velvety, and gentle with zero sharp chillies. Plus, we can tailor any dish to mild in the kitchen notes.',
    closingQuestion: 'Would you like our chef to make your curries extra mild for the family?',
  },
  {
    objection: 'Why is Lamb Charsi Karahi £24.99?',
    rootFear: 'Perceived high price compared to generic takeaway curries.',
    rapidChefResponse: 'Our Charsi Karahi is a generous feast portion made with prime hand-selected British bone-in lamb, cooked Peshawari-style purely in its own marrow fats and fresh vine tomatoes with zero water or cheap fillers. Easily feeds 2 hungry guests!',
    closingQuestion: 'Shall I add a couple of Tandoori Naans to scoop that rich gravy?',
  },
  {
    objection: 'Why should I order on WhatsApp instead of Deliveroo or UberEats?',
    rootFear: 'Convenience preference for third-party apps.',
    rapidChefResponse: 'Ordering direct on WhatsApp saves you 15–20% on menu prices with zero hidden service app fees, your order goes straight to our kitchen master printer, and delivery is free over £30!',
    closingQuestion: 'Can I set up your order right here with 1-tap Apple Pay / Google Pay?',
  },
  {
    objection: 'Will the food stay hot during delivery?',
    rootFear: 'Receiving lukewarm or soggy food.',
    rapidChefResponse: 'We pack all curries and platters in thermal heat-sealed containers and deliver directly within 4 miles in insulated hot bags. Food arrives piping hot.',
    closingQuestion: 'What’s your delivery postcode so we can dispatch our driver to you?',
  },
];

// ── 7. Multi-Agent Marketing Campaign Blueprints ───────────────────────
export const TOV_AGENT_CAMPAIGN_BLUEPRINTS: MultiAgentCampaignBlueprint[] = [
  {
    platform: 'meta_ads',
    headline: 'Craving Authentic Pakistani Karahi in West London? 🔥',
    hookBody: 'Zero buffet base gravy. Pure cast-iron wok heat, fresh vine tomatoes, julienned ginger, and charcoal-kissed lamb chops. Taste of Village Hayes serves 100% Halal village cuisine until 2:00 AM every night. Order direct on WhatsApp for 20% lower prices than Deliveroo!',
    callToAction: 'Order Direct on WhatsApp',
    targetAudience: 'West London Asian diaspora, foodies, late-night workers within 5 miles of Hayes UB4',
  },
  {
    platform: 'google_search',
    headline: 'Authentic Karahi & BBQ Hayes | 100% Halal | Open Till 2 AM',
    hookBody: 'Wok-cooked Charsi Karahi, sizzling lamb chops & fresh tandoori naans. Free delivery over £30 in Hayes, Southall & Hillingdon. Order direct now.',
    callToAction: 'View Menu & Order',
    targetAudience: 'Searchers for "halal food hayes", "best karahi london", "late night delivery ub4"',
  },
  {
    platform: 'tiktok_reels',
    headline: 'POV: You found real Peshawar Namak Mandi Karahi in Hayes 🥩🔥',
    hookBody: 'Watch this: heavy iron wok, 450°C screaming flame, bone-in lamb sizzled in its own natural marrow fats, vine tomatoes, and crushed black pepper. Zero water. Served piping hot with blistered sesame roghani naan.',
    callToAction: 'Tap link in bio to order via WhatsApp',
    targetAudience: 'Food TikTokers, London Halal food bloggers, Gen Z / Millennial desi community',
  },
  {
    platform: 'whatsapp_push',
    headline: 'Weekend Halwa Puri & Dum Pulao are live! ☀️',
    hookBody: 'Salam! Our chefs just fired up the weekend breakfast batches: crispy puffed Halwa Puri (£7.49) and fragrant Chicken Pulao (£7.49). Available fresh until 2 PM. Reply *Order* to grab yours before they sell out!',
    callToAction: 'Reply "Order" to start',
    targetAudience: 'Existing customer database for Saturday/Sunday morning broadcasts',
  },
];

// ── 8. AI SEO & Local Discovery Keywords ───────────────────────────────
export const TOV_LOCAL_SEO_ENTITIES = {
  canonicalDomain: 'https://tasteofvillagerestaurants.co.uk/',
  primaryKeywords: [
    'Halal restaurant Hayes Uxbridge Road',
    'Best Karahi in West London',
    'Authentic Pakistani food Hayes UB4',
    'Late night food delivery Hayes UB4',
    'Peshawari Charsi Karahi London',
    'Charcoal Lamb Chops Southall Hayes',
    'Family BBQ Platter Hayes',
    'Halwa Puri breakfast Hayes London',
    'Halal catering West London Hillingdon',
  ],
  serviceAreas: [
    { area: 'Hayes', postcode: 'UB3, UB4', distanceMiles: 0.5 },
    { area: 'Southall', postcode: 'UB1, UB2', distanceMiles: 2.1 },
    { area: 'Harlington', postcode: 'UB3', distanceMiles: 2.8 },
    { area: 'West Drayton', postcode: 'UB7', distanceMiles: 3.2 },
    { area: 'Hillingdon', postcode: 'UB8, UB10', distanceMiles: 2.5 },
    { area: 'Northolt', postcode: 'UB5', distanceMiles: 3.4 },
    { area: 'Heathrow North', postcode: 'TW6', distanceMiles: 3.9 },
  ],
  schemaJsonLdRecommendation: {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    'name': 'Taste of Village',
    'image': 'https://tasteofvillagerestaurants.co.uk/assets/tov-logo-tree-terracotta-alpha.png',
    '@id': 'https://tasteofvillagerestaurants.co.uk/#restaurant',
    'url': 'https://tasteofvillagerestaurants.co.uk/',
    'telephone': '020 8848 0211',
    'servesCuisine': ['Pakistani', 'North Indian', 'Punjabi', 'Halal', 'Barbecue'],
    'priceRange': '££',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '766B Uxbridge Road',
      'addressLocality': 'Hayes',
      'postalCode': 'UB4 0RU',
      'addressCountry': 'GB',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 51.5284,
      'longitude': -0.4287,
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'opens': '10:00',
        'closes': '02:00',
      },
    ],
  },
};