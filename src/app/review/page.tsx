import type { Metadata } from 'next';
import ReviewClient from './ReviewClient';

export const metadata: Metadata = {
  title: 'Leave a Review | Taste of Village',
  description: 'Share your dining experience at Taste of Village. Rate us and help us serve you better.',
  alternates: {
    canonical: '/review',
  },
  openGraph: {
    type: 'website',
    title: 'Leave a Review | Taste of Village',
    description: 'Rate your Taste of Village experience and share feedback.',
    url: 'https://tasteofvillagerestaurants.co.uk/review',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Review Taste of Village' }],
  },
};

export default function ReviewPage() {
  return <ReviewClient />;
}
