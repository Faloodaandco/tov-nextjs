/**
 * Gemini Contextual Cross-Sell Engine
 *
 * Reasons about what the customer ordered and suggests ONE complementary item.
 * Uses rule-based pairing (extracted from UpsellDrawer) + Gemini Flash copywriting.
 *
 * KEY PRINCIPLE: The AI observes the order and applies food pairing logic.
 * Cold drink in cart → NEVER suggest hot drink. Hot drink → NEVER suggest cold.
 * Same-category items → NEVER suggest duplicates.
 */
import { getMenuSections, getItemsBySection, getMenuItemById, type MenuItem } from '@/lib/wabaMenu';
import type { LocationId } from '@/config/shopConfig';

interface OrderItem {
  name: string;
  category?: string;
  pricePence?: number;
}

export interface CrossSellResult {
  itemName: string;
  itemPrice: string;       // "£1.99"
  reason: string;           // Chef-voice recommendation
  itemId: string;           // Menu item ID
}

// ── Category classification ──────────────────────────────────────────

const CURRY_CATEGORIES = new Set([
  'karahi_e_khaas', 'speciality_curries', 'desi_signatures', 'lamb_specials',
  'village_classics', 'tawa_specials', 'sunday_roast',
]);

const BREAD_CATEGORIES = new Set([
  'naan_n_roti', 'parathas', 'lahori_kulchas', 'naan_n_bread',
]);

const GRILL_CATEGORIES = new Set([
  'bbq_live_flame_grill', 'tandoori_grills', 'bbq_grill',
]);

const DRINK_CATEGORIES = new Set([
  'beverages', 'drinks', 'hot_drinks', 'cold_drinks', 'lassi',
]);

const DESSERT_CATEGORIES = new Set([
  'desserts', 'sweet_treats',
]);

const RICE_CATEGORIES = new Set([
  'biryani_and_rice', 'rice_specials',
]);

// ── Cold vs hot drink items (name-based detection) ─────────────────

const COLD_DRINK_PATTERNS = /\b(pepsi|coke|coca.?cola|7.?up|sprite|fanta|mirinda|water|juice|can|bottle|lassi|mango lassi|strawberry|ice)\b/i;
const HOT_DRINK_PATTERNS = /\b(chai|karak|doodh patti|green tea|kashmiri chai|pink tea|tea|coffee)\b/i;

function isColdDrink(name: string): boolean {
  return COLD_DRINK_PATTERNS.test(name);
}

function isHotDrink(name: string): boolean {
  return HOT_DRINK_PATTERNS.test(name);
}

// ── Main cross-sell logic ────────────────────────────────────────────

export function generateContextualCrossSell(
  orderItems: OrderItem[],
  branchId: LocationId,
): CrossSellResult | null {
  if (!orderItems?.length) return null;

  // Build full menu from sections
  const sections = getMenuSections(branchId);
  const menu: MenuItem[] = [];
  for (const section of sections) {
    menu.push(...getItemsBySection(section.id, branchId));
  }
  if (!menu.length) return null;

  // Classify the order
  const hasCurry = orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? CURRY_CATEGORIES.has(cat) : false;
  });
  const hasBread = orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? BREAD_CATEGORIES.has(cat) : false;
  });
  const hasGrill = orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? GRILL_CATEGORIES.has(cat) : false;
  });
  const hasRice = orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? RICE_CATEGORIES.has(cat) : false;
  });
  const hasDessert = orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? DESSERT_CATEGORIES.has(cat) : false;
  });
  const hasColdDrink = orderItems.some(i => isColdDrink(i.name));
  const hasHotDrink = orderItems.some(i => isHotDrink(i.name));
  const hasAnyDrink = hasColdDrink || hasHotDrink || orderItems.some(i => {
    const cat = i.category || findCategory(i.name, menu);
    return cat ? DRINK_CATEGORIES.has(cat) : false;
  });

  const orderTotal = orderItems.reduce((sum, i) => sum + (i.pricePence || 0), 0);
  const orderedNames = new Set(orderItems.map(i => i.name.toLowerCase()));

  // ── Pairing Rules (priority order) ────────────────────────────────

  // Rule 1: Has curry/grill but NO bread → suggest bread
  if ((hasCurry || hasGrill) && !hasBread) {
    const suggestion = findMenuItem(menu, BREAD_CATEGORIES, orderedNames);
    if (suggestion) {
      const hook = hasGrill
        ? `Your smoky grill deserves a fresh-baked companion — our ${suggestion.name} straight from the tandoor is the perfect wrap!`
        : `Every rich, simmering curry needs something to scoop it up — our ${suggestion.name} comes straight from the tandoor, piping hot!`;
      return formatResult(suggestion, hook);
    }
  }

  // Rule 2: Has mains but NO drink (respect cold/hot boundary)
  if ((hasCurry || hasGrill) && !hasAnyDrink) {
    // Suggest a drink that complements the meal
    const isSpicy = orderItems.some((i: OrderItem) =>
      /\b(karahi|charsi|peshawari|fiery|tikka masala|madras|vindaloo)\b/i.test(i.name)
    );
    if (isSpicy) {
      // Spicy food → suggest cooling drink (Mango Lassi, Raita)
      const lassi = menu.find((i: MenuItem) => i.name.toLowerCase().includes('mango lassi') && !orderedNames.has(i.name.toLowerCase()));
      if (lassi) {
        return formatResult(lassi, `That fiery spice needs a cool-down — our thick Mango Lassi is the perfect palate soother. Pure mango, no water!`);
      }
    }
    // Non-spicy → suggest Karak Chai
    const chai = menu.find((i: MenuItem) => /karak|doodh patti/i.test(i.name) && !orderedNames.has(i.name.toLowerCase()));
    if (chai) {
      return formatResult(chai, `Complete your meal the village way — a steaming cup of ${chai.name}, brewed slow with real cardamom.`);
    }
  }

  // Rule 3: Has drink but it's cold → DON'T suggest hot (and vice versa)
  // This is the user's key requirement: "if they buy cold drink, it shouldn't offer karak chai"
  // Already handled by the drink rules above — we only suggest drinks when hasAnyDrink is false.

  // Rule 4: Has mains but NO dessert → suggest dessert
  if ((hasCurry || hasGrill || hasRice) && !hasDessert) {
    const suggestion = findMenuItem(menu, DESSERT_CATEGORIES, orderedNames);
    if (suggestion) {
      return formatResult(suggestion, `Every great meal deserves a sweet finish — our ${suggestion.name} is the perfect end to your feast!`);
    }
  }

  // Rule 5: Has ONLY bread/sides → suggest a curry
  if (hasBread && !hasCurry && !hasGrill && !hasRice) {
    const suggestion = findMenuItem(menu, CURRY_CATEGORIES, orderedNames);
    if (suggestion) {
      return formatResult(suggestion, `Great breads deserve a rich curry to dip into — try our ${suggestion.name}, slow-cooked to perfection!`);
    }
  }

  // Rule 6: Low value order → suggest affordable side
  if (orderTotal < 1500 && orderTotal > 0) { // Under £15
    const samosa = menu.find((i: MenuItem) => /samosa|pakora|spring roll/i.test(i.name) && !orderedNames.has(i.name.toLowerCase()));
    if (samosa) {
      return formatResult(samosa, `A perfect little extra — our ${samosa.name} is a crowd favourite starter. Crispy, golden, irresistible!`);
    }
  }

  // No suggestion needed — order looks well-rounded
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────

function findCategory(name: string, menu: MenuItem[]): string | undefined {
  const item = menu.find(i => i.name.toLowerCase() === name.toLowerCase());
  return item?.category;
}

function findMenuItem(
  menu: MenuItem[],
  categories: Set<string>,
  exclude: Set<string>,
): MenuItem | null {
  // Prefer popular/affordable items
  const candidates = menu
    .filter(i => categories.has(i.category) && !exclude.has(i.name.toLowerCase()))
    .sort((a, b) => a.price - b.price); // Cheapest first for easy add

  return candidates[0] || null;
}

function formatResult(item: MenuItem, reason: string): CrossSellResult {
  return {
    itemName: item.name,
    itemPrice: `£${item.price.toFixed(2)}`,
    reason,
    itemId: item.id,
  };
}
