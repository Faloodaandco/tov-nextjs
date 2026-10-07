'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import Head from 'next/head';

export default function StudentPromoPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', postcode: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/leads/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-orange-400 mb-6 backdrop-blur-md"
          >
            <GraduationCap size={16} />
            <span>Brunel & Uxbridge Exclusive</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 mb-4">
            50% Off Your First 3 Orders.
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Taste of Village is now delivering to Brunel University and Uxbridge. 
            Claim your student pass below.
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 border border-green-500/30 rounded-3xl p-8 text-center backdrop-blur-xl"
          >
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">You're on the list.</h3>
            <p className="text-white/60 mb-6">
              We'll send your 50% off promo codes to your WhatsApp shortly. Valid for both delivery and collection.
            </p>
            <a 
              href="https://tasteofvillagerestaurants.co.uk"
              className="inline-flex items-center justify-center w-full bg-white text-black py-4 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Browse Menu
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Sarah Smith"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">WhatsApp Number</label>
                <input 
                  required
                  type="tel"
                  placeholder="e.g. +44 7123 456789"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">University Email</label>
                  <input 
                    type="email"
                    placeholder="@brunel.ac.uk"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Postcode (e.g. UB8)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input 
                      required
                      type="text"
                      placeholder="UB8 3PH"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      value={formData.postcode}
                      onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm mt-2">Something went wrong. Please try again.</p>
              )}

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white text-black py-4 rounded-xl font-medium mt-4 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Claim 50% Off Pass <ArrowRight size={18} /></>
                )}
              </button>
            </div>
            
            <p className="text-xs text-white/30 text-center mt-6">
              By claiming this offer, you agree to receive WhatsApp notifications with your promo codes and order updates. You can opt out at any time.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
