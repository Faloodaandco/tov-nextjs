import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, Phone, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Taste of Village Restaurants',
  description: 'UK GDPR and Data Protection Act 2018 compliant Privacy Policy for Taste of Village restaurant ordering, website, and WhatsApp services.',
  alternates: {
    canonical: 'https://tasteofvillagerestaurants.co.uk/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '10 October 2026';

  return (
    <main className="min-h-screen bg-[#FAF5EE] text-[#0E1F1A] px-4 py-12 md:py-20 selection:bg-[#C85A32] selection:text-white">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#0E1F1A]/70 hover:text-[#C85A32] transition-colors mb-6 font-semibold"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex items-center gap-3 text-[#C85A32] mb-3">
            <Shield size={28} />
            <span className="text-xs font-bold tracking-widest uppercase">Legal &amp; Privacy Compliance</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[#0E1F1A] mb-4">
            Privacy Policy
          </h1>

          <p className="text-sm text-[#0E1F1A]/60">
            Last updated: <span className="font-medium text-[#0E1F1A]">{lastUpdated}</span> &bull; Compliant with UK GDPR &amp; Data Protection Act 2018
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-[#0E1F1A]/10 p-6 md:p-12 shadow-sm space-y-10 leading-relaxed text-sm md:text-base text-[#0E1F1A]/80">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              1. Introduction &amp; Data Controller
            </h2>
            <p className="mb-3">
              Taste of Village Restaurants (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website{' '}
              <a href="https://tasteofvillagerestaurants.co.uk" className="text-[#C85A32] underline underline-offset-4">
                https://tasteofvillagerestaurants.co.uk
              </a>{' '}
              and automated customer ordering services via WhatsApp Business for our branches in Hayes (UB4) and Slough (SL1).
            </p>
            <p className="mb-3">
              We are committed to safeguarding the privacy of our website visitors, customers, and ordering patrons in full compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <div className="p-4 bg-[#FAF5EE] rounded-xl border border-[#0E1F1A]/5 text-xs md:text-sm">
              <p className="font-semibold text-[#0E1F1A] mb-1">Data Controller Identity:</p>
              <p>Taste of Village Restaurants / Shahbaz Nawaz</p>
              <p>Branches: Hayes (766B Uxbridge Rd, Hayes UB4 0RU) &amp; Slough (260 Farnham Road, Slough SL1 4XL)</p>
              <p>Email: <a href="mailto:info@tasteofvillagerestaurants.co.uk" className="text-[#C85A32]">info@tasteofvillagerestaurants.co.uk</a></p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              2. What Information We Collect
            </h2>
            <p className="mb-3">We collect and process only the minimal information strictly required to provide dining, collection, and delivery services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Direct Orders &amp; WhatsApp Interactions:</strong> Customer phone number, profile name, delivery address (where delivery is requested), order details, items selected, and conversation identifiers.
              </li>
              <li>
                <strong>Table Bookings &amp; Inquiries:</strong> Contact name, telephone number, party size, booking date and time, and special dietary requests.
              </li>
              <li>
                <strong>Payment Information:</strong> All card payments are processed securely by Square (Block, Inc.). We do not store, view, or process full credit/debit card numbers on our servers. Square tokens, transaction status, and order amounts are retained for order verification and VAT receipts.
              </li>
              <li>
                <strong>Technical &amp; Log Data:</strong> IP address, device type, browser user agent, and interaction timestamps required for anti-fraud security and server stability.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              3. Legal Basis for Processing (UK GDPR Art. 6)
            </h2>
            <p className="mb-3">We process your personal information under the following lawful bases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contractual Necessity:</strong> To fulfill food orders, process collections, calculate delivery zones, and communicate real-time order status updates via WhatsApp.
              </li>
              <li>
                <strong>Legitimate Interests:</strong> To improve menu offerings, prevent fraudulent transactions, protect our web infrastructure, and verify payment legitimacy.
              </li>
              <li>
                <strong>Consent:</strong> For opt-in direct communications or promotional student discount offerings, which you can withdraw at any time.
              </li>
              <li>
                <strong>Legal Obligation:</strong> To maintain accurate financial, accounting, and tax records in accordance with UK statutory requirements (HMRC).
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              4. Data Processors &amp; Third-Party Services
            </h2>
            <p className="mb-3">
              We never sell or rent your personal data. We partner strictly with GDPR-compliant data processors who assist in providing our service under formal Data Processing Agreements:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[#0E1F1A]/10 rounded-xl">
                <p className="font-bold text-[#0E1F1A]">Meta Platforms Ireland Ltd</p>
                <p className="text-xs text-[#0E1F1A]/70 mt-1">Powers WhatsApp Cloud API messaging infrastructure and catalog sync.</p>
              </div>
              <div className="p-4 border border-[#0E1F1A]/10 rounded-xl">
                <p className="font-bold text-[#0E1F1A]">Square (Block, Inc.)</p>
                <p className="text-xs text-[#0E1F1A]/70 mt-1">PCI-DSS compliant payment gateway, checkout links, and in-store POS receipts.</p>
              </div>
              <div className="p-4 border border-[#0E1F1A]/10 rounded-xl">
                <p className="font-bold text-[#0E1F1A]">Google LLC (Firebase / GCP)</p>
                <p className="text-xs text-[#0E1F1A]/70 mt-1">Cloud Firestore state management, real-time message deduplication, and order records.</p>
              </div>
              <div className="p-4 border border-[#0E1F1A]/10 rounded-xl">
                <p className="font-bold text-[#0E1F1A]">Vercel Inc.</p>
                <p className="text-xs text-[#0E1F1A]/70 mt-1">Serverless hosting provider executing webhook endpoints and website delivery.</p>
              </div>
            </div>
          </section>

          {/* Section 5 - Data Deletion */}
          <section id="data-deletion" className="p-6 bg-[#0E1F1A]/5 rounded-2xl border border-[#0E1F1A]/10">
            <div className="flex items-center gap-3 text-[#C85A32] mb-3">
              <Lock size={22} />
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A]">
                5. User Data Deletion &amp; Your GDPR Rights
              </h2>
            </div>
            <p className="mb-3">
              Under UK GDPR, you have the right to request access to, rectification of, or erasure of your personal data (&ldquo;Right to be Forgotten&rdquo;).
            </p>
            <p className="mb-4">
              If you have placed orders via our website, table booking system, or WhatsApp bot and wish to have your personal data deleted, you can request immediate removal using either method:
            </p>
            <div className="space-y-3 bg-white p-4 rounded-xl border border-[#0E1F1A]/10 text-xs md:text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#C85A32] shrink-0 mt-0.5" />
                <div>
                  <strong>Email Request:</strong> Send an email to{' '}
                  <a href="mailto:info@tasteofvillagerestaurants.co.uk" className="text-[#C85A32] underline font-medium">
                    info@tasteofvillagerestaurants.co.uk
                  </a>{' '}
                  with the subject <em>&ldquo;Data Deletion Request&rdquo;</em> and provide your WhatsApp phone number or email.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#C85A32] shrink-0 mt-0.5" />
                <div>
                  <strong>Online Deletion Page:</strong> Visit{' '}
                  <Link href="/data-deletion" className="text-[#C85A32] underline font-medium">
                    tasteofvillagerestaurants.co.uk/data-deletion
                  </Link>{' '}
                  for self-service instructions and deletion status.
                </div>
              </div>
            </div>
            <p className="text-xs text-[#0E1F1A]/60 mt-3">
              We process all verified deletion requests within 30 calendar days, retaining only transaction records strictly required by UK tax law (HMRC) for statutory accounting.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              6. Data Retention
            </h2>
            <p>
              Ephemeral session caches and message deduplication IDs expire automatically within 24 to 48 hours. Operational order logs are retained for 90 days to handle customer service inquiries and order reconciliations, unless statutory financial records require retention.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              7. Contact Our Data Protection Team
            </h2>
            <p className="mb-4">
              For any privacy inquiries, GDPR rights requests, or feedback regarding data processing, contact:
            </p>
            <div className="p-4 bg-[#FAF5EE] rounded-xl text-xs md:text-sm space-y-1">
              <p className="font-bold text-[#0E1F1A]">Data Protection Contact: Shahbaz Nawaz</p>
              <p>Email: <a href="mailto:info@tasteofvillagerestaurants.co.uk" className="text-[#C85A32]">info@tasteofvillagerestaurants.co.uk</a></p>
              <p>Taste of Village Restaurants &bull; Hayes &amp; Slough, United Kingdom</p>
              <p className="text-[11px] text-[#0E1F1A]/60 mt-2">
                You also have the right to lodge a complaint with the UK Information Commissioner&apos;s Office (ICO) at{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline">
                  ico.org.uk
                </a>.
              </p>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
