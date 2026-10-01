'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingBag, Menu as MenuIcon, Phone, MessageCircle, X, UserCircle2, MapPin, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { SHOP_CONFIG, LOCATIONS, buildWhatsAppLink } from '@/config/shopConfig';
import { useLocationConfig } from '@/hooks/useLocationConfig';
import { LocationSelectorModal } from '@/components/LocationSelectorModal';

export const Navbar = () => {
  const { cart, setIsCartOpen } = useStore();
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const { activeLocation, hasSelected } = useLocationConfig();
  const loc = activeLocation || LOCATIONS.hayes;
  const [authTab, setAuthTab] = React.useState<'login' | 'signup'>('login');
  const [isBumping, setIsBumping] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [scrolled, setScrolled] = React.useState(false);
  const [hasRecentOrder, setHasRecentOrder] = React.useState(false);

  // Check for recent order (live badge for 60 min)
  React.useEffect(() => {
    const lastOrderTime = typeof window !== 'undefined' ? localStorage.getItem('last_order_time') : null;
    if (lastOrderTime) {
      const elapsed = Date.now() - parseInt(lastOrderTime, 10);
      setHasRecentOrder(elapsed < 60 * 60 * 1000);
    }
  }, []);

  // Scroll Detection for Glassmorphism
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Cart Bump Micro-interaction
  React.useEffect(() => {
    if (cartCount === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);
  // Close menu when route changes
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path ? 'text-terracotta font-bold' : 'text-pine hover:text-terracotta';
  
  const isMenu = pathname.includes('/menu');
  const useWhiteLogo = isMenu && !scrolled;

  const pillClasses = scrolled
    ? 'bg-transparent text-pine hover:text-terracotta'
    : isMenu
      ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20'
      : 'bg-bg-sand/95 backdrop-blur-xl border border-pine/10 shadow-md hover:shadow-lg text-pine hover:text-terracotta';

  const handleOrderNowClick = (e: React.MouseEvent) => {
    if (!hasSelected) {
      e.preventDefault();
      setShowLocationModal(true);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 pointer-events-none flex flex-col`}>
        <div className={`w-full transition-all duration-500 ${scrolled ? 'py-2 sm:py-3 bg-bg-sand/95 backdrop-blur-md border-b border-pine/10 shadow-sm pointer-events-auto' : 'py-3 sm:py-6 pointer-events-none'}`}>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start relative">
          
          {/* Left: Global Hamburger Menu & Location */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 pointer-events-auto">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              className={`p-2.5 sm:p-3.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 duration-300 rounded-full hover:-translate-y-0.5 ${pillClasses}`}
            >
              {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <MenuIcon size={20} className="sm:w-6 sm:h-6" />}
            </button>
            <button 
              suppressHydrationWarning
              onClick={() => setShowLocationModal(true)}
              className={`hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-full hover:-translate-y-0.5 px-5 py-2 sm:py-3 ${pillClasses}`}
            >
              <MapPin size={16} />
              {(loc?.name || 'Taste Of Village Hayes').replace('Taste Of Village ', '')}
            </button>
          </div>

          {/* Center: Brand Logo */}
          {pathname !== '/' && pathname !== `/${loc?.id || 'hayes'}` && (
            <div className={`absolute left-1/2 -translate-x-1/2 top-1 sm:top-2 transition-all duration-500 ${scrolled ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
              <Link href={`/${loc?.id || 'hayes'}`} className="flex flex-col items-center group">
                <img src="/assets/tov-logo-full-terracotta-alpha.png" alt="Taste of Village" className={`w-auto h-12 sm:h-16 object-contain drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5 ${useWhiteLogo ? 'brightness-0 invert opacity-90' : ''}`} />
              </Link>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 pointer-events-auto">
            <button 
              onClick={() => setShowLocationModal(true)}
              aria-label="Select store location"
              className={`sm:hidden flex items-center justify-center p-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50 duration-300 rounded-full hover:-translate-y-0.5 ${pillClasses}`}
            >
              <MapPin size={20} />
            </button>

            {/* Profile Icon */}
            {isLoggedIn ? (
              <Link href="/rewards" aria-label="Your rewards and account" className={`flex items-center justify-center p-2.5 sm:p-3.5 transition-all duration-300 rounded-full hover:-translate-y-0.5 ${pillClasses}`}>
                <UserCircle2 size={20} className="sm:w-6 sm:h-6" />
              </Link>
            ) : (
              <button  
                onClick={() => { setAuthTab('login'); setShowAuth(true); }}
                aria-label="Sign in to your account"
                className={`flex items-center justify-center p-2.5 sm:p-3.5 transition-all duration-300 rounded-full hover:-translate-y-0.5 ${pillClasses}`}
              >
                <UserCircle2 size={20} className="sm:w-6 sm:h-6" />
              </button>
            )}

            <button  
              onClick={() => {
                setIsCartOpen(true);
                if (!pathname.includes('/menu')) {
                  router.push(`/${loc?.id || 'hayes'}/menu`);
                }
              }}
              aria-label="View basket"
              className={`relative p-2.5 sm:p-3.5 transition-all duration-300 flex items-center justify-center rounded-full hover:-translate-y-0.5 cursor-pointer ${pillClasses}`}
            >
              <ShoppingBag size={20} className="sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1 bg-terracotta text-white rounded-full text-[10px] sm:text-xs font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-bg-sand transition-all duration-300 transform origin-center ${isBumping ? 'scale-[1.6] shadow-lg shadow-terracotta/50' : 'scale-100'}`}>
                  {cartCount}
                </span>
              )}
              {hasRecentOrder && cartCount === 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full animate-pulse border-2 border-bg-sand" title="Order in progress" />
              )}
            </button>

            {/* Desktop Order Now CTA */}
            {!pathname.includes('/menu') && (
              <Link href={`/${loc?.id || 'hayes'}/menu`} onClick={handleOrderNowClick} className={`hidden sm:flex items-center justify-center bg-terracotta rounded-full text-white font-black uppercase tracking-[0.2em] hover:bg-pine transition-all border border-terracotta hover:border-pine relative overflow-hidden group duration-500 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${scrolled ? 'px-6 py-3.5 text-xs' : 'px-8 py-4 text-sm'}`}>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10">Order Now</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      </div>
    </nav>

      {/* Global Menu Overlay Drawer - Premium Independent Redesign */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-start">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-pine/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}></div>
          
          {/* Sliding Elegant Drawer (Left Side) */}
          <div className="relative w-[85%] max-w-sm bg-bg-sand h-full shadow-2xl flex flex-col transform transition-transform animate-slide-in-left border-r border-pine/10">
             
             {/* Header */}
             <div className="px-8 py-6 flex justify-between items-center border-b border-pine/10">
               <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="Taste of Village" className="h-10 object-contain drop-shadow-sm" />
               <button  onClick={() => setIsOpen(false)} aria-label="Close navigation menu" className="p-2 rounded-full border border-pine/20 text-pine hover:bg-pine hover:text-bg-sand transition-all">
                 <X size={20} strokeWidth={1.5} />
               </button>
             </div>
             
             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto flex flex-col">
                
                {/* Main Links - Elegant List */}
                <div className="flex flex-col py-4">
                  <Link href={`/${loc?.id || 'hayes'}`} className={`px-8 py-4 text-2xl font-display font-black tracking-widest uppercase transition-colors hover:bg-pine/5 ${pathname === `/${loc?.id || 'hayes'}` ? 'text-terracotta' : 'text-pine'}`}>Home</Link>
                  <Link href={`/${loc?.id || 'hayes'}/menu`} className={`px-8 py-4 text-2xl font-display font-black tracking-widest uppercase transition-colors hover:bg-pine/5 ${pathname.includes('/menu') ? 'text-terracotta' : 'text-pine'}`}>Our Menu</Link>
                  <Link href="/franchise" className={`px-8 py-4 text-2xl font-display font-black tracking-widest uppercase transition-colors hover:bg-pine/5 ${pathname === '/franchise' ? 'text-terracotta' : 'text-pine'}`}>Franchise</Link>
                  <Link href="/rewards" className={`px-8 py-4 text-2xl font-display font-black tracking-widest uppercase transition-colors hover:bg-pine/5 border-b border-pine/10 pb-6 ${pathname === '/rewards' ? 'text-terracotta' : 'text-pine'}`}>Rewards</Link>
                </div>

                {/* Secondary Actions */}
                <div className="px-8 py-6 flex flex-col gap-6">
                    {isLoggedIn ? (
                      <Link href="/rewards" className="text-sm font-bold tracking-widest uppercase flex items-center gap-4 text-pine hover:text-terracotta transition-colors" onClick={() => setIsOpen(false)}><UserCircle2 size={20} /> My Account</Link>
                    ) : (
                      <button  onClick={() => { setAuthTab('signup'); setShowAuth(true); setIsOpen(false); }} className="text-sm font-bold tracking-widest uppercase flex items-center gap-4 text-pine hover:text-terracotta transition-colors text-left"><UserCircle2 size={20} /> Sign Up / Login</button>
                    )}
                    <Link href="/track" className="text-sm font-bold tracking-widest uppercase flex items-center gap-4 text-pine hover:text-terracotta transition-colors"><Truck size={20} /> Track Order</Link>
                    <Link href="/book" className="text-sm font-bold tracking-widest uppercase flex items-center gap-4 text-pine hover:text-terracotta transition-colors"><MapPin size={20} /> Book A Table</Link>
                </div>

                {/* Spacer to push footer down */}
                <div className="flex-1"></div>

                {/* Contact & Location Block */}
                <div className="px-8 py-8 bg-pine/5 border-t border-pine/10 flex flex-col gap-5">
                  <button  
                    onClick={() => { setShowLocationModal(true); setIsOpen(false); }}
                    className="text-xs font-black tracking-[0.2em] uppercase flex items-center justify-between w-full p-4 border border-pine/20 hover:border-terracotta hover:text-terracotta transition-colors text-pine bg-white/50 shadow-sm"
                  >
                    <span className="flex items-center gap-3"><MapPin size={16} /> Change Location</span>
                    <span className="text-terracotta">{(loc?.name || 'Taste Of Village Hayes').replace('Taste Of Village ', '')}</span>
                  </button>

                  <div className="flex items-center justify-between mt-2 px-2">
                    <a href={`tel:${SHOP_CONFIG.phoneNumberRaw}`} className="text-xs font-bold tracking-widest uppercase text-pine hover:text-terracotta flex items-center gap-2 transition-colors">
                      <Phone size={16} /> Call Us
                    </a>
                    <div className="w-px h-4 bg-pine/20"></div>
                    <a href={buildWhatsAppLink('Hi! I have a question.')} target="_blank" rel="noopener noreferrer" className="text-xs font-bold tracking-widest uppercase text-pine hover:text-terracotta flex items-center gap-2 transition-colors">
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </div>
                </div>

                {/* Footer Links */}
                <div className="px-8 py-5 flex justify-center items-center bg-pine text-bg-sand">
                    <div className="flex gap-6 text-[10px] font-black tracking-[0.2em] uppercase">
                      <Link href="/info?tab=faq" className="hover:text-terracotta transition-colors">FAQs</Link>
                      <Link href="/info?tab=allergies" className="hover:text-terracotta transition-colors">Allergens</Link>
                      <Link href="/info?tab=terms" className="hover:text-terracotta transition-colors">Terms</Link>
                    </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Mobile Floating Order Now Bar (Only shown on scroll on non-menu pages) */}
      {!pathname.includes('/menu') && scrolled && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-40 animate-fade-in-up">
          <Link 
            href={`/${loc?.id || 'hayes'}/menu`} 
            onClick={handleOrderNowClick} 
            className="w-full flex justify-center items-center gap-2 bg-terracotta text-white py-3.5 px-6 rounded-full font-black uppercase tracking-[0.15em] text-sm shadow-2xl border border-terracotta-light/30 active:scale-95 transition-all"
          >
            <ShoppingBag size={18} />
            <span>Order Now • {loc?.id === 'slough' ? 'Slough' : 'Hayes'}</span>
          </Link>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />

      {/* Location Selector Modal */}
      <LocationSelectorModal 
        isOpen={showLocationModal} 
        onClose={() => setShowLocationModal(false)} 
        destination={pathname.includes('menu') ? 'menu' : ''}
      />
    </>
  );
};
