'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  Sparkles, 
  MapPin, 
  MessageSquare, 
  ArrowRight,
  Clock,
  ShieldCheck,
  Percent,
  Droplets
} from 'lucide-react';
import dynamic from 'next/dynamic';
const QRCode = dynamic(() => import('react-qr-code').then(mod => mod.default || mod), { ssr: false });
import { CampaignService } from '@/services/CampaignService';
import { LOCATIONS } from '@/config/shopConfig';

interface StoredVoucher {
  code: string;
  name: string;
  phone: string;
  branch: 'hayes' | 'slough';
  claimedAt: string;
  expiry: string;
}

// ── Realistic Liquid Apple Water Droplet ──
const LiquidDroplet = ({ 
  className = '', 
  size = 64, 
  delay = 0,
  duration = 7
}: { 
  className?: string; 
  size?: number; 
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    animate={{ 
      y: [0, -14, 0],
      scale: [1, 1.04, 1],
      rotate: [0, 3, -3, 0]
    }}
    transition={{ 
      duration, 
      repeat: Infinity, 
      ease: "easeInOut",
      delay 
    }}
    style={{ 
      width: size, 
      height: size,
      borderRadius: '48% 52% 44% 56% / 55% 45% 55% 45%'
    }}
    className={`absolute pointer-events-none ${className}`}
  >
    <div 
      className="w-full h-full rounded-[inherit] relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 35% 25%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 28%, rgba(255,255,255,0.08) 55%, rgba(26,60,52,0.12) 100%)',
        boxShadow: `
          inset 3px 3px 7px rgba(255, 255, 255, 0.95),
          inset -3px -3px 7px rgba(0, 0, 0, 0.1),
          0 16px 30px -6px rgba(26, 60, 52, 0.16),
          0 6px 12px -2px rgba(0, 0, 0, 0.08)
        `,
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.65)'
      }}
    >
      {/* Internal Glint / Specular Light Reflection */}
      <div 
        className="absolute top-[16%] left-[22%] w-[28%] h-[20%] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 80%)',
          filter: 'blur(0.5px)',
          transform: 'rotate(-25deg)'
        }}
      />
      {/* Secondary Caustic Glow */}
      <div 
        className="absolute bottom-[14%] right-[18%] w-[22%] h-[16%] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)',
        }}
      />
    </div>
  </motion.div>
);

function CheckInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Branch routing
  const branchParam = searchParams.get('branch')?.toLowerCase();
  const initialBranch: 'hayes' | 'slough' = branchParam === 'slough' ? 'slough' : 'hayes';
  const [selectedBranch, setSelectedBranch] = useState<'hayes' | 'slough'>(initialBranch);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeVoucher, setActiveVoucher] = useState<StoredVoucher | null>(null);
  const [copied, setCopied] = useState(false);

  // Check for existing voucher in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tov_active_voucher');
        if (saved) {
          const parsed: StoredVoucher = JSON.parse(saved);
          // Check if claimed within the last 24 hours
          const claimedDate = new Date(parsed.claimedAt).getTime();
          const now = Date.now();
          if (now - claimedDate < 24 * 60 * 60 * 1000) {
            setActiveVoucher(parsed);
            setStatus('success');
          }
        }
      } catch (e) {
        console.warn('Could not read cached voucher:', e);
      }
    }
  }, []);

  const activeBranchConfig = LOCATIONS[selectedBranch];
  const source = searchParams.get('src') || 'web_check_in';

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Please enter both your name and phone number.');
      setStatus('error');
      return;
    }

    // Clean UK phone number
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid UK mobile number.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await CampaignService.submitVoucherLead({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim(),
        campaign: 'dine_in_30_off',
        location: activeBranchConfig.tenant_id,
        branch: selectedBranch,
        source: source,
      });

      const now = new Date();
      const expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const voucherData: StoredVoucher = {
        code: result.voucherCode,
        name: name.trim(),
        phone: cleanPhone,
        branch: selectedBranch,
        claimedAt: now.toISOString(),
        expiry: expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' tomorrow'
      };

      setActiveVoucher(voucherData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tov_active_voucher', JSON.stringify(voucherData));
      }
      setStatus('success');
    } catch (err: any) {
      console.warn('Voucher generation local handler:', err);
      // Fallback: never block the customer
      const fallbackCode = `TOV30-${Math.floor(1000 + Math.random() * 9000)}`;
      const voucherData: StoredVoucher = {
        code: fallbackCode,
        name: name.trim(),
        phone: cleanPhone,
        branch: selectedBranch,
        claimedAt: new Date().toISOString(),
        expiry: '24 hours'
      };
      setActiveVoucher(voucherData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('tov_active_voucher', JSON.stringify(voucherData));
      }
      setStatus('success');
    }
  };

  const handleCopyCode = () => {
    if (!activeVoucher) return;
    navigator.clipboard.writeText(activeVoucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClearVoucher = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tov_active_voucher');
    }
    setActiveVoucher(null);
    setStatus('idle');
    setName('');
    setPhone('');
    setEmail('');
  };

  // WhatsApp 1-tap claim deep link
  const whatsappNumber = selectedBranch === 'hayes' ? '442034093786' : '441753326341';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi Taste of Village ${selectedBranch === 'hayes' ? 'Hayes' : 'Slough'}! Please send me my 50% OFF dining voucher code.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F7F2E7] text-[#1A3C34] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#D14836]/20">

      {/* ── Soft Fluid Ambient Background Blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.25, 1], 
            x: [0, 40, 0],
            y: [0, -30, 0],
            opacity: [0.35, 0.5, 0.35] 
          }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-[32rem] h-[32rem] bg-gradient-to-br from-[#E26D5C] to-[#D14836] rounded-full filter blur-[90px] opacity-40"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            x: [0, -30, 0],
            y: [0, 35, 0],
            opacity: [0.3, 0.45, 0.3] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-40 -left-40 w-[34rem] h-[34rem] bg-gradient-to-tr from-[#1A3C34] via-[#2F6155] to-[#438776] rounded-full filter blur-[100px] opacity-30"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.2, 0.35, 0.2] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] bg-[#F3DFA2] rounded-full filter blur-[110px] opacity-25"
        />
      </div>

      {/* ── Floating Liquid Water Droplets (Apple Droplet Spec) ── */}
      <LiquidDroplet className="-top-12 -left-8 sm:-left-16" size={88} delay={0} duration={8} />
      <LiquidDroplet className="top-1/4 -right-8 sm:-right-14" size={72} delay={1.5} duration={9} />
      <LiquidDroplet className="-bottom-8 left-10" size={60} delay={2.5} duration={7.5} />
      <LiquidDroplet className="bottom-1/3 -left-10" size={54} delay={0.8} duration={8.5} />
      <LiquidDroplet className="top-12 right-12 hidden md:block" size={46} delay={3} duration={6.8} />

      <div className="w-full max-w-md relative z-10 my-4">
        {/* Branch Selector Header Tabs — Apple Frosted Pill */}
        <div 
          className="flex p-1.5 rounded-2xl mb-6 border border-white/60"
          style={{
            background: 'rgba(255, 255, 255, 0.45)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            boxShadow: '0 8px 24px -4px rgba(26, 60, 52, 0.08), inset 0 1px 1px rgba(255,255,255,0.8)'
          }}
        >
          <button aria-label="Button"
            type="button"
            onClick={() => setSelectedBranch('hayes')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedBranch === 'hayes'
                ? 'bg-[#1A3C34] text-[#FDF9F1] shadow-lg shadow-[#1A3C34]/20 scale-[1.02]'
                : 'text-[#1A3C34]/70 hover:text-[#1A3C34] hover:bg-white/30'
            }`}
          >
            <MapPin size={14} className={selectedBranch === 'hayes' ? 'text-[#E26D5C]' : ''} />
            <span>Hayes Branch</span>
          </button>
          <button aria-label="Button"
            type="button"
            onClick={() => setSelectedBranch('slough')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedBranch === 'slough'
                ? 'bg-[#1A3C34] text-[#FDF9F1] shadow-lg shadow-[#1A3C34]/20 scale-[1.02]'
                : 'text-[#1A3C34]/70 hover:text-[#1A3C34] hover:bg-white/30'
            }`}
          >
            <MapPin size={14} className={selectedBranch === 'slough' ? 'text-[#E26D5C]' : ''} />
            <span>Slough Branch</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' && activeVoucher ? (
            /* ─────────────────────────────────────────────────────────────
               APPLE VISION GLASS PASS — INSTANT DIGITAL DINING VOUCHER
               ───────────────────────────────────────────────────────────── */
            <motion.div
              key="voucher-pass"
              initial={{ scale: 0.92, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 22 }}
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)',
                backdropFilter: 'blur(36px) saturate(200%)',
                WebkitBackdropFilter: 'blur(36px) saturate(200%)',
                boxShadow: `
                  0 35px 70px -15px rgba(26, 60, 52, 0.16),
                  0 15px 25px -10px rgba(0, 0, 0, 0.08),
                  inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.05)
                `,
                border: '1px solid rgba(255, 255, 255, 0.85)'
              }}
              className="rounded-[36px] overflow-hidden relative"
            >
              {/* Top Banner Ribbon */}
              <div 
                className="text-[#FDF9F1] p-6 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1A3C34 0%, #285B50 50%, #173830 100%)'
                }}
              >
                {/* Glossy top-edge reflection */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#D14836] rounded-full text-[11px] font-black uppercase tracking-wider text-white shadow-md mb-2">
                  <Sparkles size={12} />
                  <span>Verified Dining Pass</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                  50% OFF YOUR MEAL
                </h1>
                <p className="text-xs text-[#FDF9F1]/85 mt-1 font-medium">
                  {activeBranchConfig.name} • {activeBranchConfig.address}
                </p>

                {/* Apple Wallet style ticket cutouts */}
                <div 
                  className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full"
                  style={{ background: '#F7F2E7', border: '1px solid rgba(255,255,255,0.4)' }}
                />
                <div 
                  className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full"
                  style={{ background: '#F7F2E7', border: '1px solid rgba(255,255,255,0.4)' }}
                />
              </div>

              {/* Dashed Separator Line */}
              <div className="border-b-2 border-dashed border-[#1A3C34]/15 mx-6 my-1" />

              {/* Voucher Body */}
              <div className="p-6 space-y-5">
                {/* Code Display Box — Frosted Glass Capsule */}
                <div 
                  className="rounded-2xl p-4 text-center relative group border border-white/70"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 4px 12px rgba(26,60,52,0.04)'
                  }}
                >
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    Your Voucher Code
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#1A3C34] tracking-wider font-mono">
                      {activeVoucher.code}
                    </span>
                    <button aria-label="Button"
                      type="button"
                      onClick={handleCopyCode}
                      title="Copy Voucher Code"
                      className="p-2.5 bg-white/80 rounded-xl shadow-sm border border-white text-[#1A3C34] hover:bg-[#1A3C34] hover:text-white transition-all cursor-pointer active:scale-95"
                    >
                      {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                    </button>
                  </div>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-black text-emerald-700 block mt-1"
                    >
                      Copied to clipboard!
                    </motion.span>
                  )}
                </div>

                {/* Scannable Verification QR Code Container */}
                <div 
                  className="flex flex-col items-center justify-center p-5 rounded-2xl border border-white/70"
                  style={{
                    background: 'rgba(255, 255, 255, 0.55)',
                    backdropFilter: 'blur(14px)',
                    boxShadow: '0 8px 20px -6px rgba(0,0,0,0.04)'
                  }}
                >
                  <div className="p-3.5 bg-white rounded-2xl shadow-md border border-gray-100">
                    <QRCode
                      value={activeVoucher.code}
                      size={145}
                      level="M"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2.5 font-bold">
                    Till verification QR • Pass ID: {activeVoucher.code}
                  </p>
                </div>

                {/* Live Instructions Glass Bubble */}
                <div 
                  className="rounded-2xl p-4 flex items-start gap-3 border border-emerald-200/60"
                  style={{
                    background: 'rgba(236, 253, 245, 0.65)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <CheckCircle size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-relaxed font-medium">
                    <span className="font-black block text-sm mb-0.5">Ready to redeem!</span>
                    Show this screen to your server at the till when paying, or apply code{' '}
                    <strong className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded">{activeVoucher.code}</strong> at checkout online.
                  </div>
                </div>

                {/* Meta details */}
                <div 
                  className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 p-3 rounded-xl border border-white/50"
                  style={{ background: 'rgba(255, 255, 255, 0.35)' }}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck size={14} className="text-emerald-700" />
                    <span>Guest: {activeVoucher.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end font-bold">
                    <Clock size={14} className="text-amber-700" />
                    <span>Valid until: Today</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button aria-label="Button"
                    type="button"
                    onClick={() => router.push(`/${activeVoucher.branch}/menu`)}
                    className="w-full py-4 bg-gradient-to-r from-[#D14836] to-[#E26D5C] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-[#D14836]/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Use Code Online for Collection</span>
                    <ArrowRight size={16} />
                  </button>

                  <button aria-label="Button"
                    type="button"
                    onClick={handleClearVoucher}
                    className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors text-center cursor-pointer"
                  >
                    Check in with another phone number
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ─────────────────────────────────────────────────────────────
               APPLE VISION GLASS FORM — WITH LIQUID HIGHLIGHTS
               ───────────────────────────────────────────────────────────── */
            <motion.div
              key="checkin-form"
              initial={{ opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0.42) 100%)',
                backdropFilter: 'blur(36px) saturate(200%)',
                WebkitBackdropFilter: 'blur(36px) saturate(200%)',
                boxShadow: `
                  0 35px 70px -15px rgba(26, 60, 52, 0.14),
                  0 15px 30px -10px rgba(0, 0, 0, 0.06),
                  inset 0 1.5px 2px rgba(255, 255, 255, 0.95),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.04)
                `,
                border: '1px solid rgba(255, 255, 255, 0.85)'
              }}
              className="rounded-[36px] p-6 sm:p-8 relative overflow-hidden"
            >
              {/* Liquid Gloss Header Sheen */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

              {/* Water Droplet Decorative Badge */}
              <div className="flex justify-center mb-4">
                <div 
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-[#D14836] border border-white/80"
                  style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 4px 12px rgba(209, 72, 54, 0.12), inset 0 1px 1px rgba(255,255,255,0.9)'
                  }}
                >
                  <Droplets size={14} className="text-[#D14836]" />
                  <span>Taste of Village Dining Pass</span>
                </div>
              </div>

              {/* Header Title */}
              <div className="text-center mb-6 relative">
                <h1 className="text-3xl sm:text-4xl font-black text-[#1A3C34] tracking-tight uppercase">
                  Check-In & Save
                </h1>
                <p className="text-gray-600 text-sm mt-1 font-medium">
                  Enjoy <strong className="text-[#D14836]">50% OFF</strong> your meal at {activeBranchConfig.name}.
                </p>
              </div>

              {/* ── FAST OPTION: 1-Tap WhatsApp Claim (Liquid Glass Button) ── */}
              <div className="mb-6">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 bg-gradient-to-r from-[#22BF5B] to-[#25D366] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border border-white/30"
                >
                  <MessageSquare size={18} />
                  <span>1-Tap Claim on WhatsApp (Fastest)</span>
                </a>
                <p className="text-[11px] text-center text-gray-500 mt-2 font-medium">
                  Opens WhatsApp with pre-filled message • Zero typing required
                </p>
              </div>

              {/* Or Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="border-t border-gray-300/60 w-full" />
                <span 
                  className="px-3 text-[10px] text-gray-500 font-black uppercase tracking-wider absolute rounded-full border border-white/60"
                  style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}
                >
                  Or enter your mobile below
                </span>
              </div>

              {/* ── STANDARD FROSTED FORM ── */}
              <form onSubmit={handleCheckIn} className="space-y-4 relative">
                <div>
                  <label htmlFor="name" className="block text-xs font-black text-[#1A3C34]/80 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shahbaz"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.9)'
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1A3C34]/10 focus:bg-white transition-all text-sm font-bold text-[#1A3C34] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-black text-[#1A3C34]/80 uppercase tracking-wider mb-1.5">
                    UK Mobile Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07886 204038"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.9)'
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1A3C34]/10 focus:bg-white transition-all text-sm font-bold text-[#1A3C34] placeholder:text-gray-400"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block font-medium">
                    Your voucher pass will be registered to this number
                  </span>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-black text-[#1A3C34]/80 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hello@tasteofvillage.co.uk"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(16px)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.9)'
                    }}
                    className="w-full px-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1A3C34]/10 focus:bg-white transition-all text-sm font-bold text-[#1A3C34] placeholder:text-gray-400"
                  />
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 text-red-700 bg-red-100/70 backdrop-blur-md p-3 rounded-2xl text-xs font-bold border border-red-200"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <p>{errorMessage}</p>
                  </motion.div>
                )}

                <button aria-label="Button"
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-[#1A3C34] to-[#285B50] text-[#FDF9F1] font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-xl shadow-[#1A3C34]/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-3 cursor-pointer border border-white/20"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      <span>Generating Your Pass…</span>
                    </>
                  ) : (
                    <span>Unlock 50% Off Pass Instantly →</span>
                  )}
                </button>
              </form>

              {/* Safe & Simple Trust Footer */}
              <div className="mt-5 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1 font-bold">
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>Instant screen pass · Valid today · Dine-in & Collection</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CheckInClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckInContent />
    </Suspense>
  );
}
