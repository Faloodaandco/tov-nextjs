'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Package, Phone as PhoneIcon, MessageCircle, Sparkles, ArrowRight, MapPin, Star, Clock, ChevronRight } from 'lucide-react';
import { SHOP_CONFIG, buildWhatsAppLink } from '@/config/shopConfig';
import { normaliseUKPhone, isValidUKMobile, getPhoneError } from '@/lib/validation';
import { useStore } from '@/context/StoreContext';

interface FoundOrder {
  id: string;
  customerName: string;
  status: string;
  total: number;
  timestamp: any;
  items: { name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  web_holding: { label: 'Received', color: 'bg-amber-100 text-amber-700', emoji: '📋' },
  pending: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', emoji: '✅' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-700', emoji: '👨‍🍳' },
  ready: { label: 'Ready!', color: 'bg-green-100 text-green-700', emoji: '🎉' },
  completed: { label: 'Collected', color: 'bg-gray-100 text-gray-500', emoji: '✔️' },
  no_show: { label: 'Cancelled', color: 'bg-red-100 text-red-600', emoji: '❌' },
};

export default function TrackLanding() {
  const [mode, setMode] = useState<'order' | 'phone'>('order');
  const [searchValue, setSearchValue] = useState('');
  const [shaking, setShaking] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundOrders, setFoundOrders] = useState<FoundOrder[] | null>(null);
  const [searchedPhone, setSearchedPhone] = useState('');
  const router = useRouter();

  // Live orders from store context
  const { orders: allOrders } = useStore();

  const handleTrackByOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = searchValue.trim().replace('#', '');
    if (!cleaned) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    router.push(`/track/${cleaned}`);
  };

  const handleTrackByPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normaliseUKPhone(searchValue);
    
    if (!isValidUKMobile(searchValue)) {
      setPhoneError(getPhoneError(searchValue) || 'Enter a valid UK mobile (07XXX XXXXXX)');
      return;
    }
    setPhoneError(null);
    setLoading(true);
    setFoundOrders(null);

    try {
      // Filter from the live order stream (decoupled from Firestore)
      const orders: FoundOrder[] = allOrders
        .filter((o) => {
          const oPhone = (o.customerPhone || '').replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
          return oPhone === cleaned;
        })
        .map((o) => ({
          id: o.id,
          customerName: o.customerName || '',
          status: o.status || 'pending',
          total: o.total || 0,
          timestamp: o.timestamp instanceof Date ? o.timestamp : new Date(o.timestamp),
          items: (o.items || []).map((i: any) => ({ name: i.name, quantity: i.quantity || 1 })),
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setFoundOrders(orders);
      setSearchedPhone(cleaned);
    } catch (err) {
      console.error('Phone lookup failed:', err);
      setFoundOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-sand relative overflow-hidden selection:bg-terracotta selection:text-white">
      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: i % 2 === 0 
                ? 'radial-gradient(circle, #a64036, transparent)' 
                : 'radial-gradient(circle, #0f362a, transparent)',
              left: `${10 + i * 20}%`,
              top: `${20 + (i % 2) * 40}%`,
              animation: `float ${8 + i * 3}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-28 pb-20">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pine text-white rounded-full shadow-2xl shadow-pine/10 mb-6">
            <Package size={36} />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-pine mb-4 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-pine/60 text-lg max-w-md mx-auto leading-relaxed">
            Look up your order by order number or phone number
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-[2rem] p-2 shadow-lg shadow-pine/5 border border-pine/10 flex gap-2">
            <button aria-label="Button"
              onClick={() => { setMode('order'); setFoundOrders(null); setSearchValue(''); setPhoneError(null); }}
              className={`px-8 py-4 rounded-3xl font-bold text-sm transition-all ${
                mode === 'order' 
                  ? 'bg-pine text-white shadow-md' 
                  : 'text-pine/80 hover:bg-pine/5 hover:text-pine'
              }`}
            >
              📋 Order Number
            </button>
            <button aria-label="Button"
              onClick={() => { setMode('phone'); setFoundOrders(null); setSearchValue(''); setPhoneError(null); }}
              className={`px-8 py-4 rounded-3xl font-bold text-sm transition-all ${
                mode === 'phone' 
                  ? 'bg-pine text-white shadow-md' 
                  : 'text-pine/80 hover:bg-pine/5 hover:text-pine'
              }`}
            >
              📱 Phone Number
            </button>
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-pine/5 border border-pine/10 mb-8">
          <form onSubmit={mode === 'order' ? handleTrackByOrder : handleTrackByPhone} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-pine/80 uppercase tracking-[0.2em] mb-4">
                {mode === 'order' ? 'Order Number' : 'Phone Number'}
              </label>
              <div className={`relative transition-all ${shaking ? 'animate-shake' : ''}`}>
                {mode === 'order' 
                  ? <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-pine/30" />
                  : <PhoneIcon size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-pine/30" />
                }
                <input
                  type={mode === 'phone' ? 'tel' : 'text'}
                  value={searchValue}
                  onChange={e => {
                    setSearchValue(mode === 'order' ? e.target.value.toUpperCase() : e.target.value);
                    if (phoneError) setPhoneError(getPhoneError(e.target.value));
                    setFoundOrders(null);
                  }}
                  onBlur={() => {
                    if (mode === 'phone' && searchValue.trim()) setPhoneError(getPhoneError(searchValue));
                  }}
                  placeholder={mode === 'order' ? 'e.g. D621 or ORD-A3F7' : '07XXX XXXXXX'}
                  className={`w-full pl-16 pr-6 py-5 bg-bg-sand rounded-2xl border outline-none text-pine font-mono font-bold text-xl tracking-wider transition-all placeholder:text-pine/30 placeholder:font-sans placeholder:text-lg placeholder:tracking-normal ${
                    phoneError 
                      ? 'border-red-400 focus:border-red-500 focus:bg-white' 
                      : 'border-transparent focus:border-terracotta focus:bg-white focus:shadow-inner'
                  }`}
                  autoFocus
                  autoComplete="off"
                  maxLength={mode === 'phone' ? 15 : 30}
                />
              </div>
              {phoneError && (
                <p className="text-red-500 text-xs font-bold mt-3 ml-2">{phoneError}</p>
              )}
              <p className="text-pine/40 text-sm mt-4 ml-2">
                {mode === 'order' 
                  ? 'Find your order number on your receipt or WhatsApp confirmation'
                  : 'Enter the phone number you used when placing your order'
                }
              </p>
            </div>

            <button aria-label="Button"
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-terracotta text-white font-bold text-lg rounded-full hover:bg-[#a64036] transition-all shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-wait mt-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  {mode === 'order' ? 'Track My Order' : 'Find My Orders'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Phone Lookup Results */}
        {foundOrders !== null && mode === 'phone' && (
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-pine/5 border border-pine/10 mb-8 animate-fade-in">
            {foundOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-pine/5 text-pine rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔍</div>
                <p className="font-display font-bold text-pine text-2xl mb-2">No orders found</p>
                <p className="text-pine/80 text-sm max-w-sm mx-auto">
                  No orders were found for this phone number. If you placed an order recently, it may still be processing.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-pine text-sm uppercase tracking-widest">
                    Found {foundOrders.length} order{foundOrders.length > 1 ? 's' : ''}
                  </h3>
                  <Link 
                    href={`/rewards`} 
                    className="flex items-center gap-2 text-xs font-bold text-terracotta hover:text-[#a64036] transition-colors bg-terracotta/10 px-4 py-2 rounded-full"
                  >
                    <Star size={14} />
                    Check Rewards
                  </Link>
                </div>
                <div className="space-y-4">
                  {foundOrders.map(order => {
                    const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                    const isActive = !['completed', 'no_show'].includes(order.status);
                    return (
                      <Link
                        key={order.id}
                        href={`/track/${order.id}`}
                        className={`block p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 ${
                          isActive 
                            ? 'border-terracotta/30 bg-terracotta/5' 
                            : 'border-pine/10 bg-bg-sand'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono font-bold text-pine text-sm bg-white px-2 py-1 rounded shadow-sm">{order.id}</span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${statusInfo.color}`}>
                                {statusInfo.emoji} {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-pine/80 text-xs flex items-center gap-1.5 mb-2 font-medium">
                              <Clock size={12} />
                              {order.timestamp instanceof Date 
                                ? order.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'Unknown date'
                              }
                            </p>
                            <p className="text-pine text-sm truncate font-medium">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-pine text-lg">£{order.total.toFixed(2)}</p>
                            {isActive && (
                              <p className="text-[10px] text-terracotta font-bold mt-2 animate-pulse uppercase tracking-widest flex items-center justify-end gap-1">
                                LIVE <ChevronRight size={12}/>
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-5 mb-12">
          <Link
            href="/rewards"
            className="bg-white rounded-[2rem] p-6 border border-pine/10 hover:border-terracotta/30 transition-all shadow-xl shadow-pine/5 hover:-translate-y-1 text-center group"
          >
            <div className="w-12 h-12 bg-pine/5 text-pine rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-terracotta group-hover:text-white transition-colors">
              <Star size={20} />
            </div>
            <p className="font-bold text-pine text-sm">Check Rewards</p>
            <p className="text-pine/80 text-[11px] mt-1 font-medium">View your loyalty points</p>
          </Link>
          <Link
            href="/menu"
            className="bg-white rounded-[2rem] p-6 border border-pine/10 hover:border-terracotta/30 transition-all shadow-xl shadow-pine/5 hover:-translate-y-1 text-center group"
          >
            <div className="w-12 h-12 bg-pine/5 text-pine rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-terracotta group-hover:text-white transition-colors">
              <Package size={20} />
            </div>
            <p className="font-bold text-pine text-sm">Order Again</p>
            <p className="text-pine/80 text-[11px] mt-1 font-medium">Browse our full menu</p>
          </Link>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-[3rem] p-10 border border-pine/10 shadow-xl shadow-pine/5 mb-12">
          <h3 className="font-bold text-xs text-pine/80 uppercase tracking-[0.2em] mb-8 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-terracotta" />
            How Tracking Works
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { emoji: '📋', label: 'Received', desc: 'Order received' },
              { emoji: '✅', label: 'Confirmed', desc: 'Sent to kitchen' },
              { emoji: '👨‍🍳', label: 'Preparing', desc: 'Chefs cooking' },
              { emoji: '🎉', label: 'Ready!', desc: 'Come collect' },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-bg-sand rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner border border-pine/5">{step.emoji}</div>
                <p className="font-bold text-pine text-sm mb-1">{step.label}</p>
                <p className="text-pine/80 text-[11px] uppercase tracking-widest">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <p className="text-pine/80 text-xs font-bold uppercase tracking-widest mb-5">Need assistance?</p>
          <div className="flex justify-center gap-4">
            <a aria-label="Phone"
              href={`tel:${SHOP_CONFIG.phoneNumberRaw}`}
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-full font-bold text-sm text-pine border border-pine/20 hover:border-pine transition-all shadow-md"
            >
              <PhoneIcon size={16} className="text-pine" />
              Call Us
            </a>
            <a
              href={buildWhatsAppLink('Hi, I need help tracking my order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-[#25D366] text-white rounded-full font-bold text-sm hover:bg-[#20BD5A] transition-colors shadow-md"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Store Info Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-pine/5 rounded-full border border-pine/10">
            <MapPin size={16} className="text-terracotta" />
            <span className="text-pine/60 text-xs font-bold uppercase tracking-widest">{SHOP_CONFIG.address}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-40px) scale(1.1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
