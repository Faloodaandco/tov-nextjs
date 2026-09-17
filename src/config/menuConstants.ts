/**
 * Menu category definitions for display ordering and labeling.
 * Used by the menu page to organize items into sections.
 */

export interface MenuCategoryDef {
  id: string;
  label: string;
  emoji?: string;
}

export const MENU_CATEGORIES: MenuCategoryDef[] = [
  { id: 'popular', label: 'Popular', emoji: '🔥' },
  { id: 'breakfast___desi_nashta', label: 'Breakfast / Desi Nashta', emoji: '🌅' },
  { id: 'village_brunch_special', label: 'Village Brunch Special', emoji: '🍳' },
  { id: 'grill___bbq', label: 'Grill & BBQ', emoji: '🥩' },
  { id: 'karahi', label: 'Karahi', emoji: '🍲' },
  { id: 'desi_handi', label: 'Desi Handi', emoji: '🥘' },
  { id: 'biryani', label: 'Biryani', emoji: '🍚' },
  { id: 'rice', label: 'Rice', emoji: '🍚' },
  { id: 'naan___roti', label: 'Naan & Roti', emoji: '🫓' },
  { id: 'chaat', label: 'Chaat', emoji: '🥟' },
  { id: 'starters___sides', label: 'Starters & Sides', emoji: '🥗' },
  { id: 'falooda', label: 'Falooda', emoji: '🍨' },
  { id: 'milkshakes', label: 'Milkshakes', emoji: '🥤' },
  { id: 'hot_drinks', label: 'Hot Drinks', emoji: '☕' },
  { id: 'cold_drinks', label: 'Cold Drinks', emoji: '🧊' },
  { id: 'desserts', label: 'Desserts', emoji: '🍰' },
  { id: 'deals', label: 'Deals', emoji: '🎁' },
];

export const DIETARY_TAGS = ['halal', 'vegetarian', 'vegan', 'gluten-free', 'spicy'] as const;
export type DietaryTag = (typeof DIETARY_TAGS)[number];

/**
 * Get display label for a category ID.
 */
export function getCategoryLabel(categoryId: string): string {
  const found = MENU_CATEGORIES.find((c) => c.id === categoryId);
  if (found) return found.label;
  // Fallback: convert snake_case to Title Case
  return categoryId
    .replace(/___/g, ' / ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
