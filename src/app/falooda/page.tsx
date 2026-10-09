'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Globe, Phone, ArrowRight, ExternalLink } from 'lucide-react';

const Instagram = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Facebook = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const WhatsAppIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className={className} {...props}><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
);

// 3D Card (Immediate opacity: 1, zero blank-screen risk)
const FaloodaCard = ({
  children,
  to,
  href,
  highlight = false,
  ariaLabel,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  highlight?: boolean;
  ariaLabel?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 160, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 160, damping: 15 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="relative w-full cursor-pointer group my-1.5 transition-transform duration-200 active:scale-98"
    >
      <div
        style={{ transform: 'translateZ(25px)' }}
        className={`w-full py-4 px-5 flex items-center justify-between rounded-2xl transition-all border ${
          highlight
            ? 'bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white border-white/30 shadow-[4px_4px_0px_#4A0E17]'
            : 'bg-[#3b0914] text-[#FFF6E9] border-[#D4AF37]/30 shadow-[4px_4px_0px_#D4AF37] hover:bg-[#2c050e]'
        }`}
      >
        {children}
      </div>
      <div
        style={{ transform: 'translateZ(35px)' }}
        className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
    </motion.div>
  );

  if (to) {
    return (
      <Link href={to} aria-label={ariaLabel} className="w-full perspective-[1000px] block">
        {content}
      </Link>
    );
  }
  return (
    <a href={href} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer" className="w-full perspective-[1000px] block">
      {content}
    </a>
  );
};

export default function FaloodaLandingPage() {
  const faloodaWhatsappUrl =
    'https://wa.me/447886204038?text=' +
    encodeURIComponent(
      'Hi Falooda & Co! I would like to open the menu and place an order.'
    );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-10 px-4 sm:px-6 overflow-x-hidden bg-[#1E040A] text-[#FFF6E9] font-sans selection:bg-[#D4AF37]/30">

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E91E63]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        {/* Brand Emblem */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#3b0914] via-[#520d1c] to-[#751528] border-2 border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center mb-3">
            <span className="font-serif text-3xl font-black text-[#D4AF37] tracking-wider">
              F&amp;C
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#FFF6E9] tracking-wider uppercase">
            Falooda &amp; Co
          </h1>
          <p className="font-bold text-[#D4AF37] tracking-[0.25em] uppercase text-[10px] mt-1">
            Royal Desserts · Slough
          </p>
          <span className="text-white/60 text-xs font-mono mt-1">
            260 Farnham Road · SL1 4XL
          </span>
        </div>

        {/* 1-TOUCH WHATSAPP ORDERING PLATFORM (HERO CTA) */}
        <div className="w-full mb-3">
          <FaloodaCard
            href={faloodaWhatsappUrl}
            highlight={true}
            ariaLabel="1-Touch to open ordering platform on WhatsApp"
          >
            <div className="flex flex-col text-left">
              <span className="font-black tracking-wider uppercase text-sm flex items-center gap-2">
                <WhatsAppIcon className="text-white shrink-0" />
                Order on WhatsApp
              </span>
              <span className="text-[11px] text-white/90 font-mono tracking-wide mt-0.5">
                ★ Touch to launch instant WhatsApp menu
              </span>
            </div>
            <span className="bg-white text-[#128C7E] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 shadow">
              OPEN
            </span>
          </FaloodaCard>
        </div>

        {/* OFFICIAL WEBSITE & MENU LINKS */}
        <div className="w-full flex flex-col gap-1">
          {/* Main Website */}
          <FaloodaCard
            href="https://faloodaandco.co.uk"
            ariaLabel="Visit Falooda and Co Official Website"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Official Website</span>
              <span className="text-[10px] text-[#D4AF37]/80 font-mono tracking-wider">faloodaandco.co.uk</span>
            </div>
            <Globe className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          </FaloodaCard>

          {/* Web Menu & Ordering */}
          <FaloodaCard
            href="https://faloodaandco.co.uk/menu"
            ariaLabel="Browse Falooda and Co Full Dessert Menu"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Dessert &amp; Drink Menu</span>
              <span className="text-[10px] text-[#D4AF37]/80 font-mono tracking-wider">Royal Faloodas · Kulfi · Karak Chai</span>
            </div>
            <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          </FaloodaCard>

          {/* Phone Direct */}
          <FaloodaCard
            href="tel:+447886204038"
            ariaLabel="Call Falooda and Co Direct"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Direct Call: 07886 204038</span>
              <span className="text-[10px] text-[#D4AF37]/80 font-mono tracking-wider">Collection &amp; Table Inquiries</span>
            </div>
            <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          </FaloodaCard>
        </div>

        {/* SOCIAL MEDIA SECTION */}
        <div className="w-full mt-4 pt-3 border-t border-[#D4AF37]/20 flex flex-col gap-1">
          <div className="text-[10px] font-mono text-[#D4AF37]/70 uppercase tracking-widest px-2 mb-1">
            Social Channels
          </div>

          {/* Instagram */}
          <FaloodaCard
            href="https://www.instagram.com/faloodaandco"
            ariaLabel="Follow Falooda and Co on Instagram"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Instagram @faloodaandco</span>
              <span className="text-[10px] text-[#D4AF37]/80 font-mono tracking-wider">Reels, dessert drops &amp; behind scenes</span>
            </div>
            <Instagram className="w-4 h-4 text-[#E1306C] flex-shrink-0" />
          </FaloodaCard>

          {/* Facebook */}
          <FaloodaCard
            href="https://www.facebook.com/faloodaandco"
            ariaLabel="Follow Falooda and Co on Facebook"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Facebook Page</span>
              <span className="text-[10px] text-[#D4AF37]/80 font-mono tracking-wider">facebook.com/faloodaandco</span>
            </div>
            <Facebook className="w-4 h-4 text-[#1877F2] flex-shrink-0" />
          </FaloodaCard>
        </div>

        {/* SISTER RESTAURANT & OFFERS SECTION */}
        <div className="w-full mt-4 pt-3 border-t border-[#D4AF37]/20 flex flex-col gap-1">
          <div className="text-[10px] font-mono text-[#D4AF37]/70 uppercase tracking-widest px-2 mb-1">
            Sister Kitchen &amp; Hot Food
          </div>

          {/* Taste of Village Link */}
          <FaloodaCard
            to="/links"
            ariaLabel="Visit Taste of Village Dining & Karahi Hub"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Taste of Village (Dining &amp; Karahi)</span>
              <span className="text-[10px] text-amber-200/80 font-mono tracking-wider">Slough &amp; Hayes · Sunday Roast 30%–50% OFF</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          </FaloodaCard>

          {/* Offers Page */}
          <FaloodaCard
            to="/offers"
            ariaLabel="View Group Offers and Deals"
          >
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-xs">Dining Offers &amp; Discounts</span>
              <span className="text-[10px] text-amber-200/80 font-mono tracking-wider">Sunday Roast Specials &amp; Vouchers</span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          </FaloodaCard>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest text-center mt-6">
          Falooda &amp; Co · Artisan Desserts &copy; {new Date().getFullYear()}
        </p>

      </div>
    </div>
  );
}
