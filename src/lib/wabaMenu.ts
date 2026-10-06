/**
 * WhatsApp Menu Helpers — loads tov-menu.json and provides
 * lookup / formatting utilities for WhatsApp List messages.
 *
 * Single source of truth: both the website and WhatsApp bot
 * read from the same menu data file.
 *
 * Marketing psychology applied:
 * - Price anchoring: high-AOV platters/karahi listed first
 * - Social proof: "Most Popular" / "Chef's Pick" in descriptions
 * - Bridge items: low-cost impulse adds surfaced contextually
 */

import menuItems from '@/data/tov-menu.json';

// ── Types ────────────────────────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string[];
  originalPrice: number;
  category: string;
  image: string;
  popular: boolean;
  dineInPrice: number;
}

// ── Category Groups — ORDERED BY AOV (anchoring: expensive first) ────
export const MENU_SECTIONS = [
  { id: 'cat_platters', title: '👑 Feasts & Platters', categories: ['village_special_platters', 'weekend_special', 'village_brunch_special'] },
  { id: 'cat_karahi', title: '🔥 Karahi E Khaas', categories: ['karahi_e_khaas'] },
  { id: 'cat_curries', title: '🍛 Curries & Handi', categories: ['curries_salan_se', 'desi_handi'] },
  { id: 'cat_bbq', title: '🔥 BBQ & Tandoor', categories: ['bbq_tandoor_se', 'bbq_platter'] },
  { id: 'cat_biryani', title: '🍚 Biryani & Rice', categories: ['biryani_and_rice'] },
  { id: 'cat_rolls', title: '🌯 Rolls & Burgers', categories: ['rolls', 'burgers'] },
  { id: 'cat_breads', title: '🫓 Naan, Roti & Kulcha', categories: ['naan_n_roti', 'parathas', 'lahori_kulchas'] },
  { id: 'cat_fried', title: '⚡ Chatkhara & Fried', categories: ['talaa_hua_zaiqah', 'chatkara_junction'] },
  { id: 'cat_desserts', title: '🍨 Desserts', categories: ['desserts'] },
  { id: 'cat_specials', title: '🌟 Weekend Specials', categories: ['weekend_special'] },
];

const menu: MenuItem[] = menuItems as MenuItem[];

// ── Social Proof Tags ────────────────────────────────────────────────
// Hardcoded "most popular" items based on category bestsellers.
// These override the `popular` field from tov-menu.json (which is all false).
const SOCIAL_PROOF: Record<string, string> = {
  // Karahi
  'chicken_karahi': '🔥 Most Popular',
  'lamb_karahi': '⭐ Customer Favourite',
  // Curries
  'butter_chicken': '🔥 Best Seller',
  'lamb_rogan_josh': '⭐ Chef\'s Pick',
  // Biryani
  'chicken_biryani': '🔥 Most Ordered',
  // BBQ
  'seekh_kebab': '⭐ Grill Favourite',
  'chicken_tikka': '🔥 Must Try',
  // Platters
  'village_special_platter': '👑 Best Value',
  'bbq_mix_platter': '🔥 Feeds the Family',
};

// ── Categories that qualify for "Make it a Meal" upsell ──────────────
const CURRY_CATEGORIES = new Set([
  'karahi_e_khaas', 'curries_salan_se', 'desi_handi',
]);

const BREAD_CATEGORIES = new Set([
  'naan_n_roti', 'parathas', 'lahori_kulchas',
]);

// ── Meal Deal Config ─────────────────────────────────────────────────
export const MEAL_DEAL = {
  extraPricePence: 295, // +£2.95
  savings: '£2.50',
  includes: 'Butter Naan + Pilau Rice + Can Drink',
  items: [
    { id: 'meal_naan', name: 'Butter Naan (Meal)', pricePence: 99 },
    { id: 'meal_rice', name: 'Pilau Rice (Meal)', pricePence: 149 },
    { id: 'meal_drink', name: 'Can Drink (Meal)', pricePence: 47 },
  ],
};

// ── Bridge Items (low-cost impulse upsells) ──────────────────────────
export const BRIDGE_ITEMS = [
  { id: 'veg_samosa', name: 'Veg Samosa', pricePence: 499, emoji: '🥟' },
  { id: 'mango_lassi', name: 'Mango Lassi', pricePence: 250, emoji: '🥭' },
  { id: 'pilau_rice', name: 'Pilau Rice', pricePence: 449, emoji: '🍚' },
  { id: 'raita', name: 'Fresh Raita', pricePence: 120, emoji: '🥒' },
];

// ── Lookups ──────────────────────────────────────────────────────────

/** Get all items in a category section, sorted: expensive first (anchoring). */
export function getItemsBySection(sectionId: string): MenuItem[] {
  const section = MENU_SECTIONS.find(s => s.id === sectionId);
  if (!section) return [];
  return menu
    .filter(item => (section.categories as readonly string[]).includes(item.category))
    .sort((a, b) => b.price - a.price); // Price anchoring: expensive first
}

/** Look up a single item by its ID (matches tov-menu.json and catalog product_retailer_id). */
export function getMenuItemById(itemId: string): MenuItem | undefined {
  return menu.find(item => item.id === itemId);
}

/** Format a price in GBP. */
export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

/** Check if a menu item is a curry (qualifies for meal deal upsell). */
export function isCurryItem(item: MenuItem): boolean {
  return CURRY_CATEGORIES.has(item.category);
}

/** Check if a cart has any bread items. */
export function cartHasBread(itemIds: string[]): boolean {
  return itemIds.some(id => {
    const item = getMenuItemById(id);
    return item && BREAD_CATEGORIES.has(item.category);
  });
}

/** Get social proof tag for an item, if any. */
function getSocialProof(itemId: string): string {
  return SOCIAL_PROOF[itemId] || '';
}

/** Build a free delivery progress bar (text-based for WhatsApp). */
export function buildDeliveryProgressBar(currentPence: number, thresholdPence: number): string {
  if (thresholdPence <= 0) return '';
  const ratio = Math.min(currentPence / thresholdPence, 1);
  const filled = Math.round(ratio * 10);
  const empty = 10 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);

  if (ratio >= 1) {
    return `🛵 Free Delivery: [${bar}] ✅ *UNLOCKED!* 🎉`;
  }
  const remaining = formatPrice((thresholdPence - currentPence) / 100);
  return `🛵 Free Delivery: [${bar}] ${formatPrice(currentPence / 100)}/${formatPrice(thresholdPence / 100)}\n💡 Add *${remaining}* more for *FREE delivery!*`;
}

// ── WhatsApp List Builders ───────────────────────────────────────────

/** Build the top-level category list for the "Browse Menu" action. */
export function buildMenuCategorySections() {
  return [{
    title: 'Menu Categories',
    rows: MENU_SECTIONS.map(section => {
      const items = getItemsBySection(section.id);
      const count = items.length;
      if (count === 0) return null;
      const priceRange = count > 0
        ? `${formatPrice(items[items.length - 1].price)}–${formatPrice(items[0].price)}`
        : '';
      return {
        id: section.id,
        title: section.title.slice(0, 24),
        description: `${count} items • ${priceRange}`.slice(0, 72),
      };
    }).filter(Boolean),
  }];
}

/** Build item rows for a category section (max 10 per WhatsApp limit). */
export function buildItemListRows(sectionId: string) {
  const items = getItemsBySection(sectionId);
  return items.slice(0, 10).map(item => {
    const proof = getSocialProof(item.id);
    const desc = proof
      ? `${formatPrice(item.price)} • ${proof}`
      : `${formatPrice(item.price)}`;
    return {
      id: item.id,
      title: item.name.slice(0, 24),
      description: desc.slice(0, 72),
    };
  });
}

/** Find the section title for a given section ID. */
export function getSectionTitle(sectionId: string): string {
  return MENU_SECTIONS.find(s => s.id === sectionId)?.title || 'Menu';
}

/**
 * Match user text to a menu category section.
 * Handles queries like 'I biryani', 'need karahi', 'kebab', 'naan', etc.
 */
export function findMatchingCategory(query: string): { id: string; title: string } | null {
  const q = query.toLowerCase().trim();

  if (/\b(biryani|rice|pulao|pilau)\b/.test(q)) {
    return { id: 'cat_biryani', title: '🍚 Biryani & Rice' };
  }
  if (/\b(karahi|wok)\b/.test(q)) {
    return { id: 'cat_karahi', title: '🔥 Karahi E Khaas' };
  }
  if (/\b(curry|curries|salan|handi|daal|korma|masala|butter chicken|paneer)\b/.test(q)) {
    return { id: 'cat_curries', title: '🍛 Curries & Handi' };
  }
  if (/\b(bbq|grill|tikka|kebab|seekh|chops|tandoor)\b/.test(q)) {
    return { id: 'cat_bbq', title: '🔥 BBQ & Tandoor' };
  }
  if (/\b(naan|roti|bread|kulcha|paratha)\b/.test(q)) {
    return { id: 'cat_breads', title: '🫓 Naan, Roti & Kulcha' };
  }
  if (/\b(platter|feast|family|deal|special)\b/.test(q)) {
    return { id: 'cat_platters', title: '👑 Feasts & Platters' };
  }
  if (/\b(burger|roll|wrap)\b/.test(q)) {
    return { id: 'cat_rolls', title: '🌯 Rolls & Burgers' };
  }
  if (/\b(dessert|kheer|gulab jamun|sweet|chaat|gol gappa|pani puri)\b/.test(q)) {
    return { id: 'cat_desserts', title: '🍨 Desserts' };
  }
  if (/\b(samosa|pakora|wings|fried|chana)\b/.test(q)) {
    return { id: 'cat_fried', title: '⚡ Chatkhara & Fried' };
  }
  if (/\b(weekend|nihari|halwa|puri|paye|brunch)\b/.test(q)) {
    return { id: 'cat_specials', title: '🌟 Weekend Specials' };
  }
  return null;
}

/**
 * Search dishes across item names and descriptions.
 * Returns up to 10 matching MenuItem objects with formatted list rows.
 */
export function searchMenuDishes(query: string): MenuItem[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return [];

  const stopwords = new Set([
    'hi', 'hello', 'hey', 'hiya', 'salam', 'assalam', 'yo',
    'want', 'need', 'give', 'some', 'please', 'like', 'have', 'the', 'and', 'with', 'for'
  ]);
  const words = q.split(/\s+/).filter(w => w.length >= 3 && !stopwords.has(w));
  if (words.length === 0) return [];

  return menu.filter(item => {
    const nameLower = item.name.toLowerCase();
    const catLower = item.category.toLowerCase();
    const descLower = item.description?.toLowerCase() || '';

    return words.some(w => nameLower.includes(w) || catLower.includes(w) || descLower.includes(w));
  }).slice(0, 10);
}

export interface CuratedRecommendation {
  item: MenuItem;
  categoryId: string;
  categoryTitle: string;
}

/**
 * Curate the #1 customer favorite when someone mentions a broad food type (e.g. 'I biryani', 'karahi', 'grill')
 * to close the transaction immediately without forcing endless category navigation.
 */
export function getCuratedDish(query: string): CuratedRecommendation | null {
  const q = query.toLowerCase().trim();

  // Biryani -> Chicken Biryani
  if (/\b(biryani|pulao)\b/.test(q)) {
    const item = menu.find(i => i.id === 'chicken_biryani')
      || menu.find(i => i.name.toLowerCase().includes('chicken biryani'))
      || menu.find(i => i.category === 'biryani_and_rice');
    if (item) {
      return { item, categoryId: 'cat_biryani', categoryTitle: '📋 Other Biryanis' };
    }
  }

  // Karahi -> Chicken Karahi
  if (/\b(karahi)\b/.test(q)) {
    const item = menu.find(i => i.id === 'chicken_karahi')
      || menu.find(i => i.name.toLowerCase().includes('chicken karahi'))
      || menu.find(i => i.category === 'karahi_e_khaas');
    if (item) {
      return { item, categoryId: 'cat_karahi', categoryTitle: '📋 Other Karahis' };
    }
  }

  // Mixed Grill / BBQ Platters
  if (/\b(mixed grill|platter|feasts?)\b/.test(q)) {
    const item = menu.find(i => i.id === 'village_special_platter')
      || menu.find(i => i.name.toLowerCase().includes('platter'));
    if (item) {
      return { item, categoryId: 'cat_platters', categoryTitle: '📋 Other Platters' };
    }
  }

  // Kebab / Grill / Tikka
  if (/\b(kebab|bbq|tikka|grill|chops?)\b/.test(q)) {
    const item = menu.find(i => i.id === 'seekh_kebab')
      || menu.find(i => i.id === 'chicken_tikka')
      || menu.find(i => i.name.toLowerCase().includes('tikka'));
    if (item) {
      return { item, categoryId: 'cat_bbq', categoryTitle: '📋 Other Grills' };
    }
  }

  // Butter chicken / Curry
  if (/\b(butter chicken)\b/.test(q)) {
    const item = menu.find(i => i.id === 'butter_chicken')
      || menu.find(i => i.name.toLowerCase().includes('butter chicken'));
    if (item) {
      return { item, categoryId: 'cat_curries', categoryTitle: '📋 Other Curries' };
    }
  }

  return null;
}
