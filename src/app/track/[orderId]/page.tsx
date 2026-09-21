// @ts-nocheck
'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle2, ChefHat, Package, MapPin, ChevronLeft, Phone, MessageCircle, Sparkles, Timer, Bell, Coffee, Plus } from 'lucide-react';
import { SHOP_CONFIG, buildWhatsAppLink } from '@/config/shopConfig';
import { requestPushPermission, setupForegroundNotifications } from '@/utils/pushService';
import { motion, AnimatePresence } from 'framer-motion';

const TRACKING_STEPS = [
  { id: 'web_holding', label: 'Order Received', description: 'We\'ve received your order and it\'s in our queue.', icon: Bell, emoji: '📋', color: 'from-amber-400 to-amber-500', animation: 'animate-pulse' },
  { id: 'pending', label: 'Order Confirmed', description: 'Our team has accepted your order and sent it to the kitchen.', icon: CheckCircle2, emoji: '✅', color: 'from-emerald-400 to-green-500', animation: '' },
  { id: 'preparing', label: 'Being Prepared', description: 'Our chefs are crafting your order with care.', icon: ChefHat, emoji: '👨‍🍳', color: 'from-amber-600 to-orange-500', animation: 'animate-bounce' },
  { id: 'ready', label: 'Ready for Pickup', description: 'Your order is ready! Head to the counter to collect it.', icon: Package, emoji: '🎉', color: 'from-[#a64036] to-[#8a332a]', animation: 'animate-bounce' },
];

export default function TrackOrder() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ minutes: 0, seconds: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const prevStatus = useRef<string>('');

  useEffect(() => {
    if (orderId) requestPushPermission(orderId);
    let cleanup: any = null;
    setupForegroundNotifications((payload) => {
      console.log('[TrackOrder] Foreground push alert received:', payload);
    }).then((fn) => { cleanup = fn; });
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [orderId]);

  // Poll order status via API (no direct Firestore reads — orders collection is staff-only)
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        setError(true);
        setLoading(false);
        return;
      }
      const fetchedOrder = await res.json();
      setLoading(false);

      if (fetchedOrder) {
        if (prevStatus.current && prevStatus.current !== fetchedOrder.status) {
          try { 
            if (typeof Audio !== 'undefined') new Audio('/assets/notification.mp3').play(); 
          } catch (e) { }
          if (fetchedOrder.status === 'ready') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 4000);
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([300, 100, 300, 100, 600]); } catch (e) {}
            }
          }
        }
        prevStatus.current = fetchedOrder.status;
        setOrder(fetchedOrder);
        if (prevStatus.current && prevStatus.current !== 'completed' && fetchedOrder.status === 'completed') {
          const alreadyShown = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`review_prompted_${orderId}`) : '1';
          if (!alreadyShown) {
            setTimeout(() => setShowReviewPrompt(true), 1500);
            if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(`review_prompted_${orderId}`, '1');
          }
        }
      } else {
        setError(true);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) {
      setError(true);
      setLoading(false);
      return;
    }
    fetchOrder(); // Initial fetch
    const interval = setInterval(fetchOrder, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      const placed = new Date(order.timestamp || order.createdAt).getTime();
      const prepMinutes = (order as any).estimatedReadyMinutes || 25;
      const targetTime = placed + (prepMinutes * 60 * 1000);
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      
      setTimeRemaining({
        minutes: Math.floor(diff / 60000),
        seconds: Math.floor((diff % 60000) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-sand pt-24 pb-12 flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-terracotta/30 rounded-full animate-spin border-t-terracotta"></div>
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl">🔍</span></div>
        </div>
        <p className="mt-8 text-pine/70 font-bold font-display text-xl tracking-wider animate-pulse uppercase">Locating Signal...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-sand pt-24 pb-12 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-28 h-28 bg-white rounded-none flex items-center justify-center shadow-[8px_8px_0px_rgba(20,40,29,0.1)] mb-6 border-2 border-pine/10">
          <span className="text-4xl">📦</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-pine mb-4 uppercase tracking-widest">Order Void</h1>
        <p className="text-pine/60 max-w-md mb-8 leading-relaxed font-medium">
          We couldn't locate signal <strong className="text-terracotta">{orderId}</strong>. It may still be processing, or the ID is incorrect.
        </p>
        <div className="flex gap-4">
          <Link href="/menu" className="bg-pine text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-terracotta transition-all shadow-[4px_4px_0px_rgba(20,40,29,0.2)] hover:-translate-y-0.5 border border-pine">
            New Order
          </Link>
        </div>
      </div>
    );
  }

  const getCurrentStepIndex = () => {
    if (order.status === 'completed') return TRACKING_STEPS.length;
    if (order.status === 'no_show') return -1;
    const idx = TRACKING_STEPS.findIndex(s => s.id === order.status);
    return idx === -1 ? 0 : idx;
  };

  const currentIndex = getCurrentStepIndex();
  const currentStep = TRACKING_STEPS[Math.min(currentIndex, TRACKING_STEPS.length - 1)];
  const isCompleted = order.status === 'completed';
  const isNoShow = order.status === 'no_show';
  const progressPercent = isCompleted ? 100 : Math.min(100, (currentIndex / (TRACKING_STEPS.length - 1)) * 100);

  const whatsappMessage = `Hi, I have a question about my order ${order.id}. My name is ${order.customerName}.`;
  const whatsappUrl = buildWhatsAppLink(whatsappMessage);

  return (
    <div className="min-h-screen bg-bg-sand pt-20 pb-20 selection:bg-terracotta selection:text-white overflow-hidden relative">
      
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none -z-10"></div>

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="absolute animate-fall" style={{ left: `${Math.random() * 100}%`, top: '-20px', animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 3}s`, fontSize: `${14 + Math.random() * 16}px` }}>
              {['🎉', '🎊', '✨', '⭐', '🌟', '🥘'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 mt-8">
        
        <Link href="/menu" className="inline-flex items-center gap-2 text-pine/50 hover:text-terracotta mb-8 font-black transition-colors text-[10px] uppercase tracking-[0.2em]">
          <ChevronLeft size={14} /> Back to Menu
        </Link>

        {/* Hero Status Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`relative p-8 md:p-12 mb-8 shadow-2xl ${
          isCompleted ? 'bg-pine text-white border-pine' :
          isNoShow ? 'bg-pine/90 text-white' :
          'bg-white border-pine/10'
        } border-[3px]`}>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <span className={`inline-flex items-center gap-3 px-5 py-2.5 font-mono font-bold text-xs tracking-wider border-2 ${
                isCompleted ? 'bg-white/10 text-white border-white/20' : 'bg-bg-sand text-pine border-pine'
              }`}>
                <span className={`w-2.5 h-2.5 rounded-none ${isCompleted ? 'bg-white' : 'bg-green-500 animate-pulse'}`}></span>
                ID: {order.id.slice(-6).toUpperCase()}
              </span>
              
              {/* Precision Timer */}
              {!isCompleted && !isNoShow && (
                <div className="flex items-center gap-3 px-5 py-2.5 bg-pine text-white border-2 border-pine shadow-[4px_4px_0px_rgba(138,61,42,1)]">
                  <Timer size={16} className="text-terracotta-light animate-pulse" />
                  <span className="font-mono text-xl font-black tracking-widest">
                    {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-6">
              <div className={`text-6xl hidden sm:block ${currentStep?.animation || ''}`}>
                {isCompleted ? '🎉' : isNoShow ? '😔' : currentStep.emoji}
              </div>
              <div className="flex-1">
                <h1 className={`font-display text-4xl md:text-5xl font-black mb-3 tracking-widest uppercase ${
                  isCompleted || isNoShow ? 'text-white' : 'text-pine'
                }`}>
                  {isCompleted ? 'Collected' : isNoShow ? 'Voided' : currentStep.label}
                </h1>
                <p className={`text-sm font-medium leading-relaxed uppercase tracking-widest ${
                  isCompleted || isNoShow ? 'text-white/60' : 'text-pine/50'
                }`}>
                  {isCompleted ? `Enjoy your meal, ${order.customerName}!` : isNoShow ? 'Order was not collected.' : currentStep.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Anti-Time-Waster Arrival Notice */}
        {!isCompleted && !isNoShow && order.status !== 'ready' && (
          <div className="bg-amber-50 border-2 border-amber-300 p-4 mb-6 flex items-start gap-3 shadow-sm">
            <Clock size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-950 uppercase tracking-wider mb-0.5">
                Freshly Cooking — Please Do Not Queue at the Till
              </p>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Our kitchen is preparing your meal fresh. To maintain smooth service, please do not approach the counter until this screen confirms <strong>Ready for Pickup</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Mobile Push Notification Card */}
        {!isCompleted && !isNoShow && (
          <div className="bg-white border-2 border-pine/15 p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-terracotta/10 text-terracotta rounded-full shrink-0">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-pine uppercase tracking-wider">Buzz My Phone When Food Is Ready</p>
                <p className="text-xs text-pine/60 font-medium">Get a mobile alert the moment your bag is packed at the counter.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (orderId) {
                  const token = await requestPushPermission(orderId);
                  if (token) {
                    alert('🔔 Push notifications enabled! We will buzz your phone the second your food is ready.');
                  }
                }
              }}
              className="w-full sm:w-auto px-5 py-3 bg-pine text-white text-xs font-black uppercase tracking-wider hover:bg-terracotta transition-colors shrink-0"
            >
              Enable Phone Alerts
            </button>
          </div>
        )}

        {/* Live Progress Stepper */}
        {!isNoShow && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 md:p-12 shadow-xl border border-pine/10 mb-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-pine uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                <Sparkles size={14} className="text-terracotta" /> Live Telemetry
              </h3>
            </div>

            <div className="relative h-1.5 bg-bg-sand mb-12 border border-pine/5">
              <div className="absolute left-0 top-0 h-full bg-terracotta transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="flex justify-between relative">
              {TRACKING_STEPS.map((step, idx) => {
                const isActive = idx === currentIndex;
                const isPast = idx < currentIndex || isCompleted;
                const Icon = step.icon;

                return (
                  <div key={step.id} className={`flex flex-col items-center gap-4 flex-1 transition-all duration-500 ${!isPast && !isActive ? 'opacity-30 grayscale' : ''}`}>
                    <div className={`w-12 h-12 flex items-center justify-center transition-all duration-700 border-2 ${
                      isActive 
                        ? `bg-terracotta text-white border-terracotta shadow-[4px_4px_0px_rgba(20,40,29,0.1)] scale-110` 
                        : isPast 
                          ? 'bg-pine text-white border-pine' 
                          : 'bg-white text-pine/30 border-pine/10'
                    }`}>
                      {isPast && !isActive ? <CheckCircle2 size={18} /> : <Icon size={18} className={isActive ? step.animation : ''} />}
                    </div>
                    <div className="text-center">
                      <p className={`font-black text-[10px] uppercase tracking-widest ${isActive ? 'text-terracotta' : isPast ? 'text-pine' : 'text-pine/40'}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Order items */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="md:col-span-3 space-y-8">
            <div className="bg-white p-8 md:p-10 shadow-xl border border-pine/10">
              <h3 className="font-black text-pine uppercase tracking-[0.2em] text-[10px] mb-8 pb-4 border-b border-pine/10">Manifest</h3>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-5 group">
                    <div className="w-16 h-16 bg-bg-sand flex-shrink-0 relative overflow-hidden border border-pine/10">
                      <img src={item.image || '/assets/tov-monogram.svg'} alt={item.name} className="w-full h-full object-cover p-2 mix-blend-multiply" />
                      <span className="absolute top-0 right-0 bg-pine text-white text-[10px] px-1.5 py-0.5 font-black">x{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="font-black text-pine text-sm uppercase tracking-widest leading-tight truncate mb-1">{item.name}</p>
                      <p className="text-xs text-pine/50 font-mono font-bold">£{item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-black text-terracotta text-lg pt-1">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-6 border-t border-pine/10 flex justify-between items-end">
                <span className="text-[10px] text-pine/50 font-black uppercase tracking-[0.3em]">Total</span>
                <span className="font-display text-4xl font-black text-pine">£{order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Smart Upsell Modal block */}
            {!isCompleted && !isNoShow && (
              <div className="bg-terracotta text-white p-8 border-2 border-terracotta shadow-[8px_8px_0px_rgba(20,40,29,1)] flex items-center gap-6 justify-between group cursor-pointer hover:-translate-y-1 transition-transform">
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest mb-1 flex items-center gap-2"><Coffee size={16} /> Still thirsty?</h4>
                  <p className="text-xs font-medium text-white/80">Add a Karak Chai when you collect at the till.</p>
                </div>
                <div className="w-10 h-10 bg-white text-terracotta flex items-center justify-center border border-white shrink-0 group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Collection location & Live Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2 flex flex-col gap-8">
            <div className="bg-[#101E17] text-white p-1 shadow-2xl relative">
              <div className="p-8 pb-0 relative z-10">
                <h3 className="font-black text-white/40 uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2"><MapPin size={14}/> Base Station</h3>
                <p className="font-display text-2xl font-black mb-1 tracking-widest uppercase text-white">{SHOP_CONFIG.name}</p>
                <p className="text-white/50 text-xs font-mono mb-8">{SHOP_CONFIG.address}<br/>{SHOP_CONFIG.postcode}</p>
              </div>
              
              {/* Radar Map Vis */}
              <div className="h-48 bg-[#0a130f] relative overflow-hidden border-t border-white/5 mx-1 mb-1">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#8A3D2A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                {/* Store Beacon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-terracotta rounded-full relative z-10 border-2 border-[#101E17]"></div>
                  <div className="w-16 h-16 bg-terracotta/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" style={{ animationDuration: '2s' }}></div>
                  <div className="w-32 h-32 bg-terracotta/10 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" style={{ animationDuration: '3s' }}></div>
                </div>
              </div>
              
              <a href={`https://maps.google.com/?q=${encodeURIComponent(SHOP_CONFIG.name + ' ' + SHOP_CONFIG.address)}`} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-white/10 hover:bg-white text-white hover:text-[#101E17] px-4 py-2 font-black text-[10px] uppercase tracking-widest transition-colors backdrop-blur-sm z-20">
                Navigate
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="flex items-center justify-center gap-3 bg-white py-5 font-black text-xs uppercase tracking-widest text-pine border-2 border-pine hover:bg-pine hover:text-white transition-all shadow-[4px_4px_0px_rgba(20,40,29,1)] hover:translate-y-0.5 hover:shadow-none">
                <Phone size={16} /> Contact Base
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 font-black text-xs uppercase tracking-widest hover:bg-[#20BD5A] transition-all shadow-[4px_4px_0px_rgba(37,211,102,0.4)] hover:translate-y-0.5 hover:shadow-none border-2 border-[#25D366]">
                <MessageCircle size={16} /> Comms
              </a>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Google Review Prompt Modal */}
      <AnimatePresence>
        {showReviewPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-pine/90 backdrop-blur-md z-[300] flex items-center justify-center p-4" onClick={() => setShowReviewPrompt(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-none p-12 max-w-md w-full text-center shadow-2xl border-[4px] border-terracotta" onClick={e => e.stopPropagation()}>
              <div className="flex justify-center gap-2 mb-8">
                {[1,2,3,4,5].map(i => (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }} key={i} className="text-4xl">⭐</motion.span>
                ))}
              </div>
              <h2 className="font-display text-4xl font-black text-pine mb-4 tracking-widest uppercase">Target Neutralised</h2>
              <p className="text-pine/60 text-sm leading-relaxed mb-10 font-medium">
                Mission accomplished. Drop a 5-star review on our coordinates to help secure the sector. It takes 10 seconds.
              </p>
              <a href={SHOP_CONFIG.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-pine text-white py-6 font-black text-xs uppercase tracking-[0.2em] mb-4 hover:bg-terracotta transition-all shadow-[6px_6px_0px_rgba(20,40,29,0.2)] hover:-translate-y-1" onClick={() => setShowReviewPrompt(false)}>
                Confirm Strike (Review)
              </a>
              <button onClick={() => setShowReviewPrompt(false)} className="w-full py-4 text-pine/40 font-black text-[10px] hover:text-terracotta transition-colors uppercase tracking-[0.3em] underline underline-offset-4">
                Abort
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards; }
      `}</style>
    </div>
  );
}
