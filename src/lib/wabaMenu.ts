/**
 * WhatsApp Menu Helpers — loads tov-menu.json (Hayes) and tov-menu-slough.json (Slough)
 * and provides lookup / formatting utilities for WhatsApp List messages.
 *
 * Branch-aware: all public functions accept an optional branchId parameter.
 * When branchId is 'slough', items from the Slough menu are used.
 * Default is 'hayes' for backward compatibility.
 *
 * Marketing psychology applied:
 * - Price anchoring: high-AOV platters/karahi listed first
 * - Social proof: "Most Popular" / "Chef's Pick" in descriptions
 * - Bridge items: low-cost impulse adds surfaced contextually
 */

import hayesMenuItems from '@/data/tov-menu.json';
import sloughMenuItems from '@/data/tov-menu-slough.json';
import type { LocationId } from '@/config/shopConfig';

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

// ── Menu Data Per Branch ─────────────────────────────────────────────
const hayesMenu: MenuItem[] = hayesMenuItems as MenuItem[];
const sloughMenu: MenuItem[] = sloughMenuItems as MenuItem[];

const MENUS: Record<string, MenuItem[]> = {
  hayes: hayesMenu,
  slough: sloughMenu,
};

/** Get the menu array for a branch. Defaults to hayes. */
function getMenu(branchId?: LocationId | string): MenuItem[] {
  return MENUS[branchId || 'hayes'] || hayesMenu;
}

// ── Category Groups — Branch-Specific ────────────────────────────────
// Hayes: original TOV menu with Lahori/Desi focus
const HAYES_SECTIONS = [
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

// Slough: 10 sections (WhatsApp max 10 rows per list message)
const SLOUGH_SECTIONS = [
  { id: 'cat_breakfast', title: '🌅 Breakfast & Desi Nashta', categories: ['breakfast___desi_nashta'] },
  { id: 'cat_mains', title: '🍛 Village Classics', categories: ['mains___village_classics'] },
  { id: 'cat_signature', title: '⭐ Specials & Signatures', categories: ['signature_dishes', 'weekend_specials'] },
  { id: 'cat_grill', title: '🔥 Starters & Charcoal Grill', categories: ['starters_n_charcoal_grill'] },
  { id: 'cat_platters', title: '👑 Family Platters', categories: ['family_platters'] },
  { id: 'cat_roast', title: '🍖 Sunday Roast', categories: ['sunday_roast'] },
  { id: 'cat_veg', title: '🥬 Vegetarian Mains', categories: ['vegetarian_mains'] },
  { id: 'cat_breads', title: '🫓 Naan, Bread & Rice', categories: ['naan_n_bread', 'rice_specials'] },
  { id: 'cat_desserts', title: '🍨 Desserts & Drinks', categories: ['desserts', 'soft_drinks', 'mocktails_n_lassi'] },
  { id: 'cat_sides', title: '🥗 Sides, Salads & Kids', categories: ['salads', 'sides_n_sauces', 'kids_meal'] },
];

const BRANCH_SECTIONS: Record<string, typeof HAYES_SECTIONS> = {
  hayes: HAYES_SECTIONS,
  slough: SLOUGH_SECTIONS,
};

/** Get menu sections for a branch. */
export function getMenuSections(branchId?: LocationId | string) {
  return BRANCH_SECTIONS[branchId || 'hayes'] || HAYES_SECTIONS;
}

// Legacy export for backward compat
export const MENU_SECTIONS = HAYES_SECTIONS;

// ── Social Proof Tags ────────────────────────────────────────────────
const SOCIAL_PROOF: Record<string, string> = {
  // Hayes
  'chicken_karahi': '🔥 Most Popular',
  'lamb_karahi': '⭐ Customer Favourite',
  'butter_chicken': '🔥 Best Seller',
  'lamb_rogan_josh': '⭐ Chef\'s Pick',
  'chicken_biryani': '🔥 Most Ordered',
  'seekh_kebab': '⭐ Grill Favourite',
  'chicken_tikka': '🔥 Must Try',
  'village_special_platter': '👑 Best Value',
  'bbq_mix_platter': '🔥 Feeds the Family',
  // Slough
  'tov_slough_special_nihari': '🔥 Signature Dish',
  'tov_slough_chicken_charsi_karahi': '⭐ Customer Favourite',
  'tov_slough_seabass_fillet': '👑 Chef\'s Special',
  'tov_slough_lamb_skewers': '🔥 Must Try',
  'tov_slough_afghani_pulao': '⭐ Most Ordered',
  'tov_slough_partner_grill_feast': '👑 Best Value',
};

// ── Categories that qualify for "Make it a Meal" upsell ──────────────
const CURRY_CATEGORIES = new Set([
  'karahi_e_khaas', 'curries_salan_se', 'desi_handi',
  'mains___village_classics', 'signature_dishes',
]);

const BREAD_CATEGORIES = new Set([
  'naan_n_roti', 'parathas', 'lahori_kulchas',
  'naan_n_bread',
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
export function getItemsBySection(sectionId: string, branchId?: LocationId | string): MenuItem[] {
  const sections = getMenuSections(branchId);
  const menu = getMenu(branchId);
  const section = sections.find(s => s.id === sectionId);
  if (!section) return [];
  return menu
    .filter(item => (section.categories as readonly string[]).includes(item.category))
    .sort((a, b) => b.price - a.price); // Price anchoring: expensive first
}

/** Look up a single item by its ID. Searches both menus for resilience. */
export function getMenuItemById(itemId: string, branchId?: LocationId | string): MenuItem | undefined {
  const primaryMenu = getMenu(branchId);
  const found = primaryMenu.find(item => item.id === itemId);
  if (found) return found;
  // Fallback: search the other menu (handles cross-branch cart items)
  const otherMenu = branchId === 'slough' ? hayesMenu : sloughMenu;
  return otherMenu.find(item => item.id === itemId);
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
export function buildMenuCategorySections(carriedCart?: string, branchId?: LocationId | string) {
  const sections = getMenuSections(branchId);
  // Encode branch + cart into row ID: cat_xxx~cart~branch (branch at the END for easy extraction)
  const branchTag = branchId || 'hayes';
  const suffix = carriedCart ? `~${carriedCart}~${branchTag}` : `~~${branchTag}`;
  return [{
    title: 'Menu Categories',
    rows: sections.map(section => {
      const items = getItemsBySection(section.id, branchId);
      const count = items.length;
      if (count === 0) return null;
      const priceRange = count > 0
        ? `${formatPrice(items[items.length - 1].price)}–${formatPrice(items[0].price)}`
        : '';
      return {
        id: `${section.id}${suffix}`.slice(0, 200),
        title: section.title.slice(0, 24),
        description: `${count} items • ${priceRange}`.slice(0, 72),
      };
    }).filter(Boolean),
  }];
}

/** Build item rows for a category section (max 10 per WhatsApp limit). */
export function buildItemListRows(sectionId: string, carriedCart?: string, branchId?: LocationId | string) {
  const pureSectionId = sectionId.split('~')[0];
  const items = getItemsBySection(pureSectionId, branchId);
  const suffix = carriedCart ? `~${carriedCart}` : '';
  return items.slice(0, 10).map(item => {
    const proof = getSocialProof(item.id);
    const desc = proof
      ? `${formatPrice(item.price)} • ${proof}`
      : `${formatPrice(item.price)}`;
    return {
      id: `${item.id}${suffix}`.slice(0, 200),
      title: item.name.slice(0, 24),
      description: desc.slice(0, 72),
    };
  });
}

/** Find the section title for a given section ID. */
export function getSectionTitle(sectionId: string, branchId?: LocationId | string): string {
  const pureSectionId = sectionId.split('~')[0];
  const sections = getMenuSections(branchId);
  return sections.find(s => s.id === pureSectionId)?.title || 'Menu';
}

/**
 * Match user text to a menu category section.
 * Branch-aware: Slough has different categories (breakfast, Sunday roast, etc.)
 */
export function findMatchingCategory(query: string, branchId?: LocationId | string): { id: string; title: string } | null {
  const q = query.toLowerCase().trim();
  const isSlough = branchId === 'slough';

  // Slough-specific categories
  if (isSlough) {
    if (/\b(breakfast|nashta|brunch|nihari|haleem|paya|paye)/.test(q)) {
      return { id: 'cat_breakfast', title: '🌅 Breakfast & Desi Nashta' };
    }
    if (/\b(roast|sunday|beef roast|lamb roast)/.test(q)) {
      return { id: 'cat_roast', title: '🍖 Sunday Roast' };
    }
    if (/\b(signature|seabass|special)/.test(q)) {
      return { id: 'cat_signature', title: '⭐ Specials & Signatures' };
    }
    if (/\b(starter|grill|skewer|tikka|kebab|seekh|chops|charcoal|bbq|tandoor)/.test(q)) {
      return { id: 'cat_grill', title: '🔥 Starters & Charcoal Grill' };
    }
    if (/\b(karahi|curry|curries|handi|classic|main|charsi)/.test(q)) {
      return { id: 'cat_mains', title: '🍛 Village Classics' };
    }
    if (/\b(platter|feast|family)/.test(q)) {
      return { id: 'cat_platters', title: '👑 Family Platters' };
    }
    if (/\b(veg|vegetarian|daal|paneer|mushroom)/.test(q)) {
      return { id: 'cat_veg', title: '🥬 Vegetarian Mains' };
    }
    if (/\b(naan|roti|bread|kulcha|paratha|rice|biryani|pulao|pilau|afghani)/.test(q)) {
      return { id: 'cat_breads', title: '🫓 Naan, Bread & Rice' };
    }
    if (/\b(salad|sauce|side|raita|chutney|kid|child|nugget|fries)/.test(q)) {
      return { id: 'cat_sides', title: '🥗 Sides, Salads & Kids' };
    }
    if (/\b(dessert|kheer|gulab jamun|sweet|halwa|gajar|drink|coke|fanta|sprite|water|lassi|mocktail|mint|mango)/.test(q)) {
      return { id: 'cat_desserts', title: '🍨 Desserts & Drinks' };
    }
    return null;
  }

  // Hayes categories (unchanged)
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
 * Returns up to 10 matching MenuItem objects.
 */
export function searchMenuDishes(query: string, branchId?: LocationId | string): MenuItem[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 3) return [];

  const stopwords = new Set([
    'hi', 'hello', 'hey', 'hiya', 'salam', 'assalam', 'yo',
    'want', 'need', 'give', 'some', 'please', 'like', 'have', 'the', 'and', 'with', 'for',
    'menu', 'order', 'buy', 'eat', 'get', 'from', 'show', 'see', 'browse',
    'slough', 'hayes', 'farnham', 'uxbridge', 'branch', 'delivery', 'collection',
  ]);
  const words = q.split(/\s+/).filter(w => w.length >= 3 && !stopwords.has(w));
  if (words.length === 0) return [];

  const menu = getMenu(branchId);
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
 * Curate the #1 customer favorite when someone mentions a broad food type.
 * Branch-aware: different hero items per branch.
 */
export function getCuratedDish(query: string, branchId?: LocationId | string): CuratedRecommendation | null {
  const q = query.toLowerCase().trim();
  const menu = getMenu(branchId);
  const isSlough = branchId === 'slough';

  // Biryani/Pulao
  if (/\b(biryani|pulao)\b/.test(q)) {
    const item = isSlough
      ? menu.find(i => i.id === 'tov_slough_afghani_pulao') || menu.find(i => i.name.toLowerCase().includes('pulao'))
      : menu.find(i => i.id === 'chicken_biryani') || menu.find(i => i.name.toLowerCase().includes('chicken biryani')) || menu.find(i => i.category === 'biryani_and_rice');
    if (item) {
      return { item, categoryId: isSlough ? 'cat_rice' : 'cat_biryani', categoryTitle: isSlough ? 'Other Rice Dishes' : 'Other Biryanis' };
    }
  }

  // Karahi
  if (/\b(karahi)\b/.test(q)) {
    const item = isSlough
      ? menu.find(i => i.id === 'tov_slough_chicken_charsi_karahi') || menu.find(i => i.name.toLowerCase().includes('karahi'))
      : menu.find(i => i.id === 'chicken_karahi') || menu.find(i => i.name.toLowerCase().includes('chicken karahi')) || menu.find(i => i.category === 'karahi_e_khaas');
    if (item) {
      return { item, categoryId: isSlough ? 'cat_mains' : 'cat_karahi', categoryTitle: isSlough ? 'Other Village Classics' : 'Other Karahis' };
    }
  }

  // Nihari / Paya (Slough breakfast focus)
  if (isSlough && /\b(nihari|paya|haleem)\b/.test(q)) {
    const item = menu.find(i => i.id === 'tov_slough_special_nihari') || menu.find(i => i.name.toLowerCase().includes('nihari'));
    if (item) {
      return { item, categoryId: 'cat_breakfast', categoryTitle: 'Other Breakfast Items' };
    }
  }

  // Sunday Roast (Slough only)
  if (isSlough && /\b(roast|sunday)\b/.test(q)) {
    const item = menu.find(i => i.category === 'sunday_roast');
    if (item) {
      return { item, categoryId: 'cat_roast', categoryTitle: 'Other Roast Options' };
    }
  }

  // Mixed Grill / BBQ Platters
  if (/\b(mixed grill|platter|feasts?)\b/.test(q)) {
    const item = isSlough
      ? menu.find(i => i.id === 'tov_slough_partner_grill_feast') || menu.find(i => i.name.toLowerCase().includes('platter'))
      : menu.find(i => i.id === 'village_special_platter') || menu.find(i => i.name.toLowerCase().includes('platter'));
    if (item) {
      return { item, categoryId: 'cat_platters', categoryTitle: 'Other Platters' };
    }
  }

  // Kebab / Grill / Tikka
  if (/\b(kebab|bbq|tikka|grill|chops?)\b/.test(q)) {
    const item = isSlough
      ? menu.find(i => i.id === 'tov_slough_lamb_skewers') || menu.find(i => i.name.toLowerCase().includes('skewer'))
      : menu.find(i => i.id === 'seekh_kebab') || menu.find(i => i.id === 'chicken_tikka') || menu.find(i => i.name.toLowerCase().includes('tikka'));
    if (item) {
      return { item, categoryId: isSlough ? 'cat_grill' : 'cat_bbq', categoryTitle: isSlough ? 'Other Grills' : 'Other Grills' };
    }
  }

  // Butter chicken / Curry
  if (/\b(butter chicken)\b/.test(q)) {
    const item = menu.find(i => i.id === 'butter_chicken') || menu.find(i => i.name.toLowerCase().includes('butter chicken'));
    if (item) {
      return { item, categoryId: isSlough ? 'cat_mains' : 'cat_curries', categoryTitle: isSlough ? 'Other Village Classics' : 'Other Curries' };
    }
  }

  return null;
}
