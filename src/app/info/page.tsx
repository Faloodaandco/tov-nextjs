import type { Metadata } from 'next';
import InfoClient from './InfoClient';

export const metadata: Metadata = {
  title: 'Help & Legal Hub | Taste of Village',
  description: 'FAQs, allergen guide, food hygiene standards, returns policy, privacy policy, and terms for Taste of Village restaurants.',
  alternates: {
    canonical: '/info',
  },
  openGraph: {
    type: 'website',
    title: 'Help & Legal Hub | Taste of Village',
    description: 'FAQs, allergen guide, food hygiene, returns, privacy, and terms at Taste of Village.',
    url: 'https://tasteofvillagerestaurants.co.uk/info',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Info' }],
  },
};

export default function InfoPage() {
  return <InfoClient />;
}
