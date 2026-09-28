'use client';

import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, ShieldCheck, ChefHat, ChevronRight, CheckCircle2 } from 'lucide-react';

// TODO: metadata export

export default function FranchiseClient() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '', capital: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        type: 'franchise',
        source: 'website',
        createdAt: Timestamp.now(),
        status: 'new',
      });
      setSubmitted(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Franchise form submission failed:', error);
      alert('Failed to submit. Please try again or call us directly.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bg-sand flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 border-2 border-pine text-pine flex items-center justify-center mb-8 bg-white">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-black text-pine mb-4 text-center tracking-widest uppercase">Application Received</h2>
        <p className="text-pine/70 text-lg max-w-md text-center mb-10">
          Thank you for your interest. Our franchise team will review your details and contact you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="px-10 py-5 bg-pine text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-terracotta transition-all shadow-[8px_8px_0px_rgba(138,61,42,0.2)] hover:-translate-y-1"
        >
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-sand pt-20 selection:bg-terracotta selection:text-white">
      <section className="relative py-24 px-4 border-b border-pine/10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <p className="text-terracotta font-bold tracking-[0.3em] uppercase text-xs mb-6">Partner With Us</p>
          <h1 className="font-display text-5xl md:text-7xl font-black text-pine tracking-tight mb-8 leading-tight uppercase">
            Own a Taste of Village Franchise
          </h1>
          <p className="text-lg text-pine/70 max-w-2xl mx-auto mb-12 font-medium">
            Bring the authentic taste of the Mughal Empire to your city. Partner with a proven, high-growth restaurant brand.
          </p>
          <a href="#apply" className="inline-flex items-center gap-4 px-10 py-5 bg-pine text-white uppercase tracking-[0.2em] font-black text-sm hover:bg-terracotta transition-all shadow-[8px_8px_0px_rgba(138,61,42,0.2)] hover:-translate-y-1 border border-pine">
            Apply Now <ChevronRight size={18} />
          </a>
        </div>
      </section>

      <section className="py-24 bg-white px-4 border-b border-pine/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl md:text-5xl font-black text-pine tracking-tight uppercase">Why Partner With Us?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-bg-sand border-2 border-pine relative group hover:border-terracotta transition-colors">
              <div className="w-16 h-16 border-2 border-pine flex items-center justify-center mb-8 bg-white text-pine group-hover:bg-terracotta group-hover:text-white group-hover:border-terracotta transition-colors">
                <TrendingUp size={28} />
              </div>
              <h3 className="font-display font-bold text-2xl text-pine mb-4 uppercase">Proven Concept</h3>
              <p className="text-pine/70 leading-relaxed font-medium">
                Our menu of authentic curries, grills, and heritage dishes has a proven track record of high demand and exceptional customer retention.
              </p>
            </div>
            <div className="p-10 bg-bg-sand border-2 border-pine relative group hover:border-terracotta transition-colors">
              <div className="w-16 h-16 border-2 border-pine flex items-center justify-center mb-8 bg-white text-pine group-hover:bg-terracotta group-hover:text-white group-hover:border-terracotta transition-colors">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-display font-bold text-2xl text-pine mb-4 uppercase">Operational Excellence</h3>
              <p className="text-pine/70 leading-relaxed font-medium">
                Access our proprietary Restaurant OS, supply chain networks, and standardized operational procedures that maximize efficiency.
              </p>
            </div>
            <div className="p-10 bg-bg-sand border-2 border-pine relative group hover:border-terracotta transition-colors">
              <div className="w-16 h-16 border-2 border-pine flex items-center justify-center mb-8 bg-white text-pine group-hover:bg-terracotta group-hover:text-white group-hover:border-terracotta transition-colors">
                <ChefHat size={28} />
              </div>
              <h3 className="font-display font-bold text-2xl text-pine mb-4 uppercase">Comprehensive Training</h3>
              <p className="text-pine/70 leading-relaxed font-medium">
                From kitchen operations to front-of-house management, we provide extensive training for you and your staff to ensure success.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="py-24 px-4 bg-bg-sand">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-10 md:p-14 border-2 border-pine shadow-[12px_12px_0px_rgba(20,40,29,1)]">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-black text-pine mb-4 uppercase tracking-tight">Begin Your Journey</h2>
              <p className="text-pine/60 font-medium">Fill out the form below and our franchise development team will get in touch.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium rounded-none" placeholder="E.g. Tariq Khan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium rounded-none" placeholder="tariq@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium rounded-none" placeholder="07XXX XXXXXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Desired Location</label>
                  <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium rounded-none" placeholder="E.g. Reading, Berkshire" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Available Liquid Capital</label>
                <select required value={formData.capital} onChange={e => setFormData({ ...formData, capital: e.target.value })} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium rounded-none appearance-none">
                  <option value="" disabled>Select an option</option>
                  <option value="50k-100k">£50,000 - £100,000</option>
                  <option value="100k-250k">£100,000 - £250,000</option>
                  <option value="250k+">£250,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-pine uppercase tracking-[0.2em] mb-3">Message / Background (Optional)</label>
                <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full px-5 py-4 bg-transparent border-2 border-pine/20 focus:border-terracotta outline-none transition-all text-pine font-medium resize-none rounded-none" placeholder="Tell us a bit about your experience..." />
              </div>

              <button type="submit" className="w-full py-6 bg-terracotta text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-[#a64036] transition-all border-2 border-terracotta hover:border-[#a64036] shadow-[8px_8px_0px_rgba(20,40,29,0.1)] hover:-translate-y-1 mt-6">
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
