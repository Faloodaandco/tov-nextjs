'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Search, CheckCircle2, Ticket, Power, Link as LinkIcon, Edit2, Copy, AlertCircle, RefreshCw } from 'lucide-react';
import { Promo } from '@/types/promo';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPromosPage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Promo>>({
    code: '',
    name: '',
    discountType: 'PERCENTAGE',
    discountPercent: 0,
    fixedAmountPence: 0,
    branches: ['hayes', 'slough'],
    minOrderPence: 0,
    maxRedemptions: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
  });

  const fetchPromos = async (authPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos', {
        headers: { Authorization: `Bearer ${authPin}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPromos(data);
        setIsAuthenticated(true);
        setError('');
      } else {
        setIsAuthenticated(false);
        setError('Invalid PIN or unauthorized');
      }
    } catch (err) {
      setError('Failed to fetch promos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPromos(pin);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pin}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('Promo created successfully');
        setIsFormOpen(false);
        fetchPromos(pin);
        setFormData({ ...formData, code: '', name: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create promo');
      }
    } catch (err) {
      setError('Error creating promo');
    }
  };

  const toggleActive = async (promo: Promo) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pin}`,
        },
        body: JSON.stringify({ code: promo.code, active: !promo.active }),
      });

      if (res.ok) {
        fetchPromos(pin);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePromo = async (code: string) => {
    if (!confirm('Are you sure you want to delete this promo?')) return;
    try {
      const res = await fetch(`/api/admin/promos?code=${code}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${pin}` },
      });

      if (res.ok) {
        fetchPromos(pin);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyLink = (code: string, branch: string) => {
    const url = `${window.location.origin}/${branch}/menu?promo=${code}`;
    navigator.clipboard.writeText(url);
    setSuccess(`Link copied: ${url}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const getStatus = (promo: Promo) => {
    if (!promo.active) return { label: 'Inactive', color: 'bg-gray-200 text-gray-700' };
    
    const now = new Date();
    if (new Date(promo.endDate) < now) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    if (new Date(promo.startDate) > now) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
    if (promo.maxRedemptions > 0 && promo.currentRedemptions >= promo.maxRedemptions) return { label: 'Exhausted', color: 'bg-orange-100 text-orange-700' };
    
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-warm w-full max-w-sm">
          <h1 className="text-2xl font-bold text-pine mb-6 text-center">Admin Access</h1>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter Staff PIN"
            className="w-full p-3 border border-warm rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-terracotta"
            autoFocus
          />
          {error && <p className="text-terracotta text-sm mb-4">{error}</p>}
          <button aria-label="Button" type="submit" disabled={loading} className="w-full bg-pine text-white py-3 rounded-xl font-bold hover:bg-pine/90">
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream text-pine p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Promo Management</h1>
            <p className="text-pine/60 mt-1">Create and manage deep-link promotional codes</p>
          </div>
          <button aria-label="Button"
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-terracotta text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-terracotta/90 transition"
          >
            <Plus size={18} /> New Promo
          </button>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {promos.map(promo => {
            const status = getStatus(promo);
            return (
              <div key={promo.code} className="bg-white rounded-2xl p-6 border border-warm shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black tracking-widest text-pine uppercase bg-cream px-3 py-1 rounded-lg border border-warm/50">
                      {promo.code}
                    </span>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">{promo.name}</h3>
                    <p className="text-sm text-pine font-medium">
                      {promo.discountType === 'PERCENTAGE' 
                        ? `${promo.discountPercent}% OFF` 
                        : `£${(promo.fixedAmountPence! / 100).toFixed(2)} OFF`}
                      {' • '}Min. Order: £{(promo.minOrderPence / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {promo.branches.map(b => (
                      <button aria-label="Button"
                        key={b}
                        onClick={() => copyLink(promo.code, b)}
                        className="text-xs flex items-center gap-1.5 bg-pine/5 hover:bg-pine/10 text-pine px-3 py-1.5 rounded-full font-medium transition"
                        title={`Copy ${b} deep-link`}
                      >
                        <LinkIcon size={12} /> {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 md:border-l md:border-warm/50 md:pl-6">
                  <div className="text-right">
                    <p className="text-sm text-pine/60 font-semibold uppercase tracking-wider">Redemptions</p>
                    <p className="text-2xl font-black">
                      {promo.currentRedemptions}
                      <span className="text-base text-pine/40 font-medium">
                        {promo.maxRedemptions > 0 ? ` / ${promo.maxRedemptions}` : ' / ∞'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button aria-label="Button"
                      onClick={() => toggleActive(promo)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
                        promo.active ? 'bg-pine/10 text-pine hover:bg-pine/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Power size={16} /> {promo.active ? 'Disable' : 'Enable'}
                    </button>
                    <button aria-label="Button"
                      onClick={() => deletePromo(promo.code)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {promos.length === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-2xl border border-warm border-dashed">
              <Ticket className="mx-auto text-pine/20 mb-4" size={48} />
              <p className="text-lg font-bold text-pine/80">No promotions found</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-pine/40 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-warm p-6 flex justify-between items-center z-10">
                <h2 className="text-2xl font-black uppercase tracking-wider">New Promo</h2>
                <button aria-label="Button" onClick={() => setIsFormOpen(false)} className="p-2 bg-cream text-pine rounded-full hover:bg-warm transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Promo Code</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-bold uppercase placeholder:normal-case"
                      placeholder="e.g. VILLAGE10"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Display Name</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      placeholder="e.g. Local Resident 10% Off"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Discount Type</label>
                    <select
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      value={formData.discountType}
                      onChange={e => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (£)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">
                      Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(£)'}
                    </label>
                    <input
                      required
                      type="number"
                      step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-bold"
                      value={formData.discountType === 'PERCENTAGE' ? formData.discountPercent : (formData.fixedAmountPence || 0) / 100}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (formData.discountType === 'PERCENTAGE') {
                          setFormData({ ...formData, discountPercent: val });
                        } else {
                          setFormData({ ...formData, fixedAmountPence: Math.round(val * 100) });
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Min Order (£)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      value={(formData.minOrderPence || 0) / 100}
                      onChange={e => setFormData({ ...formData, minOrderPence: Math.round(parseFloat(e.target.value) * 100) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Max Redemptions (0 for ∞)</label>
                    <input
                      required
                      type="number"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      value={formData.maxRedemptions}
                      onChange={e => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">Start Date</label>
                    <input
                      required
                      type="date"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-pine">End Date</label>
                    <input
                      required
                      type="date"
                      className="w-full p-4 bg-cream border border-warm rounded-xl font-medium"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

                </div>

                <div className="space-y-3 pt-4 border-t border-warm">
                  <label className="text-xs font-bold uppercase tracking-wider text-pine">Valid Branches</label>
                  <div className="flex gap-4">
                    {['hayes', 'slough'].map(branch => (
                      <label key={branch} className="flex items-center gap-2 cursor-pointer p-4 bg-cream border border-warm rounded-xl flex-1 hover:bg-warm/50 transition">
                        <input
                          type="checkbox"
                          className="w-5 h-5 accent-terracotta"
                          checked={formData.branches?.includes(branch as any)}
                          onChange={e => {
                            const branches = formData.branches || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, branches: [...branches, branch as any] });
                            } else {
                              setFormData({ ...formData, branches: branches.filter(b => b !== branch) });
                            }
                          }}
                        />
                        <span className="font-bold uppercase tracking-wider text-sm">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 pb-2">
                  <button aria-label="Button" type="submit" className="w-full bg-terracotta text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-terracotta/90 transition shadow-md">
                    Create Promo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
