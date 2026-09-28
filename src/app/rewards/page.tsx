import type { Metadata } from 'next';
import RewardsClient from './RewardsClient';

export const metadata: Metadata = {
  title: 'Heritage Rewards | Taste of Village',
  description: 'Earn 1 point for every £1 spent at Taste of Village. Unlock exclusive rewards from £5 vouchers to VIP Chef\'s Table experiences.',
  alternates: {
    canonical: '/rewards',
  },
  openGraph: {
    type: 'website',
    title: 'Heritage Rewards | Taste of Village',
    description: 'Earn loyalty points and unlock exclusive dining rewards at Taste of Village.',
    url: 'https://tasteofvillagerestaurants.co.uk/rewards',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Rewards' }],
  },
};

export default function RewardsPage() {
  return <RewardsClient />;
}
