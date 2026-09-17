// @ts-nocheck
'use client';
import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ChefHat, Utensils, Receipt, PlusCircle, Bell, BellOff } from 'lucide-react';
import { Order } from '@/types';
import { streamSingleOrder } from '@/services/orderService';
import { requestPushPermission } from '@/utils/pushService';

interface Props {
  initialOrder: Order;
  tableId: string;
  onAddToTab: () => void;
}

export default function LiveOrderTracker({ initialOrder, tableId, onAddToTab }: Props) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [splitWays, setSplitWays] = useState(1);
  const [previousStatus, setPreviousStatus] = useState<Order['status']>(initialOrder?.status || 'pending');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    // Stream live updates from the kitchen
    const unsub = streamSingleOrder(order.id, (updatedOrder) => {
      if (updatedOrder) setOrder(updatedOrder);
    });

    return () => unsub();
  }, [order?.id, tableId]);

  useEffect(() => {
    // Check initial notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!order?.id) return;
    const token = await requestPushPermission(order.id);
    if (token) {
      setNotificationsEnabled(true);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('Taste of Village', {
          body: 'You will receive an alert when your order is ready!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  // Sound, vibration, and push notification when food is ready
  useEffect(() => {
    if (!order) return;
    if (order.status === 'ready' && previousStatus !== 'ready') {
      if (typeof window !== 'undefined') {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const playTone = (freq: number, startTime: number, vol = 0.5) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(freq, startTime);
              gain.gain.setValueAtTime(0, startTime);
              gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
              osc.start(startTime);
              osc.stop(startTime + 1.5);
            };
            playTone(523.25, ctx.currentTime);
            playTone(659.25, ctx.currentTime + 0.1);
            playTone(783.99, ctx.currentTime + 0.2);
            playTone(1046.50, ctx.currentTime + 0.3);
          }
        } catch (e) {
          console.warn("Audio playback failed", e);
        }
        
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([200, 100, 200, 100, 500]);
          } catch (e) {}
        }

        // Web Push Notification
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          if (navigator.serviceWorker) {
            navigator.serviceWorker.ready.then(registration => {
              registration.showNotification('Order Ready! 🍽️', {
                body: `Your order for Table ${tableId} is on its way!`,
                icon: '/assets/tov-logo-tree-terracotta-alpha.png',
                tag: 'order-ready'
              });
            }).catch(err => {
              // Fallback if no service worker
              new Notification('Order Ready! 🍽️', {
                body: `Your order for Table ${tableId} is on its way!`,
                icon: '/assets/tov-logo-tree-terracotta-alpha.png'
              });
            });
          } else {
            new Notification('Order Ready! 🍽️', {
              body: `Your order for Table ${tableId} is on its way!`,
              icon: '/assets/tov-logo-tree-terracotta-alpha.png'
            });
          }
        }
      }
    }
    setPreviousStatus(order.status);
  }, [order?.status, previousStatus, notificationsEnabled, tableId]);

  if (!order) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-400 text-amber-900';
      case 'preparing': return 'bg-pine-light text-white';
      case 'ready': return 'bg-terracotta text-white';
      default: return 'bg-pine text-white';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={32} />;
      case 'preparing': return <ChefHat size={32} />;
      case 'ready': return <Utensils size={32} />;
      default: return <CheckCircle size={32} />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Waiting for Kitchen';
      case 'preparing': return 'Chef is Preparing';
      case 'ready': return 'On its way to Table ' + tableId;
      default: return 'Completed';
    }
  };

  const isReady = order.status === 'ready' || order.status === 'completed';

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-none shadow-xl text-center relative overflow-hidden border border-pine/10">
        <div className={`absolute -inset-4 opacity-10 blur-2xl transition-colors duration-1000 ${getStatusColor(order.status)}`} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-pine font-bold text-sm tracking-widest uppercase">Order #{order.id.slice(-4)}</h3>
            {!notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window && (
              <button 
                onClick={requestNotificationPermission}
                className="text-xs font-bold bg-pine text-white px-3 py-1 flex items-center gap-2 hover:bg-pine/90 transition-colors"
              >
                <Bell size={14} /> Notify Me
              </button>
            )}
            {notificationsEnabled && (
              <span className="text-xs font-bold text-pine flex items-center gap-1 opacity-50">
                <CheckCircle size={14} /> Notifying
              </span>
            )}
          </div>

          <div className={`w-24 h-24 mx-auto rounded-none flex items-center justify-center mb-6 shadow-2xl transition-colors duration-500 ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          
          <h2 className="font-display text-4xl font-bold text-pine mb-2 tracking-tight uppercase">
            {getStatusText(order.status)}
          </h2>
          <p className="text-pine/60 font-bold mb-8 uppercase tracking-widest text-xs">
            Table {tableId}
          </p>

          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-2 px-4 relative">
            <div className="absolute top-1/2 left-8 right-8 h-1 bg-gray-100 -z-10" />
            <div className={`absolute top-1/2 left-8 h-1 transition-all duration-1000 -z-10 ${order.status === 'preparing' ? 'w-1/2 bg-pine-light' : order.status === 'ready' || order.status === 'completed' ? 'w-[80%] bg-terracotta' : 'w-0'}`} />
            
            {['pending', 'preparing', 'ready'].map((step, idx) => {
              const isActive = order.status === step || (order.status === 'ready' && idx < 2) || (order.status === 'completed');
              return (
                <div key={step} className={`w-4 h-4 rounded-none transition-colors duration-500 border border-black/10 shadow-sm ${isActive ? getStatusColor(step as any) : 'bg-white'}`} />
              );
            })}
          </div>
          <div className="flex justify-between px-2 text-[10px] uppercase tracking-widest font-bold text-pine/40 mb-10">
            <span>Sent</span>
            <span>Prep</span>
            <span>Ready</span>
          </div>

          <div className="space-y-4">
            <button 
              onClick={onAddToTab}
              disabled={isReady}
              className={`w-full py-4 rounded-none font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isReady ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-terracotta text-white hover:bg-terracotta/90 shadow-xl'}`}
            >
              <PlusCircle size={20} />
              {isReady ? 'Order Ready - Cannot Add' : 'Add to Tab'}
            </button>
            {!isReady && <p className="text-xs text-pine/50 font-bold">Changed your mind? Add drinks or dessert straight to this order.</p>}
          </div>
        </div>
      </div>

      {/* Split Bill Calculator */}
      <div className="bg-pine p-8 rounded-none shadow-xl text-white relative overflow-hidden tov-pattern-light">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Receipt size={24} className="text-terracotta" />
          <h3 className="font-display text-2xl font-bold tracking-tight uppercase">Split the Bill</h3>
        </div>
        
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-white/70 uppercase text-xs tracking-widest">How many people?</span>
            <span className="font-display text-2xl font-bold text-terracotta">{splitWays}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={splitWays} 
            onChange={(e) => setSplitWays(parseInt(e.target.value))}
            className="w-full accent-terracotta"
          />
          <div className="flex justify-between text-xs text-white/40 mt-2 font-bold">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-none p-6 flex items-center justify-between border border-white/10 relative z-10">
          <span className="font-bold uppercase tracking-widest text-xs text-white/70">Each Pays</span>
          <span className="font-display text-4xl font-bold text-white">
            £{((order.total || 0) / splitWays).toFixed(2)}
          </span>
        </div>
        <p className="text-center text-[10px] uppercase tracking-widest text-white/40 mt-4 font-bold relative z-10">
          Wait for the waiter to bring the Dojo machine
        </p>
      </div>
    </div>
  );
}
