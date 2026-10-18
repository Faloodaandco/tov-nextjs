// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, ShieldCheck, AlertTriangle, Gift, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RewardData {
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  customerName: string;
  phone: string;
  rewardTitle: string;
  rewardDescription: string;
  pointsSpent: number;
  createdAt: string;
  expiresAt: string;
  discountPounds?: number;
  redeemedAt?: string;
  redeemedBy?: string;
  redeemedAtBranch?: string;
}

const BRANCHES = [
  { id: 'hayes', name: 'Taste Of Village Hayes' },
  { id: 'slough', name: 'Taste Of Village Slough' },
];

export default function RedeemClient({ code }: { code: string }) {
  const [reward, setReward] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('hayes');
  const [redeemed, setRedeemed] = useState(false);

  useEffect(() => {
    fetchReward();
  }, [code]);

  const fetchReward = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rewards/redeem?code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Reward not found');
      }
      const data = await res.json();
      setReward(data);
      if (data.status === 'redeemed') setRedeemed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load reward');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!reward || redeeming) return;
    setRedeeming(true);
    setError('');
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: reward.code,
          branch: selectedBranch,
          staffId: 'counter',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Redemption failed');
      }
      setRedeemed(true);
      // Refresh data
      await fetchReward();
    } catch (err: any) {
      setError(err.message || 'Redemption failed');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-sand flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-terracotta mx-auto mb-4" />
          <p className="text-pine/60 font-black text-xs uppercase tracking-[0.3em]">Verifying reward...</p>
        </div>
      </div>
    );
  }

  if (error && !reward) {
    return (
      <div className="min-h-screen bg-bg-sand flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 max-w-md w-full text-center border border-red-200 shadow-xl"
        >
          <XCircle size={56} className="text-red-500 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-black text-pine uppercase tracking-widest mb-4">Invalid Reward</h1>
          <p className="text-pine/60 font-medium">{error}</p>
          <p className="text-pine/40 text-xs mt-6 font-bold uppercase tracking-widest">Code: {code}</p>
        </motion.div>
      </div>
    );
  }

  if (!reward) return null;

  // Already redeemed
  if (reward.status === 'redeemed' || redeemed) {
    return (
      <div className="min-h-screen bg-bg-sand flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 max-w-md w-full text-center border border-pine/10 shadow-xl"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-emerald-200">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="font-display text-2xl font-black text-pine uppercase tracking-widest mb-2">Already Redeemed</h1>
          <div className="bg-bg-sand p-6 my-6 border border-pine/10">
            <p className="font-display font-black text-lg text-pine">{reward.rewardTitle}</p>
            <p className="text-pine/60 text-sm mt-1">{reward.rewardDescription}</p>
            <p className="text-pine/80 text-sm mt-3 font-bold">Customer: {reward.customerName}</p>
          </div>
          {reward.redeemedAt && (
            <div className="text-xs text-pine/40 font-bold uppercase tracking-widest space-y-1">
              <p>Redeemed: {new Date(reward.redeemedAt).toLocaleString('en-GB')}</p>
              {reward.redeemedAtBranch && <p>Branch: {reward.redeemedAtBranch}</p>}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Expired
  if (reward.status === 'expired') {
    return (
      <div className="min-h-screen bg-bg-sand flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 max-w-md w-full text-center border border-amber-200 shadow-xl"
        >
          <Clock size={56} className="text-amber-500 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-black text-pine uppercase tracking-widest mb-4">Expired</h1>
          <p className="text-pine/60 font-medium">This reward expired on {new Date(reward.expiresAt).toLocaleDateString('en-GB')}.</p>
          <p className="text-pine/60 text-sm mt-2">The customer can claim a new reward on their account.</p>
        </motion.div>
      </div>
    );
  }

  // ── Active — ready to redeem ───────────────────────────────────────
  const daysLeft = Math.ceil((new Date(reward.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-bg-sand flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full border border-pine/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-pine text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <ShieldCheck size={32} className="mx-auto mb-3 text-terracotta" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-2">Staff Verification</p>
            <h1 className="font-display text-3xl font-black uppercase tracking-widest">Valid Reward</h1>
          </div>
        </div>

        {/* Reward Details */}
        <div className="p-8">
          <div className="bg-terracotta/5 border-2 border-terracotta/20 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{reward.rewardTitle.includes('Voucher') ? '🎫' : reward.rewardTitle.includes('Dessert') ? '🍨' : reward.rewardTitle.includes('Grill') ? '🥩' : '👑'}</div>
              <div>
                <h2 className="font-display text-xl font-black text-pine">{reward.rewardTitle}</h2>
                <p className="text-pine/60 text-sm mt-1">{reward.rewardDescription}</p>
                {reward.discountPounds && (
                  <p className="text-terracotta font-black text-lg mt-2">£{reward.discountPounds} OFF</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-pine/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pine/50">Customer</span>
              <span className="font-black text-pine">{reward.customerName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-pine/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pine/50">Code</span>
              <span className="font-mono font-bold text-pine">{reward.code}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-pine/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pine/50">Points Spent</span>
              <span className="font-bold text-pine">{reward.pointsSpent}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pine/50">Expires</span>
              <span className="font-bold text-pine">
                {daysLeft > 0 ? `${daysLeft} days left` : 'Today'}
              </span>
            </div>
          </div>

          {/* Branch Selector */}
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pine/50 mb-3">Redeeming at:</p>
            <div className="grid grid-cols-2 gap-3">
              {BRANCHES.map(b => (
                <button
                  aria-label={b.name}
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`p-4 text-center border-2 transition-all text-sm font-black uppercase tracking-wider ${
                    selectedBranch === b.id
                      ? 'border-terracotta bg-terracotta/5 text-terracotta'
                      : 'border-pine/10 text-pine/50 hover:border-pine/30'
                  }`}
                >
                  <Store size={16} className="mx-auto mb-2" />
                  {b.id === 'hayes' ? 'Hayes' : 'Slough'}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <p className="text-red-600 text-sm font-bold">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Button */}
          <button
            aria-label="Confirm Redemption"
            onClick={handleRedeem}
            disabled={redeeming}
            className="w-full py-5 bg-emerald-600 text-white font-black text-lg uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-[4px_4px_0px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
          >
            {redeeming ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={22} />
                Confirm &amp; Redeem
              </>
            )}
          </button>

          <p className="text-center text-[9px] text-pine/30 font-bold uppercase tracking-widest mt-4">
            This action is irreversible. Only confirm after giving the customer their reward.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
