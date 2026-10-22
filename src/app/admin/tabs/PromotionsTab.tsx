'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  Search,
  CheckCircle2,
  Ticket,
  Power,
  Copy,
  AlertCircle,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { Promo } from '@/types/promo';

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

export const PromotionsTab: React.FC<Props> = ({ selectedBranch }) => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<Promo>>({
    code: '',
    name: '',
    discountType: 'PERCENTAGE',
    discountPercent: 10,
    fixedAmountPence: 0,
    branches: ['hayes', 'slough'],
    minOrderPence: 1500,
    maxRedemptions: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true,
  });

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promos');
      if (res.ok) {
        const data = await res.json();
        setPromos(Array.isArray(data) ? data : []);
        setError('');
      } else {
        setError('Failed to fetch promos');
      }
    } catch {
      setError('Error connecting to promos API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('Promo code created successfully!');
        setIsFormOpen(false);
        fetchPromos();
        setFormData({
          code: '',
          name: '',
          discountType: 'PERCENTAGE',
          discountPercent: 10,
          fixedAmountPence: 0,
          branches: ['hayes', 'slough'],
          minOrderPence: 1500,
          maxRedemptions: 100,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          active: true,
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create promo code');
      }
    } catch {
      setError('Error creating promo');
    }
  };

  const toggleActive = async (promo: Promo) => {
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo.code, active: !promo.active }),
      });
      if (res.ok) fetchPromos();
    } catch {
      // Ignore
    }
  };

  const filtered = promos.filter((p) => {
    const codeMatch = p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const branchMatch = selectedBranch === 'all' || p.branches?.includes(selectedBranch);
    return (codeMatch || nameMatch) && branchMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">Online Promos & Vouchers</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              Checkout & WhatsApp
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Create and manage promotional discount vouchers for online cart checkout and WhatsApp chatbot orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Promo Code
          </button>
          <button
            onClick={fetchPromos}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/30 text-xs font-semibold text-[#D3A762] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#FAF6F0]/40" />
        <input
          type="text"
          placeholder="Search promo codes or campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#14231B] border border-[#D3A762]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762]"
        />
      </div>

      {/* Promos Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-12 text-center text-[#FAF6F0]/50">
          <Ticket className="w-12 h-12 text-[#D3A762]/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No promotional vouchers found</p>
          <p className="text-xs text-[#FAF6F0]/60 max-w-sm mx-auto mt-1">
            Click &quot;New Promo Code&quot; above to create a discount campaign.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((promo) => (
            <div
              key={promo.code}
              className={`bg-[#14231B] border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                promo.active
                  ? 'border-[#D3A762]/30 hover:border-[#D3A762]/60 shadow-md'
                  : 'border-white/10 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#0D1912] border border-[#D3A762]/40 rounded-xl font-mono text-sm font-bold text-[#D3A762]">
                      {promo.code}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(promo.code);
                        setSuccess(`Copied ${promo.code}!`);
                        setTimeout(() => setSuccess(''), 2000);
                      }}
                      className="text-[#FAF6F0]/40 hover:text-[#D3A762] transition-colors p-1"
                      title="Copy code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                      promo.active
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        : 'bg-red-950/40 text-red-300 border-red-500/30'
                    }`}
                  >
                    {promo.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-2">{promo.name}</h3>

                <div className="bg-[#0D1912] rounded-xl p-3 my-2 space-y-1.5 border border-[#D3A762]/10 text-xs text-[#FAF6F0]/80">
                  <div className="flex justify-between items-center">
                    <span className="text-[#FAF6F0]/60">Discount:</span>
                    <span className="font-bold text-[#D3A762]">
                      {promo.discountType === 'PERCENTAGE'
                        ? `${promo.discountPercent}% OFF`
                        : `£${((promo.fixedAmountPence || 0) / 100).toFixed(2)} OFF`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#FAF6F0]/60">Min Order:</span>
                    <span>£{((promo.minOrderPence || 0) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#FAF6F0]/60">Usage:</span>
                    <span>
                      {promo.currentRedemptions || 0} / {promo.maxRedemptions || 'Unlimited'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#D3A762]/10 text-[10px] text-[#FAF6F0]/50">
                    <span>Valid:</span>
                    <span>{promo.endDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D3A762]/10 flex items-center justify-between">
                <span className="text-[10px] text-[#FAF6F0]/50 uppercase font-semibold">
                  {promo.branches?.join(', ') || 'All Branches'}
                </span>
                <button
                  type="button"
                  onClick={() => toggleActive(promo)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    promo.active
                      ? 'bg-[#1C2D22] text-red-300 hover:bg-red-950/40 border border-red-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {promo.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Promo Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#16271F] border border-[#D3A762]/30 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-white">Create Promotional Voucher</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-[#FAF6F0]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    Voucher Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TOV15"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#D3A762]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn 15% Welcome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (£)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    {formData.discountType === 'PERCENTAGE' ? 'Discount %' : 'Amount (£)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : '100'}
                    value={
                      formData.discountType === 'PERCENTAGE'
                        ? formData.discountPercent
                        : (formData.fixedAmountPence || 0) / 100
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (formData.discountType === 'PERCENTAGE') {
                        setFormData({ ...formData, discountPercent: val });
                      } else {
                        setFormData({ ...formData, fixedAmountPence: Math.round(val * 100) });
                      }
                    }}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    Min Order (£)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={(formData.minOrderPence || 0) / 100}
                    onChange={(e) => setFormData({ ...formData, minOrderPence: Math.round(parseFloat(e.target.value || '0') * 100) })}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    value={formData.maxRedemptions || 0}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value || '0', 10) })}
                    className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D3A762]/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1C2D22] text-xs font-semibold text-[#FAF6F0]/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs shadow-md"
                >
                  Save Promo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
