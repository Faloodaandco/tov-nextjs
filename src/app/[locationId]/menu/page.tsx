// @ts-nocheck
'use client';
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { generateId } from '@/utils/generateId';
import { motion, AnimatePresence } from 'framer-motion';

import { useStore } from '@/context/StoreContext';
import { Plus, Minus, ShoppingBag, X, CheckCircle2, MessageCircle, Phone, MapPin, Search, ChevronRight, CreditCard, Store, Clock, Bell, Ticket, Printer, Zap, AlertCircle } from 'lucide-react';
import { getMenuItems } from '@/services/menuService';
import { MenuItem } from '@/types';
import { buildWhatsAppLink, buildOrderWhatsAppMessage, SHOP_CONFIG, LOCATIONS, ACTIVE_PROMO, calculatePromoDiscount, isBreakfastPromoTime, isPostcodeInDeliveryZone, getDeliveryTier, HAYES_DELIVERY_TIERS, SLOUGH_DELIVERY_TIERS } from '@/config/shopConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomisationModal } from '@/components/CustomisationModal';
import { logTableScan, logSessionDuration } from '@/services/analyticsService';
import type { FullMenuItem } from '@/components/CustomisationModal';
import { MenuItemCard } from '@/components/MenuItemCard';
import { MenuCategoryNav } from '@/components/MenuCategoryNav';
import { SquareCheckout } from '@/components/SquareCheckout';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { UpsellDrawer } from '@/components/UpsellDrawer';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';
import { trackInitiateCheckout, trackOrderPlaced } from '@/utils/analytics';
import { useLocationConfig } from '@/hooks/useLocationConfig';
import { appendItemsToOrder } from '@/services/orderService';
import { isValidUKMobile, getPhoneError, normaliseUKPhone, captureClientMeta } from '@/lib/validation';
import { sendOrderNotificationEmail } from '@/services/emailService';
import { getExistingPushToken, requestPushPermission } from '@/utils/pushService';

/* ─── Size Variations for Website ─── */
const WEB_SIZE_ITEMS: Record<string, { regular: number; large: number }> = {};

// Categories that always have Regular / Large
const SIZE_CATEGORIES: string[] = ['curries', 'desi_handi', 'karahi_e_khaas', 'rolls', 'burgers'];



const CATEGORY_DESCRIPTIONS: Record<string, { title: string; text: string }> = {
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

function MenuPageContent() {
  const router = useRouter();
  const params = useParams();
  const routeLocationId = ((params?.locationId as string) || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const { activeLocation: contextLocation } = useLocationConfig();
  const activeLocation = contextLocation || LOCATIONS[routeLocationId] || LOCATIONS.hayes;
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? (typeof window !== 'undefined' ? window : {}).location.search : '');
  const tableParam = searchParams.get('table') || searchParams.get('t');
  const { addToCart, cart, removeFromCart, addOrder, clearCart, activePromo, isCartOpen, setIsCartOpen } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('starters');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<string[]>([]);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [fulfillmentType, setFulfillmentType] = useState<'collection' | 'delivery'>('delivery');

  useEffect(() => {
    if (!tableParam) {
      setFulfillmentType('delivery');
    }
  }, [activeLocation.id, tableParam]);

  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    line2: '',
    city: activeLocation.id === 'slough' ? 'Slough' : 'Hayes',
    postcode: '',
    instructions: '',
  });

  useEffect(() => {
    setDeliveryAddress(prev => ({
      ...prev,
      city: (!prev.city || prev.city === 'Hayes' || prev.city === 'Slough') ? (activeLocation.id === 'slough' ? 'Slough' : 'Hayes') : prev.city,
    }));
  }, [activeLocation.id]);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'collection'>('online');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [customVoucher, setCustomVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<FullMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sizePickerItem, setSizePickerItem] = useState<MenuItem | null>(null);
  const [customisationItem, setCustomisationItem] = useState<FullMenuItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isKitchenClosed = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 23 || hour < 12; // 11PM to 12PM
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [pushAlertActive, setPushAlertActive] = useState(false);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const observer = useRef<IntersectionObserver | null>(null);


  useEffect(() => {
    async function loadMenu() {
      try {
        const items = await getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to load menu items", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  const predefinedCategories = [
    // 1. STARTERS & CHARCOAL GRILL
    { id: 'starters_n_charcoal_grill', label: 'STARTERS & CHARCOAL GRILL' },
    { id: 'talaa_hua_zaiqah', label: 'STARTERS & APPETISERS' },
    { id: 'bbq_tandoor_se', label: 'CHARCOAL BBQ & TANDOOR' },
    { id: 'chatkara_junction', label: 'CHATKARA STREET FOOD' },
    { id: 'starters', label: 'STARTERS & APPETISERS' },
    { id: 'bbq', label: 'CHARCOAL BBQ & TANDOOR' },
    { id: 'chaat', label: 'CHATKARA STREET FOOD' },

    // 2. MAINS – VILLAGE CLASSICS
    { id: 'mains___village_classics', label: 'MAINS – VILLAGE CLASSICS' },
    { id: 'desi_handi', label: 'DESI CLAY POT HANDI' },
    { id: 'karahi_e_khaas', label: 'KARAHI E KHAAS' },
    { id: 'curries_salan_se', label: 'MAINS – VILLAGE CLASSICS' },
    { id: 'curries', label: 'MAINS – VILLAGE CLASSICS' },

    // 3. SIGNATURE DISHES
    { id: 'signature_dishes', label: 'SIGNATURE DISHES' },
    { id: 'burgers', label: 'DESI BURGERS & NOODLES' },
    { id: 'rolls', label: 'FLAVOURFUL ROLLS' },

    // 4. RICE SPECIALS
    { id: 'rice_specials', label: 'RICE SPECIALS' },
    { id: 'biryani_and_rice', label: 'RICE SPECIALS' },
    { id: 'rice', label: 'RICE SPECIALS' },

    // 5. FAMILY PLATTERS
    { id: 'family_platters', label: 'FAMILY PLATTERS' },
    { id: 'village_special_platters', label: 'VILLAGE SIGNATURE PLATTERS' },
    { id: 'bbq_platter', label: 'BBQ SHARING PLATTERS' },
    { id: 'platters', label: 'VILLAGE SIGNATURE PLATTERS' },
    { id: 'bbq_platters', label: 'BBQ SHARING PLATTERS' },
    { id: 'rice_platters', label: 'RICE SHARING FEASTS' },

    // KIDS MEAL
    { id: 'kids_meal', label: 'KIDS MEAL' },

    // 6. BREAKFAST – DESI NASHTA
    { id: 'breakfast___desi_nashta', label: 'BREAKFAST – DESI NASHTA' },
    { id: 'village_brunch_special', label: 'BREAKFAST – DESI NASHTA' },
    { id: 'weekend_special', label: 'WEEKEND DESI NASHTA' },
    { id: 'brunch_offers', label: 'VILLAGE BRUNCH OFFERS' },
    { id: 'specials', label: 'WEEKEND DESI NASHTA' },

    // 7. SALADS
    { id: 'salads', label: 'SALADS' },

    // 8. SIDES & SAUCES
    { id: 'sides_n_sauces', label: 'SIDES & SAUCES' },

    // 9. NAAN & BREAD
    { id: 'naan_n_bread', label: 'NAAN & BREAD' },
    { id: 'naan_n_roti', label: 'TANDOORI BREADS' },
    { id: 'lahori_kulchas', label: 'LAHORI KULCHAS' },
    { id: 'parathas', label: 'STUFFED PARATHAS' },
    { id: 'breads', label: 'TANDOORI BREADS' },
    { id: 'kulchas', label: 'LAHORI KULCHAS' },

    // 10. DRINKS
    { id: 'drinks', label: 'DRINKS' },

    // 11. DESSERTS
    { id: 'desserts', label: 'DESSERTS' }
  ];

  const isWeekend = [0, 5, 6].includes(new Date().getDay());

  const groupedMenu = useMemo(() => {
    const allCatIds = Array.from(new Set(menuItems.map(item => item.category)));
    
    // Preserve predefined order first
    const orderedCategories = predefinedCategories.filter(cat => allCatIds.includes(cat.id));
    
    // Append any dynamic categories not in predefined
    allCatIds.forEach(catId => {
      if (!orderedCategories.find(c => c.id === catId)) {
        orderedCategories.push({
          id: catId,
          label: catId.replace(/___/g, ' - ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        });
      }
    });

    return orderedCategories.map(cat => ({
      ...cat,
      items: menuItems.filter(item => {
        const matchSearch = searchQuery === '' || 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          item.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Robust Dietary Classification
        let itemDietary = [...(item.dietary || [])];
        if (!item.dietary || item.dietary.length === 0) {
          const text = (item.name + ' ' + item.description + ' ' + item.category).toLowerCase();
          const isMeat = text.includes('chicken') || text.includes('lamb') || text.includes('beef') || 
                         text.includes('steak') || text.includes('ribeye') || text.includes('chargha') || 
                         text.includes('gosht') || text.includes('keema') || text.includes('tikka') || 
                         text.includes('kebab') || text.includes('chops') || text.includes('wings') || 
                         text.includes('nihari') || text.includes('haleem') || text.includes('paya') || 
                         text.includes('fish') || text.includes('seabass') || text.includes('brisket');

          if (!isMeat) {
            if (text.includes('paneer') || text.includes('vegetarian') || text.includes('veg main') || item.category.includes('vegetarian')) {
              itemDietary.push('vegetarian');
            }
            if (text.includes('vegan') || text.includes('chana') || text.includes('daal') || text.includes('tarka') || text.includes('saag')) {
              itemDietary.push('vegan', 'vegetarian');
            }
          }

          if (isMeat || text.includes('halal')) {
            itemDietary.push('halal');
          }

          if (text.includes('spicy') || text.includes('chilli') || text.includes('karahi') || text.includes('charshi') || text.includes('masala')) {
            itemDietary.push('spicy');
          }

          itemDietary = Array.from(new Set(itemDietary));
          item.dietary = itemDietary as any;
        }

        const matchDietary = activeDietaryFilters.length === 0 || 
          activeDietaryFilters.every(filter => itemDietary.includes(filter as any));

        return item.category === cat.id && item.showOnWebsite !== false && matchSearch && matchDietary;
      }).map(item => {
        const isWeekendItem = item.category === 'specials' || item.name.toLowerCase().includes('weekend only');
        const isTimeGated = isWeekendItem && !isWeekend;

        return {
          ...item,
          price: tableParam ? (item.dineInPrice ?? item.price) : (item.onlinePrice ?? item.price),
          originalPrice: tableParam ? (item.dineInPrice ?? item.originalPrice ?? item.price) : (item.onlinePrice ?? item.originalPrice ?? item.price),
          is86d: item.is86d || isTimeGated,
          name: isTimeGated && !item.name.includes('Fri-Sun') ? `${item.name} (Available Fri-Sun)` : item.name
        };
      })
    })).filter(group => group.items.length > 0);
  }, [menuItems, tableParam, searchQuery, activeDietaryFilters]);

  // ScrollSpy Logic
  useEffect(() => {
    if (isLoading || groupedMenu.length === 0) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        // We want the most recently intersecting entry
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveCategory(intersecting[0].target.id.replace('category-', ''));
        }
      },
      {
        rootMargin: '-200px 0px -40% 0px',
        threshold: 0
      }
    );

    (typeof document !== 'undefined' ? document : {}).querySelectorAll('section[id^="category-"]').forEach(el => observer.current?.observe(el));

    return () => observer.current?.disconnect();
  }, [isLoading, menuItems]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = (typeof document !== 'undefined' ? document : {}).getElementById(`category-${id}`);
    if (element) {
      const navOffset = (typeof window !== 'undefined' ? window : {}).innerWidth < 768 ? 140 : 160;
      const y = element.getBoundingClientRect().top + (typeof window !== 'undefined' ? window : {}).pageYOffset - navOffset;
      (typeof window !== 'undefined' ? window : {}).scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Auto-scroll to specific category if requested via URL query params or hash
  useEffect(() => {
    const targetCat = searchParams.get('category') || searchParams.get('cat') || (typeof window !== 'undefined' ? (typeof window !== 'undefined' ? window : {}).location.hash.replace('#', '') : '');
    if (targetCat && !isLoading && groupedMenu.length > 0) {
      const timer = setTimeout(() => {
        scrollToCategory(targetCat);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isLoading, groupedMenu]);


  // ─── Analytics Engine: Dwell Time Tracking ───
  useEffect(() => {
    if (!tableParam) return;
    
    // Log the initial NFC tap
    logTableScan(tableParam, (typeof navigator !== 'undefined' ? navigator : {}).userAgent);
    
    const startTime = Date.now();
    
    const handleVisibilityChange = () => {
      // If they put phone to sleep or switch tabs, log duration so far
      if ((typeof document !== 'undefined' ? document : {}).visibilityState === 'hidden') {
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        logSessionDuration(tableParam, durationSeconds);
      }
    };
    
    (typeof document !== 'undefined' ? document : {}).addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      logSessionDuration(tableParam, durationSeconds);
      (typeof document !== 'undefined' ? document : {}).removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tableParam]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const { discount: autoPromoDiscount, eligibleSubtotal, eligibleItemsCount, isTimeValid: isPromoTimeValid } = useMemo(
    () => calculatePromoDiscount(cart, activePromo),
    [cart, activePromo]
  );
  
  const customPromoDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    const code = appliedVoucher.toUpperCase();
    if (code.startsWith('TOV30-')) return cartTotal * 0.30;
    if (code.startsWith('TOV50-')) return cartTotal * 0.50;
    return 0;
  }, [appliedVoucher, cartTotal]);

  const promoDiscount = customPromoDiscount > 0 ? customPromoDiscount : autoPromoDiscount;
  const isDeliveryOrder = !tableParam && fulfillmentType === 'delivery';
  const discountedSubtotal = Math.max(0, cartTotal - promoDiscount);
  const activeDeliveryTier = useMemo(() => {
    if (!isDeliveryOrder) return null;
    return getDeliveryTier(deliveryAddress.postcode, activeLocation.id);
  }, [isDeliveryOrder, deliveryAddress.postcode, activeLocation.id]);

  const deliveryFee = useMemo(() => {
    if (!isDeliveryOrder) return 0;
    if (activeDeliveryTier?.isValid && activeDeliveryTier.tier) {
      return discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold
        ? 0
        : activeDeliveryTier.tier.fee;
    }
    // Default starting fee if postcode not yet entered
    return activeLocation.id === 'slough'
      ? (SLOUGH_DELIVERY_TIERS.SL1?.fee || 3.50)
      : HAYES_DELIVERY_TIERS.UB4.fee;
  }, [isDeliveryOrder, activeDeliveryTier, discountedSubtotal, activeLocation.id]);

  // C5: 10% service fee on food subtotal (Charged on delivery only; collection is free)
  const serviceFee = useMemo(() => {
    if (!isDeliveryOrder) return 0;
    const rate = activeLocation.delivery?.serviceFeePercent || 10;
    return Math.round(discountedSubtotal * rate) / 100;
  }, [isDeliveryOrder, discountedSubtotal, activeLocation]);

  const finalCartTotal = discountedSubtotal + deliveryFee + serviceFee;

  // C3: Minimum order enforcement for delivery
  const minOrder = activeLocation.delivery?.minOrder || 15;
  const isBelowMinOrder = isDeliveryOrder && discountedSubtotal < minOrder;
  const minOrderProgress = isDeliveryOrder ? Math.min(100, (discountedSubtotal / minOrder) * 100) : 100;
  const minOrderRemaining = Math.max(0, minOrder - discountedSubtotal);

  // ─── Smart Cart Upsell Engine ───
  const hasMain = cart.some(i => ['curries', 'desi_handi', 'karahi_e_khaas', 'rice', 'burgers', 'rolls', 'bbq'].includes(i.category));
  const hasDessert = cart.some(i => i.category === 'desserts');

  const upsellSuggestions = menuItems.filter(item => {
    if (hasMain && !hasDessert) return item.category === 'desserts' && item.popular;
    if (hasMain) return item.category === 'breads' && item.popular;
    return item.category === 'starters' && item.popular; // Fallback
  }).filter(item => !cart.some(cartItem => cartItem.id.startsWith(item.id))).slice(0, 1);

  const handleProceedToDetails = () => {
    trackInitiateCheckout(finalCartTotal, cart);
    setIsUpsellOpen(true);
  };

  const submitOrder = async (e: React.FormEvent, overridePaymentMethod?: 'online' | 'collection') => {
    e.preventDefault();
    
    // CRITICAL SECURITY: Synchronous browser-level lock against double-taps
    if ((window as any)._checkoutLock) return;
    (window as any)._checkoutLock = true;
    setIsSubmitting(true);

    const effectivePaymentMethod = overridePaymentMethod || paymentMethod;

    try {
      // Validate customer info
      if (!customerInfo.name.trim()) {
        alert('Please enter your name');
        setIsSubmitting(false);
        (window as any)._checkoutLock = false;
        return;
      }
      
      const phoneClean = customerInfo.phone.replace(/\s+/g, '');
      if (!phoneClean || !isValidUKMobile(phoneClean)) {
        const errorMsg = getPhoneError(phoneClean);
        setPhoneError(errorMsg);
        alert(errorMsg || 'Please enter a valid UK phone number (e.g. 07123 456789)');
        setIsSubmitting(false);
        (window as any)._checkoutLock = false;
        return;
      }

      const orderId = `ORD-${generateId().split('-')[0].toUpperCase()}`;
      
      // Capture lightweight device metadata for fraud protection
      const clientMeta = await captureClientMeta();

      // If we are in an existing NFC Table Session, append the items directly to the tab
      if (tableParam && tableSession && tableSession.status === 'open') {
        await appendItemsToOrder(tableSession.id, cart);
        
        // Mock order object to update local state for the LiveOrderTracker
        const mockOrder = {
          id: tableSession.id,
          status: 'pending', // Assume pending since we appended
          items: [...cart], // This is just for the LiveTracker until it streams the real order
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          subtotal: cartTotal,
          discount: promoDiscount,
          total: finalCartTotal,
          type: 'dine-in',
          source: 'NFC',
          table_number: parseInt(tableParam as string)
        };
        
        setCompletedOrder(mockOrder);
        setCheckoutStep('success');
        clearCart();
        (typeof window !== 'undefined' ? window.localStorage : {}).setItem('last_order_time', Date.now().toString());
        (window as any)._checkoutLock = false;
        return;
      }

      const isActuallyPaidOnline = !tableParam && effectivePaymentMethod === 'online';
      const newOrder = {
        id: orderId,
        customerName: customerInfo.name.trim(),
        customerPhone: normaliseUKPhone(customerInfo.phone),
        customerEmail: customerInfo.email.trim(),
        marketingOptIn,
        tenant_id: SHOP_CONFIG.tenant_id,
        type: (tableParam ? 'dine-in' : (isDeliveryOrder ? 'delivery' : 'collection')) as any,
        fulfillment_type: tableParam ? 'dine-in' : (isDeliveryOrder ? 'delivery' : 'collection'),
        deliveryAddress: isDeliveryOrder ? deliveryAddress : null,
        deliveryFee: deliveryFee,
        isPaid: isActuallyPaidOnline,
        paymentMethod: tableParam ? 'unpaid' : (isActuallyPaidOnline ? 'card' : 'unpaid'),
        payment_status: tableParam ? 'unpaid' : (isActuallyPaidOnline ? 'paid' : 'unpaid'),
        ...(tableParam ? { table_number: parseInt(tableParam), source: 'NFC' } : {}),
        items: [...cart],
        subtotal: cartTotal,
        discount: promoDiscount,
        total: finalCartTotal,
        status: 'pending' as const,
        timestamp: new Date(),
        ...(clientMeta ? { clientMeta } : {}),
      };

      await addOrder(newOrder as any);
      trackOrderPlaced(newOrder.id, newOrder.total, newOrder.items);
      sendOrderNotificationEmail(newOrder as any);
      setCompletedOrder(newOrder);
      setCheckoutStep('success');
      clearCart();
      (typeof window !== 'undefined' ? window.localStorage : {}).setItem('last_order_time', Date.now().toString());
    } catch (e) {
      alert('Order Placement Error: Could not place the order. Please check your connection or contact the shop.');
    } finally {
      setIsSubmitting(false);
      (window as any)._checkoutLock = false;
    }
  };

  const handleSquarePaymentSuccess = async (token: string, verificationToken?: string) => {
    if ((window as any)._checkoutLock) return;
    (window as any)._checkoutLock = true;
    setIsSubmitting(true);

    try {
      const orderId = `ORD-${generateId().split('-')[0].toUpperCase()}`;
      const existingFcmToken = await getExistingPushToken().catch(() => null) || (typeof window !== 'undefined' ? window.localStorage : {}).getItem('tov_fcm_token') || undefined;

      const idempotencyKey = crypto.randomUUID();
      const payload = {
        branch: activeLocation.id,
        cart: cart.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes,
        })),
        customer: {
          name: customerInfo.name.trim(),
          phone: normaliseUKPhone(customerInfo.phone),
          email: customerInfo.email.trim(),
        },
        sourceId: token,
        verification_token: verificationToken,
        order_id: orderId,
        voucher_code: appliedVoucher || activePromo || undefined,
        fcm_token: existingFcmToken,
        idempotency_key: idempotencyKey,
        fulfillment_type: isDeliveryOrder ? 'delivery' : 'collection',
        delivery_address: isDeliveryOrder ? deliveryAddress : null,
        delivery_fee: deliveryFee,
        service_fee: serviceFee,
        branch: activeLocation.id,
      };

      // Hit Next.js Route Handler (single payment path — no Cloud Function fallback)
      const res = await fetch('/api/checkout/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch (e) {
          errData = { error: `Server error: HTTP ${res.status}. Please check your order status or contact the restaurant.` };
        }
        throw new Error(errData.error || 'Square POS payment failed');
      }

      const data = await res.json();
      const finalOrderId = data.orderId || orderId;

      const completedOrderData = {
        id: finalOrderId,
        orderId: finalOrderId,
        customerName: customerInfo.name.trim(),
        customerPhone: normaliseUKPhone(customerInfo.phone),
        customerEmail: customerInfo.email.trim(),
        marketingOptIn,
        tenant_id: SHOP_CONFIG.tenant_id,
        type: (isDeliveryOrder ? 'delivery' : 'collection') as any,
        fulfillment_type: isDeliveryOrder ? 'delivery' : 'collection',
        deliveryAddress: isDeliveryOrder ? deliveryAddress : null,
        deliveryFee: deliveryFee,
        isPaid: true,
        paymentMethod: 'square',
        payment_status: 'paid',
        items: [...cart],
        subtotal: cartTotal,
        discount: promoDiscount,
        total: finalCartTotal,
        status: 'pending' as const,
        timestamp: new Date(),
        estimatedReadyMinutes: data.estimatedReadyMinutes || (isDeliveryOrder ? 40 : 25),
        estimatedReadyAt: data.estimatedReadyAt || new Date(Date.now() + (isDeliveryOrder ? 40 : 25) * 60 * 1000).toISOString(),
        fcmToken: existingFcmToken,
      };

      // Client-side Firestore backup write (governed by allow create: if true)
      try {
        await setDoc(doc(db, 'orders', finalOrderId), {
          ...completedOrderData,
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        });
      } catch (fErr) {
        console.warn('[Firestore] Client order backup:', fErr);
      }

      setCompletedOrder(completedOrderData);
      setCheckoutStep('success');
      clearCart();
      trackOrderPlaced(finalOrderId, finalCartTotal, cart);
      sendOrderNotificationEmail(completedOrderData as any);
      (typeof window !== 'undefined' ? window.localStorage : {}).setItem('last_order_time', Date.now().toString());
    } catch (err: any) {
      const msg = (err.message || '').toUpperCase().includes('PERMISSION')
        ? 'There was a connection issue completing your order confirmation. If money was debited, please contact the restaurant.'
        : (err.message || 'Payment processing failed. Please try again or pay on collection.');
      alert(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
      (window as any)._checkoutLock = false;
    }
  };

  const getWhatsAppOrderLink = () => {
    if (!completedOrder) return '#';
    const message = buildOrderWhatsAppMessage(completedOrder);
    return buildWhatsAppLink(message);
  };

  useEffect(() => {
    if (activeCategory) {
      const btn = (typeof document !== 'undefined' ? document : {}).getElementById(`nav-btn-${activeCategory}`);
      const container = (typeof document !== 'undefined' ? document : {}).getElementById('category-nav-container');
      if (btn && container) {
        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();
        const scrollLeft = container.scrollLeft + (btnRect.left - containerRect.left) - (containerRect.width / 2) + (btnRect.width / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeCategory]);

  // Prevent background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = (typeof document !== 'undefined' ? document : {}).body.style.overflow;
      (typeof document !== 'undefined' ? document : {}).body.style.overflow = 'hidden';
      return () => {
        (typeof document !== 'undefined' ? document : {}).body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  // Desktop Live Sticky Order Summary for Checkout Drawer (Details & Payment steps)
  const desktopOrderSummary = (
    <div className="hidden lg:flex lg:col-span-5 flex-col bg-[#F9F7F2] border-l border-pine/10 p-6 md:p-8 overflow-y-auto">
      <div className="mb-4 pb-4 border-b border-pine/10 flex items-center justify-between">
        <h4 className="font-display font-bold text-pine text-lg uppercase tracking-wider">Order Summary</h4>
        <span className="text-[10px] font-black uppercase tracking-widest bg-pine/10 text-pine px-2.5 py-1 rounded-full">
          {cart.reduce((s, i) => s + i.quantity, 0)} Items
        </span>
      </div>

      {/* Fulfillment status badge */}
      <div className="mb-4 p-3.5 bg-white rounded-xl border border-pine/10 shadow-sm flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl">{isDeliveryOrder ? '🚗' : '🛍️'}</span>
          <div className="truncate">
            <p className="font-bold text-pine leading-tight truncate">
              {isDeliveryOrder
                ? `Delivery: ${deliveryAddress.postcode ? deliveryAddress.postcode : (activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Branch')}`
                : `Pickup: ${activeLocation.name}`}
            </p>
            <p className="text-[10px] text-pine/60 truncate">
              {isDeliveryOrder ? (deliveryAddress.line1 || 'Doorstep Delivery') : activeLocation.address}
            </p>
          </div>
        </div>
        <span className="font-bold text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider shrink-0 ml-2">
          {isDeliveryOrder ? '~35-45m' : '~20-25m'}
        </span>
      </div>

      {/* Cart items scrollable list */}
      <div className="flex-1 space-y-3 mb-6 pr-1 overflow-y-auto max-h-[340px]">
        {cart.map((item) => {
          const isFallback = !item.image || item.image.includes('tov-logo-tree');
          return (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b border-pine/5 last:border-0">
              <div className="w-12 h-12 rounded-xl bg-white border border-pine/10 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={item.image || '/assets/tov-logo-tree-terracotta-alpha.png'}
                  alt=""
                  className={`w-full h-full ${isFallback ? 'object-contain p-1.5 opacity-40' : 'object-cover'}`}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png';
                    e.target.className = 'w-full h-full object-contain p-1.5 opacity-40';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-pine truncate">{item.name}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-pine/60 mt-0.5">
                  <span className="font-bold bg-pine/10 text-pine px-1.5 py-0.2 rounded">{item.quantity}x</span>
                  <span>£{item.price.toFixed(2)}</span>
                  {item.modifiers?.size && <span>• {item.modifiers.size}</span>}
                </div>
              </div>
              <div className="text-xs font-black text-pine shrink-0">
                £{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost calculation breakdown */}
      <div className="space-y-2 pt-4 border-t border-pine/10 text-xs">
        <div className="flex justify-between text-pine/70 font-semibold">
          <span>Subtotal</span>
          <span>£{cartTotal.toFixed(2)}</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between text-terracotta font-bold">
            <span className="flex items-center gap-1">
              <Ticket size={12} /> {appliedVoucher ? `${appliedVoucher} Voucher` : ACTIVE_PROMO.cartLabel}
            </span>
            <span>-£{promoDiscount.toFixed(2)}</span>
          </div>
        )}

        {isDeliveryOrder && (
          <div className="flex justify-between text-pine/70 font-semibold">
            <span>
              Delivery Fee ({activeDeliveryTier?.outcode || (activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough')})
            </span>
            <span className={deliveryFee === 0 ? 'text-emerald-700 font-bold' : ''}>
              {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
            </span>
          </div>
        )}

        {serviceFee > 0 && (
          <div className="flex justify-between text-pine/70 font-semibold">
            <span>Service Fee (10%)</span>
            <span>£{serviceFee.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-3 border-t border-pine/10 text-pine">
          <span className="font-display font-bold text-xs uppercase tracking-widest text-pine/70">Total</span>
          <span className="font-display font-bold text-2xl text-pine">£{finalCartTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Security assurances */}
      <div className="mt-6 pt-4 border-t border-pine/10 flex flex-col items-center gap-2 text-center text-[10px] text-pine/50">
        <div className="flex items-center gap-2 font-bold text-pine/70">
          <span>🔒 256-bit SSL</span>
          <span>•</span>
          <span>Square Verified</span>
          <span>•</span>
          <span>Live Kitchen Tracking</span>
        </div>
        <p className="text-[9px] text-pine/40">Official Taste of Village Digital Checkout</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-sand pb-20">
      
      {/* Cinematic Premium Hero Header */}
      <div className="relative w-full h-[45vh] min-h-[360px] overflow-hidden bg-pine">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 filter blur-[1px]" style={{ backgroundImage: "url('/assets/mix_grill_hero.webp')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/80 to-pine/90"></div>
        <div className="absolute inset-0 bg-[url('/assets/tov-new-pattern.webp')] bg-repeat opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-fade-in-up z-20 pt-28 md:pt-36">
          
          {/* Back to Branch Home Button with Scroll Memory */}
          <button 
            onClick={() => {
              if ((typeof window !== 'undefined' ? window : {}).history.length > 1) {
                router.push(-1);
              } else {
                router.push(`/${activeLocation.id}`);
              }
            }}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-bg-sand text-xs font-black uppercase tracking-widest transition-all border border-white/20 cursor-pointer shadow-sm hover:-translate-x-1"
          >
            <span>← Back to {activeLocation.id === 'hayes' ? 'Hayes Branch' : 'Slough Branch'}</span>
          </button>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-wide mb-3 drop-shadow-md">THE MENU</h1>
          <div className="w-16 h-0.5 bg-terracotta mb-4 shadow-sm"></div>
          <p className="font-sans text-white/90 text-sm md:text-base max-w-xl font-medium tracking-wide leading-relaxed mb-4">
            Experience authentic Punjabi & Mughal cooking. Prepared over live flames and slow-simmered in hand-seasoned cast iron karahis.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            <span className="text-[11px] md:text-xs font-bold text-amber-200 uppercase tracking-wider">
              {activeLocation.id === 'hayes' ? 'Hayes Kitchen • 766B Uxbridge Rd' : 'Slough Kitchen • 260 Farnham Rd'}
            </span>
          </div>
          <div className="mt-4 inline-flex items-center gap-4 px-5 py-2 rounded-full bg-terracotta/90 border border-terracotta backdrop-blur-md shadow-md shadow-terracotta/20">
            <span className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-widest">
              <span>🚗</span> Delivery
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span className="flex items-center gap-1.5 text-xs font-black text-white uppercase tracking-widest">
              <span>🛍️</span> Collection
            </span>
          </div>
        </div>
      </div>

      <MenuCategoryNav
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        groupedMenu={groupedMenu}
        activeCategory={activeCategory}
        scrollToCategory={scrollToCategory}
      />

      {/* Dietary Filters Bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-pine/10 sticky top-[118px] md:top-[106px] z-30 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center gap-2.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pine/40 mr-2 flex-shrink-0">Dietary:</span>
          {['vegan', 'vegetarian', 'halal', 'gluten-free', 'spicy'].map(filter => {
            const isActive = activeDietaryFilters.includes(filter);
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveDietaryFilters(prev => 
                    isActive ? prev.filter(f => f !== filter) : [...prev, filter]
                  );
                }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.15em] uppercase border transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-pine text-white border-pine shadow-sm shadow-pine/30' 
                    : 'bg-bg-sand text-pine/60 border-pine/10 hover:border-pine/30 hover:text-pine'
                }`}
              >
                {filter === 'vegan' && <span className={isActive ? '' : 'text-green-600'}>🌱</span>}
                {filter === 'vegetarian' && <span className={isActive ? '' : 'text-yellow-600'}>🧀</span>}
                {filter === 'halal' && <span className={isActive ? '' : 'text-emerald-600'}>🌙</span>}
                {filter === 'gluten-free' && <span className={isActive ? '' : 'text-amber-700'}>🌾</span>}
                {filter === 'spicy' && <span className={isActive ? '' : 'text-red-500'}>🌶️</span>}
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Sections Rendered Sequentially */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        


        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-20 font-bold text-pine/50 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading menu...
          </div>
        )}

        {/* Render Each Category as a ScrollSpy Section */}
        {!isLoading && groupedMenu.map((group) => (
          <section key={group.id} id={`category-${group.id}`} data-category={group.id} className="mb-24 scroll-mt-48">
            {group.id === 'specials' && <div id="desi-lahori-nashta" className="absolute -mt-48" />}
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 mt-8">
              <div className="flex-1 h-px bg-terracotta/30 max-w-[60px] md:max-w-[150px]"></div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-pine tracking-[0.15em] text-center">{group.label}</h2>
              <div className="flex-1 h-px bg-terracotta/30 max-w-[60px] md:max-w-[150px]"></div>
            </div>
            
            {CATEGORY_DESCRIPTIONS[group.id] && (
              <div className="mb-12 text-center max-w-2xl mx-auto px-4">
                <strong className="font-sans text-terracotta tracking-[0.2em] uppercase text-xs md:text-sm block mb-3">{CATEGORY_DESCRIPTIONS[group.id].title}</strong>
                <p className="text-pine/70 font-medium leading-loose text-sm tracking-wide">
                  {CATEGORY_DESCRIPTIONS[group.id].text}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item, i) => {
                const isPlaceholder = !item.image || item.image.includes('tov-logo-tree') || item.image.includes('placeholder');
                const itemQuantity = cart.filter(ci => ci.id === item.id).reduce((sum, ci) => sum + ci.quantity, 0);
                
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    index={i}
                    isPlaceholder={isPlaceholder}
                    quantityInCart={itemQuantity}
                    onClick={() => {
                      if (item.is86d) return;
                      const fullItem = item as FullMenuItem;
                      
                      if (SIZE_CATEGORIES.includes(item.category)) {
                        setSizePickerItem(item);
                      } else if (fullItem.modifier_groups && fullItem.modifier_groups.length > 0) {
                        setCustomisationItem(fullItem);
                      } else {
                        // 1-Tap Add directly to order
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          quantity: 1,
                          image: item.image,
                          category: item.category,
                          selectedVariants: [],
                          selectedModifiers: [],
                        } as any);
                        setToastMessage(`Added ${item.name} to order`);
                      }
                    }}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Floating Toast Notification for 1-Tap Adds */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[120] bg-pine/95 backdrop-blur-md text-[#FDFBF7] px-6 py-3.5 rounded-full border border-amber-200/30 shadow-[0_12px_32px_rgba(26,60,52,0.35)] flex items-center gap-3 font-bold text-xs tracking-wide whitespace-nowrap pointer-events-none"
          >
            <CheckCircle2 size={18} className="text-amber-300 flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Action Buttons */}

      {/* Sticky Mobile Floating Cart Bar */}
      {cart.length > 0 && !isCartOpen && (
        <div 
          className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-8 md:bottom-8 z-50 flex justify-center"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <button
            onClick={() => setIsCartOpen(true)}
            data-testid="cart-floating-bar"
            aria-label="Review and Pay"
            className="w-full md:w-auto bg-pine/95 backdrop-blur-md text-[#FDFBF7] px-6 py-3.5 rounded-full shadow-[0_12px_32px_rgba(26,60,52,0.35)] hover:shadow-[0_16px_40px_rgba(26,60,52,0.45)] active:scale-[0.98] border border-amber-200/30 hover:border-amber-200/50 transition-all flex items-center justify-between md:justify-start gap-5 tracking-wider"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-amber-300">
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#FDFBF7]">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items · £{finalCartTotal.toFixed(2)}
                </p>
                {promoDiscount > 0 && (
                  <p className="text-[10px] text-amber-300 font-bold tracking-wide">
                    Breakfast promo saved £{promoDiscount.toFixed(2)}!
                  </p>
                )}
              </div>
            </div>
            <span className="bg-terracotta hover:bg-terracotta/90 text-white px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase shadow-sm">
              Review & Pay ➔
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-pine/80 backdrop-blur-sm animate-fade-in transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className={`relative w-full bg-bg-sand h-full shadow-[-10px_0_40px_rgba(0,0,0,0.25)] flex flex-col animate-slide-in-right border-l border-pine/10 transition-all duration-300 ease-in-out ${
            checkoutStep === 'details' || checkoutStep === 'payment'
              ? 'max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
              : checkoutStep === 'success'
              ? 'max-w-full md:max-w-xl lg:max-w-2xl'
              : 'max-w-full md:max-w-lg lg:max-w-xl'
          }`}>
            <div className="p-5 md:px-8 border-b border-pine/10 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-pine uppercase tracking-widest leading-tight">
                  {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Delivery & Details' : checkoutStep === 'payment' ? 'Secure Payment' : 'Order Confirmed!'}
                </h2>
                {!tableParam && checkoutStep !== 'success' && (
                  <div className="hidden sm:flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-wider">
                    <button 
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className={`transition-colors ${checkoutStep === 'cart' ? 'text-terracotta underline' : 'text-pine/50 hover:text-pine'}`}
                    >
                      1. Cart {cart.length > 0 && `(${cart.reduce((s, i) => s + i.quantity, 0)})`}
                    </button>
                    <span className="text-pine/30">→</span>
                    <button 
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setCheckoutStep('details')}
                      className={`transition-colors ${checkoutStep === 'details' ? 'text-terracotta underline' : checkoutStep === 'payment' ? 'text-pine/50 hover:text-pine' : 'text-pine/30'}`}
                    >
                      2. Details
                    </button>
                    <span className="text-pine/30">→</span>
                    <span className={checkoutStep === 'payment' ? 'text-terracotta underline' : 'text-pine/30'}>
                      3. Payment
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {checkoutStep === 'cart' && cart.length > 0 && (
                  <button onClick={() => clearCart()} className="text-[10px] uppercase tracking-widest text-pine/40 hover:text-terracotta font-bold transition-colors">Clear Cart</button>
                )}
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    if (checkoutStep === 'success') {
                      setCheckoutStep('cart');
                      setCompletedOrder(null);
                    }
                  }} 
                  title="Close cart" 
                  className="p-2 hover:bg-pine/5 transition-colors text-pine rounded-full"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center text-pine/30 mt-20 flex flex-col items-center animate-fade-in-up">
                  <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="" className="w-32 h-32 opacity-20 mb-6 grayscale mix-blend-multiply" />
                  <p className="font-display text-2xl font-bold uppercase tracking-widest text-pine/50">Your table is waiting</p>
                  <p className="text-xs font-bold tracking-widest uppercase mt-4">Add items to begin</p>
                </div>
              ) : (
                cart.map((item, index) => {
                  const isFallback = !item.image || item.image.includes('tov-logo-tree');
                  return (
                  <div key={item.id} className="flex items-center gap-4 animate-fade-in-up group" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
                    <div className="relative w-20 h-20 rounded-2xl shadow-sm border border-pine/10 overflow-hidden flex-shrink-0 bg-white">
                      <img src={item.image} alt="" onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; e.target.className = 'w-full h-full object-contain p-3 opacity-40 transition-transform duration-700 group-hover:scale-110'; }} className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${isFallback ? 'object-contain p-3 opacity-40' : 'object-cover'}`} />
                      <div className="absolute inset-0 bg-pine/5 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-lg tracking-wider text-pine leading-tight">{item.name}</h4>
                      {item.modifiers && <p className="text-[10px] text-pine/60 mt-1 uppercase tracking-widest">{item.modifiers.size}</p>}
                      <p className="text-terracotta text-sm font-black mt-1">£{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-pine/20 px-3 py-1.5 rounded-full shadow-sm">
                      <button className="text-pine/60 hover:text-terracotta transition-colors font-black" title="Decrease quantity" onClick={() => removeFromCart(item.id)}><Minus size={16} strokeWidth={3} /></button>
                      <span className="font-black text-sm text-pine w-4 text-center">{item.quantity}</span>
                      <button className="text-pine/60 hover:text-terracotta transition-colors font-black" title="Increase quantity" onClick={() => addToCart(item)}><Plus size={16} strokeWidth={3} /></button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-pine/10 bg-bg-sand">
              {/* ─── Cart Upsell Engine Render ─── */}
              {upsellSuggestions.length > 0 && cartTotal > 0 && (
                <div className="mb-4 bg-white p-4 rounded-2xl border border-pine/10 flex items-center justify-between relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-terracotta/20 to-transparent group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex items-center gap-3 relative z-10 w-2/3">
                    <img src={upsellSuggestions[0].image} className={`w-12 h-12 rounded-xl shadow-sm border border-pine/10 flex-shrink-0 bibi-hover-image bg-white ${!upsellSuggestions[0].image || upsellSuggestions[0].image.includes('tov-logo-tree') ? 'object-contain p-1.5 opacity-40' : 'object-cover'}`} alt=""  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; e.target.className = 'w-12 h-12 rounded-xl shadow-sm border border-pine/10 flex-shrink-0 bibi-hover-image bg-white object-contain p-1.5 opacity-40'; }} />
                    <div className="truncate">
                      <p className="text-[10px] font-black text-terracotta uppercase tracking-widest mb-0.5">Perfect Pairing</p>
                      <p className="font-bold text-pine text-sm leading-tight truncate">{upsellSuggestions[0].name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (SIZE_CATEGORIES.includes(upsellSuggestions[0].category)) {
                        setSizePickerItem(upsellSuggestions[0]);
                      } else {
                        addToCart(upsellSuggestions[0]);
                      }
                    }}
                    className="relative z-10 bg-pine text-bg-sand px-4 py-2 rounded-full font-bold text-xs shadow-sm hover:bg-terracotta transition-all uppercase tracking-wider"
                  >
                    + £{upsellSuggestions[0].price.toFixed(2)}
                  </button>
                </div>
              )}

              {/* ─── Fulfillment Selector (Delivery First, Collection Second) ─── */}
              {!tableParam && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-pine mb-2 uppercase tracking-wider">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-pine/5 border border-pine/15 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfillmentType('delivery');
                      }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1 transition-all relative ${
                        fulfillmentType === 'delivery'
                          ? 'bg-terracotta text-white shadow-md'
                          : 'text-pine/70 hover:text-pine hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🚗</span>
                        <span>Delivery</span>
                      </span>
                      <span className="text-[10px] opacity-90 normal-case font-medium">
                        {activeDeliveryTier?.tier && discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold
                          ? 'FREE Delivery'
                          : (activeLocation.id === 'slough' ? 'From £3.50 · Est. ~35-45m' : 'From £2.99 · Est. ~30-45m')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFulfillmentType('collection');
                        setPostcodeError(null);
                      }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${
                        fulfillmentType === 'collection'
                          ? 'bg-pine text-white shadow-md'
                          : 'text-pine/70 hover:text-pine hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🛍️</span>
                        <span>Collection</span>
                      </span>
                      <span className="text-[10px] opacity-80 normal-case font-medium">Free · Ready ~20-25m</span>
                    </button>
                  </div>

                  {fulfillmentType === 'delivery' && (
                    <div className="mt-2.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-[11px] text-emerald-900 font-medium">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">🚗 {activeLocation.id === 'hayes' ? 'Hayes In-House Fleet:' : 'Slough Delivery:'}</span>
                          <span>{activeLocation.id === 'hayes' ? 'UB3, UB4, UB7, UB8, UB10' : 'SL1, SL2, SL3, SL4'}</span>
                        </div>
                        <span className="font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[10px]">
                          {activeDeliveryTier?.isValid && activeDeliveryTier.tier
                            ? (discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold ? 'FREE DELIVERY' : `£${activeDeliveryTier.tier.fee.toFixed(2)} Fee`)
                            : (activeLocation.id === 'slough' ? 'From £3.50' : 'From £2.99')}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-tight">
                        {activeLocation.id === 'hayes'
                          ? 'Tiered by distance: UB4 (£2.99) · UB3 (£3.99) · UB10 (£4.99) · UB8 (£5.99) · UB7 (£6.99)'
                          : 'Tiered by distance: SL1 (£3.50) · SL2 (£3.99) · SL3 (£4.99) · SL4 (£5.99)'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Voucher Code Input */}
              <div className="mb-4 bg-white p-3 rounded-xl border border-pine/10 shadow-sm">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={customVoucher}
                    onChange={(e) => {
                      setCustomVoucher(e.target.value.toUpperCase());
                      setVoucherError('');
                    }}
                    className="flex-1 bg-[#F7F2E7] px-3 py-2 text-sm font-bold text-pine uppercase rounded-lg focus:outline-none focus:ring-2 focus:ring-pine/20 placeholder:text-pine/30 placeholder:normal-case border border-transparent"
                  />
                  <button
                    onClick={() => {
                      const code = customVoucher.trim();
                      if (!code) return;
                      if (code.startsWith('TOV30-') || code.startsWith('TOV50-')) {
                        setAppliedVoucher(code);
                        setVoucherError('');
                      } else {
                        setVoucherError('Invalid voucher code');
                        setAppliedVoucher(null);
                      }
                    }}
                    className="bg-pine text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-terracotta transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-[10px] mt-1.5 font-bold uppercase tracking-wider px-1">{voucherError}</p>}
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{appliedVoucher} Applied</span>
                    <button onClick={() => { setAppliedVoucher(null); setCustomVoucher(''); }} className="text-emerald-700/50 hover:text-emerald-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 mb-6 text-pine">
                <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-terracotta font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} /> {appliedVoucher ? `${appliedVoucher} VOUCHER` : ACTIVE_PROMO.cartLabel}
                    </span>
                    <span>-£{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {activePromo === 'BREAKFAST40' && promoDiscount === 0 && (
                  <div className="text-[11px] text-pine/50 font-medium italic">
                    {!isPromoTimeValid
                      ? 'BREAKFAST40 is valid 9:00 AM – 2:00 PM only.'
                      : 'Add breakfast items to your cart to get 40% off.'}
                  </div>
                )}
                {isDeliveryOrder && deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                {serviceFee > 0 && (
                  <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                    <span>Service Fee (10%)</span>
                    <span>£{serviceFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-pine/10 text-xl font-bold">
                  <span className="font-display text-sm uppercase tracking-[0.2em] font-bold">Total</span>
                  <span className="font-display text-2xl font-bold">£{finalCartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {isKitchenClosed && (
                <div className="bg-pine/10 text-pine rounded-xl p-3 mb-4 text-center text-sm font-bold">
                  🕐 Kitchen opens at 12:00 PM — Browse our menu and order when we open!
                </div>
              )}
              {isBelowMinOrder && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-amber-800 mb-2">
                    <span>Minimum order for delivery: £{minOrder.toFixed(2)}</span>
                    <span>£{minOrderRemaining.toFixed(2)} more</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${minOrderProgress}%` }} />
                  </div>
                </div>
              )}
              {isDeliveryOrder && !isBelowMinOrder && activeDeliveryTier?.tier?.freeDeliveryThreshold && discountedSubtotal < activeDeliveryTier.tier.freeDeliveryThreshold && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-emerald-800 mb-2">
                    <span>🚗 Free delivery at £{activeDeliveryTier.tier.freeDeliveryThreshold.toFixed(2)}</span>
                    <span>£{(activeDeliveryTier.tier.freeDeliveryThreshold - discountedSubtotal).toFixed(2)} more</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (discountedSubtotal / activeDeliveryTier.tier.freeDeliveryThreshold) * 100)}%` }} />
                  </div>
                </div>
              )}
              <button
                onClick={handleProceedToDetails}
                disabled={cart.length === 0 || isKitchenClosed || isBelowMinOrder}
                className="w-full py-5 bg-pine text-white font-black hover:bg-terracotta active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl relative overflow-hidden group mb-4 rounded-full"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex justify-between px-8 items-center w-full">
                  <span>{isBelowMinOrder ? `Add £${minOrderRemaining.toFixed(2)} more` : 'Checkout'}</span>
                  <span className="text-lg">£{finalCartTotal.toFixed(2)}</span>
                </span>
              </button>

              <div className="flex flex-col items-center gap-2 pt-2 border-t border-pine/10">
                <div className="flex items-center gap-4 opacity-50 grayscale flex-wrap justify-center hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-3 object-contain" alt="Apple Pay" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-3 object-contain" alt="Google Pay" />
                  <span className="font-bold text-[11px] tracking-wider text-pine/80">klarna.</span>
                  <span className="font-black text-[12px] tracking-widest text-pine/80 italic font-serif">VISA</span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" className="h-4 object-contain" alt="Mastercard" />
                </div>
                <p className="text-[7px] text-pine/40 font-black uppercase tracking-[0.2em]">Secure Checkout Supported</p>
              </div>
            </div>
            </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={submitOrder} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 lg:grid lg:grid-cols-12">
                  <div className="lg:col-span-7 flex flex-col min-h-0 bg-white lg:border-r border-pine/10">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                      <div className="mb-2">
                        {tableParam ? (
                          <>
                            <p className="text-xs font-bold text-pine/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><MapPin size={14} /> Dine-In · Table {tableParam}</p>
                            <h3 className="font-display text-3xl font-bold text-pine leading-tight">Your Details</h3>
                            <p className="text-pine/60 text-sm mt-3 normal-case leading-relaxed font-medium">Sit back and relax. Your order will be sent straight to the chef. You can pay with our staff before you leave.</p>
                          </>
                        ) : (
                          <>
                            {activeLocation.id === 'hayes' ? (
                              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 shadow-sm">
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                                  <span>🚗</span> Doorstep Delivery Available (Hayes Fleet)
                                </p>
                                <p className="text-xs text-emerald-800 font-bold mt-1">
                                  Hot &amp; fresh direct to your doorstep via our own in-house drivers! Serving UB4 (£2.99), UB3 (£3.99), UB10 (£4.99), UB8 (£5.99), UB7 (£6.99).
                                </p>
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 shadow-sm">
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                                  <span>🚗</span> Doorstep Delivery Available (Slough Branch)
                                </p>
                                <p className="text-xs text-emerald-800 font-bold mt-1">
                                  Hot &amp; fresh direct to your doorstep via Square fulfillment! Serving SL1 (£3.50), SL2 (£3.99), SL3 (£4.99), SL4 (£5.99).
                                </p>
                              </div>
                            )}

                            {/* Branch Confirmation Chip */}
                            {!tableParam && (
                              <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl mb-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-start gap-3">
                                  <MapPin className="text-terracotta shrink-0 mt-0.5" size={18} />
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-terracotta">Active Branch:</p>
                                    <p className="text-sm font-bold text-pine leading-tight">{activeLocation.name}</p>
                                    <p className="text-xs text-pine/60 mt-0.5">{activeLocation.address}, {activeLocation.postcode}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsLocationModalOpen(true)}
                                  className="text-xs font-black uppercase tracking-wider text-terracotta underline hover:text-pine shrink-0 ml-3"
                                >
                                  Change Branch
                                </button>
                              </div>
                            )}


                            <h3 className="font-display text-2xl md:text-3xl font-bold text-pine leading-tight">Your Details</h3>
                            <p className="text-pine/60 text-xs sm:text-sm mt-1 normal-case leading-relaxed font-medium">
                              {isDeliveryOrder
                                ? 'Enter your delivery address and contact info for our drivers.'
                                : "Enter your details so we can have your order ready and notify you when it's hot and fresh."}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Full Name *</label>
                            <input
                              type="text"
                              required
                              autoFocus
                              className="w-full p-3.5 bg-white border border-pine/15 focus:border-pine focus:ring-1 focus:ring-brand-text/20 outline-none transition-all text-pine rounded-xl text-sm"
                              value={customerInfo.name}
                              onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              className={`w-full p-3.5 bg-white border outline-none transition-all text-pine font-medium shadow-sm rounded-xl text-sm ${
                                phoneError
                                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                                  : 'border-pine/15 focus:border-pine'
                              }`}
                              value={customerInfo.phone}
                              onChange={e => {
                                setCustomerInfo({ ...customerInfo, phone: e.target.value });
                                if (phoneError) setPhoneError(getPhoneError(e.target.value));
                              }}
                              onBlur={() => {
                                if (customerInfo.phone.trim()) setPhoneError(getPhoneError(customerInfo.phone));
                              }}
                              placeholder="07XXX XXXXXX"
                              maxLength={15}
                            />
                            {phoneError && (
                              <p className="text-red-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest">{phoneError}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Email Address (Order Confirmation &amp; Live Tracker) *</label>
                          <input
                            type="email"
                            required
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-pine outline-none transition-all text-pine font-medium shadow-sm rounded-xl text-sm"
                            value={customerInfo.email}
                            onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            placeholder="your@email.com"
                          />
                        </div>

                    {/* ─── Delivery Address Inputs (Only when Delivery is selected) ─── */}
                    {isDeliveryOrder && (
                      <div className="space-y-4 p-5 bg-terracotta/5 border-2 border-terracotta/20 rounded-2xl mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-terracotta flex items-center gap-1.5">
                            <span>🚗</span> Delivery Address ({activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Branch'})
                          </span>
                          <span className="text-[10px] font-bold bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full">
                            {activeDeliveryTier?.tier ? `Min Order £${activeDeliveryTier.tier.minOrder.toFixed(2)}` : 'Min Order £15'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Address Line 1 *</label>
                          <input
                            type="text"
                            required={isDeliveryOrder}
                            value={deliveryAddress.line1}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })}
                            placeholder="Flat / House number and street name"
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={deliveryAddress.line2}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })}
                            placeholder="Apartment, building, unit, etc."
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Town / Area *</label>
                            <input
                              type="text"
                              required={isDeliveryOrder}
                              value={deliveryAddress.city}
                              onChange={e => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                              placeholder={activeLocation.id === 'hayes' ? 'Hayes' : 'Slough'}
                              className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Postcode *</label>
                            <input
                              type="text"
                              required={isDeliveryOrder}
                              value={deliveryAddress.postcode}
                              onChange={e => {
                                const pc = e.target.value.toUpperCase();
                                setDeliveryAddress({ ...deliveryAddress, postcode: pc });
                                if (postcodeError) {
                                  const res = isPostcodeInDeliveryZone(pc, activeLocation.id);
                                  setPostcodeError(res.isValid ? null : (res.reason || 'Invalid delivery postcode'));
                                }
                              }}
                              onBlur={() => {
                                if (deliveryAddress.postcode.trim()) {
                                  const res = isPostcodeInDeliveryZone(deliveryAddress.postcode, activeLocation.id);
                                  setPostcodeError(res.isValid ? null : (res.reason || 'Invalid delivery postcode'));
                                }
                              }}
                              placeholder={activeLocation.id === 'hayes' ? 'e.g. UB4 0RU' : 'e.g. SL1 4XL'}
                              className={`w-full p-3.5 bg-white border rounded-xl text-sm uppercase font-bold outline-none ${
                                postcodeError
                                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200 text-red-700'
                                  : 'border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 text-pine'
                              }`}
                            />
                          </div>
                        </div>

                        {activeDeliveryTier?.isValid && activeDeliveryTier.tier ? (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                            <span>✅ {activeDeliveryTier.outcode} ({activeDeliveryTier.tier.areaName})</span>
                            <span>
                              {deliveryFee === 0
                                ? 'FREE Delivery Qualified!'
                                : `£${activeDeliveryTier.tier.fee.toFixed(2)} (Free over £${activeDeliveryTier.tier.freeDeliveryThreshold})`}
                            </span>
                          </div>
                        ) : postcodeError ? (
                          <p className="text-red-600 text-xs font-semibold">{postcodeError}</p>
                        ) : (
                          <p className="text-[11px] text-pine/60 font-medium">
                            {activeLocation.id === 'hayes' ? (
                              <>Delivery zones: <strong>UB4</strong> (£2.99), <strong>UB3</strong> (£3.99), <strong>UB10</strong> (£4.99), <strong>UB8</strong> (£5.99), <strong>UB7</strong> (£6.99).</>
                            ) : (
                              <>Delivery zones: <strong>SL1</strong> (£3.50), <strong>SL2</strong> (£3.99), <strong>SL3</strong> (£4.99), <strong>SL4</strong> (£5.99).</>
                            )}
                          </p>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Driver Delivery Instructions (Optional)</label>
                          <input
                            type="text"
                            value={deliveryAddress.instructions}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                            placeholder="e.g. Ring buzzer 4, leave by front porch"
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>
                      </div>
                    )}

                    {/* Online Payment Requirement & Order Type Overview */}
                    {!tableParam && (
                      <div className="pt-2 space-y-2">
                        <div className="p-4 border-2 border-terracotta/40 bg-gradient-to-br from-terracotta/5 to-amber-500/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={18} className="text-terracotta" />
                              <span className="font-bold text-xs uppercase tracking-wider text-pine">
                                {isDeliveryOrder ? 'Driver Delivery • Pay Online' : 'Collection Order • Pay Online'}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-terracotta text-white px-2.5 py-0.5 rounded-full">
                              Apple Pay / Google Pay / Card
                            </span>
                          </div>
                          <p className="text-xs font-medium text-pine/80 leading-relaxed">
                            {isDeliveryOrder
                              ? `Food is freshly prepared and delivered hot by our in-house drivers (~${activeDeliveryTier?.tier?.estimatedMinutes || 40} mins).`
                              : 'Food is freshly cooked upon payment. 1-touch checkout with Apple Pay, Google Pay, or Card.'}
                          </p>
                          {promoDiscount > 0 && (
                            <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md mt-2 flex items-center gap-1.5">
                              <span>🎁</span>
                              <span>Online promotion applied: -£{promoDiscount.toFixed(2)} (Online Exclusive)</span>
                            </p>
                          )}
                          {isDeliveryOrder && (
                            <div className="mt-2 pt-2 border-t border-pine/10 flex items-center justify-between text-xs font-bold text-pine">
                              <span>
                                {activeDeliveryTier?.isValid && activeDeliveryTier.tier
                                  ? `Delivery to ${activeDeliveryTier.outcode}:`
                                  : 'Delivery Fee:'}
                              </span>
                              <span className={deliveryFee === 0 ? 'text-emerald-700 font-black' : 'text-pine font-black'}>
                                {deliveryFee === 0
                                  ? `FREE (Qualified over £${activeDeliveryTier?.tier?.freeDeliveryThreshold || 35})`
                                  : `£${deliveryFee.toFixed(2)}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Kitchen Prep SLA Notice */}
                    {!tableParam && (
                      <div className="bg-amber-50 border-2 border-amber-300 p-4 mt-4 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider mb-1">
                          <Clock size={16} className="text-amber-700 shrink-0" />
                          <span>Estimated {isDeliveryOrder ? 'Delivery' : 'Prep'} Time: {isDeliveryOrder ? '35 – 45 Minutes' : '20 – 25 Minutes'}</span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                          {isDeliveryOrder
                            ? 'Every dish is made fresh to order. Our drivers will dispatch as soon as the tandoor and karahis are completed.'
                            : 'Every karahi, handi, and grill is prepared fresh to order. To ensure food is piping hot and prevent counter queues, please do not arrive before your tracker confirms Ready for Pickup.'}
                        </p>
                      </div>
                    )}
                    
                    {/* GDPR Marketing Opt-in */}
                    <div className="flex items-start gap-4 mt-4 bg-white p-5 border border-pine/10 shadow-sm cursor-pointer group rounded-xl" onClick={() => setMarketingOptIn(!marketingOptIn)}>
                      <div className="pt-0.5 shrink-0">
                        <div className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out relative ${marketingOptIn ? 'bg-terracotta' : 'bg-pine/20'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${marketingOptIn ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-pine leading-relaxed cursor-pointer block select-none">
                          I would like to receive exclusive offers, secret menu drops, and birthday rewards via email or SMS. 
                        </label>
                        <span className="block text-[9px] text-pine/50 mt-1.5 uppercase tracking-widest font-bold">We respect your privacy. Unsubscribe at any time.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinned Bottom in Left Column */}
                <div className="shrink-0 p-5 md:px-8 border-t border-pine/10 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)] z-20 space-y-3">
                      {isKitchenClosed && (
                        <div className="bg-pine/10 text-pine rounded-xl p-3 mb-4 text-center text-sm font-bold">
                          🕐 Kitchen opens at 12:00 PM — Browse our menu and order when we open!
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (isKitchenClosed || isSubmitting || customerInfo.name.trim() === '' || customerInfo.phone.trim() === '' || customerInfo.email.trim() === '' || !!phoneError) return;
                          
                          // Delivery validation
                          if (isDeliveryOrder) {
                            const tierCheck = getDeliveryTier(deliveryAddress.postcode, activeLocation.id);
                            if (!tierCheck.isValid || !tierCheck.tier) {
                              setPostcodeError(tierCheck.reason || 'Invalid delivery postcode');
                              alert(tierCheck.reason || (activeLocation.id === 'hayes' ? 'We deliver to UB4, UB3, UB10, UB8, and UB7 from Hayes.' : 'We deliver to SL1, SL2, SL3, and SL4 from Slough.'));
                              return;
                            }
                            if (discountedSubtotal < tierCheck.tier.minOrder) {
                              alert(`Minimum order for delivery to ${tierCheck.outcode} (${tierCheck.tier.areaName}) is £${tierCheck.tier.minOrder.toFixed(2)}. Please add more items to your cart.`);
                              return;
                            }
                            if (!deliveryAddress.line1.trim()) {
                              alert('Please enter your delivery street address (Line 1).');
                              return;
                            }
                            if (!deliveryAddress.postcode.trim()) {
                              alert('Please enter your delivery postcode.');
                              return;
                            }
                          }

                          if (!tableParam) {
                            setCheckoutStep('payment');
                          } else {
                            submitOrder(e as any, 'collection');
                          }
                        }}
                        disabled={isKitchenClosed || isSubmitting || customerInfo.name.trim() === '' || customerInfo.phone.trim() === '' || customerInfo.email.trim() === '' || !!phoneError}
                        className="w-full py-4 md:py-5 px-6 bg-pine text-white font-black hover:bg-terracotta active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl relative overflow-hidden group rounded-xl"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        <span className="relative z-10 flex justify-between items-center w-full">
                          <span>
                            {tableParam 
                              ? 'Complete Order' 
                              : 'Proceed to Payment (Apple Pay / Google Pay / Card)'
                            }
                          </span>
                          <span className="text-lg font-sans">£{finalCartTotal.toFixed(2)}</span>
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="w-full py-1.5 text-pine/40 font-bold hover:text-terracotta transition-colors uppercase tracking-[0.2em] text-[10px]"
                      >
                        ← Back to Cart
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Desktop Live Sticky Order Summary */}
                  {desktopOrderSummary}
                </div>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="flex-1 min-h-0 lg:grid lg:grid-cols-12">
                  {/* Left Column: Payment Form */}
                  <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto p-6 md:p-8 space-y-6 pb-24 bg-white lg:border-r border-pine/10">
                    <div>
                      <h3 className="font-sans text-xl md:text-2xl font-bold text-pine uppercase tracking-widest mb-1 leading-none">Complete Payment</h3>
                      <p className="text-pine/60 text-xs normal-case mb-6">Choose Express Checkout (Apple Pay / Google Pay) or enter card details below. We do not store card numbers.</p>
                      
                      {!tableParam && (
                        isDeliveryOrder ? (
                          <div className="bg-emerald-50 border border-emerald-200 p-4 mb-6 rounded-xl">
                            <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                              <span>🚗</span>
                              Driver Delivery ({activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Branch'})
                            </p>
                            <p className="text-[11px] text-emerald-800 mt-1 font-medium leading-relaxed">
                              Delivering to: <strong>{deliveryAddress.line1}, {deliveryAddress.postcode}</strong> (~35-45 mins).
                            </p>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-xl">
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                              <AlertCircle size={14} className="text-amber-700" />
                              Collection from {activeLocation.name}
                            </p>
                            <p className="text-[11px] text-amber-800 mt-1 font-medium leading-relaxed">
                              Collect from: <strong>{activeLocation.address}, {activeLocation.postcode}</strong> (~20-25 mins).
                            </p>
                          </div>
                        )
                      )}
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                        <p className="font-bold mb-1">⚠️ Allergen Notice</p>
                        <p>Our dishes may contain nuts, gluten, dairy, and other allergens. If you have a food allergy, please call us before ordering: <a href={`tel:${activeLocation.phone}`} className="font-bold underline">{activeLocation.phone}</a></p>
                      </div>

                      {(activeLocation as any).square?.enabled && (activeLocation as any).square?.appId && (activeLocation as any).square?.locationId ? (
                        <SquarePaymentForm
                          total={finalCartTotal}
                          branchName={activeLocation.name}
                          appId={(activeLocation as any).square.appId}
                          locationId={(activeLocation as any).square.locationId}
                          customerDetails={{
                            name: customerInfo.name,
                            phone: customerInfo.phone,
                            email: customerInfo.email,
                            addressLine1: isDeliveryOrder ? deliveryAddress.line1 : undefined,
                            addressLine2: isDeliveryOrder ? deliveryAddress.line2 : undefined,
                            city: isDeliveryOrder ? deliveryAddress.city : undefined,
                            postcode: isDeliveryOrder ? deliveryAddress.postcode : undefined,
                          }}
                          onBeforeSubmit={() => {
                            if (!customerInfo.name.trim()) {
                              alert('Please enter your name');
                              return false;
                            }
                            const phoneClean = customerInfo.phone.replace(/\s+/g, '');
                            if (!phoneClean || !isValidUKMobile(phoneClean)) {
                              alert('Please enter a valid UK phone number (e.g. 07123 456789)');
                              return false;
                            }
                            if (isDeliveryOrder) {
                              if (!deliveryAddress.line1.trim()) {
                                alert('Please enter your delivery street address');
                                return false;
                              }
                              if (!deliveryAddress.postcode.trim()) {
                                alert('Please enter your delivery postcode');
                                return false;
                              }
                              const check = isPostcodeInDeliveryZone(deliveryAddress.postcode, activeLocation.id);
                              if (!check.isValid) {
                                alert(check.reason || 'Invalid delivery postcode');
                                return false;
                              }
                            }
                            return true;
                          }}
                          onSuccess={handleSquarePaymentSuccess}
                          onCancel={() => setCheckoutStep('details')}
                          isSubmittingOrder={isSubmitting}
                        />
                      ) : (
                        <SquareCheckout 
                          amount={finalCartTotal} 
                          onCreateOrder={async () => {
                            return `ORD-${generateId().split('-')[0].toUpperCase()}`;
                          }}
                          onPaymentSuccess={(orderId, method = 'online') => {
                            trackOrderPlaced(orderId, finalCartTotal, cart);
                            setCompletedOrder({ 
                              id: orderId, 
                              customerName: customerInfo.name, 
                              customerPhone: customerInfo.phone, 
                              customerEmail: customerInfo.email,
                              type: isDeliveryOrder ? 'delivery' : 'collection',
                              isPaid: true,
                              paymentMethod: 'card',
                              payment_status: 'paid',
                              items: [...cart],
                              subtotal: cartTotal,
                              discount: promoDiscount,
                              total: finalCartTotal,
                              status: 'pending',
                              timestamp: new Date()
                            } as any);
                            setCheckoutStep('success');
                            clearCart();
                            (typeof window !== 'undefined' ? window.localStorage : {}).setItem('last_order_time', Date.now().toString());
                          }} 
                          onCancel={() => setCheckoutStep('details')} 
                        />
                      )}
                    </div>
                  </div>

                  {/* Right Column: Desktop Live Sticky Order Summary */}
                  {desktopOrderSummary}
                </div>
              </div>
            )}

            {checkoutStep === 'success' && completedOrder && (
              tableParam ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-sand/50">
                  <LiveOrderTracker 
                    initialOrder={completedOrder} 
                    tableId={tableParam} 
                    onAddToTab={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      // Clear local cart but keep order session alive
                    }} 
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-sm border ${
                      completedOrder.payment_status === 'paid' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${completedOrder.payment_status === 'paid' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      <span>
                        {completedOrder.payment_status === 'paid'
                          ? completedOrder.type === 'delivery' || completedOrder.fulfillment_type === 'delivery'
                            ? 'PAID ONLINE · DRIVER DELIVERY (HAYES)'
                            : 'PAID ONLINE · READY FOR COLLECTION'
                          : completedOrder.type === 'dine-in'
                            ? `DINE-IN · TABLE ${completedOrder.table_number || ''} · PAY WITH STAFF`
                            : 'PAID ONLINE · READY FOR COLLECTION'}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl font-bold text-pine mb-2">Order Confirmed!</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Your order has been sent directly to the kitchen.
                    </p>
                    {completedOrder.customerEmail && (
                      <p className="text-[11px] text-pine/70 font-semibold mt-1">
                        📧 Order confirmation ticket dispatched to <span className="text-pine font-bold underline">{completedOrder.customerEmail}</span>.
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Send Button — the primary CTA (Only for non-table orders) */}
                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle size={24} />
                    Send Order via WhatsApp
                  </a>

                  {/* Or call & print */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <a
                      href={`tel:${SHOP_CONFIG.phoneNumberRaw}`}
                      className="py-3 bg-white text-pine rounded-full font-bold border border-pine/20 flex items-center justify-center gap-2 hover:bg-pine/5 transition-colors shadow-sm text-xs"
                    >
                      <Phone size={16} />
                      Call Restaurant
                    </a>
                    <button
                      type="button"
                      onClick={() => (typeof window !== 'undefined' ? window : {}).print()}
                      className="py-3 bg-white text-pine rounded-full font-bold border border-pine/20 flex items-center justify-center gap-2 hover:bg-pine/5 transition-colors shadow-sm text-xs"
                    >
                      <Printer size={16} />
                      Print Receipt
                    </button>
                  </div>

                  <div className="bg-bg-sand w-full py-4 px-6 rounded-2xl border border-terracotta-light border-dashed text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Order Reference</p>
                    <p className="font-mono text-3xl font-black text-pine tracking-tighter">{completedOrder.id}</p>
                  </div>

                  {/* Estimated Ready Time Highlight Card */}
                  <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-left w-full shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={16} className="text-amber-700 shrink-0" />
                        Estimated Ready Time
                      </p>
                      <span className="px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-black uppercase">
                        20–25 Mins
                      </span>
                    </div>
                    <div className="text-2xl font-black text-[#a64036] mb-1">
                      Ready by approx. {(() => {
                        const placed = new Date(completedOrder.timestamp || Date.now());
                        const readyDate = new Date(placed.getTime() + (completedOrder.estimatedReadyMinutes || 25) * 60 * 1000);
                        return readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      Freshly prepared over live flames at <strong>{activeLocation.name}</strong>. Please head to the counter only when your tracker shows <strong>Ready for Pickup</strong>.
                    </p>
                  </div>

                  {/* Full Itemized Order Details */}
                  <div className="w-full bg-white border border-pine/10 rounded-2xl p-5 text-left shadow-sm">
                    <div className="flex items-center justify-between border-b border-pine/10 pb-3 mb-3">
                      <h4 className="font-serif text-sm font-bold text-pine uppercase tracking-wider">Order Items</h4>
                      <span className="text-[11px] font-bold text-pine/50">
                        {completedOrder.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 0} Items
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {completedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-pine/5 pb-2">
                          <div className="pr-3">
                            <span className="font-bold text-pine">{item.quantity}x {item.name}</span>
                            {item.notes && (
                              <p className="text-[11px] text-pine/60 italic mt-0.5">Note: {item.notes}</p>
                            )}
                          </div>
                          <span className="font-bold text-pine font-sans shrink-0">
                            £{((Number(item.price || 0)) * (Number(item.quantity || 1))).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-pine/10 space-y-1.5 text-xs">
                      {completedOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Discount</span>
                          <span>-£{Number(completedOrder.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-pine font-black text-sm pt-1">
                        <span>Total Paid</span>
                        <span className="text-[#a64036]">£{Number(completedOrder.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Push Notification Alert Status / Button */}
                  <div className="w-full">
                    {pushAlertActive || completedOrder.fcmToken ? (
                      <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Bell size={18} className="text-emerald-600 animate-bounce shrink-0" />
                        <span>🔔 Phone Alerts Active! We will alert you the second your food is ready.</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (completedOrder?.id) {
                            const token = await requestPushPermission(completedOrder.id);
                            if (token) {
                              setPushAlertActive(true);
                              alert('🔔 Alert enabled! We will buzz your phone the second your food is ready.');
                            }
                          }
                        }}
                        className="w-full py-3.5 bg-white border-2 border-terracotta text-pine rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-terracotta/5 transition-all shadow-sm cursor-pointer"
                      >
                        <Bell size={18} className="text-terracotta shrink-0" />
                        Alert My Phone When Ready
                      </button>
                    )}
                  </div>

                  <a
                    href={`/track/${completedOrder.id}`}
                    className="w-full py-4 bg-gradient-to-r from-terracotta to-rose-400 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    📍 Track Your Order Live
                  </a>

                  <div className="bg-white p-4 rounded-2xl shadow-md border border-terracotta-light/30 inline-block">
                    <QRCode 
                      value={`TASTE OF VILLAGE-ORDER:${completedOrder.id}`} 
                      size={120}
                      fgColor="#2B1A12"
                      level="Q"
                    />
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeLocation.name + ' ' + activeLocation.address + ' ' + activeLocation.postcode)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white border border-pine/20 text-pine hover:bg-pine hover:text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    <MapPin size={18} className="text-terracotta" />
                    Get Directions ({activeLocation.name.replace('Taste Of Village ', '')})
                  </a>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      setCompletedOrder(null);
                    }}
                    className="w-full py-4 bg-pine text-white rounded-full font-bold mt-2 hover:bg-pine/90 transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ─── Size Picker Modal ─── */}
      {sizePickerItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSizePickerItem(null)}></div>
          <div className="relative bg-[#FDFBF7] rounded-[28px] p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-pine/10 animate-fade-up">
            <button onClick={() => setSizePickerItem(null)} className="absolute top-4 right-4 p-2 hover:bg-pine/5 text-pine/40 hover:text-pine rounded-full transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <img src={sizePickerItem.image} alt={sizePickerItem.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-md border border-pine/10" onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; }} />
              <h3 className="font-display text-xl font-bold text-pine leading-tight">{sizePickerItem.name}</h3>
              <p className="text-pine/50 text-xs font-semibold uppercase tracking-wider mt-1">Choose your option</p>
            </div>
            <div className="space-y-3">
              {(() => {
                const sizes = WEB_SIZE_ITEMS[sizePickerItem.name];
                const regularPrice = sizes ? sizes.regular : sizePickerItem.price;
                
                let largePrice = sizes ? sizes.large : sizePickerItem.price + 2.99;
                if (!sizes) {
                  if (sizePickerItem.category === 'rolls') {
                    largePrice = sizePickerItem.price + 2.50;
                  } else if (sizePickerItem.category === 'burgers') {
                    largePrice = sizePickerItem.price + 2.99;
                  }
                }
                
                const isMeal = sizePickerItem.category === 'burgers';
                const largeLabel = isMeal ? 'Make it a Meal' : 'Large';
                const largeDesc = isMeal ? 'Add Chips & Drink' : 'Extra portion';

                return (
                  <>
                    <button
                      onClick={() => {
                        addToCart({ ...sizePickerItem, id: `${sizePickerItem.id}_regular`, name: `${sizePickerItem.name} (Regular)`, price: regularPrice });
                        setSizePickerItem(null);
                        setToastMessage(`Added ${sizePickerItem.name} (Regular) to order`);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-pine/15 hover:border-terracotta hover:bg-terracotta/5 transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="text-left">
                        <p className="font-bold text-pine group-hover:text-terracotta transition-colors">Regular</p>
                        <p className="text-pine/40 text-xs">Standard serving</p>
                      </div>
                      <span className="font-sans font-black text-terracotta text-lg">£{regularPrice.toFixed(2)}</span>
                    </button>
                    <button
                      onClick={() => {
                        addToCart({ ...sizePickerItem, id: `${sizePickerItem.id}_large`, name: `${sizePickerItem.name} (${isMeal ? 'Meal' : 'Large'})`, price: largePrice });
                        setSizePickerItem(null);
                        setToastMessage(`Added ${sizePickerItem.name} (${largeLabel}) to order`);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl border border-pine/15 hover:border-pine hover:bg-pine/5 transition-all group shadow-sm hover:shadow-md mt-3"
                    >
                      <div className="text-left">
                        <p className="font-bold text-pine group-hover:text-terracotta transition-colors">{largeLabel}</p>
                        <p className="text-pine/40 text-xs">{largeDesc}</p>
                      </div>
                      <span className="font-sans font-black text-pine text-lg">£{largePrice.toFixed(2)}</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ─── Customisation Modal (DB variants + modifiers + allergens) ─── */}
      {customisationItem && (
        <CustomisationModal
          item={customisationItem}
          onClose={() => setCustomisationItem(null)}
          onAddToCart={(cartItem) => {
            addToCart(cartItem as any);
            setCustomisationItem(null);
            setToastMessage(`Added ${cartItem.name} to order`);
          }}
        />
      )}
      {/* ─── Upsell Drawer ─── */}
      <UpsellDrawer
        isOpen={isUpsellOpen}
        onClose={() => setIsUpsellOpen(false)}
        onProceed={() => {
          setIsUpsellOpen(false);
          setCheckoutStep('details');
        }}
        locationId={activeLocation.id}
      />

      {/* ─── Branch Selector Modal ─── */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        destination="menu"
      />
    </div>
  );
};


export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading Menu...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}
