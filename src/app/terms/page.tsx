import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | Taste of Village Restaurants',
  description: 'Terms of Service for direct ordering, table reservations, and WhatsApp chatbot services at Taste of Village (Hayes & Slough).',
  alternates: {
    canonical: 'https://tasteofvillagerestaurants.co.uk/terms',
  },
};

export default function TermsOfServicePage() {
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
            <FileText size={28} />
            <span className="text-xs font-bold tracking-widest uppercase">Terms &amp; Agreements</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[#0E1F1A] mb-4">
            Terms of Service
          </h1>

          <p className="text-sm text-[#0E1F1A]/60">
            Last updated: <span className="font-medium text-[#0E1F1A]">{lastUpdated}</span> &bull; Taste of Village Restaurants (UK)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-[#0E1F1A]/10 p-6 md:p-12 shadow-sm space-y-10 leading-relaxed text-sm md:text-base text-[#0E1F1A]/80">
          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="mb-3">
              By accessing the website{' '}
              <a href="https://tasteofvillagerestaurants.co.uk" className="text-[#C85A32] underline underline-offset-4">
                https://tasteofvillagerestaurants.co.uk
              </a>{' '}
              or interacting with our automated WhatsApp ordering bot, you agree to be bound by these Terms of Service. If you do not agree, please refrain from using our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              2. Restaurant Direct Ordering &amp; WhatsApp Bot
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Accuracy of Details:</strong> When ordering through our WhatsApp bot or direct website checkout, you must provide an accurate delivery address, contact name, and mobile number.
              </li>
              <li>
                <strong>Fulfillment Types:</strong> We offer collection (takeaway) and direct delivery within designated delivery mileage zones for our Hayes and Slough branches.
              </li>
              <li>
                <strong>Menu Pricing &amp; Availability:</strong> All prices are displayed in Pounds Sterling (&pound; / GBP) and include applicable UK VAT. Dish availability is subject to real-time kitchen inventory.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              3. Payments &amp; Security
            </h2>
            <p className="mb-3">
              All online card payments are handled securely via our payment partner, Square (Block, Inc.). We never store or transmit sensitive card numbers. An order is only confirmed once Square verifies payment settlement.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              4. Cancellations &amp; Refunds
            </h2>
            <p className="mb-3">
              Because food is prepared fresh to order immediately upon receipt:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cancellations can only be made if the kitchen has not commenced food preparation (typically within 5 minutes of placing your order).
              </li>
              <li>
                If you encounter any quality issue or incorrect items, contact the branch immediately with your order reference for an instant resolution or refund.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A] mb-4">
              5. Contact &amp; Business Information
            </h2>
            <div className="p-4 bg-[#FAF5EE] rounded-xl text-xs md:text-sm space-y-1">
              <p className="font-bold text-[#0E1F1A]">Taste of Village Restaurants</p>
              <p>Hayes: 766B Uxbridge Rd, Hayes UB4 0RU &bull; Tel: 020 3409 3786</p>
              <p>Slough: 260 Farnham Road, Slough SL1 4XL &bull; Tel: 01753 326341</p>
              <p>Email: <a href="mailto:info@tasteofvillagerestaurants.co.uk" className="text-[#C85A32]">info@tasteofvillagerestaurants.co.uk</a></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
