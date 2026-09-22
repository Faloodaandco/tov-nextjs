'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Lock, CreditCard, AlertCircle } from 'lucide-react';

interface CustomerDetails {
  name?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
}

export interface SquarePaymentFormProps {
  total: number;
  branchName?: string;
  appId: string;
  locationId: string;
  customerDetails?: CustomerDetails;
  onBeforeSubmit?: () => boolean;
  onSuccess: (token: string, verificationToken?: string) => Promise<void> | void;
  onCancel?: () => void;
  buttonLabel?: string;
  disabled?: boolean;
  isSubmittingOrder?: boolean;
}

function buildBillingContact(details?: CustomerDetails) {
  if (!details) return {};
  const nameParts = (details.name || '').trim().split(' ');
  const givenName = nameParts[0] || undefined;
  const familyName = nameParts.slice(1).join(' ') || undefined;

  return {
    givenName,
    familyName,
    email: details.email || undefined,
    phone: details.phone || undefined,
    addressLines: [details.addressLine1, details.addressLine2].filter(Boolean) as string[],
    city: details.city || undefined,
    postalCode: details.postcode || undefined,
    countryCode: 'GB',
  };
}

function translatePaymentError(rawError: string): string {
  const upper = (rawError || '').toUpperCase();
  if (upper.includes('CVV') || upper.includes('VERIFICATION')) {
    return 'The card security code (CVV) is incorrect. Please check the 3 or 4-digit code on your card.';
  }
  if (upper.includes('EXPIR') || upper.includes('DATE')) {
    return 'The card expiration date is invalid or has expired.';
  }
  if (upper.includes('DECLINE') || upper.includes('GENERIC_DECLINE')) {
    return 'Card was declined by your bank. Please try Apple Pay, Google Pay, or another card.';
  }
  if (upper.includes('FUNDS') || upper.includes('INSUFFICIENT')) {
    return 'Card declined due to insufficient funds. Please try another payment method.';
  }
  if (upper.includes('PAN') || upper.includes('INVALID_CARD')) {
    return 'The card number is invalid. Please check your card number.';
  }
  if (upper.includes('PERMISSION') || upper.includes('PERMISSION_DENIED')) {
    return 'There was a temporary system connection issue. Please retry or tap Apple Pay / Google Pay.';
  }
  return rawError;
}

export const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  total,
  branchName = 'Taste of Village',
  appId,
  locationId,
  customerDetails,
  onBeforeSubmit,
  onSuccess,
  onCancel,
  buttonLabel,
  disabled = false,
  isSubmittingOrder = false,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [cardReady, setCardReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDigitalWallets, setHasDigitalWallets] = useState(false);
  const [isApplePayReady, setIsApplePayReady] = useState(false);

  const cardRef = useRef<any>(null);
  const applePayRef = useRef<any>(null);
  const googlePayRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const totalRef = useRef(total);
  const customerDetailsRef = useRef(customerDetails);

  useEffect(() => {
    totalRef.current = total;
  }, [total]);

  useEffect(() => {
    customerDetailsRef.current = customerDetails;
  }, [customerDetails]);

  const environment = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'production').toLowerCase();
  const isProduction = environment === 'production';

  useEffect(() => {
    let isMounted = true;

    const loadSquareScript = () => {
      const scriptId = 'square-web-sdk';
      const existingScript = document.getElementById(scriptId);

      if (typeof window !== 'undefined' && (window as any).Square) {
        return Promise.resolve();
      }

      if (existingScript) {
        return new Promise<void>((resolve, reject) => {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () => reject(new Error('Failed to load Square Web SDK')));
        });
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = isProduction
        ? 'https://web.squarecdn.com/v1/square.js'
        : 'https://sandbox.web.squarecdn.com/v1/square.js';

      return new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Square Web SDK script'));
        document.head.appendChild(script);
      });
    };

    const initializeSquare = async () => {
      if (!appId || !locationId) {
        setError('Square payment gateway configuration missing for this location.');
        setIsInitializing(false);
        return;
      }

      try {
        setIsInitializing(true);
        setError(null);

        await loadSquareScript();

        if (!isMounted) return;

        if (typeof window === 'undefined' || !(window as any).Square) {
          throw new Error('Square SDK could not be loaded');
        }

        console.log('[SquarePaymentForm] Initializing Square payments for:', { appId, locationId, isProduction });

        let payments = paymentsRef.current;
        if (!payments) {
          payments = (window as any).Square.payments(appId, locationId);
          paymentsRef.current = payments;
        }

        // 1. Initialize & Attach Card Input
        if (!cardRef.current) {
          const cardOptions: any = {};
          if (!isProduction) {
            cardOptions.postalCode = 'UB4 0RU';
          }
          const card = await payments.card(cardOptions);

          if (!isMounted) {
            await card.destroy();
            return;
          }
          cardRef.current = card;

          const cardContainer = document.getElementById('square-card-container');
          if (cardContainer) {
            cardContainer.innerHTML = '';
          }
          await card.attach('#square-card-container');
        }

        if (isMounted) {
          setCardReady(true);
          setIsInitializing(false);
        }

        // 2. Build paymentRequest for digital wallets
        const req = payments.paymentRequest({
          countryCode: 'GB',
          currencyCode: 'GBP',
          total: {
            amount: Math.max(0.50, totalRef.current || 0.50).toFixed(2),
            label: branchName || 'Taste of Village',
          },
        });

        // 3. Concurrently Initialize Apple Pay
        (async () => {
          try {
            console.log('[SquarePaymentForm] Checking Apple Pay support...');
            const applePay = await payments.applePay(req);
            if (applePay && isMounted) {
              applePayRef.current = applePay;
              setIsApplePayReady(true);
              setHasDigitalWallets(true);
              console.log('[SquarePaymentForm] Apple Pay is supported and ready.');
            }
          } catch (applePayErr: any) {
            console.log('[SquarePaymentForm] Apple Pay unavailable on this device/browser:', applePayErr?.message || applePayErr);
          }
        })();

        // 4. Concurrently Initialize Google Pay
        (async () => {
          try {
            console.log('[SquarePaymentForm] Checking Google Pay support...');
            const googlePay = await payments.googlePay(req);
            const gpayContainer = document.getElementById('square-google-pay-container');
            if (gpayContainer && isMounted) {
              gpayContainer.innerHTML = '';
              await googlePay.attach('#square-google-pay-container', {
                buttonSizeMode: 'fill',
                buttonColor: 'black',
                buttonType: 'order',
              });
              googlePayRef.current = googlePay;
              setHasDigitalWallets(true);
              console.log('[SquarePaymentForm] Google Pay attached.');

              gpayContainer.onclick = async (e) => {
                e.preventDefault();
                if (onBeforeSubmit && !onBeforeSubmit()) {
                  setIsProcessing(false);
                  return;
                }
                setIsProcessing(true);
                setError(null);
                try {
                  const tokenResult = await googlePay.tokenize();
                  if (tokenResult.status === 'OK') {
                    let verificationToken: string | undefined;
                    try {
                      const verificationResults = await paymentsRef.current.verifyBuyer(
                        tokenResult.token,
                        {
                          amount: totalRef.current.toFixed(2),
                          currencyCode: 'GBP',
                          intent: 'CHARGE',
                          billingContact: buildBillingContact(customerDetailsRef.current),
                        }
                      );
                      verificationToken = verificationResults?.token;
                    } catch (verifyErr: any) {
                      console.warn('[SquarePaymentForm] Google Pay verifyBuyer:', verifyErr);
                    }
                    await onSuccess(tokenResult.token, verificationToken);
                  } else {
                    if (tokenResult.errors && tokenResult.errors.length > 0) {
                      setError(translatePaymentError(tokenResult.errors[0].message));
                    }
                    setIsProcessing(false);
                  }
                } catch (err: any) {
                  console.error('[SquarePaymentForm] Google Pay tokenize error:', err);
                  setError(translatePaymentError(err.message || 'Google Pay processing failed'));
                  setIsProcessing(false);
                }
              };
            }
          } catch (gPayErr: any) {
            console.log('[SquarePaymentForm] Google Pay unavailable:', gPayErr?.message || gPayErr);
          }
        })();

      } catch (err: any) {
        console.error('[SquarePaymentForm] Initialization error:', err);
        if (isMounted) {
          setError(translatePaymentError(err.message || 'Could not connect to Square Payment Gateway. Please refresh.'));
          setIsInitializing(false);
        }
      }
    };

    initializeSquare();

    return () => {
      isMounted = false;
      setCardReady(false);
      if (cardRef.current) {
        try {
          cardRef.current.destroy();
        } catch {}
        cardRef.current = null;
      }
    };
  }, [appId, locationId, isProduction, branchName]);

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (onBeforeSubmit && !onBeforeSubmit()) {
      return;
    }

    if (!cardRef.current || !cardReady || isProcessing || isSubmittingOrder) return;

    try {
      setIsProcessing(true);
      setError(null);

      const result = await cardRef.current.tokenize();

      if (result.status === 'OK') {
        // UK SCA / PSD2: verify buyer identity
        let verificationToken: string | undefined;
        try {
          const verificationResults = await paymentsRef.current.verifyBuyer(
            result.token,
            {
              amount: totalRef.current.toFixed(2),
              billingContact: buildBillingContact(customerDetails),
              currencyCode: 'GBP',
              intent: 'CHARGE',
            }
          );
          verificationToken = verificationResults?.token;
        } catch (verifyErr: any) {
          console.warn('[SquarePaymentForm] verifyBuyer fallback:', verifyErr);
        }
        await onSuccess(result.token, verificationToken);
      } else {
        const errorMsg = result.errors?.[0]?.message || 'Card validation failed. Please check card details.';
        setError(translatePaymentError(errorMsg));
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[SquarePaymentForm] Payment submission error:', err);
      setError(translatePaymentError(err.message || 'Failed to process card payment'));
      setIsProcessing(false);
    }
  };

  const handleApplePayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!applePayRef.current) return;
    if (onBeforeSubmit && !onBeforeSubmit()) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const tokenResult = await applePayRef.current.tokenize();
      if (tokenResult.status === 'OK') {
        let verificationToken: string | undefined;
        try {
          const verificationResults = await paymentsRef.current.verifyBuyer(
            tokenResult.token,
            {
              amount: totalRef.current.toFixed(2),
              currencyCode: 'GBP',
              intent: 'CHARGE',
              billingContact: buildBillingContact(customerDetailsRef.current),
            }
          );
          verificationToken = verificationResults?.token;
        } catch (verifyErr: any) {
          console.warn('[SquarePaymentForm] Apple Pay verifyBuyer:', verifyErr);
        }
        await onSuccess(tokenResult.token, verificationToken);
      } else {
        console.warn('[SquarePaymentForm] Apple Pay tokenization not OK:', tokenResult);
        if (tokenResult.errors && tokenResult.errors.length > 0) {
          setError(translatePaymentError(tokenResult.errors[0].message));
        }
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[SquarePaymentForm] Apple Pay processing error:', err);
      setError(translatePaymentError(err.message || 'Apple Pay processing failed'));
      setIsProcessing(false);
    }
  };

  const busy = isProcessing || isSubmittingOrder;

  return (
    <div className="w-full space-y-4">
      {/* ── Express Checkout (Apple Pay & Google Pay) ── */}
      <div className="space-y-3">
        {isApplePayReady && (
          <div className="w-full">
            <button
              type="button"
              id="square-apple-pay-button"
              onClick={handleApplePayClick}
              disabled={busy || isInitializing}
              className="apple-pay-button w-full h-12 rounded-xl cursor-pointer transition-transform active:scale-[0.99] border-0 shadow-sm block bg-black text-white"
              style={{
                WebkitAppearance: '-apple-pay-button',
                // @ts-ignore
                applePayButtonStyle: 'black',
                // @ts-ignore
                applePayButtonType: 'order',
              }}
              aria-label="Apple Pay"
            />
          </div>
        )}
        <div id="square-google-pay-container" className="w-full min-h-[48px] empty:hidden"></div>
      </div>

      {hasDigitalWallets && (
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-pine/10 w-full"></div>
          <span className="bg-white px-3 text-[10px] text-pine/50 font-bold uppercase tracking-wider absolute">
            Or pay with card
          </span>
        </div>
      )}

      {/* ── Inline Card Form ── */}
      <form onSubmit={handleCardSubmit} className="space-y-4">
        <div className="p-4 bg-[#F7F2E7]/40 border border-pine/15 rounded-2xl transition-all focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <CreditCard size={16} className="text-terracotta" />
              <span className="text-xs font-bold uppercase tracking-wider text-pine">
                Card Information
              </span>
            </div>
            {isInitializing && (
              <div className="flex items-center gap-1.5 text-[11px] text-pine/60">
                <Loader2 size={12} className="animate-spin text-terracotta" />
                <span>Connecting to Square…</span>
              </div>
            )}
            {!isInitializing && cardReady && (
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Encrypted &amp; Secure
              </span>
            )}
          </div>

          {/* Square Web SDK injects the hosted card inputs here */}
          <div id="square-card-container" className="min-h-[90px]"></div>

          {!isProduction && (
            <div className="mt-2.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-900">
              <span className="font-bold">Sandbox Card:</span> 4111…1111 · Exp: 12/28 · CVV: 123
            </div>
          )}
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{error}</span>
              <p className="text-[11px] text-red-600/80 mt-0.5">Please check your card details or try Apple Pay / Google Pay.</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={busy || isInitializing || !cardReady || disabled}
          aria-busy={busy}
          className="w-full py-4 px-6 bg-pine text-white font-black text-base flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-terracotta hover:shadow-xl uppercase tracking-widest group cursor-pointer rounded-xl"
        >
          {busy ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Confirming with Square POS…</span>
            </>
          ) : !cardReady ? (
            <>
              <Loader2 size={18} className="animate-spin text-white" />
              <span>Preparing Secure Payment…</span>
            </>
          ) : (
            buttonLabel || `Pay £${total.toFixed(2)} Securely →`
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="w-full py-2.5 text-xs font-bold text-pine/60 hover:text-pine transition-colors text-center cursor-pointer"
          >
            ← Back to Details
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-pine/50 pt-1 text-center">
          <Lock size={12} />
          <span>Processed by Square POS · 256-bit SSL encrypted · PCI-DSS Level 1</span>
        </div>
      </form>
    </div>
  );
};
