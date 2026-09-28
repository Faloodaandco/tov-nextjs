import type { Metadata } from 'next';
import BookClient from './BookClient';

export const metadata: Metadata = {
  title: 'Book a Table | Taste of Village',
  description: 'Reserve a table at Taste of Village Hayes or Slough. Optionally pre-order your food for a ready-on-arrival dining experience.',
  alternates: {
    canonical: '/book',
  },
  openGraph: {
    type: 'website',
    title: 'Book a Table | Taste of Village',
    description: 'Reserve your table and pre-order authentic Pakistani cuisine at Taste of Village.',
    url: 'https://tasteofvillagerestaurants.co.uk/book',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Book at Taste of Village' }],
  },
};

export default function BookPage() {
  return <BookClient />;
}
