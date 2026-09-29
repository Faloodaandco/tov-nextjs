'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateId } from '@/utils/generateId';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, MessageCircle, Phone, ShoppingBag, Plus, Minus, X, ChevronDown, CreditCard, Store } from 'lucide-react';
import { buildWhatsAppLink, SHOP_CONFIG, LOCATIONS, getActiveLocation } from '@/config/shopConfig';
import { MENU_ITEMS } from '@/config/menuItems';
import { MenuItem } from '@/types';
import { isValidUKMobile, getPhoneError, normaliseUKPhone } from '@/lib/validation';

function getBookingTimeSlots(branch: string, dateStr: string): string[] {
  const isSlough = branch?.toLowerCase() === 'slough';
  let isWeekend = false;
  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    }
  } else {
    const today = new Date().getDay();
    isWeekend = today === 0 || today === 6;
  }

  if (isSlough) {
    if (isWeekend) {
      return [
        '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
        '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
        '00:00', '00:30',
      ];
    }
    return [
      '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
      '00:00', '00:30',
    ];
  }

  return [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
    '00:00', '00:30', '01:00', '01:30',
  ];
}

function buildBookingWhatsAppMessage(booking: { name: string; phone: string; email?: string; date: string; time: string; guests: number; id: string; preOrderItems?: any[]; preOrderTotal?: number; paymentMethod?: string; branchName?: string; notes?: string }) {
  const lines = [
    `📋 *NEW TABLE BOOKING (${booking.branchName?.toUpperCase() || 'HAYES'}) — ${booking.id}*`,
    ``,
    `👤 *Name:* ${booking.name}`,
    `📞 *Phone:* ${booking.phone}`
  ];
  if (booking.email) lines.push(`📧 *Email:* ${booking.email}`);
  
  lines.push(
    `📅 *Date:* ${booking.date}`,
    `🕐 *Time:* ${booking.time}`,
    `👥 *Guests:* ${booking.guests}`,
  );

  if (booking.notes) lines.push(`📝 *Notes:* ${booking.notes}`);

  // Pre-order items
  if (booking.preOrderItems && booking.preOrderItems.length > 0) {
    lines.push(``, `🍽️ *PRE-ORDER (ready on arrival):*`);
    booking.preOrderItems.forEach(item => {
      lines.push(`  • ${item.quantity}x ${item.name} — £${(item.price * item.quantity).toFixed(2)}`);
    });
    lines.push(`  *Total: £${booking.preOrderTotal?.toFixed(2)}*`);
    lines.push(`  💳 *Payment: ${booking.paymentMethod === 'online' ? 'Paid Online' : 'Pay in Restaurant (With Staff)'}*`);
  }

  lines.push(``, `⏰ Booked at: ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`);
  return lines.join('\n');
}

interface PreOrderItem extends MenuItem {
  quantity: number;
}

export default function BookClient() {
  const { bookings } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    branch: 'hayes',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  
  // Pre-order state
  const [showPreOrder, setShowPreOrder] = useState(false);
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'store' | 'online'>('store');
  const [showMenuPicker, setShowMenuPicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const timeSlots = useMemo(() => getBookingTimeSlots(formData.branch, formData.date), [formData.branch, formData.date]);

  useEffect(() => {
    if (formData.time && !timeSlots.includes(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [timeSlots, formData.time]);

  useEffect(() => {
    try {
      const activeLoc = getActiveLocation();
      if (activeLoc && activeLoc.id) {
        setFormData(prev => ({ ...prev, branch: activeLoc.id }));
      }
    } catch (e) {}
  }, []);

  const preOrderTotal = preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addPreOrderItem = (item: MenuItem) => {
    setPreOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removePreOrderItem = (id: string) => {
    setPreOrderItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastBookingTime = typeof window !== 'undefined' ? localStorage.getItem('last_booking_time') : null;
    if (lastBookingTime && Date.now() - parseInt(lastBookingTime) < 60000) {
      alert('You are making requests too quickly. Please wait 60 seconds.');
      return;
    }

    // Date and time validation
    if (!formData.date) {
      alert('Please select a date for your reservation.');
      return;
    }
    if (!formData.time) {
      alert('Please select a time slot for your reservation.');
      return;
    }

    // UK phone validation
    if (!isValidUKMobile(formData.phone)) {
      setPhoneError(getPhoneError(formData.phone) || 'Please enter a valid UK mobile number (07XXX XXXXXX)');
      setIsSubmitting(false);
      return;
    }
    setPhoneError(null);

    setIsSubmitting(true);
    try {
      const bookingId = `BK-${generateId().split('-')[0].toUpperCase()}`;
      const booking: any = {
        id: bookingId,
        customerName: formData.name,
        name: formData.name,
        customerPhone: normaliseUKPhone(formData.phone),
        phone: normaliseUKPhone(formData.phone),
        email: formData.email || '',
        customerEmail: formData.email || '',
        date: formData.date,
        time: formData.time,
        guests: formData.guests,
        notes: formData.notes,
        status: 'PENDING' as const,
        branch: formData.branch,
        location: formData.branch,
        tenant_id: LOCATIONS[formData.branch as keyof typeof LOCATIONS]?.tenant_id || LOCATIONS.hayes.tenant_id,
      };

      // Add pre-order if items selected
      if (preOrderItems.length > 0) {
        booking.preOrderItems = preOrderItems.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: i.category,
        }));
        booking.preOrderTotal = preOrderTotal;
        booking.paymentMethod = paymentMethod;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(booking),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit booking');
      }

      const data = await response.json();
      const confirmedId = data.bookingId || data.id || bookingId;

      setConfirmedBooking({ ...booking, id: confirmedId, ...formData, preOrderItems, preOrderTotal, paymentMethod });
      if (typeof window !== 'undefined') localStorage.setItem('last_booking_time', Date.now().toString());

      // WhatsApp notification
      const message = buildBookingWhatsAppMessage({
        ...formData,
        id: confirmedId,
        branchName: LOCATIONS[formData.branch as keyof typeof LOCATIONS]?.name || 'HAYES',
        preOrderItems: preOrderItems.length > 0 ? preOrderItems : undefined,
        preOrderTotal: preOrderTotal > 0 ? preOrderTotal : undefined,
        paymentMethod: paymentMethod,
      });
      const whatsappUrl = buildWhatsAppLink(message);
      if (typeof window !== 'undefined') window.open(whatsappUrl, '_blank');

      setFormData(prev => ({ ...prev, name: '', phone: '', email: '', date: '', time: '', guests: 2, notes: '' }));
      setPreOrderItems([]);
    } catch (e: any) {
      alert(e.message || 'Error booking table.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmed booking success screen
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-bg-sand flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg p-10 rounded-[2rem] shadow-2xl shadow-pine/5 border border-pine/10 text-center space-y-6">
          <div className="w-24 h-24 bg-pine/5 text-pine rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <div>
            <h2 className="font-display text-4xl font-black text-pine mb-3 tracking-tight">Booking Sent!</h2>
            <p className="text-pine/60 text-lg">Your reservation has been sent via WhatsApp. We'll confirm shortly.</p>
          </div>

          <div className="bg-bg-sand p-6 rounded-2xl border border-pine/10 border-dashed space-y-2">
            <p className="text-xs text-pine/50 uppercase tracking-widest font-bold">Booking Reference</p>
            <p className="font-mono text-3xl font-black text-terracotta">{confirmedBooking.id}</p>
            <p className="text-sm text-pine/70 mt-2 font-medium">
              {confirmedBooking.guests} guests • {confirmedBooking.date} • {confirmedBooking.time}
            </p>
          </div>

          {/* Pre-order summary */}
          {confirmedBooking.preOrderItems?.length > 0 && (
            <div className="bg-bg-sand p-6 rounded-2xl border border-pine/10 text-left">
              <p className="text-xs text-pine/50 uppercase tracking-widest font-bold mb-4">🍽️ Pre-Order — Ready on Arrival</p>
              {confirmedBooking.preOrderItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-1.5">
                  <span className="text-pine font-medium">{item.quantity}x {item.name}</span>
                  <span className="font-bold text-pine">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-pine/10 mt-3 pt-3 flex justify-between font-bold text-pine text-lg">
                <span>Total</span>
                <span>£{confirmedBooking.preOrderTotal?.toFixed(2)}</span>
              </div>
              <p className="text-xs text-pine/50 mt-3 font-medium">
                {confirmedBooking.paymentMethod === 'online' ? '✅ Paid online' : '💳 Pay in restaurant on arrival'}
              </p>
            </div>
          )}

          <a
            href={buildWhatsAppLink(buildBookingWhatsAppMessage(confirmedBooking))}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] text-white rounded-full font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all"
          >
            <MessageCircle size={24} /> Resend via WhatsApp
          </a>

          <button
            onClick={() => setConfirmedBooking(null)}
            className="w-full py-4 bg-white text-pine border border-pine/20 rounded-full font-bold mt-2 hover:bg-pine hover:text-white transition-all"
          >
            Book Another Table
          </button>
        </div>
      </div>
    );
  }

  // Available menu items for pre-ordering (TOV specific categories)
  const preOrderMenuItems = MENU_ITEMS.filter(item => 
    ['main', 'grill', 'starter', 'dessert', 'drinks', 'special'].includes(item.category)
  );

  return (
    <div className="min-h-screen bg-bg-sand flex items-center justify-center p-4 py-24 selection:bg-terracotta selection:text-white">
      <div className="bg-white w-full max-w-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-pine/5 border border-pine/10">
        <h2 className="font-display text-4xl md:text-5xl font-black text-pine mb-4 text-center tracking-tight">Reserve a Table</h2>
        <p className="text-center text-pine/60 mb-10 text-lg">Secure your spot at Taste of Village Hayes, and optionally pre-order your heritage dishes.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Branch</label>
              <select
                className="w-full p-4 bg-bg-sand rounded-xl border border-pine/10 focus:border-terracotta outline-none text-pine font-medium appearance-none"
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
              >
                {Object.values(LOCATIONS).map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Full Name</label>
              <input
                type="text" required
                className="w-full p-4 bg-bg-sand rounded-xl border border-pine/10 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all text-pine font-medium"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. Tariq Khan"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Phone (Required)</label>
              <input
                type="tel" required
                className={`w-full p-4 bg-bg-sand rounded-xl border focus:ring-2 outline-none transition-all text-pine font-medium ${
                  phoneError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                    : 'border-pine/10 focus:border-terracotta focus:ring-terracotta/20'
                }`}
                value={formData.phone}
                onChange={e => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (phoneError) setPhoneError(getPhoneError(e.target.value));
                }}
                onBlur={() => {
                  if (formData.phone.trim()) setPhoneError(getPhoneError(formData.phone));
                }}
                placeholder="07XXX XXXXXX"
                maxLength={15}
              />
              {phoneError && (
                <p className="text-red-500 text-xs font-bold mt-2">{phoneError}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Email (Required)</label>
              <input
                type="email" required
                className="w-full p-4 bg-bg-sand rounded-xl border border-pine/10 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all text-pine font-medium"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email Address"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-3">Select Date</label>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                {Array.from({ length: 14 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const isSelected = formData.date === date.toISOString().split('T')[0];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, date: date.toISOString().split('T')[0] })}
                      className={`flex-shrink-0 snap-center w-20 py-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected 
                          ? 'border-terracotta bg-terracotta text-white shadow-[2px_2px_0px_rgba(20,40,29,1)]' 
                          : 'border-pine/10 bg-white text-pine hover:border-pine/30 hover:bg-pine/5'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-black tracking-widest mb-1 opacity-80">
                        {date.toLocaleDateString('en-GB', { weekday: 'short' })}
                      </span>
                      <span className="text-2xl font-display font-black leading-none">
                        {date.getDate()}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-80">
                        {date.toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-3">Select Time</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {timeSlots.map(time => {
                  const isSelected = formData.time === time;
                  
                  // Availability Sync
                  const existingBookingsForSlot = bookings?.filter((b: any) => 
                    b.date === formData.date && 
                    b.time === time && 
                    b.status !== 'CANCELLED' && 
                    b.status !== 'cancelled' &&
                    (b.branch === formData.branch || b.location === formData.branch)
                  ).length || 0;
                  
                  const isFullyBooked = existingBookingsForSlot >= 5; // Max 5 bookings per 30m slot

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isFullyBooked}
                      onClick={() => setFormData({ ...formData, time })}
                      className={`py-3.5 rounded-xl border-2 text-sm font-bold transition-all relative overflow-hidden ${
                        isFullyBooked 
                          ? 'opacity-40 cursor-not-allowed border-pine/5 bg-pine/5 text-pine/40 line-through'
                          : isSelected
                            ? 'border-pine bg-pine text-white shadow-[2px_2px_0px_rgba(20,40,29,1)]'
                            : 'border-pine/10 bg-white text-pine hover:border-pine/30 hover:bg-pine/5 hover:-translate-y-0.5'
                      }`}
                    >
                      {time}
                      {isFullyBooked && (
                        <span className="absolute bottom-0 left-0 w-full text-[8px] bg-red-500/10 text-red-600 tracking-widest font-black uppercase text-center">Full</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Guests</label>
            <select
              className="w-full p-4 bg-bg-sand rounded-xl border border-pine/10 focus:border-terracotta outline-none text-pine font-medium appearance-none"
              value={formData.guests}
              onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={n}>{n} People</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-pine uppercase tracking-widest mb-2">Special Requests / Notes</label>
            <textarea
              className="w-full p-4 bg-bg-sand rounded-xl border border-pine/10 focus:border-terracotta outline-none text-pine font-medium"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests? (Optional)"
            />
          </div>

          {/* ─── Pre-Order Toggle ─── */}
          <div className="border-t border-pine/10 pt-8 mt-8">
            <button
              type="button"
              onClick={() => setShowPreOrder(!showPreOrder)}
              className="w-full flex items-center justify-between p-5 bg-pine/5 rounded-2xl border border-pine/10 hover:border-pine/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <ShoppingBag size={18} className="text-terracotta group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-pine text-sm">Pre-Order Your Food</p>
                  <p className="text-pine/50 text-xs">Arrive to a table already full of hot food.</p>
                </div>
              </div>
              <ChevronDown size={20} className={`text-pine/50 transition-transform ${showPreOrder ? 'rotate-180' : ''}`} />
            </button>

            {showPreOrder && (
              <div className="mt-6 space-y-4 animate-fade-in">
                {/* Selected items */}
                {preOrderItems.length > 0 && (
                  <div className="space-y-3">
                    {preOrderItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-pine text-white p-4 rounded-xl shadow-lg">
                        <div>
                          <p className="font-bold text-sm">{item.name}</p>
                          <p className="text-white/60 text-xs">£{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => removePreOrderItem(item.id)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold w-6 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => addPreOrderItem(item)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                            <Plus size={14} />
                          </button>
                          <button type="button" onClick={() => setPreOrderItems(prev => prev.filter(i => i.id !== item.id))} className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/40 transition-colors ml-1">
                            <X size={14} className="text-red-200" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-pine p-3 bg-bg-sand rounded-xl border border-pine/10">
                      <span>Pre-Order Total</span>
                      <span className="text-terracotta">£{preOrderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Add items button */}
                <button
                  type="button"
                  onClick={() => setShowMenuPicker(!showMenuPicker)}
                  className="w-full py-4 border-2 border-dashed border-pine/20 rounded-2xl text-pine font-bold text-sm hover:border-terracotta hover:bg-terracotta/5 hover:text-terracotta transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Items to Pre-Order
                </button>

                {/* Menu picker */}
                {showMenuPicker && (
                  <div className="max-h-72 overflow-y-auto space-y-2 border border-pine/10 rounded-2xl p-4 bg-white shadow-inner">
                    {preOrderMenuItems.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addPreOrderItem(item)}
                        className="w-full text-left p-4 rounded-xl hover:bg-pine/5 transition-colors flex justify-between items-center group border border-transparent hover:border-pine/10"
                      >
                        <div>
                          <p className="font-bold text-pine text-sm">{item.name}</p>
                          <p className="text-pine/60 text-xs capitalize mt-0.5">{item.category}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-terracotta font-bold text-sm">£{item.price.toFixed(2)}</span>
                          <div className="w-6 h-6 bg-terracotta/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={12} className="text-terracotta" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Payment method */}
                {preOrderItems.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <p className="text-xs font-bold text-pine uppercase tracking-widest">Payment Method</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('store')}
                        className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                          paymentMethod === 'store'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-pine/10 hover:border-pine/30'
                        }`}
                      >
                        <Store size={24} className={paymentMethod === 'store' ? 'text-terracotta' : 'text-pine/40'} />
                        <span className="text-sm font-bold text-pine">Pay In Restaurant</span>
                        <span className="text-[10px] text-pine/50 uppercase tracking-widest">With staff during dining</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online')}
                        className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                          paymentMethod === 'online'
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-pine/10 hover:border-pine/30'
                        }`}
                      >
                        <CreditCard size={24} className={paymentMethod === 'online' ? 'text-terracotta' : 'text-pine/40'} />
                        <span className="text-sm font-bold text-pine">Pay Online</span>
                        <span className="text-[10px] text-pine/50 uppercase tracking-widest">Coming soon</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-terracotta text-white font-bold text-lg rounded-full hover:bg-[#a64036] transition-all shadow-xl hover:-translate-y-0.5 disabled:opacity-50 mt-6"
          >
            {isSubmitting ? 'Requesting...' : preOrderItems.length > 0 ? `Confirm Booking (£${preOrderTotal.toFixed(2)})` : 'Request Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
