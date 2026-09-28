'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, MenuItem, Order, Booking } from '@/types';
import { createOrder } from '@/services/orderService';
import { createBooking } from '@/services/bookingService';
import { trackAddToCart, trackRemoveFromCart, trackClearCart } from '@/utils/analytics';
import { calculatePromoDiscount } from '@/config/shopConfig';

interface StoreContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  bookings: Booking[];
  addBooking: (booking: Booking) => Promise<void>;
  isOffline: boolean;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activePromo: string | null;
  setActivePromo: React.Dispatch<React.SetStateAction<string | null>>;
  isHydrated: boolean;
  cartTotal: number;
  cartCount: number;
  reorderItems: (items: CartItem[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePromo, setActivePromo] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('tov_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart from local storage', e);
        }
      }
      const savedPromo = localStorage.getItem('tov_active_promo');
      if (savedPromo) {
        setActivePromo(savedPromo);
      }
      setIsHydrated(true);

      const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
      updateOnlineStatus();
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('tov_cart', JSON.stringify(cart));
      if (activePromo) {
        localStorage.setItem('tov_active_promo', activePromo);
      } else {
        localStorage.removeItem('tov_active_promo');
      }
    }
  }, [cart, activePromo, isHydrated]);

  const getCartKey = (item: any) => {
    if (item._cartKey) return item._cartKey;
    return item.id + JSON.stringify(item.selectedModifiers || []);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const itemKey = getCartKey(item);
      const existing = prev.find(i => getCartKey(i) === itemKey);
      if (existing) {
        return prev.map(i => getCartKey(i) === itemKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, _cartKey: itemKey }];
    });
    trackAddToCart?.(item as any);
  };

  const removeFromCart = (idOrKey: string) => {
    setCart(prev => prev.filter(i => getCartKey(i) !== idOrKey && i.id !== idOrKey));
    trackRemoveFromCart?.({ id: idOrKey, name: idOrKey, price: 0 } as any);
  };

  const updateQuantity = (idOrKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(idOrKey);
      return;
    }
    setCart(prev => prev.map(i => (getCartKey(i) === idOrKey || i.id === idOrKey) ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCart([]);
    trackClearCart?.();
  };

  const addOrder = async (order: Order) => {
    await createOrder(order);
    setOrders(prev => [...prev, order]);
  };

  const addBooking = async (booking: Booking) => {
    await createBooking(booking);
    setBookings(prev => [...prev, booking]);
  };

  const reorderItems = (items: CartItem[]) => {
    setCart(items);
    setIsCartOpen(true);
  };

  const rawTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const promoInfo = calculatePromoDiscount(cart, activePromo);
  const cartTotal = rawTotal - promoInfo.discount;
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orders,
        addOrder,
        bookings,
        addBooking,
        isOffline,
        isCartOpen,
        setIsCartOpen,
        activePromo,
        setActivePromo,
        isHydrated,
        cartTotal,
        cartCount,
        reorderItems,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
