import type { Metadata } from 'next';
import HomeSelector from './HomeSelector';

export const metadata: Metadata = {
  title: 'Taste of Village | Authentic Pakistani Cuisine in Hayes & Slough',
  description: 'Order authentic Lahori & Gujranwala cuisine online. Chicken Karahi, Lamb Karahi, Haleem, Nihari, BBQ platters. Halal certified. Hayes & Slough branches.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'Taste of Village | Authentic Pakistani Cuisine in Hayes & Slough',
    description: 'Order authentic Lahori & Gujranwala cuisine online. Chicken Karahi, Lamb Karahi, Haleem, Nihari, BBQ platters. Halal certified.',
    url: 'https://tasteofvillagerestaurants.co.uk',
    siteName: 'Taste of Village',
    locale: 'en_GB',
    images: [{ url: '/assets/og-share-preview.jpg', width: 1200, height: 630, alt: 'Taste of Village Sizzling Karahi' }],
  },
};

export default function Home() {
  return <HomeSelector />;
}
