/* ─── Size Variations for Website ─── */
export const WEB_SIZE_ITEMS: Record<string, { regular: number; large: number }> = {};

// Categories that always have Regular / Large
export const SIZE_CATEGORIES: string[] = ['curries', 'desi_handi', 'karahi_e_khaas', 'rolls', 'burgers'];



export const CATEGORY_DESCRIPTIONS: Record<string, { title: string; text: string }> = {
  // Starters / Grill / Chaat
  starters: {
    title: "Tala'a Hua Zaiqah",
    text: 'The art of the perfect fry. From our famous Talii Fish Pakora to crispy Samosas, these golden, deeply seasoned starters are the perfect way to awaken your palate.'
  },
  talaa_hua_zaiqah: {
    title: "Tala'a Hua Zaiqah",
    text: 'The art of the perfect fry. From our famous Talii Fish Pakora to crispy Samosas, these golden, deeply seasoned starters are the perfect way to awaken your palate.'
  },
  bbq: {
    title: 'Tandoori Se (تندوری سے)',
    text: 'Prime cuts of meat marinated in our signature yogurt and spice blends, then roasted in a roaring hot clay oven (Tandoor) for that unmistakable smoky char and tender bite.'
  },
  bbq_tandoor_se: {
    title: 'Tandoori Se (تندوری سے)',
    text: 'Prime cuts of meat marinated in our signature yogurt and spice blends, then roasted in a roaring hot clay oven (Tandoor) for that unmistakable smoky char and tender bite.'
  },
  starters_n_charcoal_grill: {
    title: 'Pesh-e-ghiza (پیش غذا)',
    text: 'Crispy starters and sizzling charcoal-fired kebabs. Marinated in hand-ground spices and roasted over glowing red coals for that perfect authentic smoky finish.'
  },
  chaat: {
    title: 'Chatkhara (चटखारा / چٹخارا)',
    text: 'A sharp, tangy, or zesty flavor that causes a "smacking of lips" in appreciation of taste. This special corner of our menu is dedicated to true lovers of mouthwatering, savory, and highly seasoned street food.'
  },
  chatkara_junction: {
    title: 'Chatkara Junction (چٹخارہ جنکشن)',
    text: 'A sharp, tangy, or zesty flavor that causes a "smacking of lips" in appreciation of taste. This special corner of our menu is dedicated to true lovers of mouthwatering, savory, and highly seasoned street food.'
  },

  // Mains
  curries: {
    title: 'Saalan Se (سالن سے)',
    text: 'Rich, slow-cooked gravies that form the heart of authentic South Asian comfort food. Each curry is prepared using deeply roasted spices and simmered to perfection, meant to be scooped up with fresh tandoori bread.'
  },
  curries_salan_se: {
    title: 'Saalan Se (سالن سے)',
    text: 'Rich, slow-cooked gravies that form the heart of authentic South Asian comfort food. Each curry is prepared using deeply roasted spices and simmered to perfection, meant to be scooped up with fresh tandoori bread.'
  },
  mains___village_classics: {
    title: 'Apna Zaiqah (اپنا ذائقہ)',
    text: 'True village heritage on a plate. Traditional Punjabi curries and signature clay-pot dishes slow-simmered with cold-pressed oils and roasted spices.'
  },
  desi_handi: {
    title: 'Desi Handi (دیسی ہانڈی)',
    text: 'Traditional curries cooked in a classic clay pot (Handi) to lock in the earthy aromas and natural juices. This slow-cooking method ensures tender meat and a thick, incredibly rich sauce.'
  },
  karahi_e_khaas: {
    title: 'Karahi E Khaas (کڑاہی خاص)',
    text: 'A vibrant and fiery dish wok-fried at high heat in a traditional cast-iron Karahi. Famous for its thick tomato and ginger-garlic reduction, finished with fresh green chillies and coriander.'
  },

  // Signature Dishes
  signature_dishes: {
    title: 'Intekhaab-e-Khaas (انتخاب خاص)',
    text: 'Our master creations. Unique house specialties and street-food fusion dishes crafted specifically by our executive chefs to redefine modern Desi dining.'
  },
  rolls: {
    title: 'Flavorful Rolls',
    text: 'Fresh tandoori bread tightly wrapped around juicy grilled meats, crunchy veggies, and tangy signature sauces. The perfect, flavor-packed bite on the go.'
  },
  burgers: {
    title: 'Desi Burgers & Noodles',
    text: 'A street-food twist on modern classics. Featuring our famous Aloo Tikki and Paneer Tikki burgers, alongside wok-fried Desi-style noodles.'
  },

  rice: {
    title: 'Pulao aur Biryani (پلاؤ اور بریانی)',
    text: 'Fragrant, long-grain Basmati rice steamed with layered saffron, fresh mint, and tender cuts of meat or fresh vegetables. Aromatic perfection in every spoonful.'
  },
  biryani_and_rice: {
    title: 'Pulao aur Biryani (پلاؤ اور بریانی)',
    text: 'Fragrant, long-grain Basmati rice steamed with layered saffron, fresh mint, and tender cuts of meat or fresh vegetables. Aromatic perfection in every spoonful.'
  },
  rice_specials: {
    title: 'Pulao aur Biryani (پلاؤ اور بریانی)',
    text: 'Fragrant, long-grain Basmati rice steamed with layered saffron, fresh mint, and tender cuts of meat or fresh vegetables. Aromatic perfection in every spoonful.'
  },

  // Platters
  platters: {
    title: 'Village Signature Platters',
    text: 'A curated selection of Taste of Village favorites on a single, overflowing platter. Experience the authentic spectrum of our best dishes in one sitting.'
  },
  village_special_platters: {
    title: 'Village Signature Platters',
    text: 'A curated selection of Taste of Village favorites on a single, overflowing platter. Experience the authentic spectrum of our best dishes in one sitting.'
  },
  family_platters: {
    title: 'Family Platter (فیملی پلیٹر)',
    text: 'Royal sharing feasts. Overflowing platters of grilled charcoal delicacies, fresh breads, aromatic rice, and dynamic chutneys designed to bring families together.'
  },
  bbq_platters: {
    title: 'Premium BBQ Sharing',
    text: 'The ultimate royal feast. A massive spread of our finest charcoal-grilled meats, accompanied by fresh naan, rice, and signature dips. Designed for sharing and making memories.'
  },
  bbq_platter: {
    title: 'Premium BBQ Sharing',
    text: 'The ultimate royal feast. A massive spread of our finest charcoal-grilled meats, accompanied by fresh naan, rice, and signature dips. Designed for sharing and making memories.'
  },
  rice_platters: {
    title: 'Rice Feasts',
    text: 'A majestic combination of our aromatic, slow-cooked rice dishes served alongside perfectly grilled meats and traditional sides. A complete meal for two or more.'
  },

  // Kids Meal
  kids_meal: {
    title: 'Bachoan Ki Pasand (بچوں کی پسند)',
    text: 'Mildly seasoned, kid-friendly favourites prepared with the same premium ingredients, designed specifically for our youngest village guests.'
  },

  // Breakfast / Brunch
  breakfast___desi_nashta: {
    title: 'Nashta-e-Khaas (ناشتہ خاص)',
    text: 'A traditional Lahori breakfast feast. Savour hot, crispy puris served alongside rich halwa, aromatic chana masala, and freshly whipped lassi. The ultimate morning tradition.'
  },
  village_brunch_special: {
    title: 'Nashta-e-Khaas (ناشتہ خاص)',
    text: 'A traditional Lahori breakfast feast. Savour hot, crispy puris served alongside rich halwa, aromatic chana masala, and freshly whipped lassi. The ultimate morning tradition.'
  },
  weekend_special: {
    title: 'Weekend Only Traditions',
    text: 'Special dishes like Halwa Puri and Fruit Chaat, crafted specifically for the weekend. These traditional treats take time to prepare and are available in limited quantities.'
  },
  specials: {
    title: 'Weekend Only Traditions',
    text: 'Special dishes like Halwa Puri and Fruit Chaat, crafted specifically for the weekend. These traditional treats take time to prepare and are available in limited quantities.'
  },
  brunch_offers: {
    title: 'Daytime Village Deals',
    text: 'Exclusive midday feasts available at special prices. The perfect way to enjoy a hearty Punjabi meal during your lunch break or weekend afternoon.'
  },

  // Salads
  salads: {
    title: 'Salad (سلاد)',
    text: 'Crisp, refreshing greens, hand-picked herbs, and traditional sliced onions dressed with fresh lemon juice and sea salt to cleanse and balance your palate.'
  },

  // Sides & Sauces
  sides_n_sauces: {
    title: 'Raita aur Chatni (رائتہ اور چٹنی)',
    text: 'The perfect accompaniments. From cool, cooling mint raita and sweet imli chutney to crisp hand-cut chips, curated to perfectly complement your main feast.'
  },

  // Naan & Breads
  naan_n_bread: {
    title: 'Tandoor Se (تندور سے)',
    text: 'Freshly slapped tandoori breads, Amritsari kulchas, and buttery parathas, emerged piping hot and blistered from our 400°C clay oven.'
  },
  breads: {
    title: 'Tandoori Breads',
    text: 'No feast is complete without bread. Slapped against the wall of our 400°C clay oven, our breads emerge blistered, pillowy, and piping hot—perfect for soaking up rich curries.'
  },
  bread: {
    title: 'Tandoori Breads',
    text: 'No feast is complete without bread. Slapped against the wall of our 400°C clay oven, our breads emerge blistered, pillowy, and piping hot—perfect for soaking up rich curries.'
  },
  naan_n_roti: {
    title: 'Tandoori Breads',
    text: 'No feast is complete without bread. Slapped against the wall of our 400°C clay oven, our breads emerge blistered, pillowy, and piping hot—perfect for soaking up rich curries.'
  },
  lahori_kulchas: {
    title: 'Lahori Kulchas',
    text: 'Authentic leavened flatbreads stuffed with spicy potato, onion, or paneer fillings, baked to golden perfection and brushed with pure ghee.'
  },
  kulchas: {
    title: 'Lahori Kulchas',
    text: 'Authentic leavened flatbreads stuffed with spicy potato, onion, or paneer fillings, baked to golden perfection and brushed with pure ghee.'
  },
  parathas: {
    title: 'Stuffed Parathas',
    text: 'Flaky, layered whole wheat flatbreads stuffed with rich fillings and griddled with fresh butter. A hearty Punjabi classic.'
  },

  // Drinks
  drinks: {
    title: 'Mashroob-e-Khaas (مشروبِ خاص)',
    text: 'Refreshing traditional coolers, handcrafted sweet and salty lassis, and freshly brewed hot Karak Chai to complete your dining experience.'
  },

  // Desserts
  desserts: {
    title: 'Dessert (میٹھا)',
    text: 'Authentic South Asian desserts made in-house. From deeply caramelized Gajar Halwa to warm, syrupy Gulab Jamun—the perfect conclusion to a spicy meal.'
  }
};