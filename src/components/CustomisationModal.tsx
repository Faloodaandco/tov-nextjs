'use client';
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Info, ChevronDown, ChevronUp, Leaf } from 'lucide-react';
import type { MenuItem, CartItem } from '@/types';
import { Drawer } from '@/components/ui/Drawer';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  name: string;       // 'Small' | 'Regular' | 'Large'
  price_override: number;
  is_default: boolean;
  sort_order: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  price_delta: number;
  is_default: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: ModifierOption[];
}

export interface Allergen {
  allergen: string;
  severity: 'contains' | 'may_contain';
}

export interface FullMenuItem extends MenuItem {
  variants?: ProductVariant[];
  modifier_groups?: ModifierGroup[];
  /** Rich allergen data with severity from catalog DB */
  allergenDetails?: Allergen[];
  nutrition?: {
    calories?: number;
    protein_g?: number;
    fat_g?: number;
    carbs_g?: number;
    serving_size_g?: number;
  };
}

interface CustomisationModalProps {
  item: FullMenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  posOrderType?: string;
}

// ─── Allergen display config ─────────────────────────────────────────────────

const ALLERGEN_CONFIG: Record<string, { label: string; emoji: string; colour: string }> = {
  milk:            { label: 'Milk',         emoji: '🥛', colour: 'bg-blue-50 text-blue-800 border-blue-200' },
  eggs:            { label: 'Eggs',         emoji: '🥚', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  cereals_gluten:  { label: 'Gluten',       emoji: '🌾', colour: 'bg-amber-50 text-amber-800 border-amber-200' },
  nuts:            { label: 'Tree Nuts',    emoji: '🌰', colour: 'bg-orange-50 text-orange-800 border-orange-200' },
  peanuts:         { label: 'Peanuts',      emoji: '🥜', colour: 'bg-red-50 text-red-800 border-red-200' },
  soya:            { label: 'Soya',         emoji: '🫘', colour: 'bg-green-50 text-green-800 border-green-200' },
  fish:            { label: 'Fish',         emoji: '🐟', colour: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  crustaceans:     { label: 'Crustaceans',  emoji: '🦐', colour: 'bg-pink-50 text-pink-800 border-pink-200' },
  molluscs:        { label: 'Molluscs',     emoji: '🐚', colour: 'bg-purple-50 text-purple-800 border-purple-200' },
  mustard:         { label: 'Mustard',      emoji: '🟡', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  sesame:          { label: 'Sesame',       emoji: '🌱', colour: 'bg-lime-50 text-lime-800 border-lime-200' },
  celery:          { label: 'Celery',       emoji: '🥬', colour: 'bg-green-50 text-green-800 border-green-200' },
  lupin:           { label: 'Lupin',        emoji: '💛', colour: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  sulphur_dioxide: { label: 'Sulphites',    emoji: '⚗️', colour: 'bg-gray-50 text-gray-800 border-gray-200' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CustomisationModal: React.FC<CustomisationModalProps> = ({ item, onClose, onAddToCart, posOrderType }) => {
  // Size variant selection
  const defaultVariant = item.variants?.find(v => v.is_default) ?? item.variants?.[0] ?? null;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(defaultVariant);

  // Modifier selections: groupId → Set of selected optionIds
  const [selectedOptions, setSelectedOptions] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    item.modifier_groups?.forEach(g => {
      const defaults = new Set(g.options.filter(o => o.is_default).map(o => o.id));
      init[g.id] = defaults;
    });
    return init;
  });

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showNutrition, setShowNutrition] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // ─── Price Calculation ──────────────────────────────────────────────────────

  const totalPrice = useMemo(() => {
    let base = selectedVariant ? selectedVariant.price_override : item.price;
    const markup = posOrderType === 'dine-in' ? (item.dineInPrice ?? item.price) - (item.originalPrice ?? item.price) : 0;
    base += markup;

    // Add modifier price deltas
    item.modifier_groups?.forEach(g => {
      const selected = selectedOptions[g.id] ?? new Set();
      g.options.forEach(opt => {
        if (selected.has(opt.id)) {
          base += opt.price_delta;
        }
      });
    });

    return base * quantity;
  }, [selectedVariant, selectedOptions, quantity, item]);

  // ─── Validation (required groups) ──────────────────────────────────────────

  const missingRequired = item.modifier_groups?.some(g =>
    g.is_required && (selectedOptions[g.id]?.size ?? 0) < g.min_selections
  ) ?? false;

  // ─── Option toggle ──────────────────────────────────────────────────────────

  const toggleOption = (group: ModifierGroup, optionId: string) => {
    setSelectedOptions(prev => {
      const current = new Set(prev[group.id] ?? []);

      if (group.max_selections === 1) {
        // Radio behaviour — only one at a time
        return { ...prev, [group.id]: new Set([optionId]) };
      }

      // Checkbox behaviour
      if (current.has(optionId)) {
        current.delete(optionId);
      } else if (current.size < group.max_selections) {
        current.add(optionId);
      }
      return { ...prev, [group.id]: current };
    });
  };

  // ─── Build cart item ────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (missingRequired) return;

    // Build human-readable modifiers summary for kitchen display
    const modifierSummary: string[] = [];
    item.modifier_groups?.forEach(g => {
      const selected = selectedOptions[g.id] ?? new Set();
      g.options.forEach(opt => {
        if (selected.has(opt.id)) modifierSummary.push(opt.name);
      });
    });
    if (specialInstructions.trim()) modifierSummary.push(`Note: ${specialInstructions.trim()}`);

    const markup = posOrderType === 'dine-in' ? (item.dineInPrice ?? item.price) - (item.originalPrice ?? item.price) : 0;
    const unitPrice = (selectedVariant ? selectedVariant.price_override : item.price) + markup;
    const modifierDelta = modifierSummary.length > 0
      ? (totalPrice / quantity - unitPrice)
      : 0;

    const cartItem: CartItem = {
      ...item,
      price: totalPrice / quantity,
      quantity,
      modifiers: modifierSummary.length > 0
        ? {
            size: selectedVariant?.name ?? '',
            options: modifierSummary.join(', '),
            instructions: specialInstructions.trim(),
          }
        : selectedVariant
          ? { size: selectedVariant.name }
          : undefined,
      _cartKey: `${item.id}_${Date.now()}`, // unique key per customisation
    };

    onAddToCart(cartItem);
    onClose();
  };

  // ─── Allergen display ───────────────────────────────────────────────────────

  const contains = item.allergenDetails?.filter(a => a.severity === 'contains') ?? [];
  const mayContain = item.allergenDetails?.filter(a => a.severity === 'may_contain') ?? [];
  const hasAllergens = contains.length > 0 || mayContain.length > 0;

  const hasVariants = (item.variants?.length ?? 0) > 1;
  const hasGroups = (item.modifier_groups?.length ?? 0) > 0;
  const hasNutrition = !!item.nutrition?.calories;
  const isSimple = !hasVariants && !hasGroups && !hasAllergens;

  return (
    <Drawer isOpen={true} onClose={onClose} title={item.name} width="md:max-w-2xl" side="bottom">
      <div className="flex flex-col relative w-full h-full bg-bg-sand">
        {/* ─── Hero Image (optional, since Drawer is narrower) ─── */}
        {item.image && (
          <div className="relative w-full h-48 bg-pine shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full ${!item.image || item.image.includes('tov-logo-tree') ? 'object-contain p-8 opacity-40' : 'object-cover'}`}
              onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; e.target.className = 'w-full h-full object-contain p-8 opacity-40'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pine/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-6 pb-4">
          {/* Mobile Item title (hidden on desktop if we wanted, but good for flow) */}
          <div className="mb-6">
            {item.description && (
              <p className="text-pine/70 text-sm leading-relaxed tracking-wide font-medium">{item.description}</p>
            )}
          </div>

          {/* ─── Size Variants ────────────────────────────── */}
          {hasVariants && (
            <div className="mb-6">
              <p className="text-xs font-black text-brand-text uppercase tracking-widest mb-3">
                Choose Size <span className="text-brand-pink">*</span>
              </p>
              <div className="flex gap-3">
                {item.variants!.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex-1 py-3.5 px-4 rounded-[20px] border shadow-sm text-left transition-all hover:-translate-y-0.5 ${
                      selectedVariant?.id === v.id
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-pine/10 hover:border-pine/30'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedVariant?.id === v.id ? 'text-terracotta' : 'text-pine'}`}>
                      {v.name}
                    </p>
                    <p className="font-black text-pine mt-0.5">£{v.price_override.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Modifier Groups ──────────────────────────── */}
          {hasGroups && item.modifier_groups!.map(group => (
            <div key={group.id} className="mb-6">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-xs font-black text-pine uppercase tracking-widest">
                  {group.name}
                  {group.is_required && <span className="text-terracotta ml-1">*</span>}
                </p>
                <p className="text-[10px] text-pine/40 font-medium">
                  {group.max_selections > 1
                    ? `Pick up to ${group.max_selections}`
                    : 'Pick one'}
                </p>
              </div>
              {group.description && (
                <p className="text-xs text-pine/50 mb-3">{group.description}</p>
              )}
              <div className="space-y-2">
                {group.options.map(opt => {
                  const isSelected = selectedOptions[group.id]?.has(opt.id) ?? false;
                  const isRadio = group.max_selections === 1;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group, opt.id)}
                      disabled={!opt.is_available}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] border shadow-sm transition-all hover:-translate-y-0.5 text-left ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5'
                          : 'border-pine/10 hover:border-pine/20'
                      } ${!opt.is_available ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Indicator */}
                        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center ${isRadio ? 'rounded-full' : 'rounded-md'} border transition-all ${
                          isSelected
                            ? 'border-terracotta bg-terracotta'
                            : 'border-pine/30'
                        }`}>
                          {isSelected && (
                            <div className={`${isRadio ? 'w-2 h-2 rounded-full' : 'w-3 h-3'} bg-white`}>
                              {!isRadio && (
                                <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${isSelected ? 'text-terracotta' : 'text-pine'}`}>
                          {opt.name}
                        </span>
                      </div>
                      {opt.price_delta !== 0 && (
                        <span className={`text-sm font-bold ${isSelected ? 'text-terracotta' : 'text-pine/50'}`}>
                          {opt.price_delta > 0 ? '+' : ''}£{opt.price_delta.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ─── Allergen Information ─────────────────────── */}
          {hasAllergens && (
            <div className="mb-6 p-4 rounded-[20px] bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Allergen Information</p>
              </div>

              {contains.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Contains:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {contains.map(a => {
                      const cfg = ALLERGEN_CONFIG[a.allergen];
                      if (!cfg) return null;
                      return (
                        <span key={a.allergen} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.colour}`}>
                          <span>{cfg.emoji}</span> {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {mayContain.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">May Contain:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mayContain.map(a => {
                      const cfg = ALLERGEN_CONFIG[a.allergen];
                      if (!cfg) return null;
                      return (
                        <span key={a.allergen} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-dashed ${cfg.colour}`}>
                          <span>{cfg.emoji}</span> {cfg.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-amber-700 mt-3 leading-relaxed">
                If you have a food allergy or intolerance, please speak to a member of staff before ordering.
              </p>
            </div>
          )}

          {/* ─── Nutrition ───────────────────────────────── */}
          {hasNutrition && (
            <div className="mb-6">
              <button
                onClick={() => setShowNutrition(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-pine/50 hover:text-pine transition-colors"
              >
                <Info size={14} />
                Nutritional Information
                {showNutrition ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showNutrition && (
                <div className="mt-3 p-4 rounded-[20px] bg-pine/5 border border-pine/10">
                  <p className="text-[10px] text-pine/60 mb-2">Per serving {item.nutrition?.serving_size_g ? `(${item.nutrition.serving_size_g}g)` : ''}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Calories', value: item.nutrition?.calories, unit: 'kcal' },
                      { label: 'Fat',      value: item.nutrition?.fat_g,    unit: 'g' },
                      { label: 'Carbs',    value: item.nutrition?.carbs_g,  unit: 'g' },
                      { label: 'Protein',  value: item.nutrition?.protein_g,unit: 'g' },
                    ].map(n => n.value != null && (
                      <div key={n.label} className="text-center">
                        <p className="font-black text-pine text-sm">{n.value}{n.unit}</p>
                        <p className="text-[9px] text-pine/40 uppercase tracking-wider">{n.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Special Instructions ─────────────────────── */}
          <div className="mb-5">
            <p className="text-xs font-black text-pine uppercase tracking-widest mb-2">
              Special Instructions <span className="font-normal text-pine/40 normal-case tracking-normal">(optional)</span>
            </p>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="e.g. No onions, extra sauce, allergy note..."
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 rounded-[20px] border border-pine/10 focus:border-terracotta focus:shadow-md outline-none text-sm text-pine resize-none transition-all placeholder:text-pine/30 shadow-sm"
            />
          </div>
        </div>

        {/* ─── Footer (sticky) ─────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 md:px-10 py-6 border-t border-pine/10 bg-white shadow-[0_-10px_40px_rgba(26,60,52,0.05)] z-20">
          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-black text-pine uppercase tracking-[0.2em]">Quantity</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-12 h-12 bg-bg-sand rounded-full border border-pine/10 flex items-center justify-center font-black text-pine hover:border-terracotta hover:text-terracotta transition-colors text-xl shadow-sm hover:shadow-md"
              >−</button>
              <span className="font-display font-bold text-pine text-2xl w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-12 h-12 bg-bg-sand rounded-full border border-pine/10 flex items-center justify-center font-black text-pine hover:border-terracotta hover:text-terracotta transition-colors text-xl shadow-sm hover:shadow-md"
              >+</button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={missingRequired}
            className="w-full py-5 rounded-[30px] font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-between px-8 disabled:opacity-40 disabled:cursor-not-allowed
              bg-pine text-white hover:bg-terracotta active:scale-[0.98] shadow-xl hover:shadow-2xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            <span className="relative z-10">Add to Order</span>
            <span className="relative z-10 font-sans font-black text-xl">£{totalPrice.toFixed(2)}</span>
          </button>

          {missingRequired && (
            <p className="text-center text-xs text-terracotta font-semibold mt-2">
              Please make all required selections above
            </p>
          )}
        </div>
      </div>
    </Drawer>
  );
};
