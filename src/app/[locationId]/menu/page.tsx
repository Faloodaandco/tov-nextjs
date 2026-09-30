'use client';
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { generateId } from '@/utils/generateId';
import { motion, AnimatePresence } from 'framer-motion';

import { useStore } from '@/context/StoreContext';
import { Plus, Minus, ShoppingBag, X, CheckCircle2, MessageCircle, Phone, MapPin, Search, ChevronRight, CreditCard, Store, Clock, Bell, Ticket, Printer, Zap, AlertCircle, Star, RotateCcw, Truck } from 'lucide-react';
import { getMenuItems } from '@/services/menuService';
import { MenuItem } from '@/types';
import { buildWhatsAppLink, buildOrderWhatsAppMessage, SHOP_CONFIG, LOCATIONS, ACTIVE_PROMO, calculatePromoDiscount, isBreakfastPromoTime, isPostcodeInDeliveryZone, getDeliveryTier, HAYES_DELIVERY_TIERS, SLOUGH_DELIVERY_TIERS } from '@/config/shopConfig';
import { doc, setDoc } from 'firebase/firestore';
import { WEB_SIZE_ITEMS, SIZE_CATEGORIES, CATEGORY_DESCRIPTIONS } from '@/data/menuStaticData';
import { db } from '@/lib/firebase';
import { CustomisationModal } from '@/components/CustomisationModal';
import type { FullMenuItem } from '@/components/CustomisationModal';
import { MenuItemCard } from '@/components/MenuItemCard';
import { MenuCategoryNav } from '@/components/MenuCategoryNav';
import { CartDrawer } from '@/components/CartDrawer';

import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { UpsellDrawer } from '@/components/UpsellDrawer';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';
import { trackInitiateCheckout, trackOrderPlaced } from '@/utils/analytics';
import { useLocationConfig } from '@/hooks/useLocationConfig';
import { appendItemsToOrder } from '@/services/orderService';
import { isValidUKMobile, getPhoneError, normaliseUKPhone, captureClientMeta } from '@/lib/validation';
import { sendOrderNotificationEmail } from '@/services/emailService';
import { getExistingPushToken, requestPushPermission } from '@/utils/pushService';
import { upsertCustomerOnOrder } from '@/services/customerService';
import { sendPaymentFailureAlert } from '@/services/paymentAlertService';


function MenuPageContent() {
  const router = useRouter();
  const params = useParams();
  const routeLocationId = ((params?.locationId as string) || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const { activeLocation: contextLocation } = useLocationConfig();
  const activeLocation = contextLocation || LOCATIONS[routeLocationId] || LOCATIONS.hayes;
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const tableParam = searchParams.get('table') || searchParams.get('t');
  const { addToCart, cart, removeFromCart, updateQuantity, addOrder, clearCart, activePromo, isCartOpen, setIsCartOpen, reorderItems } = useStore();
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
    try {
      const nowInUK = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
      const hour = nowInUK.getHours();
      // Kitchen operates 09:00 - 23:00 UK time. Pre-orders are accepted outside these hours.
      return hour >= 23 || hour < 9;
    } catch {
      const hour = new Date().getHours();
      return hour >= 23 || hour < 9;
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [pushAlertActive, setPushAlertActive] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showReorderBanner, setShowReorderBanner] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [allergenAcknowledged, setAllergenAcknowledged] = useState(false);

  // Table session (NFC tap-to-order) — null when ordering via web
  const tableSession = useRef<{ id: string; status: string } | null>(null).current;

  // Restore regular customer profile and previous order for 1-tap reordering
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCustomer = window.localStorage.getItem('tov_customer_info');
        if (savedCustomer) {
          const parsed = JSON.parse(savedCustomer);
          if (parsed && typeof parsed === 'object') {
            setCustomerInfo(prev => ({
              name: prev.name || parsed.name || '',
              phone: prev.phone || parsed.phone || '',
              email: prev.email || parsed.email || '',
            }));
          }
        }
        const savedLastOrder = window.localStorage.getItem('tov_last_order');
        if (savedLastOrder) {
          const parsedOrder = JSON.parse(savedLastOrder);
          if (parsedOrder && Array.isArray(parsedOrder.items) && parsedOrder.items.length > 0) {
            setLastOrder(parsedOrder);
          }
        }
      } catch (e) {
        console.warn('[LocalStorage] Reading regular customer profile:', e);
      }
    }
  }, []);

  const handleReorderLastMeal = () => {
    if (!lastOrder || !Array.isArray(lastOrder.items) || lastOrder.items.length === 0) return;
    reorderItems(lastOrder.items);
    setToastMessage(`🔁 Reordered: ${lastOrder.items.length} item${lastOrder.items.length > 1 ? 's' : ''} added to your cart!`);
  };

  // Auto-dismiss toast notification
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handle ?added= redirect from dish detail pages
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const addedDish = params.get('added');
    if (addedDish) {
      setToastMessage(`✓ ${decodeURIComponent(addedDish)} added to your order`);
      // Clean the URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('added');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);


  useEffect(() => {
    async function loadMenu() {
      try {
        const branchKey = (activeLocation.id === 'slough' ? 'slough' : 'hayes') as 'hayes' | 'slough';
        const items = getMenuItems(branchKey);
        setMenuItems(items);
      } catch (error) {
        console.error("Failed to load menu items", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, [activeLocation.id]);

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

    if (typeof document !== 'undefined') {
      document.querySelectorAll('section[id^="category-"]').forEach((el: Element) => observer.current?.observe(el));
    }

    return () => observer.current?.disconnect();
  }, [isLoading, menuItems]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const element = document.getElementById(`category-${id}`);
    if (element) {
      const navOffset = window.innerWidth < 768 ? 140 : 160;
      const y = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  // Auto-scroll to specific category if requested via URL query params or hash
  useEffect(() => {
    const targetCat = searchParams.get('category') || searchParams.get('cat') || (typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '');
    if (targetCat && !isLoading && groupedMenu.length > 0) {
      const timer = setTimeout(() => {
        scrollToCategory(targetCat);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isLoading, groupedMenu]);


  // ─── Analytics Engine: Dwell Time Tracking ───
  useEffect(() => {
    if (!tableParam || typeof document === 'undefined') return;
    
    // Log the initial NFC tap (TODO: implement analytics endpoint)
    console.debug('[NFC] Table scan:', tableParam, typeof navigator !== 'undefined' ? navigator.userAgent : '');
    
    const startTime = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
        console.debug('[NFC] Session duration:', tableParam, durationSeconds, 's');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.debug('[NFC] Session end:', tableParam, durationSeconds, 's');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tableParam]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const { discount: autoPromoDiscount, eligibleSubtotal, eligibleItemsCount, isTimeValid: isPromoTimeValid } = useMemo(
    () => calculatePromoDiscount(cart, activePromo),
    [cart, activePromo]
  );
  
  // Server-validated voucher discount — set by CartDrawer after calling /api/vouchers/validate.
  // NEVER calculated client-side from prefix matching.
  const [voucherDiscountPercent, setVoucherDiscountPercent] = useState<number>(0);
  const [voucherFixedDiscount, setVoucherFixedDiscount] = useState<number>(0);
  const [promoBannerVisible, setPromoBannerVisible] = useState(false);
  const [promoBannerMessage, setPromoBannerMessage] = useState('');

  useEffect(() => {
    const promoQuery = searchParams.get('promo');
    if (promoQuery && !appliedVoucher && cartTotal >= 0) {
      const validatePromo = async () => {
        try {
          const res = await fetch('/api/promos/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoQuery, branchId: routeLocationId, subtotalPence: cartTotal * 100 })
          });
          const data = await res.json();
          if (data.valid) {
            setAppliedVoucher(promoQuery.toUpperCase());
            if (data.discountType === 'PERCENTAGE') {
              setVoucherDiscountPercent(data.discountPercent);
            } else if (data.discountType === 'FIXED_AMOUNT') {
              setVoucherFixedDiscount(data.fixedAmountPence / 100);
            }
            setPromoBannerMessage(data.reason || 'Promo applied!');
            setPromoBannerVisible(true);
            setTimeout(() => setPromoBannerVisible(false), 5000);
          }
        } catch (err) {
          console.error('Failed to validate promo', err);
        }
      };
      const timer = setTimeout(validatePromo, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, appliedVoucher, routeLocationId, cartTotal, setAppliedVoucher]);

  const voucherDiscountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (voucherFixedDiscount > 0) return voucherFixedDiscount;
    if (voucherDiscountPercent > 0) return Math.round(cartTotal * (voucherDiscountPercent / 100) * 100) / 100;
    return 0;
  }, [appliedVoucher, voucherDiscountPercent, voucherFixedDiscount, cartTotal]);

  // Anti-stacking: voucher wins over breakfast promo
  const promoDiscount = voucherDiscountAmount > 0 ? voucherDiscountAmount : autoPromoDiscount;
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
  // IMPORTANT: Uses pre-discount cartTotal to match server-side calculateServiceFee()
  const serviceFee = useMemo(() => {
    if (!isDeliveryOrder) return 0;
    const rate = activeLocation.delivery?.serviceFeePercent || 10;
    return Math.round(cartTotal * rate) / 100;
  }, [isDeliveryOrder, cartTotal, activeLocation]);

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
        setNameError('Please enter your name');
        setIsSubmitting(false);
        (window as any)._checkoutLock = false;
        return;
      }
      
      const phoneClean = customerInfo.phone.replace(/\s+/g, '');
      if (!phoneClean || !isValidUKMobile(phoneClean)) {
        const errorMsg = getPhoneError(phoneClean);
        setPhoneError(errorMsg);
        // Phone error already set via setPhoneError above — no browser alert needed
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
        if (typeof window !== 'undefined') window.localStorage.setItem('last_order_time', Date.now().toString());
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
      if (typeof window !== 'undefined') window.localStorage.setItem('last_order_time', Date.now().toString());
    } catch (e) {
      setCheckoutError('Could not place the order. Please check your connection or contact the shop.');
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
      const existingFcmToken = await getExistingPushToken().catch(() => null) || (typeof window !== 'undefined' ? window.localStorage.getItem('tov_fcm_token') : null) || undefined;

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
      };

      // Hit Next.js Route Handler with retry for infrastructure errors only
      let res: Response | null = null;
      const MAX_RETRIES = 1; // 1 retry max — nonces are single-use
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        res = await fetch('/api/checkout/square', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Only retry on 502/503/504 (gateway/infra errors, not app 500s)
        // App-level 500s return JSON and indicate the request reached our code
        if (res.ok || res.status < 502 || attempt === MAX_RETRIES) break;
        await new Promise(r => setTimeout(r, 1500));
      }

      if (!res || !res.ok) {
        let errMsg = 'Payment processing failed. Please try again or call us.';
        try {
          const responseText = await res!.text();
          try {
            const errData = JSON.parse(responseText);
            errMsg = errData.error || errMsg;
          } catch {
            // Non-JSON response (Vercel HTML error page / cold start crash)
            if (res!.status >= 500) {
              errMsg = `Server error (${res!.status}). Your card was NOT charged. Please try again or call ${activeLocation.phone || 'the restaurant'}.`;
            }
          }
        } catch {
          errMsg = `Connection error. Please check your internet and try again, or call ${activeLocation.phone || 'the restaurant'}.`;
        }
        throw new Error(errMsg);
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

      // Server-side checkout route already persists the order to Firestore.
      // Client-side write removed to prevent race condition overwriting server data.

      setCompletedOrder(completedOrderData);
      setCheckoutStep('success');
      clearCart();
      trackOrderPlaced(finalOrderId, finalCartTotal, cart);
      sendOrderNotificationEmail(completedOrderData as any);

      // Upsert customer loyalty record — non-blocking, fire-and-forget
      upsertCustomerOnOrder(
        normaliseUKPhone(customerInfo.phone),
        customerInfo.name.trim(),
        finalCartTotal
      ).catch((e) => console.warn('[Loyalty] upsertCustomerOnOrder:', e));

      // Save order snapshot for 1-tap reorder & profile persistence
      try {
        if (typeof window !== 'undefined') {
          const orderSnapshot = {
            orderId: finalOrderId,
            branch: activeLocation.id,
            branchName: activeLocation.name,
            items: cart.map(i => ({
              id: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              modifiers: i.modifiers,
              image: i.image,
            })),
            total: finalCartTotal,
            timestamp: Date.now(),
            customerName: customerInfo.name.trim(),
            customerPhone: customerInfo.phone.trim(),
            customerEmail: customerInfo.email.trim(),
          };
          window.localStorage.setItem('tov_last_order', JSON.stringify(orderSnapshot));
          window.localStorage.setItem('tov_customer_info', JSON.stringify({
            name: customerInfo.name.trim(),
            phone: customerInfo.phone.trim(),
            email: customerInfo.email.trim(),
          }));
          window.localStorage.setItem('last_order_time', Date.now().toString());
          setLastOrder(orderSnapshot);
        }
      } catch (storageErr) {
        console.warn('[LocalStorage] Save last order error:', storageErr);
      }
    } catch (err: any) {
      const isServerError = (err.message || '').includes('Server error') || (err.message || '').includes('Connection error');
      const isPermError = (err.message || '').toUpperCase().includes('PERMISSION');
      const msg = isPermError
        ? `Connection issue completing your order. If money was debited, please call ${activeLocation.phone || 'the restaurant'}.`
        : isServerError
        ? err.message
        : (err.message || `Payment failed. Please try again or call ${activeLocation.phone || 'the restaurant'}.`);
      sendPaymentFailureAlert({
        branchName: activeLocation.name,
        branchId: activeLocation.id,
        errorMessage: err.message || 'Unknown payment error',
        cartTotal: finalCartTotal,
        paymentMethod: 'card',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
      });
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
    if (activeCategory && typeof document !== 'undefined') {
      const btn = document.getElementById(`nav-btn-${activeCategory}`);
      const container = document.getElementById('category-nav-container');
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
    if (isCartOpen && typeof document !== 'undefined') {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
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
          {isDeliveryOrder ? <Truck size={18} className="text-terracotta" /> : <Store size={18} className="text-pine/60" />}
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
        <a
          href={activeLocation.id === 'slough'
            ? 'https://ratings.food.gov.uk/business/1963386/taste-of-village-slough'
            : 'https://ratings.food.gov.uk/business/653844/a-taste-of-village'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-1 hover:opacity-80 transition-opacity"
        >
          <img
            src={activeLocation.id === 'slough' ? '/assets/fhrs-badge-5-horizontal.svg' : '/assets/fhrs-badge-4-horizontal.svg'}
            alt={`Food Hygiene Rating ${activeLocation.id === 'slough' ? '5' : '4'}`}
            className="h-6 w-auto"
            loading="lazy"
          />
        </a>
        <p className="text-[9px] text-pine/40">Official Taste of Village Digital Checkout</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-sand pb-20">

      <AnimatePresence>
        {promoBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-terracotta text-white font-bold text-center py-3 px-4 shadow-md text-sm flex items-center justify-center gap-2 overflow-hidden sticky top-0 z-50"
          >
            <Ticket size={18} />
            {promoBannerMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cinematic Premium Hero Header */}
      <div className="relative w-full h-[45vh] min-h-[360px] overflow-hidden bg-pine">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 filter blur-[1px]" style={{ backgroundImage: "url('/assets/bg-food.webp')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/80 to-pine/90"></div>
        <div className="absolute inset-0 bg-[url('/assets/tov-new-pattern.webp')] bg-repeat opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-fade-in-up z-20 pt-28 md:pt-36">
          
          {/* Back to Branch Home Button with Scroll Memory */}
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
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

      {/* UK FSA Food Allergy Notice — Natasha's Law (2021) Compliance */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs leading-relaxed">
          <span className="shrink-0 mt-0.5 text-base" aria-hidden="true">⚠️</span>
          <p>
            <strong>Food Allergy Notice:</strong> If you or someone you are ordering for has a food allergy or intolerance,
            please call the restaurant directly at{' '}
            <a href={`tel:${activeLocation.phone}`} className="font-bold underline decoration-amber-400 underline-offset-2 hover:text-amber-700 transition-colors">
              {activeLocation.phone}
            </a>{' '}
            before placing your order. All our meat is 100% Halal certified.
          </p>
        </div>
      </div>

      {/* ─── Dietary Filter Bar ─── */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-pine/40 uppercase tracking-widest shrink-0 mr-1">Filter:</span>
          {([
            { key: 'halal', label: 'Halal', emoji: '🟢' },
            { key: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
            { key: 'vegan', label: 'Vegan', emoji: '🌱' },
            { key: 'spicy', label: 'Spicy', emoji: '🌶️' },
          ] as const).map(({ key, label, emoji }) => {
            const isActive = activeDietaryFilters.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveDietaryFilters(prev =>
                    prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]
                  );
                }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                  isActive
                    ? 'bg-pine text-white border-pine shadow-sm'
                    : 'bg-white text-pine/60 border-pine/10 hover:border-pine/30 hover:text-pine'
                }`}
              >
                <span className="text-sm">{emoji}</span>
                {label}
                {isActive && <span className="ml-0.5 text-[10px] opacity-70">✕</span>}
              </button>
            );
          })}
          {activeDietaryFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveDietaryFilters([])}
              className="shrink-0 text-[10px] font-bold text-terracotta hover:text-pine underline underline-offset-2 transition-colors ml-1"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Menu Sections Rendered Sequentially */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* 1-Tap Reorder Banner for Returning Diners */}
        {lastOrder && showReorderBanner && Array.isArray(lastOrder.items) && lastOrder.items.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-pine via-[#15342c] to-pine text-white p-5 md:p-6 rounded-2xl shadow-xl border-2 border-terracotta/40 relative overflow-hidden animate-fade-in-up">
            <div className="absolute right-0 top-0 w-72 h-72 bg-terracotta/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/4" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-terracotta/20 border border-terracotta/50 flex items-center justify-center shrink-0 text-amber-300">
                  <RotateCcw size={22} className="animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-terracotta text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      Regular Diner
                    </span>
                    <span className="text-xs text-white/70">
                      Welcome back{lastOrder.customerName ? `, ${lastOrder.customerName}` : ''}!
                    </span>
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-bold mt-1 text-white tracking-wide">
                    Reorder Your Previous Meal in 1 Tap
                  </h3>
                  <p className="text-xs text-white/70 mt-1 max-w-xl line-clamp-1">
                    {lastOrder.items.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')} • £{Number(lastOrder.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleReorderLastMeal}
                  className="px-6 py-3 bg-terracotta hover:bg-terracotta-dark text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Zap size={15} className="fill-white" />
                  <span>Reorder Now (£{Number(lastOrder.total || 0).toFixed(2)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReorderBanner(false)}
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                  title="Dismiss"
                  aria-label="Dismiss reorder banner"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

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
                const itemQuantity = cart.filter(ci => ci.id === item.id).reduce((sum, ci) => sum + ci.quantity, 0);
                
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    index={i}
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
      <CartDrawer
      isCartOpen={isCartOpen}
      setIsCartOpen={setIsCartOpen}
      checkoutStep={checkoutStep}
      setCheckoutStep={setCheckoutStep}
      cart={cart}
      clearCart={clearCart}
      lastOrder={lastOrder}
      handleReorderLastMeal={handleReorderLastMeal}
      removeFromCart={removeFromCart}
      updateQuantity={updateQuantity}
      addToCart={addToCart}
      upsellSuggestions={upsellSuggestions}
      SIZE_CATEGORIES={SIZE_CATEGORIES}
      setSizePickerItem={setSizePickerItem}
      tableParam={tableParam}
      setFulfillmentType={setFulfillmentType}
      fulfillmentType={fulfillmentType}
      activeDeliveryTier={activeDeliveryTier}
      discountedSubtotal={discountedSubtotal}
      activeLocation={activeLocation}
      deliveryFee={deliveryFee}
      isDeliveryOrder={isDeliveryOrder}
      postcodeError={postcodeError}
      setPostcodeError={setPostcodeError}
      customVoucher={customVoucher}
      setCustomVoucher={setCustomVoucher}
      setVoucherError={setVoucherError}
      appliedVoucher={appliedVoucher}
      setAppliedVoucher={setAppliedVoucher}
      voucherError={voucherError}
      cartTotal={cartTotal}
      promoDiscount={promoDiscount}
      ACTIVE_PROMO={ACTIVE_PROMO}
      isPromoTimeValid={isPromoTimeValid}
      serviceFee={serviceFee}
      finalCartTotal={finalCartTotal}
      isKitchenClosed={isKitchenClosed}
      isBelowMinOrder={isBelowMinOrder}
      minOrder={minOrder}
      minOrderRemaining={minOrderRemaining}
      minOrderProgress={minOrderProgress}
      handleProceedToDetails={handleProceedToDetails}
      customerInfo={customerInfo}
      setCustomerInfo={setCustomerInfo}
      phoneError={phoneError}
      setPhoneError={setPhoneError}
      getPhoneError={getPhoneError}
      deliveryAddress={deliveryAddress}
      setDeliveryAddress={setDeliveryAddress}
      setIsLocationModalOpen={setIsLocationModalOpen}
      isPostcodeInDeliveryZone={isPostcodeInDeliveryZone}
      marketingOptIn={marketingOptIn}
      setMarketingOptIn={setMarketingOptIn}
      submitOrder={submitOrder}
      isSubmitting={isSubmitting}
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      completedOrder={completedOrder}
      setCompletedOrder={setCompletedOrder}
      handleSquarePaymentSuccess={handleSquarePaymentSuccess}
      getWhatsAppOrderLink={getWhatsAppOrderLink}
      pushAlertActive={pushAlertActive}
      setPushAlertActive={setPushAlertActive}
      requestPushPermission={requestPushPermission}
      SHOP_CONFIG={SHOP_CONFIG}
      activePromo={activePromo}
      desktopOrderSummary={desktopOrderSummary}
      tableSession={tableSession ?? undefined}
      allergenAcknowledged={allergenAcknowledged}
      setAllergenAcknowledged={setAllergenAcknowledged}
    />

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
