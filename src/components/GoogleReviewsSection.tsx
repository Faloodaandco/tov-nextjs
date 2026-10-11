'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, ExternalLink } from 'lucide-react';
import { LOCATIONS, type LocationId } from '@/config/shopConfig';

interface GoogleReviewItem {
  id: string;
  author: string;
  isLocalGuide?: boolean;
  date: string;
  rating: number;
  text: string;
  branch: 'hayes' | 'slough';
  dishMentioned: string;
}

const VERIFIED_GOOGLE_REVIEWS: GoogleReviewItem[] = [
  {
    id: 'rev-h1',
    author: 'Imran S.',
    isLocalGuide: true,
    date: '1 week ago',
    rating: 5,
    dishMentioned: 'Chicken Karahi & Roghni Naan',
    branch: 'hayes',
    text: 'The Chicken Karahi was unbelievable — authentic Gujranwala taste, rich spices, and fresh naans straight from the clay tandoor. You can tell they do not take shortcuts. Excellent hospitality.',
  },
  {
    id: 'rev-s1',
    author: 'Farhan K.',
    isLocalGuide: true,
    date: '2 weeks ago',
    rating: 5,
    dishMentioned: 'Mutton Karahi & Sizzling BBQ',
    branch: 'slough',
    text: 'Slough genuinely needed an authentic Lahori restaurant like this. The mutton karahi was sizzling and cooked with pure desi ghee aromas. Generous portions and very welcoming staff on Farnham Road.',
  },
  {
    id: 'rev-h2',
    author: 'Zubair A.',
    isLocalGuide: false,
    date: '3 weeks ago',
    rating: 5,
    dishMentioned: 'Sunday Nihari & Karak Chai',
    branch: 'hayes',
    text: 'Best Halal food on Uxbridge Road by far. The Nihari on Sunday morning was tender and slow cooked to perfection with ginger and green chillies. Roghni naan is a must-try.',
  },
  {
    id: 'rev-s2',
    author: 'Naveed R.',
    isLocalGuide: false,
    date: '1 month ago',
    rating: 5,
    dishMentioned: 'Hygiene 5 & Falooda',
    branch: 'slough',
    text: 'Top tier Food Hygiene Rating of 5 and genuine Pakistani street flavours. The samosa chaat was bursting with flavour and the traditional Falooda rounded off the evening perfectly.',
  },
  {
    id: 'rev-h3',
    author: 'Ayesha M.',
    isLocalGuide: true,
    date: '1 month ago',
    rating: 5,
    dishMentioned: 'Family Dining & Mixed Grill',
    branch: 'hayes',
    text: 'Took the whole family for dinner. High chairs were provided immediately and family seating was very comfortable. The mixed grill platter and chicken biryani were highlights.',
  },
  {
    id: 'rev-s3',
    author: 'Kamran T.',
    isLocalGuide: false,
    date: '2 months ago',
    rating: 5,
    dishMentioned: 'Lamb Chops & Seekh Kebabs',
    branch: 'slough',
    text: 'Spotless restaurant, attentive service, and piping hot food. The lamb chops are the best in Berkshire — juicy, smoky, and seasoned just right.',
  },
];

export function GoogleReviewsSection({ currentBranch = 'hayes' }: { currentBranch?: LocationId }) {
  const [activeBranch, setActiveBranch] = useState<'all' | 'hayes' | 'slough'>(currentBranch);

  const filteredReviews = activeBranch === 'all'
    ? VERIFIED_GOOGLE_REVIEWS
    : VERIFIED_GOOGLE_REVIEWS.filter(r => r.branch === activeBranch);

  const reviewLink = activeBranch === 'slough'
    ? LOCATIONS.slough.googleReviewUrl
    : LOCATIONS.hayes.googleReviewUrl;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header & Google Score */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-pine/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-3">
            <CheckCircle2 size={14} /> Verified Diners on Google Maps
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-medium text-pine">
            Real Words From Real Diners
          </h2>
          <p className="text-sm text-pine/70 mt-1 max-w-xl">
            Unfiltered feedback from our dining rooms and takeaway counters in Hayes and Slough.
          </p>
        </div>

        {/* Google Rating Badge */}
        <div className="mt-6 md:mt-0 flex items-center gap-4 bg-white/80 p-4 rounded-2xl border border-pine/10 shadow-sm backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-inner border border-stone-200 font-bold text-lg text-blue-600">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-display font-bold text-pine">4.8</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
            <span className="text-xs text-pine/60">Over 650+ verified Google reviews</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setActiveBranch('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeBranch === 'all'
              ? 'bg-pine text-white shadow-sm'
              : 'bg-white/60 text-pine/70 hover:bg-white hover:text-pine border border-pine/10'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActiveBranch('hayes')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeBranch === 'hayes'
              ? 'bg-pine text-white shadow-sm'
              : 'bg-white/60 text-pine/70 hover:bg-white hover:text-pine border border-pine/10'
          }`}
        >
          Hayes (UB4 0RU)
        </button>
        <button
          onClick={() => setActiveBranch('slough')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeBranch === 'slough'
              ? 'bg-pine text-white shadow-sm'
              : 'bg-white/60 text-pine/70 hover:bg-white hover:text-pine border border-pine/10'
          }`}
        >
          Slough (SL1 4XL)
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white/80 rounded-3xl p-6 sm:p-7 border border-pine/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-pine/10 text-pine font-bold text-sm flex items-center justify-center">
                    {rev.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-pine flex items-center gap-1.5">
                      {rev.author}
                      {rev.isLocalGuide && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Local Guide
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-pine/50">{rev.date} · Google Maps</span>
                  </div>
                </div>

                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-pine/85 leading-relaxed mb-4 italic font-sans">
                &ldquo;{rev.text}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-pine/5 flex items-center justify-between text-[11px] text-pine/60">
              <span className="font-semibold text-terracotta">
                Dish: {rev.dishMentioned}
              </span>
              <span className="uppercase tracking-wider font-bold text-[10px]">
                {rev.branch.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to leave review or view on Google */}
      <div className="text-center">
        <a
          href={reviewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pine hover:text-terracotta transition-colors py-3 px-6 rounded-full border border-pine/20 hover:border-terracotta bg-white/50 backdrop-blur-sm"
        >
          View More Reviews On Google <ExternalLink size={13} />
        </a>
      </div>
    </section>
  );
}
