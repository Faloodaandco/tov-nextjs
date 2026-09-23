/**
 * Taste of Village — Central Shop Configuration
 * 
 * Standalone customer web platform configuration for Hayes and Slough branches.
 */

const HAYES_TENANT = 'f0b00da2-4444-4444-4444-000000000004';
const SLOUGH_TENANT = 'f0b00da2-4444-4444-4444-000000000005';

export const LOCATIONS = {
  hayes: {
    id: 'hayes',
    name: 'Taste Of Village Hayes',
    tenant_id: HAYES_TENANT,
    address: '766B Uxbridge Rd',
    postcode: 'UB4 0RU',
    city: 'Hayes',
    phone: '020 3409 3786',
    w3w: '///example.words.here',
    coords: { lat: 51.5127, lng: -0.4211 },
    googleReviewUrl: 'https://g.page/r/CU4P6ZjGio6HECE/review',
    square: {
      enabled: true,
      appId: 'sq0idp-ANAbi4bOc4sroonK7d45BA',
      locationId: 'LW0Z07P1KP8HB',
    },
    delivery: {
      enabled: true,
      method: 'own_drivers' as const,
      maxRadiusMiles: 5,
      minOrder: 15.00,
      serviceFeePercent: 10,
      fallbackFee: 3.99,
      noContactEnabled: true,
      estimatedMinutes: { collection: { min: 15, max: 25 }, delivery: { min: 35, max: 55 } },
    },
  },
  slough: {
    id: 'slough',
    name: 'Taste Of Village Slough',
    tenant_id: SLOUGH_TENANT,
    address: '260 Farnham Road',
    postcode: 'SL1 4XL',
    city: 'Slough',
    phone: '01753 326341',
    w3w: '///slough.words.here',
    coords: { lat: 51.5273, lng: -0.6128 },
    googleReviewUrl: 'https://www.google.com/maps/search/?api=1&query=Taste+of+Village+260+Farnham+Road+Slough+SL1+4XL',
    square: {
      enabled: true,
      appId: 'sq0idp-ZEv7rUulY8UD5q8eZTPR8A',
      locationId: 'LD40KJ3QHAPGK',
    },
    delivery: {
      enabled: true,
      method: 'own_drivers' as const,
      maxRadiusMiles: 5,
      minOrder: 20.00,
      serviceFeePercent: 10,
      fallbackFee: 3.99,
      noContactEnabled: true,
      estimatedMinutes: { collection: { min: 15, max: 25 }, delivery: { min: 35, max: 55 } },
    },
  }
} as const;

export type LocationId = keyof typeof LOCATIONS;

// ─── Distance-Based Delivery Fee Tiers (Matches Square Dashboard Exactly) ────

export interface DistanceDeliveryTier {
  minMiles: number;
  maxMiles: number;
  fee: number;
  freeThreshold: number;
}

/** Hayes (Kitchencorner LTD) — Square Dashboard: 5mi radius, min £15 */
export const HAYES_DISTANCE_TIERS: DistanceDeliveryTier[] = [
  { minMiles: 0, maxMiles: 2, fee: 3.00, freeThreshold: 30.00 },
  { minMiles: 2, maxMiles: 3, fee: 4.00, freeThreshold: 35.00 },
  { minMiles: 3, maxMiles: 4, fee: 5.00, freeThreshold: 45.00 },
  { minMiles: 4, maxMiles: 5, fee: 6.00, freeThreshold: 55.00 },
];

/** Slough (Taste Of Village) — Square Dashboard: 5mi radius, min £20 */
export const SLOUGH_DISTANCE_TIERS: DistanceDeliveryTier[] = [
  { minMiles: 0, maxMiles: 2, fee: 3.99, freeThreshold: 30.00 },
  { minMiles: 2, maxMiles: 3, fee: 5.99, freeThreshold: 35.00 },
  { minMiles: 3, maxMiles: 4, fee: 6.99, freeThreshold: 40.00 },
  { minMiles: 4, maxMiles: 5, fee: 7.99, freeThreshold: 50.00 },
];

// ─── Legacy Outcode Lookup (Kept as Immediate Fallback) ──────────────────────

export interface DeliveryTier {
  fee: number;
  minOrder: number;
  freeDeliveryThreshold: number;
  estimatedMinutes: number;
  areaName: string;
}

export const HAYES_DELIVERY_TIERS: Record<string, DeliveryTier> = {
  UB4: { fee: 3.00, minOrder: 15.00, freeDeliveryThreshold: 30.00, estimatedMinutes: 30, areaName: 'Hayes North & Yeading' },
  UB3: { fee: 4.00, minOrder: 15.00, freeDeliveryThreshold: 35.00, estimatedMinutes: 35, areaName: 'Hayes Town & Harlington' },
  UB10: { fee: 5.00, minOrder: 15.00, freeDeliveryThreshold: 45.00, estimatedMinutes: 40, areaName: 'Hillingdon & Ickenham' },
  UB8: { fee: 5.00, minOrder: 15.00, freeDeliveryThreshold: 45.00, estimatedMinutes: 45, areaName: 'Uxbridge & Cowley' },
  UB7: { fee: 6.00, minOrder: 15.00, freeDeliveryThreshold: 55.00, estimatedMinutes: 50, areaName: 'West Drayton & Heathrow North' },
};

export const SLOUGH_DELIVERY_TIERS: Record<string, DeliveryTier> = {
  SL1: { fee: 3.99, minOrder: 20.00, freeDeliveryThreshold: 30.00, estimatedMinutes: 35, areaName: 'Central Slough & Farnham Rd' },
  SL2: { fee: 5.99, minOrder: 20.00, freeDeliveryThreshold: 35.00, estimatedMinutes: 40, areaName: 'Slough East & Stoke Poges' },
  SL3: { fee: 6.99, minOrder: 20.00, freeDeliveryThreshold: 40.00, estimatedMinutes: 45, areaName: 'Langley & Datchet' },
  SL4: { fee: 7.99, minOrder: 20.00, freeDeliveryThreshold: 50.00, estimatedMinutes: 50, areaName: 'Windsor & Eton' },
};

// ─── Haversine Distance Calculator ───────────────────────────────────────────

/** Straight-line distance in miles between two lat/lng pairs. */
export function haversineDistanceMiles(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Calculate the 10% service fee on the food subtotal (applicable to delivery orders only). */
export function calculateServiceFee(foodSubtotal: number, branchId: LocationId = 'hayes'): number {
  const loc = LOCATIONS[branchId];
  const percent = loc.delivery.serviceFeePercent;
  return Math.round(foodSubtotal * (percent / 100) * 100) / 100;
}

/**
 * Resolves delivery fee from distance (miles) against the branch tier table.
 * Returns the exact tier matching the Square Dashboard distance-based rules.
 */
export function getDeliveryFeeByDistance(miles: number, branchId: LocationId = 'hayes'): {
  eligible: boolean;
  miles: number;
  fee: number;
  freeThreshold: number;
  minOrder: number;
  reason?: string;
} {
  const loc = LOCATIONS[branchId];
  const tiers = branchId === 'slough' ? SLOUGH_DISTANCE_TIERS : HAYES_DISTANCE_TIERS;

  if (miles > loc.delivery.maxRadiusMiles) {
    return {
      eligible: false,
      miles,
      fee: 0,
      freeThreshold: 0,
      minOrder: loc.delivery.minOrder,
      reason: `You are ${miles.toFixed(1)} miles away. Our maximum delivery radius is ${loc.delivery.maxRadiusMiles} miles to ensure your food arrives sizzling hot. Please select Store Collection!`,
    };
  }

  for (const tier of tiers) {
    if (miles >= tier.minMiles && miles < tier.maxMiles) {
      return {
        eligible: true,
        miles,
        fee: tier.fee,
        freeThreshold: tier.freeThreshold,
        minOrder: loc.delivery.minOrder,
      };
    }
  }

  // Edge case: exactly 5.0 miles — use last tier
  const last = tiers[tiers.length - 1];
  if (miles <= loc.delivery.maxRadiusMiles) {
    return {
      eligible: true,
      miles,
      fee: last.fee,
      freeThreshold: last.freeThreshold,
      minOrder: loc.delivery.minOrder,
    };
  }

  return {
    eligible: false,
    miles,
    fee: 0,
    freeThreshold: 0,
    minOrder: loc.delivery.minOrder,
    reason: `Delivery is not available for your location. Please select Collection.`,
  };
}

// ─── Legacy Outcode-Based Lookup (Fallback when geocoding unavailable) ────────

/**
 * Normalises and extracts UK outward postcode (e.g. 'UB4 0RU' -> 'UB4')
 */
export function extractUKOutcode(postcode: string): string {
  const clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!clean) return '';
  if (clean.length >= 5 && /^[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2}$/.test(clean)) {
    return clean.slice(0, clean.length - 3);
  }
  if (clean.length <= 4) return clean;
  return clean.slice(0, clean.length - 3);
}

/**
 * Formats a raw UK postcode string into standard form: 'ub40ru' -> 'UB4 0RU'
 */
export function formatUKPostcode(postcode: string): string {
  const clean = postcode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length < 5) return clean;
  return clean.slice(0, clean.length - 3) + ' ' + clean.slice(clean.length - 3);
}

/**
 * Returns delivery tier details based on UK outcode and branch (fallback).
 */
export function getDeliveryTier(postcode: string, branchId: string = 'hayes'): {
  isValid: boolean;
  outcode: string;
  tier?: DeliveryTier;
  reason?: string;
} {
  const loc = LOCATIONS[branchId as LocationId] || LOCATIONS.hayes;
  if (!loc.delivery?.enabled) {
    return { isValid: false, outcode: '', reason: `${loc.name} currently offers Collection Only.` };
  }

  const outcode = extractUKOutcode(postcode);
  const tiers = branchId === 'slough' ? SLOUGH_DELIVERY_TIERS : HAYES_DELIVERY_TIERS;
  const tier = tiers[outcode];
  if (!tier) {
    const available = Object.entries(tiers)
      .map(([code, t]) => `${code} (£${t.fee.toFixed(2)})`)
      .join(', ');
    return {
      isValid: false,
      outcode,
      reason: `We deliver to ${available} from ${loc.name}. Please choose Collection or enter a valid local postcode.`,
    };
  }

  return { isValid: true, outcode, tier };
}

/**
 * Validates whether a UK postcode falls into the active branch's delivery zones.
 */
export function isPostcodeInDeliveryZone(postcode: string, branchId: string = 'hayes'): {
  isValid: boolean;
  outcode: string;
  reason?: string;
} {
  const res = getDeliveryTier(postcode, branchId);
  return { isValid: res.isValid, outcode: res.outcode, reason: res.reason };
}

export function getActiveLocation() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    let urlLoc = params.get('location')?.toLowerCase();

    // Parse location from pathname for /hayes/home or /slough/home format
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1) {
      const possibleLoc = pathParts[1].toLowerCase();
      if (possibleLoc === 'hayes' || possibleLoc === 'slough') {
        urlLoc = possibleLoc;
      }
    }

    if (urlLoc && (urlLoc === 'hayes' || urlLoc === 'slough')) {
      try {
        const current = localStorage.getItem('tov_selected_location');
        if (current !== urlLoc) {
          localStorage.setItem('tov_selected_location', urlLoc);
        }
      } catch {}
      return LOCATIONS[urlLoc as LocationId];
    }
  }

  const envTenant = undefined;
  if (envTenant) {
    const matchedLoc = Object.values(LOCATIONS).find(loc => loc.tenant_id === envTenant);
    if (matchedLoc) return matchedLoc;
  }

  const loc = typeof window !== 'undefined' ? (localStorage.getItem('tov_selected_location') as LocationId) : null;
  return LOCATIONS[loc || 'hayes'] || LOCATIONS.hayes;
}

export function hasSelectedLocation() {
  const envTenant = undefined;
  if (envTenant) return true;
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('tov_selected_location');
  }
  return false;
}

export function setActiveLocation(locId: LocationId) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tov_selected_location', locId);
    window.dispatchEvent(new Event('tov_location_changed'));
  }
}

export const SHOP_CONFIG = {
  get tenant_id() { return getActiveLocation().tenant_id; },
  get name() { return getActiveLocation().name; },
  get address() { return getActiveLocation().address; },
  get postcode() { return getActiveLocation().postcode; },
  get city() { return getActiveLocation().city; },
  get w3w() { return getActiveLocation().w3w; },
  get coords() { return getActiveLocation().coords; },

  tagline: 'Authentic Desi Taste from Lahore & Gujranwala',
  get whatsappNumber() { return getActiveLocation().phone.replace(/\s+/g, '').replace(/^0/, '44'); },
  get phoneNumber() { return getActiveLocation().phone; },
  get phoneNumberRaw() { return '+' + getActiveLocation().phone.replace(/\s+/g, '').replace(/^0/, '44'); },
  get googleReviewUrl() { return getActiveLocation().googleReviewUrl; },
  instagram: 'https://www.instagram.com/tasteofvillageuk/',
  facebook: 'https://www.facebook.com/profile.php?id=61590779182784',
  tiktok: 'https://www.tiktok.com/@tasteofvillage1',
  website: 'https://tasteofvillagerestaurants.co.uk',
  openingHours: '12:00 PM – 11:00 PM',
  openingDays: 'Monday – Sunday',
};

export const KITCHEN_SLA = {
  HOT_FOOD: 900, // 15 mins
  DRINKS_DESSERTS: 300, // 5 mins
};

/**
 * Active Promotion — change this ONE object to update the promo across the entire site.
 */
export const ACTIVE_PROMO = {
  enabled: true,
  code: 'BREAKFAST40',
  multiplier: 0.6,
  percentOff: 40,
  cartLabel: 'BREAKFAST40 (40% Off Breakfast)',
  floatingLabel: '-40% OFF BREAKFAST',
  bannerHeadline: '40% OFF BREAKFAST!',
  bannerSubtitle: 'Start your morning with our traditional Desi Nashta.',
  bannerFinePrint: 'Valid 9:00 AM – 2:00 PM on breakfast items only.',
  startHour: 9, // 09:00 AM
  endHour: 14,  // 02:00 PM (14:00)
  eligibleCategories: [
    'breakfast___desi_nashta',
    'village_brunch_special',
    'weekend_special',
    'brunch_offers',
    'breakfast',
    'desi_breakfast',
    'english_breakfast',
    'sweet_breakfast',
    'breakfast_drinks',
    'halwa_puri',
  ] as const,
} as const;

/**
 * Checks if the breakfast promotion is currently within valid operating hours (09:00 - 14:00 UK time).
 */
export function isBreakfastPromoTime(date: Date = new Date()): boolean {
  try {
    const ukHour = parseInt(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: 'numeric',
        hourCycle: 'h23',
      }).format(date),
      10
    );
    return ukHour >= ACTIVE_PROMO.startHour && ukHour < ACTIVE_PROMO.endHour;
  } catch {
    const localHour = date.getHours();
    return localHour >= ACTIVE_PROMO.startHour && localHour < ACTIVE_PROMO.endHour;
  }
}

/**
 * Checks if a menu item is eligible for the breakfast promo discount.
 */
export function isEligibleForBreakfastPromo(item: { category?: string; name?: string }): boolean {
  if (!item) return false;
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  // Category match
  const isBreakfastCategory = ACTIVE_PROMO.eligibleCategories.some(
    c => cat === c || cat.includes('breakfast') || cat.includes('nashta')
  );
  if (isBreakfastCategory) return true;

  // Specific signature breakfast dish name heuristics
  if (name.includes('halwa puri') || name.includes('nashta') || name.includes('bhaturay') || name.includes('paya')) {
    return true;
  }

  return false;
}

/**
 * Calculates promo discount for the cart.
 * ONLY discounts eligible breakfast items, and ONLY if promo is active and in the valid time window.
 */
export function calculatePromoDiscount(
  items: Array<{ price: number; quantity: number; category?: string; name?: string }>,
  promoCode: string | null,
  date: Date = new Date()
): { discount: number; eligibleSubtotal: number; eligibleItemsCount: number; isTimeValid: boolean } {
  const isTimeValid = isBreakfastPromoTime(date);

  if (!ACTIVE_PROMO.enabled || promoCode !== ACTIVE_PROMO.code) {
    return { discount: 0, eligibleSubtotal: 0, eligibleItemsCount: 0, isTimeValid };
  }

  if (!isTimeValid) {
    return { discount: 0, eligibleSubtotal: 0, eligibleItemsCount: 0, isTimeValid: false };
  }

  let eligibleSubtotal = 0;
  let eligibleItemsCount = 0;

  for (const item of items) {
    if (isEligibleForBreakfastPromo(item)) {
      eligibleSubtotal += item.price * item.quantity;
      eligibleItemsCount += item.quantity;
    }
  }

  const discount = Math.round(eligibleSubtotal * (1 - ACTIVE_PROMO.multiplier) * 100) / 100;
  return { discount, eligibleSubtotal, eligibleItemsCount, isTimeValid: true };
}

export function buildWhatsAppLink(message: string, customPhone?: string): string {
  const encoded = encodeURIComponent(message);
  let phone = customPhone ? customPhone.replace(/\D/g, '') : SHOP_CONFIG.whatsappNumber;
  if (phone.startsWith('0')) {
    phone = '44' + phone.substring(1);
  }
  return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Builds a 1-tap Google Review invite message for WhatsApp.
 */
export function buildReviewWhatsAppMessage(branch: 'hayes' | 'slough', customerName?: string): string {
  const loc = LOCATIONS[branch];
  const nameSalutation = customerName ? `Hi ${customerName}, ` : 'Hi! ';
  return `${nameSalutation}thank you for dining with Taste of Village (${loc.city})! If you enjoyed your authentic Desi meal, please consider leaving us a quick 5-star review on Google: ${loc.googleReviewUrl} — your support helps our kitchen family immensely! ❤️`;
}

/**
 * Builds a formatted WhatsApp order message from order details.
 */
export function buildOrderWhatsAppMessage(order: {
  id: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal?: number;
  discount?: number;
  total: number;
}): string {
  const itemLines = order.items
    .map(item => `• ${item.quantity}x ${item.name} — £${(item.price * item.quantity).toFixed(2)}`)
    .join('\n');

  const discountLine = (order.discount && order.discount > 0)
    ? `🎟️ *Breakfast Promo (40% Off): -£${order.discount.toFixed(2)}*\n`
    : '';

  return [
    `🧾 *NEW ORDER — ${order.id}*`,
    ``,
    `👤 *Customer:* ${order.customerName}`,
    `📞 *Phone:* ${order.customerPhone}`,
    `🏷️ *Type:* Collection`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    discountLine ? discountLine.trim() : null,
    `💰 *Total: £${order.total.toFixed(2)}*`,
    ``,
    `⏰ Order placed: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
  ].filter(Boolean).join('\n');
}
