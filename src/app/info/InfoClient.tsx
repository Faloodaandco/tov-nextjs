'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, MapPin, Shield, RefreshCw, Leaf, HelpCircle, ChevronRight } from 'lucide-react';
import { SHOP_CONFIG } from '@/config/shopConfig';

type TabId = 'terms' | 'allergies' | 'privacy' | 'returns' | 'food' | 'faq';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'faq', label: 'General FAQs', icon: <HelpCircle size={18} /> },
  { id: 'allergies', label: 'Allergen Guide', icon: <AlertTriangle size={18} /> },
  { id: 'food', label: 'Food & Hygiene', icon: <Leaf size={18} /> },
  { id: 'returns', label: 'Returns Policy', icon: <RefreshCw size={18} /> },
  { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={18} /> },
  { id: 'terms', label: 'Terms & Conditions', icon: <MapPin size={18} /> },
];

function InfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('faq');

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabId;
    if (tabParam && TABS.map(t => t.id).includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    router.push(`/info?tab=${tabId}`);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is all meat HMC Halal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we buy exclusively from HMC certified halal suppliers."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer catering for large events or weddings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, catering and large event orders can be made. Please book 2 weeks before the event to ensure availability and proper preparation."
        }
      },
      {
        "@type": "Question",
        "name": "Are your curries made fresh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our curries are made fresh."
        }
      }
    ]
  });

  return (
    <div className="min-h-screen bg-[#F4F1EA] pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-terracotta/20 font-sans text-pine">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <h1 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light mb-6">
            Help & Legal Hub
          </h1>
          <div className="flex items-center gap-5 mb-8">
            <div className="h-[0.5px] w-16 md:w-32 bg-gradient-to-r from-transparent to-pine/40"></div>
            <span className="text-xl text-terracotta/90 drop-shadow-sm">✤</span>
            <div className="h-[0.5px] w-16 md:w-32 bg-gradient-to-l from-transparent to-pine/40"></div>
          </div>
          <p className="text-pine/60 text-[10px] md:text-[11px] font-sans tracking-[0.3em] uppercase font-bold max-w-xl mx-auto">
            Everything you need to know about navigating the Taste of Village experience, transparently and safely.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          
          {/* Side Navigation */}
          <div className="md:w-1/4 flex-shrink-0">
            <div className="sticky top-32 bg-[#FBF9F4] p-6 border-[0.5px] border-pine/20 space-y-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center justify-between px-2 py-4 font-sans text-[10px] tracking-[0.25em] uppercase font-medium transition-all ${
                    activeTab === tab.id
                    ? 'text-terracotta border-b-[0.5px] border-terracotta/30'
                    : 'text-pine/70 hover:text-pine border-b-[0.5px] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={activeTab === tab.id ? 'text-terracotta' : 'text-pine/50'}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <span className="text-terracotta">✤</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="md:w-3/4 bg-[#FBF9F4] p-8 md:p-12 border-[0.5px] border-pine/20 animate-fade-in min-h-[60vh]">
            
            {activeTab === 'faq' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <HelpCircle className="text-terracotta"/> General FAQs
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="font-sans font-bold text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-pine/80 mb-3">Is all meat HMC Halal?</h4>
                    <p className="text-pine/70 leading-relaxed text-sm">Yes, we buy exclusively from HMC certified halal suppliers.</p>
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-pine/80 mb-3">Do you offer catering for large events or weddings?</h4>
                    <p className="text-pine/70 leading-relaxed text-sm">Yes, catering and large event orders can be made. Please book 2 weeks before the event to ensure availability and proper preparation.</p>
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-pine/80 mb-3">Are your curries made fresh?</h4>
                    <p className="text-pine/70 leading-relaxed text-sm">Yes, all our curries are made fresh. We pride ourselves on preparing our dishes daily using authentic, fresh ingredients.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'allergies' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <AlertTriangle className="text-terracotta"/> Allergen Guide
                </h2>
                <div className="bg-terracotta/10 border-l-4 border-terracotta p-6 rounded-r-2xl">
                  <p className="text-terracotta font-bold text-lg mb-2">CRITICAL NOTICE REGARDING SEVERE ALLERGIES</p>
                  <p className="text-pine/80 leading-relaxed font-medium">
                    Taste of Village operates a bustling, open kitchen where cross-contamination is a fundamental risk. We use shared equipment to prepare items containing severe allergens.
                  </p>
                </div>
                
                <div className="space-y-6 text-pine/70 leading-relaxed text-sm">
                  <p><strong>NUTS & SEEDS:</strong> Pistachios, almonds, and various seeds are standard ingredients scattered freely across our kitchen and used in many traditional curries and desserts. <strong>If you have a severe nut allergy, we strongly advise against dining with us to guarantee your safety.</strong></p>
                  
                  <p><strong>DAIRY:</strong> Ghee, butter, milk, and yogurt form the bedrock of authentic Indian and Pakistani cuisine. Very few items are truly dairy-free, and cross-contamination is highly likely across grills and curries.</p>

                  <p><strong>GLUTEN & WHEAT:</strong> Naans, rotis, and samosas contain heavy gluten and are prepared on standard prep areas.</p>

                  <p className="italic bg-bg-sand p-6 rounded-2xl border border-pine/10 mt-8 font-medium">
                    While we maintain top hygiene standards, we CANNOT and DO NOT guarantee that any single item is 100% free of nuts, dairy, or gluten. You consume our products at your own risk if you suffer from anaphylaxis or severe allergic reactions.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'food' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <Leaf className="text-terracotta"/> Food & Hygiene Standards
                </h2>
                
                <div className="space-y-8 text-pine/70 leading-relaxed text-sm">
                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">100% Halal Guarantee</h3>
                    <p>Every single ingredient and meat product entering our premises is meticulously checked to ensure it is HMC certified Halal. We do not prepare, serve, or allow any non-halal items or alcohol into our premises.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Hygiene & Preparation</h3>
                    <p>Our kitchen adheres to the highest local authority guidelines for food safety. Staff wear gloves during prep handling, and our surfaces undergo intensive deep cleans every single shift cycle to prevent bacterial spread.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Sourcing</h3>
                    <p>We source our meats exclusively from certified HMC suppliers and import authentic spices directly from South Asia to preserve the true heritage taste of our curries and grills.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <RefreshCw className="text-terracotta"/> Return & Refund Policy
                </h2>
                
                <div className="space-y-6 text-pine/70 leading-relaxed text-sm">
                  <p>Due to the perishable nature of hot food, our return policy operates on strict parameters inline with standard food delivery consumer rights.</p>

                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Order Accuracy & Quality</h3>
                    <p>If you receive an incorrect item, or if the food quality falls significantly below our standards, you must report this to us <strong>within 1 hour</strong> of collection or delivery. Please bring the item back to the counter, or send photographic evidence if requested.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Refunds</h3>
                    <p>Validated complaints will be compensated via a direct replacement or a refund. Refunds processed via Stripe or card terminal take 3-5 business days to clear into your account. We do not offer cash refunds for card payments.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Change of Mind</h3>
                    <p>Because our kitchen begins preparation immediately upon receiving an order, we strictly do not offer refunds or cancellations for "change of mind" once the order ticket has printed in the kitchen.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <Shield className="text-terracotta"/> Privacy Policy
                </h2>
                
                <div className="space-y-6 text-pine/70 leading-relaxed text-sm">
                  <p>Taste of Village ("we", "our", "us") respects your privacy. This policy outlines how we collect, process, and protect your data.</p>

                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">What We Collect</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Order Data:</strong> Name, phone number, and order history strictly for fulfilling your collection/booking and loyalty rewards.</li>
                      <li><strong>Analytics:</strong> Anonymous usage data to help us improve the website experience.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">How We Use It</h3>
                    <p>Your phone number is used exclusively to contact you regarding your active order status, bookings, and loyalty points. We do NOT sell your data to third-party marketing agencies.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-pine mb-3">Data Security</h3>
                    <p>All order data is encrypted and securely stored. Only authenticated store admins have access to your order information.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-8">
                <h2 className="font-display italic text-2xl md:text-3xl text-pine/90 font-light flex items-center gap-3 border-b-[0.5px] border-pine/20 pb-4 tracking-wide">
                  <MapPin className="text-terracotta"/> Terms & Conditions
                </h2>
                
                <div className="space-y-6 text-pine/70 leading-relaxed text-sm">
                  <p>Welcome to Taste of Village. By using this website to place orders or book tables, you agree to the following terms:</p>
                  
                  <ul className="list-disc pl-5 space-y-4">
                    <li><strong>Service Availability:</strong> We reserve the right to refuse service, cancel orders, or close the store early during extremely busy periods or unforeseen circumstances.</li>
                    <li><strong>Pricing:</strong> All prices shown are inclusive of VAT where applicable. Prices are subject to change without prior notice.</li>
                    <li><strong>Order Collection:</strong> Customers must collect their orders within a reasonable timeframe. Uncollected hot food will be discarded after 1 hour for hygiene reasons, without refund.</li>
                    <li><strong>Booking Policies:</strong> Table bookings will be held for a maximum of 15 minutes past the reserved time before being released to walk-in customers.</li>
                  </ul>
                  
                  <p className="text-sm text-pine/60 italic pt-8 border-t mt-12 border-pine/10 font-bold uppercase tracking-widest">
                    Last updated: {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} • Registered Address: {SHOP_CONFIG.address}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfoClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-sand pt-32 pb-24 text-center">Loading...</div>}>
      <InfoContent />
    </Suspense>
  );
}
