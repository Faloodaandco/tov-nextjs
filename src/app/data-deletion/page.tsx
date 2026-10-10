import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Trash2, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'User Data Deletion Instructions | Taste of Village Restaurants',
  description: 'Instructions on how customers and users can request deletion of their personal data from Taste of Village ordering and WhatsApp systems.',
  alternates: {
    canonical: 'https://tasteofvillagerestaurants.co.uk/data-deletion',
  },
};

export default function DataDeletionPage() {
  const lastUpdated = '10 October 2026';

  return (
    <main className="min-h-screen bg-[#FAF5EE] text-[#0E1F1A] px-4 py-12 md:py-20 selection:bg-[#C85A32] selection:text-white">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#0E1F1A]/70 hover:text-[#C85A32] transition-colors mb-6 font-semibold"
          >
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <div className="flex items-center gap-3 text-[#C85A32] mb-3">
            <Trash2 size={28} />
            <span className="text-xs font-bold tracking-widest uppercase">Meta Platform &amp; GDPR Compliance</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-[#0E1F1A] mb-4">
            User Data Deletion Instructions
          </h1>

          <p className="text-sm text-[#0E1F1A]/60">
            Last updated: <span className="font-medium text-[#0E1F1A]">{lastUpdated}</span> &bull; UK GDPR &amp; Meta Developer Policy Compliant
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-2xl border border-[#0E1F1A]/10 p-6 md:p-12 shadow-sm space-y-8 leading-relaxed text-sm md:text-base text-[#0E1F1A]/80">
          <section>
            <p className="mb-4">
              At Taste of Village Restaurants (Hayes &amp; Slough), we respect your right to privacy and control over your personal data. In compliance with the UK General Data Protection Regulation (UK GDPR) and Meta Platform Terms, this page outlines how you can request deletion of data associated with our WhatsApp bot and website ordering system.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-[#0E1F1A]">
              How to Request Deletion of Your Data
            </h2>
            <p>You can request complete deletion of your customer record through any of the following simple steps:</p>

            <div className="p-6 bg-[#FAF5EE] rounded-xl border border-[#0E1F1A]/10 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C85A32] text-white text-xs font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h3 className="font-bold text-[#0E1F1A]">Via Direct Email (Recommended)</h3>
                  <p className="text-sm text-[#0E1F1A]/70 mt-1">
                    Send an email to{' '}
                    <a href="mailto:info@tasteofvillagerestaurants.co.uk" className="text-[#C85A32] underline font-semibold">
                      info@tasteofvillagerestaurants.co.uk
                    </a>{' '}
                    with the subject line: <strong>&ldquo;User Data Deletion Request&rdquo;</strong>.
                  </p>
                  <p className="text-xs text-[#0E1F1A]/60 mt-1">
                    Include your WhatsApp phone number and full name used when ordering.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#C85A32] text-white text-xs font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h3 className="font-bold text-[#0E1F1A]">Via WhatsApp Chat</h3>
                  <p className="text-sm text-[#0E1F1A]/70 mt-1">
                    Send the word <strong>&ldquo;DELETE MY DATA&rdquo;</strong> to our WhatsApp ordering number. Our team will verify your phone number and schedule your conversational history for removal.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-serif font-bold text-[#0E1F1A]">
              What Happens When You Request Deletion?
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>
                <strong>Firestore Conversation State:</strong> Your telephone number, cart state, cached address, and conversation session records are purged from our database.
              </li>
              <li>
                <strong>Lead Data:</strong> Any student offers or newsletter signups associated with your contact info are permanently deleted.
              </li>
              <li>
                <strong>Payment Records:</strong> Historical payment receipts processed through Square (Block, Inc.) are anonymised and retained only for the legally mandated period required by UK HMRC tax law.
              </li>
            </ul>
          </section>

          <section className="p-4 bg-[#0E1F1A]/5 rounded-xl border border-[#0E1F1A]/10 text-xs md:text-sm flex items-start gap-3">
            <ShieldCheck size={20} className="text-[#C85A32] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#0E1F1A] mb-1">Confirmation &amp; SLA</p>
              <p className="text-[#0E1F1A]/70">
                All requests are acknowledged within 48 hours and completed within 30 calendar days. You will receive an email confirmation once your data has been successfully erased.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
