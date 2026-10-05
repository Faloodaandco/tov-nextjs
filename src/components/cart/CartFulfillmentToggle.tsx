import React from 'react';
import { Truck, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';

export interface CartFulfillmentToggleProps {
  fulfillmentType: 'delivery' | 'collection';
  setFulfillmentType: (type: 'delivery' | 'collection') => void;
  activeLocation: { id: string; name: string; [key: string]: any };
  activeDeliveryTier: any;
  discountedSubtotal: number;
  deliveryAddress: { postcode: string; [key: string]: any };
  setDeliveryAddress: React.Dispatch<React.SetStateAction<any>>;
  postcodeError: string | null;
  setPostcodeError: (error: string | null) => void;
  isPostcodeInDeliveryZone: (postcode: string, locationId: string) => { isValid: boolean; reason?: string };
}

export const CartFulfillmentToggle: React.FC<CartFulfillmentToggleProps> = ({
  fulfillmentType,
  setFulfillmentType,
  activeLocation,
  activeDeliveryTier,
  discountedSubtotal,
  deliveryAddress,
  setDeliveryAddress,
  postcodeError,
  setPostcodeError,
  isPostcodeInDeliveryZone,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-xs font-bold text-pine mb-2 uppercase tracking-wider">
        Order Type
      </label>
      <div className="grid grid-cols-2 gap-0 p-1 bg-pine/5 border border-pine/10 rounded-2xl relative isolate">
        <button
          type="button"
          onClick={() => {
            setFulfillmentType('delivery');
          }}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1.5 transition-colors duration-200 relative ${
            fulfillmentType === 'delivery'
              ? 'text-white'
              : 'text-pine/60 hover:text-pine hover:bg-white/50'
          }`}
        >
          {fulfillmentType === 'delivery' && (
            <motion.div
              layoutId="activeFulfillment"
              className="absolute inset-0 bg-terracotta rounded-xl shadow-md -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="flex items-center gap-2 text-sm">
            <Truck size={16} strokeWidth={2.5} className={fulfillmentType === 'delivery' ? 'text-white' : 'text-pine/80'} />
            <span>Delivery</span>
          </span>
          <span className="text-[10px] opacity-90 normal-case font-medium">
            {activeDeliveryTier?.tier && discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold
              ? 'FREE Delivery'
              : (activeLocation.id === 'slough' ? 'From £3.50 · Est. ~35-45m' : 'From £2.99 · Est. ~30-45m')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setFulfillmentType('collection');
            setPostcodeError(null);
          }}
          className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1.5 transition-colors duration-200 relative ${
            fulfillmentType === 'collection'
              ? 'text-white'
              : 'text-pine/60 hover:text-pine hover:bg-white/50'
          }`}
        >
          {fulfillmentType === 'collection' && (
            <motion.div
              layoutId="activeFulfillment"
              className="absolute inset-0 bg-pine rounded-xl shadow-md -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="flex items-center gap-2 text-sm">
            <Store size={16} strokeWidth={2.5} className={fulfillmentType === 'collection' ? 'text-white' : 'text-pine/80'} />
            <span>Collection</span>
          </span>
          <span className="text-[10px] opacity-80 normal-case font-medium">Free · Ready ~20-25m</span>
        </button>
      </div>

      {fulfillmentType === 'delivery' && (
        <div className="mt-2.5 px-3.5 py-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-[11px] text-emerald-900 font-medium">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Truck size={13} className="text-emerald-700" />
              <span className="font-bold">{activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Delivery'}</span>
              <span className="text-emerald-700">{activeLocation.id === 'hayes' ? 'UB3, UB4, UB7, UB8, UB10' : 'SL1, SL2, SL3, SL4'}</span>
            </div>
            <span className="font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[10px]">
              {activeDeliveryTier?.isValid && activeDeliveryTier.tier
                ? (discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold ? 'FREE DELIVERY' : `${formatCurrency(activeDeliveryTier.tier.fee)} Fee`)
                : (activeLocation.id === 'slough' ? 'From £3.50' : 'From £2.99')}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-emerald-700 leading-relaxed">
            {activeLocation.id === 'hayes'
              ? <>
                  <span>UB4 <strong>£2.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>UB3 <strong>£3.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>UB10 <strong>£4.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>UB8 <strong>£5.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>UB7 <strong>£6.99</strong></span>
                </>
              : <>
                  <span>SL1 <strong>£3.50</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>SL2 <strong>£3.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>SL3 <strong>£4.99</strong></span>
                  <span className="text-emerald-400">·</span>
                  <span>SL4 <strong>£5.99</strong></span>
                </>
            }
          </div>

          {/* ─── Early Delivery Zone Check ─── */}
          <div className="mt-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your postcode (e.g. UB4 8HY)"
                value={deliveryAddress.postcode}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setDeliveryAddress((prev: any) => ({ ...prev, postcode: val }));
                  setPostcodeError(null);
                }}
                className="flex-1 px-3 py-2 text-base sm:text-sm font-bold text-pine bg-white rounded-lg border border-emerald-200 focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 placeholder:text-pine/30 placeholder:font-normal uppercase"
              />
              <button
                type="button"
                onClick={() => {
                  const pc = deliveryAddress.postcode.trim();
                  if (!pc) { setPostcodeError('Please enter a postcode'); return; }
                  const check = isPostcodeInDeliveryZone(pc, activeLocation.id);
                  if (!check.isValid) {
                    setPostcodeError(check.reason || "Sorry, we don't deliver to your area.");
                  } else {
                    setPostcodeError(null);
                  }
                }}
                className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 active:scale-95 transition-all uppercase tracking-wider shrink-0"
              >
                Check
              </button>
            </div>
            {postcodeError && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-medium">
                <p>{postcodeError}</p>
                <button
                  type="button"
                  onClick={() => { setFulfillmentType('collection'); setPostcodeError(null); }}
                  className="mt-1.5 text-[10px] font-bold text-pine underline underline-offset-2 hover:text-terracotta transition-colors"
                >
                  Switch to Collection instead →
                </button>
              </div>
            )}
            {deliveryAddress.postcode.trim() && !postcodeError && activeDeliveryTier?.isValid && activeDeliveryTier.tier && (
              <p className="mt-1.5 text-[10px] text-emerald-700 font-bold">
                ✓ We deliver to {deliveryAddress.postcode}
                {discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold
                  ? ' — FREE delivery!'
                  : ` — ${formatCurrency(activeDeliveryTier.tier.fee)} delivery fee (free over £${activeDeliveryTier.tier.freeDeliveryThreshold})`
                }
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
