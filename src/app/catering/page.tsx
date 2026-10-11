'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  UtensilsCrossed, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles, 
  ChefHat, 
  Coffee,
  ArrowRight
} from 'lucide-react';
import { LOCATIONS, buildWhatsAppLink } from '@/config/shopConfig';

interface PackageOption {
  id: string;
  name: string;
  subtitle: string;
  guests: string;
  price: number;
  highlight?: boolean;
  tag?: string;
  items: string[];
}

const DAAWAT_PACKAGES: PackageOption[] = [
  {
    id: 'daawat-small',
    name: 'Daawat-e-Khaas (Family)',
    subtitle: 'Perfect for intimate family dinners and weekend gatherings',
    guests: '4 – 5 Guests',
    price: 65,
    tag: 'Popular',
    items: [
      '1× Full Chicken Karahi (Slow-simmered bone-in Lahori style)',
      '1× Fragrant Chicken Biryani Pot with boiled eggs & plum chutney',
      '4× Seekh Kebabs + 4× Succulent Chicken Tikka Boti',
      '4× Fresh Tandoori Naans / Roghni Naans',
      'Fresh Garden Salad & Fresh Mint Raita',
      '4× Cold Drinks or 1L Traditional Mango Lassi',
    ],
  },
  {
    id: 'daawat-medium',
    name: 'Daawat-e-Khaas (Royal)',
    subtitle: 'The ultimate Punjabi feast for special guests & celebrations',
    guests: '5 – 7 Guests',
    price: 95,
    highlight: true,
    tag: 'Best Value',
    items: [
      '1× Full Tender Lamb Karahi (Gujranwala recipe with desi ghee aroma)',
      '1× Full Chicken Karahi or Lahori Chana Masala',
      '2× Large Chicken Biryani Pots',
      '6× Seekh Kebabs + 6× Malai Boti + 4× Sizzling Lamb Chops',
      '6× Fresh Artisan Roghni Naans',
      'Large Mint Raita & Fresh Onion-Cucumber Salad',
      'Traditional Shahi Kheer or 4× Village Falooda Cups',
    ],
  },
  {
    id: 'daawat-large',
    name: 'Daawat-e-Khaas (Grand Feast)',
    subtitle: 'Large family milestones, Nikkah celebrations & parties',
    guests: '10 – 15 Guests',
    price: 195,
    tag: 'Feast of the Village',
    items: [
      '2× Full Lamb Karahi + 1× Signature Chicken Nihari or Haleem Handi',
      '3× Large Biryani Pots (Lamb & Chicken)',
      'Grand Mixed Grill: 12× Seekh Kebabs, 12× Tikka Boti, 8× Lamb Chops & 8× Wings',
      '15× Assorted Naans (Roghni, Garlic & Plain Tandoori)',
      'Large Bowls of Fresh Salad, Raita & Spicy Chutneys',
      '2× Grand Dessert Platters (Gajar Halwa, Shahi Kheer or Falooda)',
    ],
  },
];

export default function CateringPage() {
  const [selectedBranch, setSelectedBranch] = useState<'hayes' | 'slough'>('hayes');
  const [guestCount, setGuestCount] = useState<number>(20);
  const [cateringType, setCateringType] = useState<'daawat' | 'corporate' | 'subscription'>('daawat');
  const [needDessert, setNeedDessert] = useState<boolean>(true);
  const [needChafing, setNeedChafing] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');

  // Per head calculation for custom guest counts
  const baseRatePerHead = cateringType === 'corporate' ? 12.5 : 15.0;
  const dessertAddon = needDessert ? 3.0 : 0;
  const chafingAddon = needChafing ? 2.0 : 0;
  const totalPerHead = baseRatePerHead + dessertAddon + chafingAddon;
  const estimatedTotal = Math.round(totalPerHead * guestCount);

  const getWhatsAppEnquiryText = () => {
    let msg = `Salam Taste of Village (${selectedBranch.toUpperCase()})!\n`;
    msg += `I am interested in catering details:\n`;
    msg += `• Type: ${cateringType === 'daawat' ? 'Daawat-e-Khaas Feast' : cateringType === 'corporate' ? 'Corporate Office Catering' : 'Monthly Lunch Subscription'}\n`;
    msg += `• Est. Guests: ${guestCount}\n`;
    if (eventDate) msg += `• Target Date: ${eventDate}\n`;
    msg += `• Desserts included: ${needDessert ? 'Yes' : 'No'}\n`;
    msg += `• Hot Chafing Dishes: ${needChafing ? 'Yes' : 'No'}\n`;
    msg += `• Estimated Budget: ~£${estimatedTotal} (£${totalPerHead.toFixed(2)}/head)\n`;
    if (contactName) msg += `• Name: ${contactName}\n`;
    if (contactPhone) msg += `• Phone: ${contactPhone}\n`;
    return msg;
  };

  const branchPhone = selectedBranch === 'slough' ? LOCATIONS.slough.phone : LOCATIONS.hayes.phone;

  return (
    <div className="min-h-screen bg-bg-sand text-pine selection:bg-terracotta selection:text-white pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pine/5 border border-pine/10 text-terracotta text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> 100% Halal Live Desi Catering &amp; Subscriptions
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-pine tracking-tight mb-6">
          Authentic Punjabi &amp; Lahori Catering <br className="hidden sm:inline" />
          <span className="italic text-terracotta font-serif">Daawat-e-Khaas &amp; Corporate</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-pine/80 leading-relaxed font-sans mb-8">
          From intimate family reunions and weddings to corporate boardrooms and regular office lunch tiffins across Hayes, Slough, Heathrow, and West London. Hand-crafted in authentic clay tandoors and bubbling karahi pots.
        </p>

        {/* Branch Quick Toggle */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-white/70 border border-pine/10 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => setSelectedBranch('hayes')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              selectedBranch === 'hayes'
                ? 'bg-pine text-white shadow-md'
                : 'text-pine/70 hover:text-pine hover:bg-pine/5'
            }`}
          >
            Hayes (UB4 0RU)
          </button>
          <button
            onClick={() => setSelectedBranch('slough')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              selectedBranch === 'slough'
                ? 'bg-pine text-white shadow-md'
                : 'text-pine/70 hover:text-pine hover:bg-pine/5'
            }`}
          >
            Slough (SL1 4XL)
          </button>
        </div>
      </section>

      {/* Daawat-e-Khaas Package Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-pine/10 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-terracotta">Signature Feasts</span>
            <h2 className="text-3xl font-display font-medium text-pine mt-1">Daawat-e-Khaas Packages</h2>
            <p className="text-sm text-pine/70 mt-1">Pre-configured feast boxes ready for prompt collection or scheduled delivery.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck size={16} /> 100% Certified Halal Meat Only
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {DAAWAT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 border ${
                pkg.highlight
                  ? 'bg-pine text-bg-sand border-pine shadow-xl ring-2 ring-terracotta/40 -translate-y-2'
                  : 'bg-white/80 text-pine border-pine/10 shadow-sm hover:shadow-md hover:border-terracotta/30'
              }`}
            >
              {pkg.tag && (
                <span
                  className={`absolute -top-3.5 left-8 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
                    pkg.highlight ? 'bg-terracotta text-white' : 'bg-pine/10 text-pine border border-pine/10'
                  }`}
                >
                  {pkg.tag}
                </span>
              )}

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-widest ${pkg.highlight ? 'text-amber-300' : 'text-terracotta'}`}>
                    {pkg.guests}
                  </span>
                  <div className="text-3xl font-display font-bold">
                    £{pkg.price}
                    <span className="text-xs font-normal opacity-70 ml-1">inc. VAT</span>
                  </div>
                </div>

                <h3 className="text-2xl font-display font-semibold mb-2">{pkg.name}</h3>
                <p className={`text-xs leading-relaxed mb-6 ${pkg.highlight ? 'text-bg-sand/80' : 'text-pine/70'}`}>
                  {pkg.subtitle}
                </p>

                <div className={`h-px w-full my-6 ${pkg.highlight ? 'bg-white/15' : 'bg-pine/10'}`} />

                <ul className="space-y-3 mb-8">
                  {pkg.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2
                        size={16}
                        className={`shrink-0 mt-0.5 ${pkg.highlight ? 'text-amber-300' : 'text-emerald-700'}`}
                      />
                      <span className={pkg.highlight ? 'text-bg-sand/90' : 'text-pine/85'}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={buildWhatsAppLink(`Salam! I'd like to book the ${pkg.name} (£${pkg.price}) for ${selectedBranch.toUpperCase()} branch.`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3.5 px-6 rounded-full text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                  pkg.highlight
                    ? 'bg-terracotta text-white hover:bg-white hover:text-pine shadow-md'
                    : 'bg-pine text-white hover:bg-terracotta shadow-sm'
                }`}
              >
                <MessageCircle size={15} /> Book on WhatsApp
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate & Monthly Lunch Subscription Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Corporate Catering Card */}
          <div className="bg-white/80 rounded-3xl p-8 sm:p-10 border border-pine/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 text-terracotta text-xs font-bold uppercase tracking-widest mb-3">
              <Building2 size={18} /> Business &amp; Events
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-medium text-pine mb-4">
              Corporate Office Catering
            </h3>
            <p className="text-sm text-pine/80 leading-relaxed mb-6">
              Tailored hot buffet chafers or individually labeled Halal meal boxes delivered on time to your office in <strong>Slough Trading Estate</strong>, <strong>Heathrow Airport Business Park</strong>, <strong>Stockley Park</strong>, or <strong>Uxbridge</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-bg-sand/60 border border-pine/5">
                <span className="block text-xl font-display font-bold text-pine">From £12.50</span>
                <span className="text-xs text-pine/70">Per head with hot mains, fresh naan, salad &amp; drinks</span>
              </div>
              <div className="p-4 rounded-2xl bg-bg-sand/60 border border-pine/5">
                <span className="block text-xl font-display font-bold text-pine">Chafing Setup</span>
                <span className="text-xs text-pine/70">Hot buffet chafing dishes &amp; serving cutlery available</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-pine/80 mb-8">
              <li className="flex items-center gap-2">✓ VAT invoices provided for corporate expense accounts</li>
              <li className="flex items-center gap-2">✓ Accommodates vegetarian, gluten-free, and nut-allergy dietary requests</li>
              <li className="flex items-center gap-2">✓ Guaranteed prompt delivery for scheduled boardroom lunch hours</li>
            </ul>

            <button
              onClick={() => {
                setCateringType('corporate');
                const el = document.getElementById('catering-estimator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-terracotta hover:text-pine transition-colors"
            >
              Calculate Corporate Estimate <ArrowRight size={14} />
            </button>
          </div>

          {/* Monthly Lunch Subscription (Tiffin) Card */}
          <div className="bg-white/80 rounded-3xl p-8 sm:p-10 border border-pine/10 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 text-terracotta text-xs font-bold uppercase tracking-widest mb-3">
              <Calendar size={18} /> Daily Hot Food
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-medium text-pine mb-4">
              Monthly Lunch Subscriptions
            </h3>
            <p className="text-sm text-pine/80 leading-relaxed mb-6">
              Stop settling for cold sandwiches. Enjoy a fresh, authentic hot Lahori meal every working day (Monday – Friday) delivered straight to your workplace or home.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-bg-sand/60 border border-pine/5">
                <span className="block text-xl font-display font-bold text-pine">£140 / mo</span>
                <span className="text-xs text-pine/70">Single Plan (~£7.00/meal, 20 hot weekday lunches)</span>
              </div>
              <div className="p-4 rounded-2xl bg-bg-sand/60 border border-pine/5">
                <span className="block text-xl font-display font-bold text-pine">£250 / mo</span>
                <span className="text-xs text-pine/70">Executive 2-Person (~£6.25/meal per person)</span>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-pine/80 mb-8">
              <li className="flex items-center gap-2">✓ Rotating daily menu (Chicken Karahi, Biryani, Daal Mash, BBQ, Haleem)</li>
              <li className="flex items-center gap-2">✓ Includes fresh Tandoori Roti or Naan + crisp salad</li>
              <li className="flex items-center gap-2">✓ Pause or skip days anytime with 24 hours notice on WhatsApp</li>
            </ul>

            <a
              href={buildWhatsAppLink(`Salam! I'd like to subscribe to the Taste of Village Monthly Lunch Plan (${selectedBranch.toUpperCase()}). Please share the active weekday menu!`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-terracotta hover:text-pine transition-colors"
            >
              Enquire About Lunch Subscription <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Catering & Daawat Quote Estimator */}
      <section id="catering-estimator" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-pine text-bg-sand rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Instant Estimate</span>
            <h2 className="text-3xl sm:text-4xl font-display font-medium text-bg-sand mt-1">
              Custom Catering Quote Estimator
            </h2>
            <p className="text-xs sm:text-sm text-bg-sand/80 mt-2">
              Select your event details below to get an instant budget estimate and send it directly to our catering manager via WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Catering Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-bg-sand/70 mb-2">
                Service Type
              </label>
              <select
                value={cateringType}
                onChange={(e) => setCateringType(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                <option value="daawat" className="text-pine">Daawat-e-Khaas (Family / Party)</option>
                <option value="corporate" className="text-pine">Corporate Buffet / Lunchboxes</option>
                <option value="subscription" className="text-pine">Monthly Lunch Subscription</option>
              </select>
            </div>

            {/* Guest Count Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-bg-sand/70">
                  Guest Count: <span className="text-white font-bold text-sm">{guestCount} people</span>
                </label>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                step="5"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-terracotta cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-bg-sand/50 mt-1">
                <span>10</span>
                <span>50</span>
                <span>100</span>
                <span>200+</span>
              </div>
            </div>

            {/* Contact Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-bg-sand/70 mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tariq Khan"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-bg-sand/70 mb-2">
                Event Date (Optional)
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>

          {/* Add-ons Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 pt-4 border-t border-white/10">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={needDessert}
                onChange={(e) => setNeedDessert(e.target.checked)}
                className="w-4 h-4 accent-terracotta rounded"
              />
              <span className="text-xs sm:text-sm text-bg-sand/90">
                Include Traditional Desserts (+£3.00/head)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={needChafing}
                onChange={(e) => setNeedChafing(e.target.checked)}
                className="w-4 h-4 accent-terracotta rounded"
              />
              <span className="text-xs sm:text-sm text-bg-sand/90">
                Hot Chafing Dishes &amp; Burners (+£2.00/head)
              </span>
            </label>
          </div>

          {/* Total & Action Bar */}
          <div className="bg-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-bg-sand/70 block">Estimated Package Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-display font-bold text-amber-300">£{estimatedTotal}</span>
                <span className="text-xs text-bg-sand/70">
                  (approx. £{totalPerHead.toFixed(2)} per guest)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={buildWhatsAppLink(getWhatsAppEnquiryText())}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial py-3.5 px-6 rounded-full bg-terracotta text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-pine transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Request Quote on WhatsApp
              </a>
              <a
                href={`tel:${branchPhone}`}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Call Branch Directly"
              >
                <PhoneCall size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
