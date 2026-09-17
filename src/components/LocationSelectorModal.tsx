'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X } from 'lucide-react';
import { LOCATIONS, setActiveLocation, LocationId } from '@/config/shopConfig';
import { useRouter } from 'next/navigation';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  destination?: string; // e.g. '/menu'
}

export const LocationSelectorModal: React.FC<Props> = ({ isOpen, onClose, destination = 'menu' }) => {
  const router = useRouter();

  const handleSelect = (locId: LocationId) => {
    setActiveLocation(locId);
    onClose();
    
    // destination is expected to be 'menu' or '' (for home)
    const cleanDest = destination.replace(/^\//, '');
    const targetPath = cleanDest ? `/${locId}/${cleanDest}` : `/${locId}`;
    
    if (typeof window !== 'undefined') {
      if (window.location.pathname === targetPath) {
        window.location.reload();
      } else {
        router.push(targetPath);
      }
    } else {
      router.push(targetPath);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop with strong blur and brand overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-pine/80 backdrop-blur-xl"
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-bg-sand/95 backdrop-blur-3xl rounded-[40px] md:rounded-[60px] shadow-[0_20px_80px_-15px_rgba(138,61,42,0.3)] tov-pattern flex flex-col items-center pt-16 pb-12 px-6 md:px-12 text-center overflow-hidden"
          >
            {/* Magical glow inside the modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-terracotta/10 blur-[60px] rounded-full pointer-events-none"></div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-pine/50 hover:text-pine bg-pine/5 hover:bg-pine/10 rounded-full p-2 md:p-3 backdrop-blur-md transition-all z-50 flex items-center justify-center"
              aria-label="Close"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <img 
              src="/assets/tov-logo-arch-terracotta-alpha.png" 
              alt="Taste of Village" 
              className="w-24 md:w-32 h-auto object-contain mb-8 relative z-10 drop-shadow-[0_10px_20px_rgba(138,61,42,0.2)]"
            />

            <h2 className="font-display font-black text-3xl md:text-5xl text-pine tracking-[0.15em] uppercase mb-4 relative z-10">
              CHOOSE YOUR VILLAGE
            </h2>
            <p className="text-pine/70 text-lg md:text-xl font-medium max-w-xl mx-auto mb-12 relative z-10 normal-case">
              Select a location to view the live menu, see current wait times, and place your order.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10 px-2">
              {Object.values(LOCATIONS).map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc.id as LocationId)}
                  className="group relative bg-white/40 backdrop-blur-xl rounded-t-[50px] rounded-b-[20px] p-10 text-left transition-all duration-700 hover:bg-white/70 hover:shadow-[0_30px_60px_-15px_rgba(138,61,42,0.25)] hover:-translate-y-3 overflow-hidden border border-white/30 tov-arch-glow"
                >
                  {/* Subtle brand gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-b from-terracotta/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  {/* Glassmorphic inner border line */}
                  <div className="absolute inset-0 border border-white/20 rounded-t-[48px] rounded-b-[18px] pointer-events-none"></div>

                  <div className="flex justify-between items-center mb-10">
                    <div className="p-4 bg-terracotta/10 rounded-full text-terracotta group-hover:bg-terracotta group-hover:text-bg-sand transition-all duration-500 shadow-inner group-hover:shadow-[0_10px_20px_rgba(138,61,42,0.3)] group-hover:scale-115 group-hover:rotate-[360deg]">
                      <MapPin size={28} />
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-white/40 group-hover:border-terracotta/40 transition-colors">
                      <ArrowRight className="text-pine/60 group-hover:text-terracotta transition-transform group-hover:translate-x-2" size={24} />
                    </div>
                  </div>

                  <h3 className="font-display font-black text-3xl text-pine tracking-[0.1em] mb-3 uppercase border-b border-pine/10 pb-4 group-hover:border-terracotta/20 transition-colors">
                    {loc.name.replace('Taste Of Village ', '')}
                  </h3>
                  
                  {/* Tactile indicator and address */}
                  <div className="flex items-center gap-3 text-pine/80 font-medium normal-case mt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse"></span>
                    <span>{loc.address}</span>
                  </div>
                  <p className="text-pine/50 font-mono text-sm mt-2 tracking-wider uppercase ml-4">{loc.postcode}</p>
                  <p className="text-terracotta/90 font-mono text-sm mt-3 tracking-widest ml-4 font-bold flex items-center gap-2">
                    📞 {loc.phone}
                  </p>
                </button>
              ))}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
