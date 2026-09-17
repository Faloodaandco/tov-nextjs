'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Menu as MenuIcon, Star, Globe } from 'lucide-react';

const Instagram = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Facebook = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
import { SEOHead } from '@/components/SEOHead';
import { SHOP_CONFIG } from '@/config/shopConfig';

// A 3D Animated Card Component using Framer Motion
const TiltCard = ({ children, delay = 0, to, href }: { children: React.ReactNode; delay?: number; to?: string; href?: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
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
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full cursor-pointer group"
    >
      <div 
        style={{ transform: "translateZ(40px)" }}
        className="w-full bg-[#1A3C34] text-[#FDF9F1] border border-[#1A3C34]/20 py-4 px-6 flex items-center justify-between shadow-[8px_8px_0px_#D14836] hover:bg-[#122A24] transition-colors"
      >
        {children}
      </div>
      {/* Glossy overlay effect for 3D realism */}
      <div 
        style={{ transform: "translateZ(50px)" }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
      />
    </motion.div>
  );

  if (to) {
    return <Link href={to} className="w-full perspective-[1000px] block my-3">{content}</Link>;
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" className="w-full perspective-[1000px] block my-3">{content}</a>;
};

// Animated Tree Graphic Background
const AnimatedTree = () => {
  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
      <motion.svg
        viewBox="0 0 400 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-[120vh] max-w-lg object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.path
          d="M200 800 C200 600, 200 500, 200 400 C150 350, 100 250, 50 150 M200 400 C250 350, 300 250, 350 150 M200 500 C150 450, 80 400, 40 300 M200 500 C250 450, 320 400, 360 300"
          stroke="#1A3C34"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
        {/* Animated Leaves/Dots */}
        {[
          { cx: 50, cy: 150, delay: 1.5 },
          { cx: 350, cy: 150, delay: 1.7 },
          { cx: 40, cy: 300, delay: 2.0 },
          { cx: 360, cy: 300, delay: 2.2 },
          { cx: 200, cy: 100, delay: 2.5 },
        ].map((leaf, i) => (
          <motion.circle
            key={i}
            cx={leaf.cx}
            cy={leaf.cy}
            r="12"
            fill="#D14836"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: 1 }}
            transition={{ delay: leaf.delay, duration: 0.8, type: "spring" }}
          />
        ))}
      </motion.svg>
    </div>
  );
};

export default function Links() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newParticles = Array.from({ length: 15 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        animY: Math.random() * -500,
        animX: (Math.random() - 0.5) * 200,
        duration: 10 + Math.random() * 10,
      }));
      setParticles(newParticles);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-20 px-6 overflow-hidden bg-[#FDF9F1] font-sans">
      <SEOHead 
        title={`Socials | ${SHOP_CONFIG.name}`}
        description="Quick links to our menu, ordering, reviews, and social media."
        canonical="/links"
      />
      
      <AnimatedTree />

      {/* Floating particles for depth */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#D14836]/20 rounded-full"
            initial={{
              x: p.x,
              y: p.y,
            }}
            animate={{
              y: [null, p.animY],
              x: [null, p.animX],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Header / Avatar */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8 flex flex-col items-center"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-24 h-24 bg-[#1A3C34] text-[#FDF9F1] rounded-full flex items-center justify-center border-4 border-[#D14836] shadow-2xl mb-4 overflow-hidden"
          >
            <MenuIcon size={40} />
          </motion.div>
          <h1 className="font-display text-4xl font-black text-[#1A3C34] tracking-tight uppercase text-center drop-shadow-sm">
            Taste of Village
          </h1>
          <p className="font-bold text-[#D14836] tracking-widest uppercase text-xs mt-2 text-center">
            Authentic Flavours
          </p>
        </motion.div>

        {/* Links List */}
        <div className="w-full flex flex-col perspective-[1000px] gap-1" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
          
          {/* Slough Ordering */}
          <TiltCard to="/slough/menu" delay={0.1}>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-sm">Order Slough Menu</span>
              <span className="text-[10px] text-amber-200/80 font-mono tracking-wider">260 Farnham Rd · Delivery &amp; Collection</span>
            </div>
            <MenuIcon className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Hayes Ordering */}
          <TiltCard to="/hayes/menu" delay={0.2}>
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-widest uppercase text-sm">Order Hayes Menu</span>
              <span className="text-[10px] text-amber-200/80 font-mono tracking-wider">766B Uxbridge Rd · Delivery &amp; Collection</span>
            </div>
            <MenuIcon className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Voucher */}
          <TiltCard to="/check-in" delay={0.3}>
            <span className="font-bold tracking-widest uppercase text-sm">Claim £5 Welcome Voucher</span>
            <Star className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Google Reviews */}
          <TiltCard href="https://g.page/r/CU4P6ZjGio6HECE/review" delay={0.4}>
            <span className="font-bold tracking-widest uppercase text-sm">Leave a Google Review</span>
            <Star className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Instagram */}
          <TiltCard href="https://www.instagram.com/tasteofvillageuk/" delay={0.5}>
            <span className="font-bold tracking-widest uppercase text-sm">Follow on Instagram</span>
            <Instagram className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Facebook */}
          <TiltCard href="https://www.facebook.com/profile.php?id=61590779182784" delay={0.6}>
            <span className="font-bold tracking-widest uppercase text-sm">Follow on Facebook</span>
            <Facebook className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

          {/* Main Website */}
          <TiltCard to="/" delay={0.7}>
            <span className="font-bold tracking-widest uppercase text-sm">Main Website</span>
            <Globe className="w-5 h-5 text-[#D14836] flex-shrink-0" />
          </TiltCard>

        </div>
      </div>
    </div>
  );
}
