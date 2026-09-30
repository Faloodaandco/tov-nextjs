'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, ChevronRight, Check } from 'lucide-react';
import { MenuItem } from '@/types';
import { useStore } from '@/context/StoreContext';
import tovMenuData from '@/data/tov-menu.json';
import tovMenuSloughData from '@/data/tov-menu-slough.json';
import { formatCurrency } from '@/utils/formatters';

interface UpsellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  locationId: string;
}

interface SmartPairingItem extends MenuItem {
  pairingReason: string;
}

export const UpsellDrawer: React.FC<UpsellDrawerProps> = ({ isOpen, onClose, onProceed, locationId }) => {
  const { addToCart, cart } = useStore();
  const [upsellItems, setUpsellItems] = useState<SmartPairingItem[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;

    const allBranchItems: MenuItem[] = locationId === 'slough'
      ? (tovMenuSloughData as MenuItem[])
      : (tovMenuData as MenuItem[]);

    const cartIds = new Set(cart.map(c => c.id));
    const cartNames = cart.map(c => c.name.toLowerCase()).join(' ');
    const cartCats = new Set(cart.map(c => (c.category || '').toLowerCase()));

    // Analyze what the user has in cart
    const hasCurryOrKarahi = cartNames.includes('karahi') || 
                             cartNames.includes('handi') || 
                             cartNames.includes('nihari') || 
                             cartNames.includes('haleem') || 
                             cartNames.includes('curry') || 
                             cartNames.includes('salan') ||
                             cartCats.has('curries_salan_se') ||
                             cartCats.has('karahi_e_khaas') ||
                             cartCats.has('desi_handi') ||
                             cartCats.has('mains___village_classics');

    const hasBBQ = cartNames.includes('tikka') || 
                   cartNames.includes('kebab') || 
                   cartNames.includes('grill') || 
                   cartNames.includes('chops') || 
                   cartCats.has('bbq_platter') || 
                   cartCats.has('starters_n_charcoal_grill');

    const hasRice = cartNames.includes('biryani') || 
                    cartNames.includes('rice') || 
                    cartNames.includes('pilau') || 
                    cartCats.has('rice_specials') || 
                    cartCats.has('biryani_and_rice');

    const hasBread = cartNames.includes('naan') || 
                     cartNames.includes('roti') || 
                     cartNames.includes('paratha') || 
                     cartNames.includes('kulcha') || 
                     cartCats.has('naan_n_bread') || 
                     cartCats.has('naan_n_roti');

    const hasDrink = cartNames.includes('lassi') || 
                     cartNames.includes('coke') || 
                     cartNames.includes('drink') || 
                     cartNames.includes('margarita') || 
                     cartCats.has('drinks');

    const hasDessert = cartNames.includes('kheer') || 
                       cartNames.includes('halwa') || 
                       cartNames.includes('jamun') || 
                       cartNames.includes('rasmalai') || 
                       cartCats.has('desserts');

    // Categorized candidate pools
    const breadCandidates = allBranchItems.filter(item => 
      !cartIds.has(item.id) &&
      !item.is86d &&
      (item.category === 'naan_n_bread' || item.category === 'naan_n_roti' || item.category === 'parathas' || item.category === 'lahori_kulchas')
    );

    const drinkCandidates = allBranchItems.filter(item => 
      !cartIds.has(item.id) &&
      !item.is86d &&
      (item.category === 'drinks' || item.name.toLowerCase().includes('lassi') || item.name.toLowerCase().includes('drink'))
    );

    const sideCandidates = allBranchItems.filter(item => 
      !cartIds.has(item.id) &&
      !item.is86d &&
      (item.category === 'sides_n_sauces' || item.name.toLowerCase().includes('raita') || item.name.toLowerCase().includes('salad') || item.name.toLowerCase().includes('chutney'))
    );

    const dessertCandidates = allBranchItems.filter(item => 
      !cartIds.has(item.id) &&
      !item.is86d &&
      (item.category === 'desserts' || item.name.toLowerCase().includes('kheer') || item.name.toLowerCase().includes('jamun') || item.name.toLowerCase().includes('halwa'))
    );

    const suggestions: SmartPairingItem[] = [];

    // Rule 1: If has Curry/Karahi and NO Bread -> MUST recommend fresh hot Naan/Roti!
    if (hasCurryOrKarahi && !hasBread && breadCandidates.length > 0) {
      const bestBread = breadCandidates.find(b => b.name.toLowerCase().includes('garlic')) || breadCandidates[0];
      if (bestBread) {
        suggestions.push({
          ...bestBread,
          pairingReason: '⭐ Essential pairing for your Karahi & Curries'
        });
      }
    }

    // Rule 2: If has BBQ/Grill and NO Bread -> recommend fresh Naan
    if (hasBBQ && !hasBread && breadCandidates.length > 0 && !suggestions.some(s => s.id.includes('naan') || s.id.includes('roti'))) {
      const bestBread = breadCandidates[0];
      if (bestBread) {
        suggestions.push({
          ...bestBread,
          pairingReason: '🔥 Fresh tandoori accompaniment for Charcoal Grill'
        });
      }
    }

    // Rule 3: If has Spicy/Karahi/Grill/Biryani and NO Drink -> recommend refreshing Lassi / Drink
    if (!hasDrink && drinkCandidates.length > 0) {
      const lassi = drinkCandidates.find(d => d.name.toLowerCase().includes('mango lassi')) || drinkCandidates[0];
      if (lassi && !suggestions.some(s => s.id === lassi.id)) {
        suggestions.push({
          ...lassi,
          pairingReason: '❄️ Cools the palate & balances the spices'
        });
      }
    }

    // Rule 4: If has Biryani/Rice or BBQ and NO Side -> recommend Raita / Chutney / Salad
    if ((hasRice || hasBBQ) && sideCandidates.length > 0 && suggestions.length < 3) {
      const raita = sideCandidates.find(s => s.name.toLowerCase().includes('raita')) || sideCandidates[0];
      if (raita && !suggestions.some(s => s.id === raita.id)) {
        suggestions.push({
          ...raita,
          pairingReason: '🥗 Fresh & cooling accompaniment'
        });
      }
    }

    // Rule 5: If customer has bread & drink, or looking for sweet finish -> recommend Dessert!
    if (!hasDessert && dessertCandidates.length > 0 && suggestions.length < 3) {
      const dessert = dessertCandidates.find(d => d.name.toLowerCase().includes('kheer') || d.name.toLowerCase().includes('jamun')) || dessertCandidates[0];
      if (dessert && !suggestions.some(s => s.id === dessert.id)) {
        suggestions.push({
          ...dessert,
          pairingReason: '🍨 Authentic traditional Punjabi sweet finish'
        });
      }
    }

    // Fill any remaining slots with varied unchosen items
    const remainingPool = [...breadCandidates, ...drinkCandidates, ...dessertCandidates, ...sideCandidates]
      .filter(item => !cartIds.has(item.id) && !suggestions.some(s => s.id === item.id));

    while (suggestions.length < 3 && remainingPool.length > 0) {
      const nextItem = remainingPool.shift()!;
      suggestions.push({
        ...nextItem,
        pairingReason: '✨ Handcrafted freshly in our kitchen'
      });
    }

    setUpsellItems(suggestions.slice(0, 3));
  }, [isOpen, cart, locationId]);

  const handleAddItem = (item: SmartPairingItem) => {
    addToCart(item);
    setAddedIds(prev => new Set(prev).add(item.id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex flex-col justify-end pointer-events-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-pine/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-bg-sand w-full max-w-lg mx-auto rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border-t-2 border-terracotta"
        >
          <div className="p-6 pb-4 border-b border-pine/10 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-terracotta animate-pulse" />
              <div>
                <h3 className="font-display text-xl font-bold text-pine uppercase tracking-wider leading-none">
                  Complete Your Feast
                </h3>
                <p className="text-[11px] text-pine/60 font-medium mt-1">
                  Intelligently paired with your chosen dishes
                </p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full hover:bg-pine/5 text-pine/60 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4">
            {upsellItems.length === 0 ? (
              <p className="text-center text-sm font-bold tracking-widest uppercase text-pine/40 py-8">
                Your order is perfectly complete!
              </p>
            ) : (
              upsellItems.map(item => {
                const isAdded = addedIds.has(item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-pine/10 shadow-sm hover:border-terracotta/40 transition-all gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.image && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-pine/5 border border-pine/10">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="block text-[9.5px] sm:text-[10px] font-bold text-terracotta uppercase tracking-wider mb-0.5 truncate">
                          {item.pairingReason}
                        </span>
                        <h4 className="font-bold text-pine text-sm truncate">{item.name}</h4>
                        <p className="text-terracotta font-black text-sm mt-0.5">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddItem(item)}
                      disabled={isAdded}
                      className={`px-4 py-3 sm:px-4 sm:py-3 min-h-[48px] rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 ${
                        isAdded 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-terracotta text-white hover:bg-[#a64036] hover:shadow-md active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-6 bg-white border-t border-pine/10 sticky bottom-0 flex gap-3">
            <button 
              onClick={onProceed}
              className="w-full py-4 bg-pine text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-pine-light transition-all flex items-center justify-center gap-2 shadow-xl hover:-translate-y-0.5 active:scale-98"
            >
              <span>Continue to Details & Payment</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
