import React from 'react';
import { Ticket, Clock, Truck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface CartOrderSummaryProps {
  cartTotal: number;
  promoDiscount: number;
  appliedVoucher: string | null;
  promoCartLabel?: string;
  activePromo?: string | null;
  isPromoTimeValid?: boolean;
  isDeliveryOrder: boolean;
  deliveryFee: number;
  serviceFee: number;
  finalCartTotal: number;
  isKitchenClosed?: boolean;
  isBelowMinOrder?: boolean;
  minOrder?: number;
  minOrderRemaining?: number;
  minOrderProgress?: number;
  activeDeliveryTier?: any;
  discountedSubtotal?: number;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  cartTotal,
  promoDiscount,
  appliedVoucher,
  promoCartLabel = 'Promotion',
  activePromo,
  isPromoTimeValid = true,
  isDeliveryOrder,
  deliveryFee,
  serviceFee,
  finalCartTotal,
  isKitchenClosed = false,
  isBelowMinOrder = false,
  minOrder = 0,
  minOrderRemaining = 0,
  minOrderProgress = 0,
  activeDeliveryTier,
  discountedSubtotal = 0,
}) => {
  return (
    <>
      <div className="space-y-2.5 mb-6 text-pine pt-2 border-t border-pine/10">
        <div className="flex justify-between items-center text-xs text-pine/60 font-semibold uppercase tracking-wider">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatCurrency(cartTotal)}</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between items-center text-xs text-terracotta font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Ticket size={14} /> {appliedVoucher ? `${appliedVoucher} VOUCHER` : promoCartLabel}
            </span>
            <span className="tabular-nums">-{formatCurrency(promoDiscount)}</span>
          </div>
        )}

        {activePromo === 'BREAKFAST40' && promoDiscount === 0 && (
          <div className="text-[11px] text-pine/80 font-medium italic">
            {!isPromoTimeValid
              ? 'BREAKFAST40 is valid on Weekends (Sat & Sun) till 2:00 PM only.'
              : 'Add breakfast items to your cart to get 40% off.'}
          </div>
        )}

        {isDeliveryOrder && deliveryFee > 0 && (
          <div className="flex justify-between items-center text-xs text-pine/60 font-semibold uppercase tracking-wider">
            <span>Delivery Fee</span>
            <span className="tabular-nums">{deliveryFee === 0 ? 'FREE' : `${formatCurrency(deliveryFee)}`}</span>
          </div>
        )}

        {serviceFee > 0 && (
          <div className="flex justify-between items-center text-xs text-pine/60 font-semibold uppercase tracking-wider">
            <span>Service Fee (10%)</span>
            <span className="tabular-nums">{formatCurrency(serviceFee)}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline pt-3 mt-1 border-t-2 border-pine/15">
          <span className="font-display text-xs uppercase tracking-[0.2em] font-bold text-pine">Total</span>
          <span className="font-display text-2xl font-bold tabular-nums text-pine">{formatCurrency(finalCartTotal)}</span>
        </div>
      </div>

      {isKitchenClosed && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-pine rounded-xl p-3 mb-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <Clock size={14} className="text-amber-600 shrink-0" />
          <span><strong>Pre-Order:</strong> Kitchen opens at 10:00 AM. Place your order now to secure your slot!</span>
        </div>
      )}

      {isBelowMinOrder && minOrder > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex justify-between text-xs font-bold text-amber-800 mb-2">
            <span>Minimum order for delivery: {formatCurrency(minOrder)}</span>
            <span className="tabular-nums">{formatCurrency(minOrderRemaining)} more</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${minOrderProgress}%` }} />
          </div>
        </div>
      )}

      {isDeliveryOrder && !isBelowMinOrder && activeDeliveryTier?.tier?.freeDeliveryThreshold && discountedSubtotal < activeDeliveryTier.tier.freeDeliveryThreshold && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex justify-between text-xs font-bold text-emerald-800 mb-2">
            <span className="flex items-center gap-1">
              <Truck size={12} /> Free delivery at {formatCurrency(activeDeliveryTier.tier.freeDeliveryThreshold)}
            </span>
            <span className="tabular-nums">
              {formatCurrency(activeDeliveryTier.tier.freeDeliveryThreshold - discountedSubtotal)} more
            </span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (discountedSubtotal / activeDeliveryTier.tier.freeDeliveryThreshold) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </>
  );
};
