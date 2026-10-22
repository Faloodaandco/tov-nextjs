'use client';

import React, { useState } from 'react';
import {
  Settings,
  MapPin,
  Phone,
  Clock,
  Mail,
  Save,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

export const StoreInfoTab: React.FC<Props> = ({ selectedBranch }) => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">Store Settings & Operations</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              Branch Configuration
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Addresses, dispatch phone lines, delivery fee rules, and trading hours for Hayes and Slough.
          </p>
        </div>

        {saved && (
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hayes Branch Config */}
        <div className="bg-[#14231B] border border-[#D3A762]/25 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D3A762]/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D3A762]" /> Hayes Restaurant & Takeaway
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Full Address & Postcode
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>23 Coldharbour Lane, Hayes, Greater London UB3 3EB</span>
              </div>
            </div>

            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Landline & Takeaway Hotline
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>020 8573 2223 / +44 7424 216045</span>
              </div>
            </div>

            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Trading Hours
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>Mon - Sun: 12:00 PM – 11:00 PM (Brunch Sat-Sun: 10:00 AM)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                  Min Delivery
                </label>
                <div className="bg-[#0D1912] p-2 rounded-xl border border-[#D3A762]/20 text-white font-bold">
                  £15.00
                </div>
              </div>
              <div>
                <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                  Free Delivery Over
                </label>
                <div className="bg-[#0D1912] p-2 rounded-xl border border-[#D3A762]/20 text-white font-bold">
                  £35.00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slough Branch Config */}
        <div className="bg-[#14231B] border border-[#D3A762]/25 rounded-2xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D3A762]/10">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#D3A762]" /> Slough Restaurant & Takeaway
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Full Address & Postcode
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>276 High Street, Slough SL1 1NB</span>
              </div>
            </div>

            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Landline & Takeaway Hotline
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>01753 521234 / +44 7337 389133</span>
              </div>
            </div>

            <div>
              <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                Trading Hours
              </label>
              <div className="bg-[#0D1912] p-2.5 rounded-xl border border-[#D3A762]/20 text-white font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D3A762] shrink-0" />
                <span>Mon - Sun: 12:00 PM – 11:00 PM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                  Min Delivery
                </label>
                <div className="bg-[#0D1912] p-2 rounded-xl border border-[#D3A762]/20 text-white font-bold">
                  £15.00
                </div>
              </div>
              <div>
                <label className="block text-[#D3A762] font-semibold text-[11px] uppercase mb-1">
                  Free Delivery Over
                </label>
                <div className="bg-[#0D1912] p-2 rounded-xl border border-[#D3A762]/20 text-white font-bold">
                  £35.00
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
