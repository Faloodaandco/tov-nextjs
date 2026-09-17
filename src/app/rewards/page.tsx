// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, ChevronRight, QrCode, Loader2, Store, Smartphone, UserCircle2, LogOut, Crown, Star, Award, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCustomer } from '@/services/customerService';
import { useAuth } from '@/context/AuthContext';

// TODO: metadata export

interface LoyaltyAccount {
  id: string;
  phone: string;
  points: number;
  name?: string;
  totalSpent?: number;
  orderCount?: number;
}

const REWARDS_CATALOG = [
  { points: 50, title: '£5 OFF Voucher', desc: 'Redeemable on any order', icon: '🎫' },
  { points: 100, title: 'Free Dessert', desc: 'Gulab Jamun or Rasmalai', icon: '🍨' },
  { points: 250, title: 'Free Mixed Grill', desc: 'Sizzling Charcoal Platter', icon: '🥩' },
  { points: 500, title: 'VIP Chef\'s Table', desc: 'Exclusive dining for two', icon: '👑' },
];

const getTierInfo = (points: number) => {
  if (points >= 500) return { name: 'Platinum Reserve', color: 'bg-slate-900', border: 'border-amber-400/30', text: 'text-amber-300', icon: Crown, next: null };
  if (points >= 250) return { name: 'Gold Heritage', color: 'bg-amber-600', border: 'border-amber-300', text: 'text-amber-100', icon: Star, next: 500 };
  return { name: 'Silver Village', color: 'bg-pine', border: 'border-terracotta/30', text: 'text-terracotta', icon: Award, next: 250 };
};

export default function Rewards() {
  const { user, isLoggedIn, isAuthLoading, loginWithGoogle, logout, linkPhone } = useAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [error, setError] = useState('');
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (user?.phoneNumber) {
      fetchLoyalty(user.phoneNumber);
    } else {
      setAccount(null);
    }
  }, [user]);

  const fetchLoyalty = async (phoneNumber: string) => {
    setLoading(true);
    setError('');
    setAccount(null);
    try {
      const customer = await getCustomer(phoneNumber);
      if (customer) {
        setAccount({
          id: customer.id,
          phone: customer.phone,
          points: customer.points || 0,
          name: customer.name,
          totalSpent: customer.totalSpent,
          orderCount: customer.totalOrders,
        });
      } else {
        setAccount({ id: '', phone: phoneNumber, points: 0, name: undefined, totalSpent: 0, orderCount: 0 });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPhone = async () => {
    if (phoneInput.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await linkPhone(phoneInput);
      await fetchLoyalty(phoneInput);
    } catch (err: any) {
      setError(err.message || 'Failed to link phone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-bg-sand pt-32 pb-20 flex justify-center">
        <Loader2 size={32} className="animate-spin text-terracotta" />
      </div>
    );
  }

  const qrPayload = account ? `TASTE OF VILLAGE-REWARDS:${account.phone}` : '';
  const points = account?.points || 0;
  const tier = getTierInfo(points);
  const TierIcon = tier.icon;
  
  // Progression Math
  const nextTarget = tier.next || points;
  const progressPercent = tier.next ? Math.min(100, (points / nextTarget) * 100) : 100;

  return (
    <div className="min-h-screen bg-bg-sand pt-20 pb-32 selection:bg-terracotta selection:text-white overflow-hidden relative">
      {/* TODO: metadata export */}
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-pine/5 pointer-events-none -skew-y-3 transform origin-top-left -z-10"></div>

      <div className="max-w-3xl mx-auto px-4 mt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white border border-pine/20 shadow-[4px_4px_0px_rgba(20,40,29,0.05)]">
            <UserCircle2 size={28} className="text-terracotta" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-pine tracking-[0.15em] uppercase mb-6">
            Heritage Rewards
          </h1>
          <p className="text-pine/70 text-lg max-w-md mx-auto font-medium">
            Earn 1 point for every £1 spent across all our restaurants. Unlock exclusive dining experiences.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Not Logged In */}
          {!isLoggedIn && (
            <motion.div 
              key="logged-out"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none p-8 md:p-14 border border-pine/10 shadow-2xl shadow-pine/5 relative"
            >
              <div className="text-center mb-10">
                <h2 className="font-display font-black text-2xl tracking-widest text-pine uppercase">Join The Club</h2>
                <p className="text-pine/60 text-sm mt-4 font-medium leading-relaxed max-w-sm mx-auto">
                  Sign in to securely access your rewards, track orders, and easily link your points at our kiosks.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-5 px-6 border-2 border-pine/10 hover:border-terracotta hover:bg-bg-sand transition-all font-black text-pine tracking-[0.2em] uppercase disabled:opacity-50 shadow-[4px_4px_0px_rgba(20,40,29,0.05)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(138,61,42,0.1)]"
              >
                {loading ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="mt-14 pt-10 border-t border-pine/10">
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-pine/40 mb-10 text-center">How It Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                  {[
                    { icon: Store, title: 'Visit Us', desc: 'Order at any of our branches' },
                    { icon: Smartphone, title: 'Track', desc: 'Points attach to your mobile automatically' },
                    { icon: Gift, title: 'Earn', desc: 'Unlock exclusive culinary experiences' },
                  ].map((step, i) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} key={i} className="text-center flex flex-col items-center">
                      <div className="w-12 h-12 border border-pine/10 flex items-center justify-center mb-4 bg-bg-sand text-pine/60 rounded-full">
                        <step.icon size={20} />
                      </div>
                      <p className="font-display font-black uppercase tracking-wider text-pine mb-2">{step.title}</p>
                      <p className="text-pine/50 text-xs leading-relaxed font-medium">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Logged in, but NO Phone number linked */}
          {isLoggedIn && !user?.phone && (
            <motion.div 
              key="link-phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-none p-8 md:p-14 border border-pine/10 shadow-2xl shadow-pine/5 relative"
            >
              <div className="flex items-center justify-between mb-10 border-b border-pine/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-bg-sand flex items-center justify-center border border-pine/10 overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <UserCircle2 size={18} className="text-pine" />}
                  </div>
                  <div>
                    <h2 className="font-display font-black text-xl tracking-widest text-pine uppercase">Welcome, {user?.displayName?.split(' ')[0] || 'Guest'}</h2>
                    <p className="text-pine/50 text-xs font-bold uppercase tracking-widest mt-1">Almost Done</p>
                  </div>
                </div>
                <button onClick={logout} title="Sign Out" className="p-2 text-pine/40 hover:text-terracotta transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
              
              <p className="text-pine/60 text-sm mb-8 font-medium leading-relaxed">
                To securely track your points and use them at our kiosks, please link your mobile number to your account.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLinkPhone()}
                  placeholder="07XXX XXXXXX"
                  className="flex-1 px-6 py-4 border border-pine/20 focus:border-terracotta outline-none text-lg font-bold text-pine transition-colors bg-white shadow-inner"
                />
                <button
                  onClick={handleLinkPhone} disabled={loading}
                  className="px-10 py-4 bg-pine text-white font-black uppercase tracking-[0.2em] hover:bg-terracotta transition-all shadow-[4px_4px_0px_rgba(20,40,29,0.2)] hover:shadow-[6px_6px_0px_rgba(138,61,42,0.3)] hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3 border border-pine"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                  {loading ? '' : 'Link Mobile'}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 text-center border border-red-100 animate-fade-in">
                  <p className="text-red-500 text-[11px] font-black tracking-widest uppercase">{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Dashboard when logged in & Phone Linked */}
          {isLoggedIn && user?.phone && account && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Ultra Premium Welcome Banner based on Tier */}
              <div className={`${tier.color} text-white p-8 md:p-12 shadow-[12px_12px_0px_rgba(20,40,29,0.1)] relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-12">
                    <div className="flex gap-5 items-center">
                      <div className="w-16 h-16 bg-white/10 rounded-none flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-inner">
                        {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserCircle2 size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TierIcon size={14} className={tier.text} />
                          <p className={`${tier.text} text-[10px] font-black uppercase tracking-[0.3em]`}>{tier.name} TIER</p>
                        </div>
                        <h2 className="font-display text-3xl font-black uppercase tracking-[0.15em]">{user.displayName || 'Customer'}</h2>
                        <p className="text-white/50 text-xs font-mono mt-1">{account.phone}</p>
                      </div>
                    </div>
                    <button onClick={logout} className="text-white/50 hover:text-white text-[10px] font-black tracking-widest uppercase transition-colors flex items-center gap-2 border border-white/10 px-4 py-2 hover:bg-white/10">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                  
                  {/* Points Display */}
                  <div className="flex flex-col md:flex-row gap-8 md:items-end">
                    <div>
                      <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Available Points</p>
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                        className="font-display text-7xl font-black tracking-tight drop-shadow-md"
                      >
                        {points}
                      </motion.div>
                    </div>
                    
                    {/* Next Tier Progress */}
                    {tier.next && (
                      <div className="flex-1 max-w-md bg-white/5 p-5 border border-white/10">
                        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-white/70 mb-3">
                          <span>Progress to {getTierInfo(tier.next).name}</span>
                          <span>{points} / {tier.next}</span>
                        </div>
                        <div className="h-2 bg-white/10 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                            className={`h-full ${tier.name === 'Silver Village' ? 'bg-terracotta' : 'bg-amber-400'}`}
                          />
                        </div>
                        <p className="text-[10px] text-white/50 mt-3 font-medium uppercase tracking-widest">
                          Earn {tier.next - points} more points to upgrade
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reward Gallery Grid */}
              <div className="bg-white p-8 md:p-10 border border-pine/10 shadow-xl">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black text-xs uppercase tracking-[0.25em] text-pine flex items-center gap-3">
                    <Gift size={16} className="text-terracotta" /> Available Rewards
                  </h3>
                  <span className="text-xs text-pine/40 font-bold uppercase tracking-widest">Tap to view</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {REWARDS_CATALOG.map((reward, i) => {
                    const isUnlocked = points >= reward.points;
                    const progress = Math.min(100, (points / reward.points) * 100);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        key={i} 
                        className={`p-6 border-2 flex items-start gap-5 transition-all ${
                          isUnlocked 
                            ? 'border-terracotta/30 bg-terracotta/5 hover:border-terracotta' 
                            : 'border-pine/5 bg-bg-sand opacity-70 grayscale-[0.5]'
                        }`}
                      >
                        <div className={`text-4xl ${isUnlocked ? '' : 'opacity-50'}`}>
                          {reward.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-display font-black text-lg text-pine">{reward.title}</h4>
                            <span className={`text-[10px] font-black px-3 py-1 uppercase tracking-widest ${
                              isUnlocked ? 'bg-terracotta text-white' : 'bg-pine/10 text-pine'
                            }`}>
                              {reward.points} PTS
                            </span>
                          </div>
                          <p className="text-pine/60 text-sm font-medium mb-4">{reward.desc}</p>
                          
                          {/* Mini Progress bar if locked */}
                          {!isUnlocked && (
                            <div className="space-y-1.5">
                              <div className="h-1 bg-pine/10 overflow-hidden w-full">
                                <div className="h-full bg-terracotta/50" style={{ width: `${progress}%` }}></div>
                              </div>
                              <p className="text-[9px] text-pine/40 font-bold uppercase tracking-widest text-right">
                                {reward.points - points} points to go
                              </p>
                            </div>
                          )}
                          {isUnlocked && (
                            <p className="text-xs text-terracotta font-bold uppercase tracking-widest flex items-center gap-1">
                              <Crown size={12} /> UNLOCKED
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Digital Card / QR */}
              <div className="bg-pine text-bg-sand p-8 md:p-12 border border-pine/10 text-center relative overflow-hidden shadow-2xl">
                {/* Visual architectural flair */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-terracotta to-transparent"></div>
                
                <h3 className="font-black text-xs uppercase tracking-[0.3em] text-bg-sand/70 mb-4 flex items-center justify-center gap-3">
                  <QrCode size={16} className="text-terracotta-light" /> Digital Loyalty Card
                </h3>
                <p className="text-bg-sand/60 text-sm mb-10 max-w-md mx-auto font-medium leading-relaxed">
                  Scan this code at the till or kiosk to instantly link your order, earn points, and redeem rewards.
                </p>
                
                {!showQr ? (
                  <button onClick={() => setShowQr(true)} className="px-10 py-5 bg-terracotta text-white font-black tracking-[0.2em] uppercase text-sm hover:bg-terracotta-light transition-all inline-flex items-center gap-4 shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1">
                    <QrCode size={20} /> Reveal My Card
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 inline-flex flex-col items-center bg-white p-8 border-[4px] border-terracotta shadow-2xl"
                  >
                    <div className="w-64 h-64 bg-white flex items-center justify-center p-2">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}&color=1A3C34&bgcolor=FFFFFF&qzone=1`} alt="Rewards QR code" className="w-full h-full drop-shadow-sm" />
                    </div>
                    <div className="w-full h-px bg-pine/10 my-6"></div>
                    <p className="text-pine font-display font-black tracking-[0.1em] text-xl">{user.displayName}</p>
                    <p className="text-pine/50 text-sm mt-1 font-mono font-bold tracking-widest">{account.phone}</p>
                    
                    <button onClick={() => setShowQr(false)} className="mt-8 text-xs text-pine/50 font-black tracking-[0.2em] uppercase hover:text-terracotta transition-colors underline underline-offset-4 flex items-center gap-2">
                      <ChevronDown size={14} /> Hide Card
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Call to Action */}
              <div className="text-center pt-8 pb-12">
                <Link href="/menu" className="inline-flex items-center gap-4 px-12 py-6 bg-white border-[3px] border-pine text-pine font-black uppercase tracking-[0.2em] text-sm hover:bg-pine hover:text-white transition-all shadow-[8px_8px_0px_rgba(20,40,29,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(20,40,29,1)]">
                  Order & Earn Points <ChevronRight size={18} />
                </Link>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
