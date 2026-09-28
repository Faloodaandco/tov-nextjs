import type { Metadata } from 'next';
import CheckInClient from './CheckInClient';

export const metadata: Metadata = {
  title: 'Check-In & Save 50% | Taste of Village',
  description: 'Check in at Taste of Village and receive an instant 50% OFF dining voucher. Valid for dine-in and collection at Hayes or Slough.',
  alternates: {
    canonical: '/check-in',
  },
  openGraph: {
    type: 'website',
    title: 'Check-In & Save 50% | Taste of Village',
    description: 'Get an instant 50% OFF dining voucher at Taste of Village Hayes or Slough.',
    url: 'https://tasteofvillagerestaurants.co.uk/check-in',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Check-In' }],
  },
};

export default function CheckInPage() {
  return <CheckInClient />;
}
