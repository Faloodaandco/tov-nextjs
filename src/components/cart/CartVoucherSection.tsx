import React, { useState } from 'react';
import { Ticket, CheckCircle2, X, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export interface CartVoucherSectionProps {
  customVoucher: string;
  setCustomVoucher: (code: string) => void;
  appliedVoucher: string | null;
  setAppliedVoucher: (code: string | null) => void;
  voucherError: string;
  setVoucherError: (err: string) => void;
  customerPhone?: string;
  branchId: string;
  cartTotal: number;
  promoDiscount: number;
  setVoucherDiscountPercent: (percent: number) => void;
  setVoucherFixedDiscount: (amount: number) => void;
}

export const CartVoucherSection: React.FC<CartVoucherSectionProps> = ({
  customVoucher,
  setCustomVoucher,
  appliedVoucher,
  setAppliedVoucher,
  voucherError,
  setVoucherError,
  customerPhone = '',
  branchId,
  cartTotal,
  promoDiscount,
  setVoucherDiscountPercent,
  setVoucherFixedDiscount,
}) => {
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyVoucher = async () => {
    const code = customVoucher.trim();
    if (!code) return;

    // BREAKFAST40 is handled locally (standard promo)
    if (code.toUpperCase() === 'BREAKFAST40') {
      setAppliedVoucher(null);
      setVoucherError('');
      return;
    }

    try {
      setIsValidating(true);
      setVoucherError('');

      // Try vouchers first, then promos as fallback
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          phone: customerPhone,
          branchId,
          subtotalPence: Math.round(cartTotal * 100),
        }),
      });

      const result = await res.json();
      if (result.valid) {
        setAppliedVoucher(code);
        setVoucherError('');
      } else {
        // Voucher not found — try promos collection as fallback
        const promoRes = await fetch('/api/promos/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            branchId,
            subtotalPence: Math.round(cartTotal * 100),
          }),
        });
        const promoResult = await promoRes.json();
        if (promoResult.valid) {
          setAppliedVoucher(code);
          setVoucherError('');
          if (promoResult.discountType === 'PERCENTAGE' && promoResult.discountPercent > 0) {
            setVoucherDiscountPercent(promoResult.discountPercent);
            setVoucherFixedDiscount(0);
          } else if (promoResult.discountType === 'FIXED_AMOUNT' && promoResult.fixedAmountPence > 0) {
            setVoucherFixedDiscount(promoResult.fixedAmountPence / 100);
            setVoucherDiscountPercent(0);
          }
        } else {
          setVoucherError(promoResult.reason || result.reason || 'Invalid code');
          setAppliedVoucher(null);
        }
      }
    } catch {
      setVoucherError('Could not validate code. Please try again.');
      setAppliedVoucher(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setCustomVoucher('');
    setVoucherDiscountPercent(0);
    setVoucherFixedDiscount(0);
    setVoucherError('');
  };

  return (
    <div className="mb-4 bg-white p-3 rounded-xl border border-pine/10 shadow-sm">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-[#F7F2E7] rounded-lg border border-transparent focus-within:ring-2 focus-within:ring-terracotta/20 focus-within:border-terracotta/30 transition-all">
          <Ticket size={14} className="text-pine/30 ml-3 shrink-0" />
          <input
            type="text"
            placeholder="Enter discount code"
            value={customVoucher}
            onChange={(e) => {
              setCustomVoucher(e.target.value.toUpperCase());
              setVoucherError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyVoucher();
              }
            }}
            className="flex-1 bg-transparent px-2.5 py-2 text-base sm:text-sm font-bold text-pine uppercase focus:outline-none placeholder:text-pine/30 placeholder:normal-case"
          />
        </div>
        <button
          type="button"
          onClick={handleApplyVoucher}
          disabled={isValidating || !customVoucher.trim()}
          className="bg-pine text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-terracotta transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {isValidating && <Loader2 size={12} className="animate-spin" />}
          <span>Apply</span>
        </button>
      </div>

      {voucherError && (
        <p className="text-red-500 text-[10px] mt-1.5 font-bold uppercase tracking-wider px-1">
          {voucherError}
        </p>
      )}

      {appliedVoucher && (
        <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100 mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle2 size={12} /> {appliedVoucher} Applied
            {promoDiscount > 0 && <> (-{formatCurrency(promoDiscount)})</>}
          </span>
          <button
            type="button"
            aria-label="Remove voucher"
            onClick={handleRemoveVoucher}
            className="text-emerald-700/50 hover:text-emerald-700 p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
