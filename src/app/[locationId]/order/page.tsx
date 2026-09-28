'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Plus, Minus, ShoppingBag, X, CheckCircle2, AlertCircle, Clock, ChefHat, Check, Sparkles } from 'lucide-react';
import { MenuItem } from '@/types';
import { getMenuItems } from '@/services/menuService';
import { streamSingleOrder } from '@/services/orderService';
import { SHOP_CONFIG, getActiveLocation, LOCATIONS } from '@/config/shopConfig';
import { SquarePaymentForm } from '@/components/SquarePaymentForm';
import { generateId } from '@/utils/generateId';
import { sendOrderNotificationEmail } from '@/services/emailService';

const SquareCheckoutForm = ({ cart, cartTotal, onCreateOrder, onPaymentSuccess, onBack, isCollection, customerInfo, setCustomerInfo }: any) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const activeLocation = getActiveLocation() || LOCATIONS.hayes;
  const squareConfig = activeLocation?.square || {};

  if (!squareConfig.enabled || !squareConfig.appId || !squareConfig.locationId) {
    return <div className="p-6 bg-red-50 text-red-700">Square Payments are not configured.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
       <div className="p-6 bg-gray-50 border-b relative">
         <button onClick={onBack} className="absolute left-6 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full">
           <X size={20} />
         </button>
         <h2 className="text-xl font-bold text-center">Complete Payment</h2>
       </div>
       <div className="flex-1 overflow-y-auto p-6">
         <div className="space-y-4">
           <label className="block text-sm font-bold">Your Name {isCollection ? '*' : '(Optional)'}</label>
           <input autoFocus required={isCollection} value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="John" />
           <label className="block text-sm font-bold flex justify-between items-center">
              <span>Phone Number {isCollection ? '*' : '(Optional)'}</span>
           </label>
           <input required={isCollection} type="tel" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="07700 900000" />
           <label className="block text-sm font-bold mt-4">Email Address {isCollection ? '*' : '(Optional)'}</label>
           <input required={isCollection} type="email" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl" placeholder="john@example.com" />
         </div>

         {/* Loyalty Integration */}
         <div className="mt-6 p-4 bg-terracotta/5 border border-terracotta/20 rounded-xl">
           <h3 className="font-bold text-pine flex items-center gap-2"><Sparkles size={18} className="text-terracotta" /> Taste of Village Loyalty</h3>
           <p className="text-xs text-pine/70 mt-1 mb-3">Earn points on every order. Enter your phone number above to check your balance or join!</p>
           <div className="flex items-center gap-3">
             <button
               type="button"
               disabled={!customerInfo.phone || isProcessing}
               onClick={async () => {
                 setIsProcessing(true);
                 try {
                   const res = await fetch('/api/loyalty', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({ action: 'check', phone: customerInfo.phone, branch: activeLocation.id })
                   });
                   const data = await res.json();
                   if (data.status === 'found') {
                     alert(`You have ${data.balance} points! They will automatically accumulate on this order.`);
                   } else if (data.status === 'no_account' || data.status === 'no_loyalty_account') {
                     const enroll = confirm("You don't have a loyalty account yet. Would you like to join and start earning points?");
                     if (enroll) {
                       await fetch('/api/loyalty', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ action: 'enroll', phone: customerInfo.phone, customerName: customerInfo.name, branch: activeLocation.id })
                       });
                       alert('Successfully enrolled! Points for this order will be credited to your new account.');
                     }
                   }
                 } catch (err) {
                   console.error('Loyalty error', err);
                   alert('Failed to check loyalty status.');
                 }
                 setIsProcessing(false);
               }}
               className="text-xs font-bold px-4 py-2 bg-pine text-white rounded-full hover:bg-pine/90 disabled:opacity-50"
             >
               Check Balance / Join
             </button>
           </div>
         </div>
         
         <div className="mt-8 mb-4 border-t pt-6">
            <SquarePaymentForm 
              total={cartTotal}
              branchName={activeLocation.name}
              appId={squareConfig.appId || ''}
              locationId={squareConfig.locationId || ''}
              customerDetails={{
                name: customerInfo.name,
                phone: customerInfo.phone,
                email: customerInfo.email,
              }}
              onBeforeSubmit={() => {
                if (!customerInfo.name && isCollection) {
                  alert('Name is required');
                  return false;
                }
                return true;
              }}
              onSuccess={async (token, verificationToken) => {
                setIsProcessing(true);
                try {
                  const orderId = await onCreateOrder(true);
                  onPaymentSuccess(orderId);
                } catch (err) {
                  setIsProcessing(false);
                }
              }}
              onCancel={onBack}
              isSubmittingOrder={isProcessing}
            />
            {isCollection && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  disabled={isProcessing} 
                  onClick={async () => {
                    if (!customerInfo.name) {
                      setPaymentError('Please provide your name.');
                      return;
                    }
                    setIsProcessing(true);
                    setPaymentError(null);
                    try {
                      const orderId = await onCreateOrder(false); // false = not online payment, creates in Firestore
                      onPaymentSuccess(orderId);
                    } catch(err: any) {
                      setPaymentError(err.message || 'Order creation failed');
                      setIsProcessing(false);
                    }
                  }}
                  className="w-full py-4 bg-transparent border-2 border-[#2A1B18] text-[#2A1B18] rounded-xl font-bold hover:bg-[#2A1B18]/5 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  Pay on Collection
                </button>
              </div>
            )}

            {paymentError && <p className="text-red-500 text-sm mt-2">{paymentError}</p>}
         </div>
       </div>
    </div>
  );
};

const OrderInner = () => {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get('table');
  const storeParam = searchParams.get('store');
  const isCollection = !tableParam;

  const { cart, addToCart, removeFromCart, clearCart, addOrder, orders } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [activeQueueLength, setActiveQueueLength] = useState<number>(0);

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoading(true);
        const fallback = await getMenuItems();
        setMenuItems(fallback);
        if (fallback.length > 0) setActiveCategory(fallback[0].category);
      } catch (err: any) {
        console.error('Menu fetch failed:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, []);

  // Derive categories automatically from items
  const categoriesMap = new Map();
  menuItems.forEach(item => {
    if (!categoriesMap.has(item.category)) categoriesMap.set(item.category, []);
    categoriesMap.get(item.category).push(item);
  });

  const groupedMenu = Array.from(categoriesMap.keys()).map(cat => ({
    id: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
    items: categoriesMap.get(cat)
  }));


  // ScrollSpy Logic
  useEffect(() => {
    if (isLoading || groupedMenu.length === 0) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter(e => e.isIntersecting);
        if (intersecting.length > 0) {
          setActiveCategory(intersecting[0].target.id.replace('cat-', ''));
        }
      },
      { rootMargin: '-200px 0px -40% 0px', threshold: 0 }
    );

    document.querySelectorAll('section[id^="cat-"]').forEach(el => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [isLoading, menuItems]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(`cat-${id}`);
    if (element) {
      const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      const y = element.getBoundingClientRect().top + scrollY - 180;
      if (typeof window !== 'undefined') window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCreateGoOrder = async (isOnlinePayment: boolean = false): Promise<string> => {
    if (cart.length === 0) throw new Error("Cart is empty");

    const orderId = `ORD-${generateId().split('-')[0].toUpperCase()}`;

    // If online payment, the Square Cloud Function handles Firestore write & Email
    if (isOnlinePayment) return orderId;

    const newOrder = {
      id: orderId,
      customerName: customerInfo.name.trim(),
      customerPhone: customerInfo.phone,
      customerEmail: customerInfo.email,
      type: (isCollection ? 'collection' : 'dine-in') as any,
      isPaid: false,
      paymentMethod: 'cash',
      payment_status: 'unpaid',
      ...(tableParam ? { table_number: parseInt(tableParam as string), source: 'NFC' } : { source: 'Web' }),
      items: [...cart],
      total: cartTotal,
      tenant_id: SHOP_CONFIG.tenant_id,
      status: 'pending' as const,
      timestamp: new Date(),
    };

    try {
      await addOrder(newOrder as any);
      sendOrderNotificationEmail(newOrder as any);
      return orderId;
    } catch (e: any) {
      throw new Error('Order creation failed: ' + e.message);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    setCheckoutStep('success');
    clearCart();

    // Get queue length from the realtime context (decoupled)
    try {
      setActiveQueueLength(orders.filter((o: any) => !['completed', 'no_show'].includes(o.status)).length);
    } catch(e) {}
  };

  // Track order status via Firestore
  useEffect(() => {
    if (!completedOrderId) return;
    const unsub = streamSingleOrder(completedOrderId, (order) => {
      if (order) {
        setOrderStatus(order.status);
      } else {
        setOrderStatus('completed');
      }
    });
    return () => unsub();
  }, [completedOrderId]);

  // Derived estimated wait time based on queue
  const estimatedWaitMins = Math.max(5, activeQueueLength * 3); // 3 mins per ticket avg

  return (
    <div className="min-h-screen bg-brand-cacao pb-20 pt-8">
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="bg-[#FDF9F1] rounded-none p-6 text-center border-4 border-[#1A3C34] shadow-[8px_8px_0px_#1A3C34]">
          <h1 className="font-display text-4xl text-[#1A3C34] font-bold mb-2 uppercase tracking-[0.2em]">
            {isCollection ? 'Collection Order' : `Table ${tableParam}`}
          </h1>
          <p className="text-[#1A3C34]/80 font-bold tracking-widest uppercase text-xs">
            {isCollection ? 'Order ahead and pick up securely.' : 'Scan, order, relax. We bring it right to you.'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-brand-text/50 animate-pulse">Loading Live Menu...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 font-bold flex flex-col items-center gap-4">
          <AlertCircle size={48} />
          {error}
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="bg-[#FDF9F1]/95 backdrop-blur-md shadow-[0_4px_0px_#1A3C34] sticky z-40 py-4 border-b-4 border-[#1A3C34] top-0">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollBehavior: 'smooth' }}>
              <div className="flex space-x-4 pb-2">
                {groupedMenu.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`px-6 py-2.5 rounded-none font-bold whitespace-nowrap transition-all border-2 border-[#1A3C34] uppercase tracking-widest text-xs ${
                      activeCategory === cat.id
                      ? 'bg-[#D14836] text-white shadow-[4px_4px_0px_#1A3C34]'
                      : 'bg-white text-[#1A3C34] hover:shadow-[4px_4px_0px_#1A3C34] hover:-translate-y-1'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
            {groupedMenu.map((group) => (
              <section key={group.id} id={`cat-${group.id}`} className="mb-16 scroll-mt-48">
                <h2 className="font-display text-3xl font-bold text-[#1A3C34] mb-6 uppercase tracking-widest border-b-4 border-[#1A3C34] inline-block pr-8 pb-2">{group.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map((item: MenuItem) => (
                    <div key={item.id} className="bg-white rounded-none p-5 border-2 border-[#1A3C34] shadow-[4px_4px_0px_#1A3C34] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col justify-between group">
                       <div className="mb-4">
                         <h3 className="text-[#1A3C34] font-black text-lg mb-2 uppercase tracking-wide leading-tight">{item.name}</h3>
                       </div>
                       <div className="flex items-center justify-between mt-auto">
                         <span className="text-[#D14836] font-black text-xl tracking-widest">£{item.price.toFixed(2)}</span>
                         <button
                            onClick={() => { addToCart(item); setIsCartOpen(true); }}
                            className="w-12 h-12 rounded-none bg-white border-2 border-[#1A3C34] text-[#1A3C34] flex justify-center items-center font-black shadow-[2px_2px_0px_#1A3C34] hover:bg-[#D14836] hover:text-white hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex-shrink-0"
                          >
                            <Plus size={24} strokeWidth={3} />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 w-[calc(100%-3rem)] max-w-sm left-1/2 -translate-x-1/2 z-50 bg-[#1A3C34] text-[#FDF9F1] px-6 py-4 rounded-none border-4 border-[#D14836] font-black shadow-[8px_8px_0px_#D14836] hover:-translate-y-[2px] hover:shadow-[10px_10px_0px_#D14836] transition-all flex items-center justify-between uppercase tracking-widest"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#D14836] text-white w-8 h-8 rounded-none flex items-center justify-center text-sm font-bold border-2 border-[#FDF9F1]">{cart.reduce((s, i) => s + i.quantity, 0)}</div>
            <span>View Cart</span>
          </div>
          <span>£{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-display text-2xl font-bold text-brand-text">
                {checkoutStep === 'cart' ? 'Your Order' : checkoutStep === 'details' ? 'Complete Order' : 'Success!'}
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {checkoutStep === 'cart' && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                      <div>
                        <h4 className="font-bold text-brand-text">{item.name}</h4>
                        <p className="text-brand-pink text-sm font-bold">£{item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
                        <button className="text-gray-400 p-2" onClick={() => removeFromCart(item.id)}><Minus size={14} /></button>
                        <span className="font-bold text-brand-text w-4 text-center">{item.quantity}</span>
                        <button className="text-gray-400 p-2" onClick={() => addToCart(item)}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t">
                  <div className="flex justify-between mb-4 text-lg font-bold text-brand-text">
                    <span>Total</span>
                    <span>£{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setCheckoutStep('details')}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-brand-pink text-white rounded-xl font-bold hover:bg-brand-pink/90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 'details' && (
                  <SquareCheckoutForm 
                     cart={cart}
                     cartTotal={cartTotal}
                     onCreateOrder={handleCreateGoOrder}
                     onPaymentSuccess={handlePaymentSuccess}
                     onBack={() => setCheckoutStep('cart')}
                     isCollection={isCollection}
                     customerInfo={{...customerInfo, table: tableParam}}
                     setCustomerInfo={setCustomerInfo}
                  />
              
            )}

            {checkoutStep === 'success' && (
               <div className="flex-1 flex flex-col p-6">
                 <h2 className="text-3xl font-display font-bold text-center text-brand-text mb-2 mt-4">Live Tracking</h2>
                 <p className="text-gray-500 text-center mb-8">
                   Order Number: <span className="font-bold text-brand-text">#{completedOrderId?.substring(0, 8)}</span>
                 </p>
                 
                 <div className="flex-1">
                   <div className="relative pl-8 space-y-10 before:absolute before:inset-y-2 before:left-[1.35rem] before:w-0.5 before:bg-brand-rose/30">
                     
                     {/* Step 1: Received */}
                     <div className={`relative flex items-center gap-4 transition-all ${['pending','preparing','ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className="absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg bg-orange-400 text-white z-10 border-4 border-white">
                         <CheckCircle2 size={16} />
                       </div>
                       <div>
                         <h4 className="font-bold text-lg text-brand-text">Order Received</h4>
                         <p className="text-gray-500 text-sm">We've got your order and are checking it.</p>
                       </div>
                     </div>

                     {/* Step 2: Preparing */}
                     <div className={`relative flex items-center gap-4 transition-all ${['preparing','ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white ${['preparing','ready','completed'].includes(orderStatus) ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'}`}>
                         <ChefHat size={16} />
                       </div>
                       <div>
                         <h4 className="font-bold text-lg text-brand-text flex items-center gap-2">
                           Preparing
                           {orderStatus === 'preparing' && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span></span>}
                         </h4>
                         <p className="text-gray-500 text-sm">Our chefs are assembling your order.</p>
                       </div>
                     </div>

                     {/* Step 3: Ready */}
                     <div className={`relative flex items-center gap-4 transition-all ${['ready','completed'].includes(orderStatus) ? 'opacity-100' : 'opacity-40'}`}>
                       <div className={`absolute -left-12 w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 border-4 border-white ${['ready','completed'].includes(orderStatus) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                         <Check size={16} />
                       </div>
                       <div>
                         <h4 className={`font-bold text-lg ${['ready','completed'].includes(orderStatus) ? 'text-green-600' : 'text-brand-text'}`}>
                           {isCollection ? 'Ready for Pickup!' : 'On the Way!'}
                         </h4>
                         <p className="text-gray-500 text-sm">
                           {isCollection ? 'Please head to the counter.' : 'We are bringing it to your table now.'}
                         </p>
                       </div>
                     </div>

                   </div>
                 </div>

                 {/* ETA Block */}
                 {['pending', 'preparing'].includes(orderStatus) && (
                   <div className="bg-brand-rose/10 rounded-2xl p-4 flex items-center gap-4 mb-4 border border-brand-rose/20">
                     <Clock className="text-brand-pink" size={24} />
                     <div>
                       <p className="text-sm font-bold text-brand-text">Estimated Wait</p>
                       <p className="text-gray-600 text-sm">~ {estimatedWaitMins} minutes</p>
                     </div>
                   </div>
                 )}
                 
                 <button onClick={() => {setIsCartOpen(false); setCheckoutStep('cart'); setCompletedOrderId(null);}} className="w-full py-4 bg-brand-text text-white rounded-xl font-bold mt-4">Start New Order</button>
               </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default function OrderPage() {
  return (
    <Suspense fallback={<div>Loading Order System...</div>}>
      <OrderInner />
    </Suspense>
  );
}
