'use client';
import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Printer, MapPin, Sparkles, Percent, Download, ArrowLeft, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { LOCATIONS } from '@/config/shopConfig';

export default function PrintQRs() {
  const [selectedBranch, setSelectedBranch] = useState<'hayes' | 'slough'>('hayes');
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'receipt' | 'table' | 'bag'>('whatsapp');
  const [tableCount, setTableCount] = useState<number>(1);

  const branch = LOCATIONS[selectedBranch];
  const baseUrl = 'https://tasteofvillagerestaurants.co.uk';

  const getCheckInUrl = (tableId?: number) => {
    let url = `${baseUrl}/check-in?branch=${selectedBranch}&src=${activeTab}`;
    if (tableId) url += `&table=${tableId}`;
    return url;
  };
  const whatsappNumber = selectedBranch === 'hayes' ? '447424216045' : '447337389133';
  const whatsappOrderingUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Taste of Village ${selectedBranch === 'hayes' ? 'Hayes' : 'Slough'}! I would like to view the menu and order food.`
  )}`;
  const whatsappVoucherUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Taste of Village ${selectedBranch === 'hayes' ? 'Hayes' : 'Slough'}! Please send me my 50% OFF dining voucher code.`
  )}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-4 sm:p-8 font-sans print:p-0 print:bg-white">
      {/* Non-printable Control Header */}
      <div className="max-w-4xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/check-in" className="text-sm font-bold text-gray-400 hover:text-gray-700 flex items-center gap-1">
                <ArrowLeft size={16} /> Back to Check-In
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A3C34] uppercase tracking-tight">
              Marketing QR Code Generator & Print Tool
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Print thermal receipt footers, table tent cards, and takeaway bag flyers to capture customer phone numbers.
            </p>
          </div>

          <button aria-label="Button"
            type="button"
            onClick={handlePrint}
            className="px-6 py-3 bg-[#D14836] text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-md hover:bg-[#b83b2b] transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Printer size={18} />
            <span>Print Current Design</span>
          </button>
        </div>

        {/* Branch & Template Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Select Branch
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button aria-label="Button"
                type="button"
                onClick={() => setSelectedBranch('hayes')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedBranch === 'hayes' ? 'bg-[#1A3C34] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Hayes (766B Uxbridge Rd)
              </button>
              <button aria-label="Button"
                type="button"
                onClick={() => setSelectedBranch('slough')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedBranch === 'slough' ? 'bg-[#1A3C34] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Slough (260 Farnham Rd)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Marketing Format
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button aria-label="Button"
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'whatsapp' ? 'bg-[#25D366] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                <MessageSquare size={13} />
                <span>WhatsApp AI Ordering</span>
              </button>
              <button aria-label="Button"
                type="button"
                onClick={() => setActiveTab('receipt')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'receipt' ? 'bg-[#D14836] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Till Receipt Footer
              </button>
              <button aria-label="Button"
                type="button"
                onClick={() => setActiveTab('table')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'table' ? 'bg-[#D14836] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Table Tent (A6)
              </button>
              <button aria-label="Button"
                type="button"
                onClick={() => setActiveTab('bag')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'bag' ? 'bg-[#D14836] text-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Takeaway Bag Flyer
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'table' && (
          <div className="mt-6 flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <label className="text-sm font-bold text-gray-700">Number of Tables:</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              value={tableCount} 
              onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
              className="border border-gray-300 rounded px-3 py-1 w-24 text-center font-bold text-[#1A3C34]"
            />
            <span className="text-xs text-gray-500">Will generate {tableCount} separate table tent cards.</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRINTABLE CANVAS CONTAINERS
          ───────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* 0. WHATSAPP AI FOOD ORDERING STANDEE & QR */}
        {activeTab === 'whatsapp' && (
          <div className="flex flex-col items-center w-full max-w-xl">
            {/* Quick Action Bar (Print / Download / Test) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 mb-6 shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#25D366] animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                  WABA Ordering Live
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={`/qr/tov-${selectedBranch}-whatsapp-standee.png`}
                  download={`tov-${selectedBranch}-whatsapp-standee.png`}
                  className="px-3 py-1.5 bg-[#1A3C34] text-white rounded-lg text-xs font-bold hover:bg-[#0f2520] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download size={13} />
                  <span>Download Standee (PNG)</span>
                </a>
                <a
                  href={`/qr/tov-${selectedBranch}-whatsapp-qr.svg`}
                  download={`tov-${selectedBranch}-whatsapp-qr.svg`}
                  className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all flex items-center gap-1.5 border border-gray-300"
                >
                  <Download size={13} />
                  <span>Vector SVG QR</span>
                </a>
                <a
                  href={whatsappOrderingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-bold hover:bg-[#20ba59] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <ExternalLink size={13} />
                  <span>Test Bot</span>
                </a>
              </div>
            </div>

            {/* Standee Container (Printable, Exact Taste of Village Architectural Arch Theme) */}
            <div className="w-[420px] sm:w-[480px] bg-[#F4F1EA] text-[#1A3C34] pt-0 pb-6 px-6 border border-pine/15 shadow-2xl rounded-[40px] text-center relative overflow-hidden print:shadow-none print:m-0 print:border-none print:p-4 print:w-[135mm] print:break-inside-avoid">
              {/* Rose Top Accent Border */}
              <div className="w-full h-1 bg-[#F0C6BD] -mx-6 mb-6" />

              {/* Editorial Logo Header */}
              <div className="flex flex-col items-center mb-3">
                <img
                  src="/assets/tov-logo-pine.png"
                  alt="Taste of Village"
                  className="h-10 w-auto object-contain"
                />
                <span className="font-serif italic text-[11px] text-[#1A3C34] tracking-[0.15em] mt-1">
                  Authentic Pakistani Restaurant
                </span>
              </div>

              {/* Hairline Destination Divider */}
              <div className="flex items-center justify-center gap-3 my-3">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#8A3D2A]/40" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#1A3C34]">
                  Direct WhatsApp Ordering
                </span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#8A3D2A]/40" />
              </div>

              {/* Background Decorative Sprigs */}
              <div className="absolute top-44 left-3 opacity-40 pointer-events-none w-10 h-auto -rotate-6">
                <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain" />
              </div>
              <div className="absolute top-44 right-3 opacity-40 pointer-events-none w-10 h-auto rotate-6 scale-x-[-1]">
                <img src="/assets/tov-sprig.svg" alt="" className="w-full h-auto object-contain" />
              </div>

              {/* Signature White Arch Card (Exact Mathematical Arch: Width 360px, Radius 180px) */}
              <div
                className="w-[360px] mx-auto bg-white border border-pine/10 shadow-[0_12px_40px_-8px_rgba(26,60,52,0.12)] p-7 text-center relative z-10 flex flex-col items-center mt-2"
                style={{ borderRadius: '180px 180px 8px 8px' }}
              >
                {/* Top Circular Badge */}
                <div className="w-10 h-10 rounded-full bg-pine/5 flex items-center justify-center mb-2">
                  {selectedBranch === 'slough' ? (
                    <Sparkles size={16} className="text-[#8A3D2A]" />
                  ) : (
                    <MapPin size={16} className="text-[#1A3C34]/80" />
                  )}
                </div>

                {/* City Heading in Cinzel Serif */}
                <h2 className="font-serif text-3xl font-bold uppercase tracking-[0.22em] text-[#1A3C34] mb-1">
                  {selectedBranch.toUpperCase()}
                </h2>

                {/* Address & Terracotta Postcode */}
                <div className="flex flex-col items-center gap-0.5 mb-4">
                  <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-[#1A3C34]/80">
                    {branch.address}
                  </span>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-[#8A3D2A]">
                    {branch.postcode}
                  </span>
                  <span className="text-[11px] font-medium tracking-[0.1em] text-[#1A3C34]/65">
                    Tel: {branch.phone} • WhatsApp {branch.whatsappPhone}
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-3.5 bg-white rounded-3xl shadow-sm border border-pine/10 inline-block relative mb-4">
                  <QRCode
                    value={whatsappOrderingUrl}
                    size={210}
                    level="H"
                    fgColor="#1A3C34"
                    bgColor="#FFFFFF"
                  />
                  {/* WhatsApp center emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-[#25D366] rounded-full border-[3px] border-white shadow-md flex items-center justify-center text-white">
                      <MessageSquare size={18} className="fill-white" />
                    </div>
                  </div>
                </div>

                {/* Elevated Solid Accent Pill Button */}
                <div className="px-7 py-3 rounded-full bg-[#1A3C34] text-[#FDF9F1] shadow-[0_4px_16px_rgba(26,60,52,0.18)] flex items-center gap-2 mb-3">
                  <span className="font-sans font-bold text-[10px] tracking-[0.25em] uppercase">
                    Scan to Order Now &rarr;
                  </span>
                </div>

                {/* 3 Understated Steps */}
                <p className="text-[11px] tracking-[0.05em] text-[#1A3C34]/65 font-medium">
                  1. Point camera • 2. Open WhatsApp chat • 3. Order direct
                </p>
              </div>

              {/* Bottom Editorial Trust Strip */}
              <div className="flex items-center justify-center gap-3 mt-4 text-[9px] font-bold tracking-[0.22em] uppercase text-[#1A3C34]/65">
                <div className="h-px w-6 bg-[#8A3D2A]/30" />
                <span>100% Halal Certified • Prepared Fresh Daily • Taste of Village</span>
                <div className="h-px w-6 bg-[#8A3D2A]/30" />
              </div>
            </div>
          </div>
        )}

        {/* 1. TILL RECEIPT FOOTER (Thermal receipt width ~72-80mm) */}
        {activeTab === 'receipt' && (
          <div className="w-[300px] bg-white p-6 border border-gray-300 shadow-xl rounded-lg font-mono text-center print:shadow-none print:border-none print:m-0 print:p-2">
            <div className="border-t-2 border-dashed border-gray-400 pt-4 mb-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                — TASTE OF VILLAGE —
              </p>
              <h2 className="text-xl font-black uppercase tracking-tight my-1 text-black">
                GET 50% OFF
              </h2>
              <p className="text-[12px] font-bold text-gray-800">
                YOUR NEXT MEAL
              </p>
            </div>

            <div className="my-3 flex justify-center p-2 bg-white inline-block border border-gray-200">
              <QRCode value={getCheckInUrl()} size={150} level="M" />
            </div>

            <p className="text-[11px] leading-tight text-gray-700 font-bold mt-2">
              Scan with your phone camera to claim your instant voucher pass
            </p>

            <div className="mt-4 pt-3 border-t border-dashed border-gray-400 text-[10px] text-gray-500">
              <p>{branch.name}</p>
              <p>{branch.address}, {branch.postcode}</p>
              <p className="mt-1 font-sans text-[9px] text-gray-400">tasteofvillagerestaurants.co.uk</p>
            </div>
          </div>
        )}

        {/* 2. TABLE TENT CARD (A6 Size ~105 x 148mm) */}
        {activeTab === 'table' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:w-[210mm] print:mx-auto">
            {Array.from({ length: tableCount }).map((_, i) => (
              <div key={i} className="w-[380px] print:w-[95mm] bg-[#FBF7EE] text-[#1A3C34] p-8 print:p-4 border-4 border-[#1A3C34] shadow-2xl rounded-3xl text-center relative overflow-hidden print:shadow-none print:break-inside-avoid">
                <div className="bg-[#1A3C34] text-[#FDF9F1] py-2 px-4 rounded-xl inline-block text-[11px] font-black uppercase tracking-widest mb-4 print:mb-2">
                  {branch.name} - Table {i + 1}
                </div>

                <h2 className="text-3xl font-black uppercase tracking-tight text-[#D14836] leading-none mb-1">
                  50% OFF
                </h2>
                <p className="text-lg font-black uppercase tracking-wider text-[#1A3C34] mb-4 print:mb-2">
                  Today's Food Bill
                </p>

                <div className="my-4 print:my-2 flex justify-center">
                  <div className="p-4 print:p-2 bg-white rounded-2xl shadow-md border-2 border-[#1A3C34]/20 inline-block">
                    <QRCode value={getCheckInUrl(i + 1)} size={180} level="M" />
                  </div>
                </div>

                <div className="space-y-1 mt-4 print:mt-2">
                  <p className="text-sm font-black text-[#1A3C34]">
                    1. Scan with your phone camera
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    2. Enter your mobile number
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    3. Show your instant screen pass at the till!
                  </p>
                </div>

                <div className="mt-6 print:mt-4 pt-4 border-t-2 border-dashed border-[#1A3C34]/20 text-[11px] text-gray-500 font-medium">
                  Valid for Dine-in & Collection • Single use per customer
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. TAKEAWAY BAG FLYER (Uber Eats / Deliveroo Steal-Back) */}
        {activeTab === 'bag' && (
          <div className="w-[420px] bg-white text-gray-900 p-8 border-2 border-gray-300 shadow-2xl rounded-3xl text-center relative overflow-hidden print:shadow-none print:border-none print:m-0">
            <div className="bg-[#D14836] text-white py-1.5 px-4 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3">
              Tired of Uber Fees?
            </div>

            <h2 className="text-3xl font-black tracking-tight text-[#1A3C34] uppercase mb-1">
              Order Direct Next Time
            </h2>
            <p className="text-sm font-bold text-[#D14836] mb-4">
              Save 15% to 50% on Every Single Order
            </p>

            <div className="grid grid-cols-2 gap-2 text-left bg-gray-50 p-3 rounded-xl text-xs mb-4 font-semibold text-gray-700">
              <div className="text-red-700">❌ Uber High Prices</div>
              <div className="text-green-700">✅ 15% Cheaper Direct</div>
              <div className="text-red-700">❌ Cold Delayed Food</div>
              <div className="text-green-700">✅ Cooked Fresh to Order</div>
            </div>

            <div className="my-4 flex justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200 inline-block">
                <QRCode value={getCheckInUrl()} size={160} level="M" />
              </div>
            </div>

            <p className="text-xs font-black text-gray-800 uppercase tracking-wider">
              Scan to unlock 50% OFF your first direct order
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              tasteofvillagerestaurants.co.uk
            </p>

            <div className="mt-4 pt-3 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between px-2">
              <span>{branch.name}</span>
              <span>Tel: {branch.phone}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
