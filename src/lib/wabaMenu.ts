/**
 * WhatsApp Menu Helpers — loads tov-menu.json and provides
 * lookup / formatting utilities for WhatsApp List messages.
 *
 * Single source of truth: both the website and WhatsApp bot
 * read from the same menu data file.
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

// ── Category Groups (17 raw categories → 10 WhatsApp List rows) ────
export const MENU_SECTIONS = [
  { id: 'cat_karahi', title: '🔥 Karahi E Khaas', categories: ['karahi_e_khaas'] },
  { id: 'cat_curries', title: '🥘 Curries / Salan Se', categories: ['curries_salan_se'] },
  { id: 'cat_bbq', title: '🍢 BBQ & Tandoor', categories: ['bbq_tandoor_se', 'bbq_platter'] },
  { id: 'cat_biryani', title: '🍚 Biryani & Rice', categories: ['biryani_and_rice'] },
  { id: 'cat_handi', title: '🫕 Desi Handi', categories: ['desi_handi'] },
  { id: 'cat_burgers', title: '🍔 Burgers & Rolls', categories: ['burgers', 'rolls'] },
  { id: 'cat_breads', title: '🫓 Breads & Kulcha', categories: ['naan_n_roti', 'parathas', 'lahori_kulchas'] },
  { id: 'cat_fried', title: '🍟 Talaa Hua Zaiqah', categories: ['talaa_hua_zaiqah'] },
  { id: 'cat_platters', title: '🍽️ Platters & Specials', categories: ['village_special_platters', 'weekend_special', 'village_brunch_special'] },
  { id: 'cat_desserts', title: '🍨 Desserts & Chaat', categories: ['desserts', 'chatkara_junction'] },
];

const menu: MenuItem[] = menuItems as MenuItem[];

// ── Lookups ──────────────────────────────────────────────────────────

/** Get all items in a category section, popular first. */
export function getItemsBySection(sectionId: string): MenuItem[] {
  const section = MENU_SECTIONS.find(s => s.id === sectionId);
  if (!section) return [];
  return menu
    .filter(item => (section.categories as readonly string[]).includes(item.category))
    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
}

/** Look up a single item by its ID (matches tov-menu.json and catalog product_retailer_id). */
export function getMenuItemById(itemId: string): MenuItem | undefined {
  return menu.find(item => item.id === itemId);
}

/** Format a price in GBP. */
export function formatPrice(price: number): string {
  return `£${price.toFixed(2)}`;
}

// ── WhatsApp List Builders ───────────────────────────────────────────

/** Build the top-level category list for the "Browse Menu" action. */
export function buildMenuCategorySections() {
  return [{
    title: 'Menu Categories',
    rows: MENU_SECTIONS.map(section => {
      const count = getItemsBySection(section.id).length;
      return {
        id: section.id,
        title: section.title.slice(0, 24),
        description: `${count} item${count !== 1 ? 's' : ''}`,
      };
    }),
  }];
}

/** Build item rows for a category section (max 10 per WhatsApp limit). */
export function buildItemListRows(sectionId: string) {
  const items = getItemsBySection(sectionId);
  return items.slice(0, 10).map(item => ({
    id: item.id,
    title: item.name.slice(0, 24),
    description: `${formatPrice(item.price)}${item.popular ? ' ⭐' : ''}`.slice(0, 72),
  }));
}

/** Find the section title for a given section ID. */
export function getSectionTitle(sectionId: string): string {
  return MENU_SECTIONS.find(s => s.id === sectionId)?.title || 'Menu';
}
