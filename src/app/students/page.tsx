'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F6F4EB] text-[#133026] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Subtle organic background decoration (leaf motifs) */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-20 pointer-events-none hidden md:block">
        <svg width="60" height="300" viewBox="0 0 60 300" fill="none" stroke="#133026" strokeWidth="1.5">
          <path d="M30 0 Q40 50 20 100 T30 200 T20 300" fill="none" />
          <path d="M30 40 Q50 30 40 60" fill="none" />
          <path d="M25 80 Q5 70 15 100" fill="none" />
          <path d="M28 140 Q48 130 38 160" fill="none" />
          <path d="M22 190 Q2 180 12 210" fill="none" />
          <path d="M28 250 Q48 240 38 270" fill="none" />
        </svg>
      </div>
      <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-20 pointer-events-none hidden md:block scale-x-[-1]">
        <svg width="60" height="300" viewBox="0 0 60 300" fill="none" stroke="#133026" strokeWidth="1.5">
          <path d="M30 0 Q40 50 20 100 T30 200 T20 300" fill="none" />
          <path d="M30 40 Q50 30 40 60" fill="none" />
          <path d="M25 80 Q5 70 15 100" fill="none" />
          <path d="M28 140 Q48 130 38 160" fill="none" />
          <path d="M22 190 Q2 180 12 210" fill="none" />
          <path d="M28 250 Q48 240 38 270" fill="none" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[320px] z-10 mx-auto"
      >
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-8">
             <div className="h-[1px] w-12 bg-[#133026]/20"></div>
             <span className="uppercase tracking-[0.2em] text-[10px] font-semibold text-[#133026]">Brunel & Uxbridge</span>
             <div className="h-[1px] w-12 bg-[#133026]/20"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif text-[#133026] mb-4">
            Student Pass
          </h1>
          <p className="text-[#a44230] font-semibold tracking-widest text-xs uppercase mb-4">
            50% Off First 3 Orders
          </p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#FAF8F3] border border-[#133026]/10 px-8 pt-20 pb-12 text-center shadow-sm relative overflow-hidden"
            style={{ borderRadius: '160px 160px 0 0' }}
          >
            <div className="absolute top-10 left-1/2 -translate-x-1/2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a44230" strokeWidth="1.5">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h3 className="font-serif text-2xl text-[#133026] mb-3">You're on the list</h3>
            <p className="text-sm text-[#133026]/70 mb-8 leading-relaxed">
              We'll send your 50% off promo codes to your WhatsApp shortly. Valid for both delivery and collection.
            </p>
            <a 
              href="https://tasteofvillagerestaurants.co.uk"
              className="inline-block uppercase tracking-widest text-[10px] font-semibold border border-[#133026] text-[#133026] px-8 py-3 rounded hover:bg-[#133026] hover:text-[#F6F4EB] transition-colors"
            >
              Order Now
            </a>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white/25 backdrop-blur-sm border-[0.5px] border-[#133026]/10 px-6 pt-20 pb-10 shadow-[0_8px_32px_-8px_rgba(26,60,52,0.08)]" style={{ borderRadius: '160px 160px 0 0' }}>
            <div className="space-y-6">
              
              <div>
                <input 
                  required
                  type="text"
                  placeholder="FULL NAME"
                  className="w-full bg-transparent border-b border-[#133026]/20 px-2 py-3 text-[11px] text-[#133026] placeholder-[#133026]/40 focus:outline-none focus:border-[#a44230] transition-colors uppercase tracking-[0.2em] text-center"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <input 
                  required
                  type="tel"
                  placeholder="WHATSAPP NUMBER"
                  className="w-full bg-transparent border-b border-[#133026]/20 px-2 py-3 text-[11px] text-[#133026] placeholder-[#133026]/40 focus:outline-none focus:border-[#a44230] transition-colors uppercase tracking-[0.2em] text-center"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <input 
                  type="email"
                  placeholder="UNI EMAIL (OPTIONAL)"
                  className="w-full bg-transparent border-b border-[#133026]/20 px-2 py-3 text-[11px] text-[#133026] placeholder-[#133026]/40 focus:outline-none focus:border-[#a44230] transition-colors uppercase tracking-[0.2em] text-center"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <input 
                  required
                  type="text"
                  placeholder="POSTCODE (E.G. UB8)"
                  className="w-full bg-transparent border-b border-[#133026]/20 px-2 py-3 text-[11px] text-[#133026] placeholder-[#133026]/40 focus:outline-none focus:border-[#a44230] transition-colors uppercase tracking-[0.2em] text-center"
                  value={formData.postcode}
                  onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                />
              </div>

              {status === 'error' && (
                <p className="text-[#a44230] text-[10px] text-center uppercase tracking-wider mt-4">Something went wrong. Please try again.</p>
              )}

              <div className="pt-8 text-center">
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-block px-6 py-2.5 border-[0.5px] border-[#133026]/40 text-[#133026] transition-all duration-500 bg-transparent hover:border-[#a44230] hover:text-[#a44230] disabled:opacity-50 mx-auto"
                >
                  <span className="font-sans font-bold text-[9px] tracking-[0.25em] uppercase">
                    {status === 'loading' ? 'Processing...' : 'Claim Offer'}
                  </span>
                </button>
              </div>
            </div>
            
            <p className="text-[8px] text-[#133026]/50 text-center mt-10 uppercase tracking-[0.1em] leading-relaxed max-w-[80%] mx-auto">
              By claiming this offer, you agree to receive WhatsApp notifications.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
