import React from 'react';
import { X, RotateCcw, Minus, Plus, Ticket, MapPin, CreditCard, Clock, CheckCircle2, MessageCircle, AlertCircle, Printer, Bell } from 'lucide-react';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';

import { getDeliveryTier, ACTIVE_PROMO } from '@/config/shopConfig';
import { isValidUKMobile } from '@/lib/validation';
import { Phone, Star } from 'lucide-react';

import QRCode from 'react-qr-code';
const LiveOrderTracker = (p: any) => <div />;
export function CartDrawer(p: any) {
  const {
    isCartOpen, setIsCartOpen, checkoutStep, setCheckoutStep, cart, clearCart, lastOrder, handleReorderLastMeal, removeFromCart, addToCart, upsellSuggestions, SIZE_CATEGORIES, setSizePickerItem, tableParam, setFulfillmentType, fulfillmentType, activeDeliveryTier, discountedSubtotal, activeLocation, deliveryFee, isDeliveryOrder, postcodeError, setPostcodeError, customVoucher, setCustomVoucher, setVoucherError, appliedVoucher, setAppliedVoucher, voucherError, cartTotal, promoDiscount, ACTIVE_PROMO, isPromoTimeValid, serviceFee, finalCartTotal, isKitchenClosed, isBelowMinOrder, minOrder, minOrderRemaining, minOrderProgress, handleProceedToDetails, customerInfo, setCustomerInfo, phoneError, setPhoneError, getPhoneError, deliveryAddress, setDeliveryAddress, setIsLocationModalOpen, isPostcodeInDeliveryZone, marketingOptIn, setMarketingOptIn, submitOrder, isSubmitting, paymentMethod, setPaymentMethod, completedOrder, setCompletedOrder, handleSquarePaymentSuccess, getWhatsAppOrderLink, pushAlertActive, setPushAlertActive, requestPushPermission, SHOP_CONFIG, activePromo, desktopOrderSummary, tableSession
  } = p;

  return (
    <>
    {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-pine/80 backdrop-blur-sm animate-fade-in transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className={`relative w-full bg-bg-sand h-full shadow-[-10px_0_40px_rgba(0,0,0,0.25)] flex flex-col animate-slide-in-right border-l border-pine/10 transition-all duration-300 ease-in-out ${
            checkoutStep === 'details' || checkoutStep === 'payment'
              ? 'max-w-full md:max-w-2xl lg:max-w-4xl xl:max-w-5xl'
              : checkoutStep === 'success'
              ? 'max-w-full md:max-w-xl lg:max-w-2xl'
              : 'max-w-full md:max-w-lg lg:max-w-xl'
          }`}>
            <div className="p-5 md:px-8 border-b border-pine/10 flex justify-between items-center bg-white shrink-0">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold text-pine uppercase tracking-widest leading-tight">
                  {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Delivery & Details' : checkoutStep === 'payment' ? 'Secure Payment' : 'Order Confirmed!'}
                </h2>
                {!tableParam && checkoutStep !== 'success' && (
                  <div className="hidden sm:flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-wider">
                    <button 
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className={`transition-colors ${checkoutStep === 'cart' ? 'text-terracotta underline' : 'text-pine/50 hover:text-pine'}`}
                    >
                      1. Cart {cart.length > 0 && `(${cart.reduce((s: any, i: any) => s + i.quantity, 0)})`}
                    </button>
                    <span className="text-pine/30">→</span>
                    <button 
                      type="button"
                      disabled={cart.length === 0}
                      onClick={() => setCheckoutStep('details')}
                      className={`transition-colors ${checkoutStep === 'details' ? 'text-terracotta underline' : checkoutStep === 'payment' ? 'text-pine/50 hover:text-pine' : 'text-pine/30'}`}
                    >
                      2. Details
                    </button>
                    <span className="text-pine/30">→</span>
                    <span className={checkoutStep === 'payment' ? 'text-terracotta underline' : 'text-pine/30'}>
                      3. Payment
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {checkoutStep === 'cart' && cart.length > 0 && (
                  <button onClick={() => clearCart()} className="text-[10px] uppercase tracking-widest text-pine/40 hover:text-terracotta font-bold transition-colors">Clear Cart</button>
                )}
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    if (checkoutStep === 'success') {
                      setCheckoutStep('cart');
                      setCompletedOrder(null);
                    }
                  }} 
                  title="Close cart" 
                  className="p-2 hover:bg-pine/5 transition-colors text-pine rounded-full"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {checkoutStep === 'cart' && (
              <>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center text-pine/30 mt-20 flex flex-col items-center animate-fade-in-up">
                  <img src="/assets/tov-logo-tree-terracotta-alpha.png" alt="" className="w-32 h-32 opacity-20 mb-6 grayscale mix-blend-multiply" />
                  <p className="font-display text-2xl font-bold uppercase tracking-widest text-pine/50">Your table is waiting</p>
                  <p className="text-xs font-bold tracking-widest uppercase mt-4">Add items to begin</p>
                  {lastOrder && Array.isArray(lastOrder.items) && lastOrder.items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReorderLastMeal}
                      className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pine text-white text-xs font-bold uppercase tracking-wider hover:bg-terracotta transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <RotateCcw size={14} className="text-amber-300" />
                      <span>Reorder Previous Meal ({lastOrder.items.length} items)</span>
                    </button>
                  )}
                </div>
              ) : (
                cart.map((item: any, index: any) => {
                  const isFallback = !item.image || item.image.includes('tov-logo-tree');
                  return (
                  <div key={item.id} className="flex items-center gap-4 animate-fade-in-up group" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
                    <div className="relative w-20 h-20 rounded-2xl shadow-sm border border-pine/10 overflow-hidden flex-shrink-0 bg-white">
                      <img src={item.image} alt="" onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; e.target.className = 'w-full h-full object-contain p-3 opacity-40 transition-transform duration-700 group-hover:scale-110'; }} className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${isFallback ? 'object-contain p-3 opacity-40' : 'object-cover'}`} />
                      <div className="absolute inset-0 bg-pine/5 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-lg tracking-wider text-pine leading-tight">{item.name}</h4>
                      {item.modifiers && <p className="text-[10px] text-pine/60 mt-1 uppercase tracking-widest">{item.modifiers.size}</p>}
                      <p className="text-terracotta text-sm font-black mt-1">£{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-pine/20 px-3 py-1.5 rounded-full shadow-sm">
                      <button className="text-pine/60 hover:text-terracotta transition-colors font-black" title="Decrease quantity" onClick={() => removeFromCart(item.id)}><Minus size={16} strokeWidth={3} /></button>
                      <span className="font-black text-sm text-pine w-4 text-center">{item.quantity}</span>
                      <button className="text-pine/60 hover:text-terracotta transition-colors font-black" title="Increase quantity" onClick={() => addToCart(item)}><Plus size={16} strokeWidth={3} /></button>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            <div className="p-6 border-t border-pine/10 bg-bg-sand">
              {/* ─── Cart Upsell Engine Render ─── */}
              {upsellSuggestions.length > 0 && cartTotal > 0 && (
                <div className="mb-4 bg-white p-4 rounded-2xl border border-pine/10 flex items-center justify-between relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-terracotta/20 to-transparent group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex items-center gap-3 relative z-10 w-2/3">
                    <img src={upsellSuggestions[0].image} className={`w-12 h-12 rounded-xl shadow-sm border border-pine/10 flex-shrink-0 bibi-hover-image bg-white ${!upsellSuggestions[0].image || upsellSuggestions[0].image.includes('tov-logo-tree') ? 'object-contain p-1.5 opacity-40' : 'object-cover'}`} alt=""  onError={(e: any) => { e.target.onerror = null; e.target.src = '/assets/tov-logo-tree-terracotta-alpha.png'; e.target.className = 'w-12 h-12 rounded-xl shadow-sm border border-pine/10 flex-shrink-0 bibi-hover-image bg-white object-contain p-1.5 opacity-40'; }} />
                    <div className="truncate">
                      <p className="text-[10px] font-black text-terracotta uppercase tracking-widest mb-0.5">Perfect Pairing</p>
                      <p className="font-bold text-pine text-sm leading-tight truncate">{upsellSuggestions[0].name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (SIZE_CATEGORIES.includes(upsellSuggestions[0].category)) {
                        setSizePickerItem(upsellSuggestions[0]);
                      } else {
                        addToCart(upsellSuggestions[0]);
                      }
                    }}
                    className="relative z-10 bg-pine text-bg-sand px-4 py-2 rounded-full font-bold text-xs shadow-sm hover:bg-terracotta transition-all uppercase tracking-wider"
                  >
                    + £{upsellSuggestions[0].price.toFixed(2)}
                  </button>
                </div>
              )}

              {/* ─── Fulfillment Selector (Delivery First, Collection Second) ─── */}
              {!tableParam && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-pine mb-2 uppercase tracking-wider">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-pine/5 border border-pine/15 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfillmentType('delivery');
                      }}
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1 transition-all relative ${
                        fulfillmentType === 'delivery'
                          ? 'bg-terracotta text-white shadow-md'
                          : 'text-pine/70 hover:text-pine hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🚗</span>
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
                      className={`py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex flex-col items-center gap-1 transition-all ${
                        fulfillmentType === 'collection'
                          ? 'bg-pine text-white shadow-md'
                          : 'text-pine/70 hover:text-pine hover:bg-white/60'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-sm">
                        <span>🛍️</span>
                        <span>Collection</span>
                      </span>
                      <span className="text-[10px] opacity-80 normal-case font-medium">Free · Ready ~20-25m</span>
                    </button>
                  </div>

                  {fulfillmentType === 'delivery' && (
                    <div className="mt-2.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-[11px] text-emerald-900 font-medium">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">🚗 {activeLocation.id === 'hayes' ? 'Hayes In-House Fleet:' : 'Slough Delivery:'}</span>
                          <span>{activeLocation.id === 'hayes' ? 'UB3, UB4, UB7, UB8, UB10' : 'SL1, SL2, SL3, SL4'}</span>
                        </div>
                        <span className="font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[10px]">
                          {activeDeliveryTier?.isValid && activeDeliveryTier.tier
                            ? (discountedSubtotal >= activeDeliveryTier.tier.freeDeliveryThreshold ? 'FREE DELIVERY' : `£${activeDeliveryTier.tier.fee.toFixed(2)} Fee`)
                            : (activeLocation.id === 'slough' ? 'From £3.50' : 'From £2.99')}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 leading-tight">
                        {activeLocation.id === 'hayes'
                          ? 'Tiered by distance: UB4 (£2.99) · UB3 (£3.99) · UB10 (£4.99) · UB8 (£5.99) · UB7 (£6.99)'
                          : 'Tiered by distance: SL1 (£3.50) · SL2 (£3.99) · SL3 (£4.99) · SL4 (£5.99)'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Voucher Code Input */}
              <div className="mb-4 bg-white p-3 rounded-xl border border-pine/10 shadow-sm">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter discount code"
                    value={customVoucher}
                    onChange={(e) => {
                      setCustomVoucher(e.target.value.toUpperCase());
                      setVoucherError('');
                    }}
                    className="flex-1 bg-[#F7F2E7] px-3 py-2 text-sm font-bold text-pine uppercase rounded-lg focus:outline-none focus:ring-2 focus:ring-pine/20 placeholder:text-pine/30 placeholder:normal-case border border-transparent"
                  />
                  <button
                    onClick={() => {
                      const code = customVoucher.trim();
                      if (!code) return;
                      if (code.startsWith('TOV30-') || code.startsWith('TOV50-')) {
                        setAppliedVoucher(code);
                        setVoucherError('');
                      } else {
                        setVoucherError('Invalid voucher code');
                        setAppliedVoucher(null);
                      }
                    }}
                    className="bg-pine text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-terracotta transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {voucherError && <p className="text-red-500 text-[10px] mt-1.5 font-bold uppercase tracking-wider px-1">{voucherError}</p>}
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded border border-emerald-100 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{appliedVoucher} Applied</span>
                    <button onClick={() => { setAppliedVoucher(null); setCustomVoucher(''); }} className="text-emerald-700/50 hover:text-emerald-700">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2 mb-6 text-pine">
                <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                  <span>Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-terracotta font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Ticket size={14} /> {appliedVoucher ? `${appliedVoucher} VOUCHER` : ACTIVE_PROMO.cartLabel}
                    </span>
                    <span>-£{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                {activePromo === 'BREAKFAST40' && promoDiscount === 0 && (
                  <div className="text-[11px] text-pine/50 font-medium italic">
                    {!isPromoTimeValid
                      ? 'BREAKFAST40 is valid 9:00 AM – 2:00 PM only.'
                      : 'Add breakfast items to your cart to get 40% off.'}
                  </div>
                )}
                {isDeliveryOrder && deliveryFee > 0 && (
                  <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</span>
                  </div>
                )}
                {serviceFee > 0 && (
                  <div className="flex justify-between items-center text-xs text-pine/70 font-semibold uppercase tracking-wider">
                    <span>Service Fee (10%)</span>
                    <span>£{serviceFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-pine/10 text-xl font-bold">
                  <span className="font-display text-sm uppercase tracking-[0.2em] font-bold">Total</span>
                  <span className="font-display text-2xl font-bold">£{finalCartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {isKitchenClosed && (
                <div className="bg-pine/10 text-pine rounded-xl p-3 mb-4 text-center text-sm font-bold">
                  🕐 Kitchen opens at 12:00 PM — Browse our menu and order when we open!
                </div>
              )}
              {isBelowMinOrder && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-amber-800 mb-2">
                    <span>Minimum order for delivery: £{minOrder.toFixed(2)}</span>
                    <span>£{minOrderRemaining.toFixed(2)} more</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full transition-all duration-500" style={{ width: `${minOrderProgress}%` }} />
                  </div>
                </div>
              )}
              {isDeliveryOrder && !isBelowMinOrder && activeDeliveryTier?.tier?.freeDeliveryThreshold && discountedSubtotal < activeDeliveryTier.tier.freeDeliveryThreshold && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex justify-between text-xs font-bold text-emerald-800 mb-2">
                    <span>🚗 Free delivery at £{activeDeliveryTier.tier.freeDeliveryThreshold.toFixed(2)}</span>
                    <span>£{(activeDeliveryTier.tier.freeDeliveryThreshold - discountedSubtotal).toFixed(2)} more</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (discountedSubtotal / activeDeliveryTier.tier.freeDeliveryThreshold) * 100)}%` }} />
                  </div>
                </div>
              )}
              <button
                onClick={handleProceedToDetails}
                disabled={cart.length === 0 || isKitchenClosed || isBelowMinOrder}
                className="w-full py-5 bg-pine text-white font-black hover:bg-terracotta active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl relative overflow-hidden group mb-4 rounded-full"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 flex justify-between px-8 items-center w-full">
                  <span>{isBelowMinOrder ? `Add £${minOrderRemaining.toFixed(2)} more` : 'Checkout'}</span>
                  <span className="text-lg">£{finalCartTotal.toFixed(2)}</span>
                </span>
              </button>

              <div className="flex flex-col items-center gap-2 pt-2 border-t border-pine/10">
                <div className="flex items-center gap-4 opacity-50 grayscale flex-wrap justify-center hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" className="h-3 object-contain" alt="Apple Pay" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" className="h-3 object-contain" alt="Google Pay" />
                  <span className="font-bold text-[11px] tracking-wider text-pine/80">klarna.</span>
                  <span className="font-black text-[12px] tracking-widest text-pine/80 italic font-serif">VISA</span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" className="h-4 object-contain" alt="Mastercard" />
                </div>
                <p className="text-[7px] text-pine/40 font-black uppercase tracking-[0.2em]">Secure Checkout Supported</p>
              </div>
            </div>
            </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={submitOrder} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 lg:grid lg:grid-cols-12">
                  <div className="lg:col-span-7 flex flex-col min-h-0 bg-white lg:border-r border-pine/10">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                      <div className="mb-2">
                        {tableParam ? (
                          <>
                            <p className="text-xs font-bold text-pine/50 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5"><MapPin size={14} /> Dine-In · Table {tableParam}</p>
                            <h3 className="font-display text-3xl font-bold text-pine leading-tight">Your Details</h3>
                            <p className="text-pine/60 text-sm mt-3 normal-case leading-relaxed font-medium">Sit back and relax. Your order will be sent straight to the chef. You can pay with our staff before you leave.</p>
                          </>
                        ) : (
                          <>
                            {activeLocation.id === 'hayes' ? (
                              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 shadow-sm">
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                                  <span>🚗</span> Doorstep Delivery Available (Hayes Fleet)
                                </p>
                                <p className="text-xs text-emerald-800 font-bold mt-1">
                                  Hot &amp; fresh direct to your doorstep via our own in-house drivers! Serving UB4 (£2.99), UB3 (£3.99), UB10 (£4.99), UB8 (£5.99), UB7 (£6.99).
                                </p>
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 shadow-sm">
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                                  <span>🚗</span> Doorstep Delivery Available (Slough Branch)
                                </p>
                                <p className="text-xs text-emerald-800 font-bold mt-1">
                                  Hot &amp; fresh direct to your doorstep via Square fulfillment! Serving SL1 (£3.50), SL2 (£3.99), SL3 (£4.99), SL4 (£5.99).
                                </p>
                              </div>
                            )}

                            {/* Branch Confirmation Chip */}
                            {!tableParam && (
                              <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl mb-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-start gap-3">
                                  <MapPin className="text-terracotta shrink-0 mt-0.5" size={18} />
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-terracotta">Active Branch:</p>
                                    <p className="text-sm font-bold text-pine leading-tight">{activeLocation.name}</p>
                                    <p className="text-xs text-pine/60 mt-0.5">{activeLocation.address}, {activeLocation.postcode}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsLocationModalOpen(true)}
                                  className="text-xs font-black uppercase tracking-wider text-terracotta underline hover:text-pine shrink-0 ml-3"
                                >
                                  Change Branch
                                </button>
                              </div>
                            )}


                            <h3 className="font-display text-2xl md:text-3xl font-bold text-pine leading-tight">Your Details</h3>
                            <p className="text-pine/60 text-xs sm:text-sm mt-1 normal-case leading-relaxed font-medium">
                              {isDeliveryOrder
                                ? 'Enter your delivery address and contact info for our drivers.'
                                : "Enter your details so we can have your order ready and notify you when it's hot and fresh."}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Full Name *</label>
                            <input
                              type="text"
                              required
                              autoFocus
                              className="w-full p-3.5 bg-white border border-pine/15 focus:border-pine focus:ring-1 focus:ring-brand-text/20 outline-none transition-all text-pine rounded-xl text-sm"
                              value={customerInfo.name}
                              onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Phone Number *</label>
                            <input
                              type="tel"
                              required
                              className={`w-full p-3.5 bg-white border outline-none transition-all text-pine font-medium shadow-sm rounded-xl text-sm ${
                                phoneError
                                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200'
                                  : 'border-pine/15 focus:border-pine'
                              }`}
                              value={customerInfo.phone}
                              onChange={e => {
                                setCustomerInfo({ ...customerInfo, phone: e.target.value });
                                if (phoneError) setPhoneError(getPhoneError(e.target.value));
                              }}
                              onBlur={() => {
                                if (customerInfo.phone.trim()) setPhoneError(getPhoneError(customerInfo.phone));
                              }}
                              placeholder="07XXX XXXXXX"
                              maxLength={15}
                            />
                            {phoneError && (
                              <p className="text-red-500 text-[10px] font-bold mt-1.5 uppercase tracking-widest">{phoneError}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-pine mb-1.5 uppercase tracking-wider">Email Address (Order Confirmation &amp; Live Tracker) *</label>
                          <input
                            type="email"
                            required
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-pine outline-none transition-all text-pine font-medium shadow-sm rounded-xl text-sm"
                            value={customerInfo.email}
                            onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            placeholder="your@email.com"
                          />
                        </div>

                    {/* ─── Delivery Address Inputs (Only when Delivery is selected) ─── */}
                    {isDeliveryOrder && (
                      <div className="space-y-4 p-5 bg-terracotta/5 border-2 border-terracotta/20 rounded-2xl mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-terracotta flex items-center gap-1.5">
                            <span>🚗</span> Delivery Address ({activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Branch'})
                          </span>
                          <span className="text-[10px] font-bold bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full">
                            {activeDeliveryTier?.tier ? `Min Order £${activeDeliveryTier.tier.minOrder.toFixed(2)}` : 'Min Order £15'}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Address Line 1 *</label>
                          <input
                            type="text"
                            required={isDeliveryOrder}
                            value={deliveryAddress.line1}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })}
                            placeholder="Flat / House number and street name"
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Address Line 2 (Optional)</label>
                          <input
                            type="text"
                            value={deliveryAddress.line2}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })}
                            placeholder="Apartment, building, unit, etc."
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Town / Area *</label>
                            <input
                              type="text"
                              required={isDeliveryOrder}
                              value={deliveryAddress.city}
                              onChange={e => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                              placeholder={activeLocation.id === 'hayes' ? 'Hayes' : 'Slough'}
                              className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Postcode *</label>
                            <input
                              type="text"
                              required={isDeliveryOrder}
                              value={deliveryAddress.postcode}
                              onChange={e => {
                                const pc = e.target.value.toUpperCase();
                                setDeliveryAddress({ ...deliveryAddress, postcode: pc });
                                if (postcodeError) {
                                  const res = isPostcodeInDeliveryZone(pc, activeLocation.id);
                                  setPostcodeError(res.isValid ? null : (res.reason || 'Invalid delivery postcode'));
                                }
                              }}
                              onBlur={() => {
                                if (deliveryAddress.postcode.trim()) {
                                  const res = isPostcodeInDeliveryZone(deliveryAddress.postcode, activeLocation.id);
                                  setPostcodeError(res.isValid ? null : (res.reason || 'Invalid delivery postcode'));
                                }
                              }}
                              placeholder={activeLocation.id === 'hayes' ? 'e.g. UB4 0RU' : 'e.g. SL1 4XQ'}
                              className={`w-full p-3.5 bg-white border rounded-xl text-sm uppercase font-bold outline-none ${
                                postcodeError
                                  ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200 text-red-700'
                                  : 'border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 text-pine'
                              }`}
                            />
                          </div>
                        </div>

                        {activeDeliveryTier?.isValid && activeDeliveryTier.tier ? (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
                            <span>✅ {activeDeliveryTier.outcode} ({activeDeliveryTier.tier.areaName})</span>
                            <span>
                              {deliveryFee === 0
                                ? 'FREE Delivery Qualified!'
                                : `£${activeDeliveryTier.tier.fee.toFixed(2)} (Free over £${activeDeliveryTier.tier.freeDeliveryThreshold})`}
                            </span>
                          </div>
                        ) : postcodeError ? (
                          <p className="text-red-600 text-xs font-semibold">{postcodeError}</p>
                        ) : (
                          <p className="text-[11px] text-pine/60 font-medium">
                            {activeLocation.id === 'hayes' ? (
                              <>Delivery zones: <strong>UB4</strong> (£2.99), <strong>UB3</strong> (£3.99), <strong>UB10</strong> (£4.99), <strong>UB8</strong> (£5.99), <strong>UB7</strong> (£6.99).</>
                            ) : (
                              <>Delivery zones: <strong>SL1</strong> (£3.50), <strong>SL2</strong> (£3.99), <strong>SL3</strong> (£4.99), <strong>SL4</strong> (£5.99).</>
                            )}
                          </p>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-pine mb-1 uppercase tracking-wider">Driver Delivery Instructions (Optional)</label>
                          <input
                            type="text"
                            value={deliveryAddress.instructions}
                            onChange={e => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                            placeholder="e.g. Ring buzzer 4, leave by front porch"
                            className="w-full p-3.5 bg-white border border-pine/15 focus:border-terracotta focus:ring-1 focus:ring-terracotta/20 rounded-xl text-sm outline-none text-pine"
                          />
                        </div>
                      </div>
                    )}

                    {/* Online Payment Requirement & Order Type Overview */}
                    {!tableParam && (
                      <div className="pt-2 space-y-2">
                        <div className="p-4 border-2 border-terracotta/40 bg-gradient-to-br from-terracotta/5 to-amber-500/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CreditCard size={18} className="text-terracotta" />
                              <span className="font-bold text-xs uppercase tracking-wider text-pine">
                                {isDeliveryOrder ? 'Driver Delivery • Pay Online' : 'Collection Order • Pay Online'}
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-terracotta text-white px-2.5 py-0.5 rounded-full">
                              Apple Pay / Google Pay / Card
                            </span>
                          </div>
                          <p className="text-xs font-medium text-pine/80 leading-relaxed">
                            {isDeliveryOrder
                              ? `Food is freshly prepared and delivered hot by our in-house drivers (~${activeDeliveryTier?.tier?.estimatedMinutes || 40} mins).`
                              : 'Food is freshly cooked upon payment. 1-touch checkout with Apple Pay, Google Pay, or Card.'}
                          </p>
                          {promoDiscount > 0 && (
                            <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md mt-2 flex items-center gap-1.5">
                              <span>🎁</span>
                              <span>Online promotion applied: -£{promoDiscount.toFixed(2)} (Online Exclusive)</span>
                            </p>
                          )}
                          {isDeliveryOrder && (
                            <div className="mt-2 pt-2 border-t border-pine/10 flex items-center justify-between text-xs font-bold text-pine">
                              <span>
                                {activeDeliveryTier?.isValid && activeDeliveryTier.tier
                                  ? `Delivery to ${activeDeliveryTier.outcode}:`
                                  : 'Delivery Fee:'}
                              </span>
                              <span className={deliveryFee === 0 ? 'text-emerald-700 font-black' : 'text-pine font-black'}>
                                {deliveryFee === 0
                                  ? `FREE (Qualified over £${activeDeliveryTier?.tier?.freeDeliveryThreshold || 35})`
                                  : `£${deliveryFee.toFixed(2)}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Kitchen Prep SLA Notice */}
                    {!tableParam && (
                      <div className="bg-amber-50 border-2 border-amber-300 p-4 mt-4 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider mb-1">
                          <Clock size={16} className="text-amber-700 shrink-0" />
                          <span>Estimated {isDeliveryOrder ? 'Delivery' : 'Prep'} Time: {isDeliveryOrder ? '35 – 45 Minutes' : '20 – 25 Minutes'}</span>
                        </div>
                        <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                          {isDeliveryOrder
                            ? 'Every dish is made fresh to order. Our drivers will dispatch as soon as the tandoor and karahis are completed.'
                            : 'Every karahi, handi, and grill is prepared fresh to order. To ensure food is piping hot and prevent counter queues, please do not arrive before your tracker confirms Ready for Pickup.'}
                        </p>
                      </div>
                    )}
                    
                    {/* GDPR Marketing Opt-in */}
                    <div className="flex items-start gap-4 mt-4 bg-white p-5 border border-pine/10 shadow-sm cursor-pointer group rounded-xl" onClick={() => setMarketingOptIn(!marketingOptIn)}>
                      <div className="pt-0.5 shrink-0">
                        <div className={`w-10 h-5 rounded-full transition-colors duration-300 ease-in-out relative ${marketingOptIn ? 'bg-terracotta' : 'bg-pine/20'}`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${marketingOptIn ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-pine leading-relaxed cursor-pointer block select-none">
                          I would like to receive exclusive offers, secret menu drops, and birthday rewards via email or SMS. 
                        </label>
                        <span className="block text-[9px] text-pine/50 mt-1.5 uppercase tracking-widest font-bold">We respect your privacy. Unsubscribe at any time.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pinned Bottom in Left Column */}
                <div className="shrink-0 p-5 md:px-8 border-t border-pine/10 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.04)] z-20 space-y-3">
                      {isKitchenClosed && (
                        <div className="bg-pine/10 text-pine rounded-xl p-3 mb-4 text-center text-sm font-bold">
                          🕐 Kitchen opens at 12:00 PM — Browse our menu and order when we open!
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (isKitchenClosed || isSubmitting || customerInfo.name.trim() === '' || customerInfo.phone.trim() === '' || customerInfo.email.trim() === '' || !!phoneError) return;
                          
                          // Delivery validation
                          if (isDeliveryOrder) {
                            const tierCheck = getDeliveryTier(deliveryAddress.postcode, activeLocation.id);
                            if (!tierCheck.isValid || !tierCheck.tier) {
                              setPostcodeError(tierCheck.reason || 'Invalid delivery postcode');
                              alert(tierCheck.reason || (activeLocation.id === 'hayes' ? 'We deliver to UB4, UB3, UB10, UB8, and UB7 from Hayes.' : 'We deliver to SL1, SL2, SL3, and SL4 from Slough.'));
                              return;
                            }
                            if (discountedSubtotal < tierCheck.tier.minOrder) {
                              alert(`Minimum order for delivery to ${tierCheck.outcode} (${tierCheck.tier.areaName}) is £${tierCheck.tier.minOrder.toFixed(2)}. Please add more items to your cart.`);
                              return;
                            }
                            if (!deliveryAddress.line1.trim()) {
                              alert('Please enter your delivery street address (Line 1).');
                              return;
                            }
                            if (!deliveryAddress.postcode.trim()) {
                              alert('Please enter your delivery postcode.');
                              return;
                            }
                          }

                          if (!tableParam) {
                            setCheckoutStep('payment');
                          } else {
                            submitOrder(e as any, 'collection');
                          }
                        }}
                        disabled={isKitchenClosed || isSubmitting || customerInfo.name.trim() === '' || customerInfo.phone.trim() === '' || customerInfo.email.trim() === '' || !!phoneError}
                        className="w-full py-4 md:py-5 px-6 bg-pine text-white font-black hover:bg-terracotta active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl relative overflow-hidden group rounded-xl"
                      >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                        <span className="relative z-10 flex justify-between items-center w-full">
                          <span>
                            {tableParam 
                              ? 'Complete Order' 
                              : 'Proceed to Payment (Apple Pay / Google Pay / Card)'
                            }
                          </span>
                          <span className="text-lg font-sans">£{finalCartTotal.toFixed(2)}</span>
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="w-full py-1.5 text-pine/40 font-bold hover:text-terracotta transition-colors uppercase tracking-[0.2em] text-[10px]"
                      >
                        ← Back to Cart
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Desktop Live Sticky Order Summary */}
                  {desktopOrderSummary}
                </div>
              </form>
            )}

            {checkoutStep === 'payment' && (
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="flex-1 min-h-0 lg:grid lg:grid-cols-12">
                  {/* Left Column: Payment Form */}
                  <div className="lg:col-span-7 flex flex-col min-h-0 overflow-y-auto p-6 md:p-8 space-y-6 pb-24 bg-white lg:border-r border-pine/10">
                    <div>
                      <h3 className="font-sans text-xl md:text-2xl font-bold text-pine uppercase tracking-widest mb-1 leading-none">Complete Payment</h3>
                      <p className="text-pine/60 text-xs normal-case mb-6">Choose Express Checkout (Apple Pay / Google Pay) or enter card details below. We do not store card numbers.</p>
                      
                      {!tableParam && (
                        isDeliveryOrder ? (
                          <div className="bg-emerald-50 border border-emerald-200 p-4 mb-6 rounded-xl">
                            <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
                              <span>🚗</span>
                              Driver Delivery ({activeLocation.id === 'hayes' ? 'Hayes Fleet' : 'Slough Branch'})
                            </p>
                            <p className="text-[11px] text-emerald-800 mt-1 font-medium leading-relaxed">
                              Delivering to: <strong>{deliveryAddress.line1}, {deliveryAddress.postcode}</strong> (~35-45 mins).
                            </p>
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-xl">
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                              <AlertCircle size={14} className="text-amber-700" />
                              Collection from {activeLocation.name}
                            </p>
                            <p className="text-[11px] text-amber-800 mt-1 font-medium leading-relaxed">
                              Collect from: <strong>{activeLocation.address}, {activeLocation.postcode}</strong> (~20-25 mins).
                            </p>
                          </div>
                        )
                      )}
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                        <p className="font-bold mb-1">⚠️ Allergen Notice</p>
                        <p>Our dishes may contain nuts, gluten, dairy, and other allergens. If you have a food allergy, please call us before ordering: <a href={`tel:${activeLocation.phone}`} className="font-bold underline">{activeLocation.phone}</a></p>
                      </div>

                      {(activeLocation as any).square?.enabled && (activeLocation as any).square?.appId && (activeLocation as any).square?.locationId ? (
                        <SquarePaymentForm
                          total={finalCartTotal}
                          branchName={activeLocation.name}
                          appId={(activeLocation as any).square.appId}
                          locationId={(activeLocation as any).square.locationId}
                          customerDetails={{
                            name: customerInfo.name,
                            phone: customerInfo.phone,
                            email: customerInfo.email,
                            addressLine1: isDeliveryOrder ? deliveryAddress.line1 : undefined,
                            addressLine2: isDeliveryOrder ? deliveryAddress.line2 : undefined,
                            city: isDeliveryOrder ? deliveryAddress.city : undefined,
                            postcode: isDeliveryOrder ? deliveryAddress.postcode : undefined,
                          }}
                          onBeforeSubmit={() => {
                            if (!customerInfo.name.trim()) {
                              alert('Please enter your name');
                              return false;
                            }
                            const phoneClean = customerInfo.phone.replace(/\s+/g, '');
                            if (!phoneClean || !isValidUKMobile(phoneClean)) {
                              alert('Please enter a valid UK phone number (e.g. 07123 456789)');
                              return false;
                            }
                            if (isDeliveryOrder) {
                              if (!deliveryAddress.line1.trim()) {
                                alert('Please enter your delivery street address');
                                return false;
                              }
                              if (!deliveryAddress.postcode.trim()) {
                                alert('Please enter your delivery postcode');
                                return false;
                              }
                              const check = isPostcodeInDeliveryZone(deliveryAddress.postcode, activeLocation.id);
                              if (!check.isValid) {
                                alert(check.reason || 'Invalid delivery postcode');
                                return false;
                              }
                            }
                            return true;
                          }}
                          onSuccess={handleSquarePaymentSuccess}
                          onCancel={() => setCheckoutStep('details')}
                          isSubmittingOrder={isSubmitting}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Right Column: Desktop Live Sticky Order Summary */}
                  {desktopOrderSummary}
                </div>
              </div>
            )}

            {checkoutStep === 'success' && completedOrder && (
              tableParam ? (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-bg-sand/50">
                  <LiveOrderTracker 
                    initialOrder={completedOrder} 
                    tableId={tableParam} 
                    onAddToTab={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      // Clear local cart but keep order session alive
                    }} 
                  />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-sm border ${
                      completedOrder.payment_status === 'paid' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${completedOrder.payment_status === 'paid' ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
                      <span>
                        {completedOrder.payment_status === 'paid'
                          ? completedOrder.type === 'delivery' || completedOrder.fulfillment_type === 'delivery'
                            ? 'PAID ONLINE · DRIVER DELIVERY (HAYES)'
                            : 'PAID ONLINE · READY FOR COLLECTION'
                          : completedOrder.type === 'dine-in'
                            ? `DINE-IN · TABLE ${completedOrder.table_number || ''} · PAY WITH STAFF`
                            : 'PAID ONLINE · READY FOR COLLECTION'}
                      </span>
                    </div>

                    <h3 className="font-serif text-3xl font-bold text-pine mb-2">Order Confirmed!</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Your order has been sent directly to the kitchen.
                    </p>
                    {completedOrder.customerEmail && (
                      <p className="text-[11px] text-pine/70 font-semibold mt-1">
                        📧 Order confirmation ticket dispatched to <span className="text-pine font-bold underline">{completedOrder.customerEmail}</span>.
                      </p>
                    )}
                  </div>

                  {/* WhatsApp Send Button — the primary CTA (Only for non-table orders) */}
                  <a
                    href={getWhatsAppOrderLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-[#25D366] text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:bg-[#20BD5A] transition-colors"
                  >
                    <MessageCircle size={24} />
                    Send Order via WhatsApp
                  </a>

                  {/* Or call & print */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <a
                      href={`tel:${activeLocation.phone.replace(/\s+/g, '')}`}
                      className="py-3 bg-white text-pine rounded-full font-bold border border-pine/20 flex items-center justify-center gap-2 hover:bg-pine/5 transition-colors shadow-sm text-xs"
                    >
                      <Phone size={16} />
                      Call Restaurant
                    </a>
                    <button
                      type="button"
                      onClick={() => (typeof window !== 'undefined' ? (window as any).print() : null)}
                      className="py-3 bg-white text-pine rounded-full font-bold border border-pine/20 flex items-center justify-center gap-2 hover:bg-pine/5 transition-colors shadow-sm text-xs"
                    >
                      <Printer size={16} />
                      Print Receipt
                    </button>
                  </div>

                  <div className="bg-bg-sand w-full py-4 px-6 rounded-2xl border border-terracotta-light border-dashed text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Order Reference</p>
                    <p className="font-mono text-3xl font-black text-pine tracking-tighter">{completedOrder.id}</p>
                  </div>

                  {/* Estimated Ready Time Highlight Card */}
                  <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-left w-full shadow-sm">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={16} className="text-amber-700 shrink-0" />
                        Estimated Ready Time
                      </p>
                      <span className="px-2.5 py-0.5 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-black uppercase">
                        20–25 Mins
                      </span>
                    </div>
                    <div className="text-2xl font-black text-[#a64036] mb-1">
                      Ready by approx. {(() => {
                        const placed = new Date(completedOrder.timestamp || Date.now());
                        const readyDate = new Date(placed.getTime() + (completedOrder.estimatedReadyMinutes || 25) * 60 * 1000);
                        return readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      })()}
                    </div>
                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                      Freshly prepared over live flames at <strong>{activeLocation.name}</strong>. Please head to the counter only when your tracker shows <strong>Ready for Pickup</strong>.
                    </p>
                  </div>

                  {/* Full Itemized Order Details */}
                  <div className="w-full bg-white border border-pine/10 rounded-2xl p-5 text-left shadow-sm">
                    <div className="flex items-center justify-between border-b border-pine/10 pb-3 mb-3">
                      <h4 className="font-serif text-sm font-bold text-pine uppercase tracking-wider">Order Items</h4>
                      <span className="text-[11px] font-bold text-pine/50">
                        {completedOrder.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 0} Items
                      </span>
                    </div>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {completedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-xs border-b border-pine/5 pb-2">
                          <div className="pr-3">
                            <span className="font-bold text-pine">{item.quantity}x {item.name}</span>
                            {item.notes && (
                              <p className="text-[11px] text-pine/60 italic mt-0.5">Note: {item.notes}</p>
                            )}
                          </div>
                          <span className="font-bold text-pine font-sans shrink-0">
                            £{((Number(item.price || 0)) * (Number(item.quantity || 1))).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-pine/10 space-y-1.5 text-xs">
                      {completedOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold">
                          <span>Discount</span>
                          <span>-£{Number(completedOrder.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-pine font-black text-sm pt-1">
                        <span>Total Paid</span>
                        <span className="text-[#a64036]">£{Number(completedOrder.total || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-Time Push Notification Alert Status / Button */}
                  <div className="w-full">
                    {pushAlertActive || completedOrder.fcmToken ? (
                      <div className="w-full py-3.5 px-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                        <Bell size={18} className="text-emerald-600 animate-bounce shrink-0" />
                        <span>🔔 Phone Alerts Active! We will alert you the second your food is ready.</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          if (completedOrder?.id) {
                            const token = await requestPushPermission(completedOrder.id);
                            if (token) {
                              setPushAlertActive(true);
                              alert('🔔 Alert enabled! We will buzz your phone the second your food is ready.');
                            }
                          }
                        }}
                        className="w-full py-3.5 bg-white border-2 border-terracotta text-pine rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-terracotta/5 transition-all shadow-sm cursor-pointer"
                      >
                        <Bell size={18} className="text-terracotta shrink-0" />
                        Alert My Phone When Ready
                      </button>
                    )}
                  </div>

                  <a
                    href={`/track/${completedOrder.id}`}
                    className="w-full py-4 bg-gradient-to-r from-terracotta to-rose-400 text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  >
                    📍 Track Your Order Live
                  </a>

                  {/* Google Review Velocity Booster */}
                  <div className="w-full bg-gradient-to-br from-white to-[#FAF6EE] border-2 border-terracotta/40 p-5 rounded-2xl text-center shadow-sm">
                    <div className="flex justify-center gap-1 text-amber-400 mb-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <h4 className="font-display font-bold text-pine text-base uppercase tracking-wider mb-1">
                      Support {activeLocation.name} on Google
                    </h4>
                    <p className="text-xs text-pine/70 mb-3.5 leading-relaxed font-medium">
                      Your 5-star review helps our kitchen family thrive in {activeLocation.city}. Takes only 15 seconds!
                    </p>
                    <a
                      href={activeLocation.googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-pine hover:bg-terracotta text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Star size={15} className="text-amber-300 fill-amber-300" />
                      Leave a 5★ Google Review
                    </a>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-md border border-terracotta-light/30 inline-block">
                    <QRCode 
                      value={`TASTE OF VILLAGE-ORDER:${completedOrder.id}`} 
                      size={120}
                      fgColor="#2B1A12"
                      level="Q"
                    />
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeLocation.name + ' ' + activeLocation.address + ' ' + activeLocation.postcode)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-white border border-pine/20 text-pine hover:bg-pine hover:text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-colors uppercase tracking-wider shadow-sm"
                  >
                    <MapPin size={18} className="text-terracotta" />
                    Get Directions ({activeLocation.name.replace('Taste Of Village ', '')})
                  </a>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('cart');
                      setCompletedOrder(null);
                    }}
                    className="w-full py-4 bg-pine text-white rounded-full font-bold mt-2 hover:bg-pine/90 transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
