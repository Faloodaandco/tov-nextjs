'use client';

import React, { useState } from 'react';
import { Megaphone, Save, Eye, CheckCircle2, Power } from 'lucide-react';

export const AnnouncementsTab: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [text, setText] = useState('🔥 Authentic Desi Karahi & Fresh Naan — Order Direct for 15% Off with code TOV15! Available in Hayes & Slough.');
  const [link, setLink] = useState('/offers');
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
            <h2 className="font-serif font-bold text-lg text-white">Marquee Announcement Banner</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              Site Top Bar
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Broadcast urgent notices, holiday specials, or promotions across every page of the public website.
          </p>
        </div>

        {saved && (
          <div className="p-2 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Banner updated live</span>
          </div>
        )}
      </div>

      {/* Live Preview Card */}
      <div className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md">
        <h3 className="text-xs font-bold uppercase text-[#D3A762] tracking-wider mb-2 flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> Live Website Preview
        </h3>
        <div className="overflow-hidden rounded-xl border border-[#D3A762]/30 bg-[#0D1912]">
          {enabled ? (
            <div className="bg-gradient-to-r from-[#D3A762] to-[#dfb774] text-[#0D1912] font-bold text-xs py-2 px-4 flex items-center justify-center gap-2 text-center animate-pulse">
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>{text}</span>
            </div>
          ) : (
            <div className="bg-[#1C2D22] text-[#FAF6F0]/50 text-xs py-3 px-4 text-center italic">
              Announcement banner is currently disabled.
            </div>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D3A762]/10">
            <div>
              <h4 className="text-sm font-bold text-white">Banner Status</h4>
              <p className="text-xs text-[#FAF6F0]/60">Toggle banner visibility on public pages</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                enabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  : 'bg-[#1C2D22] text-[#FAF6F0]/70 hover:text-white border border-[#D3A762]/20'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {enabled ? 'Active (Displaying)' : 'Disabled'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
              Announcement Copy
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D3A762]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#D3A762] uppercase mb-1">
              Click-Through Link (Optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/offers or https://..."
              className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              Save Announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
