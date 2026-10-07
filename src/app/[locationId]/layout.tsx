import type { Metadata } from 'next';
import { getBranchSeoMeta, getRestaurantSchema, getFaqSchema, getBreadcrumbSchema } from '@/lib/seoData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface BranchLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locationId: string }> }): Promise<Metadata> {
  const { locationId } = await params;
  const locId = (locationId || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const seo = getBranchSeoMeta(locId);

  return {
    title: {
      absolute: seo.homeTitle,
    },
    description: seo.homeDescription,
    alternates: {
      canonical: `/${locId}`,
    },
    openGraph: {
      type: 'website',
      title: seo.homeTitle,
      description: seo.homeDescription,
      url: `https://tasteofvillagerestaurants.co.uk/${locId}`,
      siteName: 'Taste of Village',
      images: [
        {
          url: '/assets/og-share-preview.jpg',
          width: 1200,
          height: 630,
          alt: `Taste of Village ${locId === 'slough' ? 'Slough' : 'Hayes'}`,
        },
      ],
    },
    other: {
      'og:latitude': String(seo.lat),
      'og:longitude': String(seo.lng),
      'place:location:latitude': String(seo.lat),
      'place:location:longitude': String(seo.lng),
    }
  };
}

export default async function BranchLayout({ children, params }: BranchLayoutProps) {
  const { locationId } = await params;
  const locId = (locationId || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const restaurantSchema = getRestaurantSchema(locId);
  const faqSchema = getFaqSchema(locId);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://tasteofvillagerestaurants.co.uk' },
    { name: locId === 'slough' ? 'Taste of Village Slough' : 'Taste of Village Hayes', url: `https://tasteofvillagerestaurants.co.uk/${locId}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="sticky top-0 z-[60] w-full">
        <Navbar />
      </div>
      {children}
      <Footer />
    </>
  );
}
