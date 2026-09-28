import type { Metadata } from 'next';
import FranchiseClient from './FranchiseClient';

export const metadata: Metadata = {
  title: 'Franchise Opportunities | Taste of Village',
  description: 'Own a Taste of Village franchise. Partner with a proven, high-growth halal restaurant brand serving authentic Lahori & Gujranwala cuisine across the UK.',
  alternates: {
    canonical: '/franchise',
  },
  openGraph: {
    type: 'website',
    title: 'Franchise Opportunities | Taste of Village',
    description: 'Own a Taste of Village franchise. Partner with a proven, high-growth halal restaurant brand.',
    url: 'https://tasteofvillagerestaurants.co.uk/franchise',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Franchise' }],
  },
};

export default function FranchisePage() {
  return <FranchiseClient />;
}
