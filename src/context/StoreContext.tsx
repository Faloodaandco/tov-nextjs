'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, MenuItem, Order, Booking } from '@/types';
import { createOrder } from '@/services/orderService';
import { createBooking } from '@/services/bookingService';
import { trackAddToCart, trackRemoveFromCart, trackClearCart } from '@/utils/analytics';

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
    }
  }, [cart, isHydrated]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    trackAddToCart?.(item as any);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    trackRemoveFromCart?.({ id, name: id, price: 0 } as any);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
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

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
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
