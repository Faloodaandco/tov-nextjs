'use client';

import React, { useState } from 'react';
import { Lock, CreditCard } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { SHOP_CONFIG } from '@/config/shopConfig';
import { useLocationConfig } from '@/hooks/useLocationConfig';

interface CheckoutFormProps {
  amount: number;
  onCreateOrder: () => Promise<string>;
  onPaymentSuccess: (orderId: string, method?: 'online' | 'collection') => void;
  onSelectCollection?: () => void;
  onCancel: () => void;
}

/**
 * Square Checkout via local Route Handler.
 * Calls /api/checkout/square for server-side order creation and payment.
 */
export const SquareCheckout: React.FC<CheckoutFormProps> = ({
  amount,
  onCreateOrder,
  onPaymentSuccess,
  onSelectCollection,
  onCancel,
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cart } = useStore();
  const { activeLocation } = useLocationConfig();

  const handlePayOnline = async () => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Create the order in Firestore
      const orderId = await onCreateOrder();

      // 2. Call the local Route Handler (single payment path — no Cloud Function)
      const response = await fetch('/api/checkout/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          customer: { name: 'Walk-in', phone: '' },
          sourceId: 'CASH', // Placeholder — SquareCheckout is used for collection orders
          branch: activeLocation.id,
          fulfillment_type: 'collection',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create checkout');
      }

      const data = await response.json();

      if (data.success) {
        onPaymentSuccess(data.orderId || orderId, 'online');
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      console.error('[SquareCheckout] Error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handlePayAtCollection = async () => {
    setProcessing(true);
    try {
      const orderId = await onCreateOrder();
      onPaymentSuccess(orderId, 'collection');
    } catch (err: any) {
      setError(err.message || 'Failed to create order.');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Pay Online */}
      <button
        onClick={handlePayOnline}
        disabled={processing}
        className="w-full bg-terracotta text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-terracotta-light transition-all disabled:opacity-50"
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CreditCard size={18} />
            Pay £{amount.toFixed(2)} Online
          </>
        )}
      </button>

      {/* Pay at Collection */}
      {onSelectCollection && (
        <button
          onClick={handlePayAtCollection}
          disabled={processing}
          className="w-full border-2 border-pine/20 text-pine py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-pine/5 transition-all disabled:opacity-50"
        >
          Pay at Collection
        </button>
      )}

      {/* Cancel */}
      <button
        onClick={onCancel}
        disabled={processing}
        className="w-full text-pine/50 text-xs font-bold uppercase tracking-widest py-2 hover:text-pine transition-colors"
      >
        Cancel
      </button>

      <div className="flex items-center justify-center gap-2 text-pine/30 text-xs">
        <Lock size={12} />
        <span>Secured by Square</span>
      </div>
    </div>
  );
};

export default SquareCheckout;
