import type { Metadata } from 'next';
import { getBranchSeoMeta, getMenuSchema, getBreadcrumbSchema } from '@/lib/seoData';

interface MenuLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locationId: string }> }): Promise<Metadata> {
  const { locationId } = await params;
  const locId = (locationId || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const seo = getBranchSeoMeta(locId);

  return {
    title: {
      absolute: seo.menuTitle,
    },
    description: seo.menuDescription,
    alternates: {
      canonical: `/${locId}/menu`,
    },
    openGraph: {
      type: 'website',
      title: seo.menuTitle,
      description: seo.menuDescription,
      url: `https://tasteofvillagerestaurants.co.uk/${locId}/menu`,
      siteName: 'Taste of Village',
      images: [
        {
          url: '/assets/og-share-preview.jpg',
          width: 1200,
          height: 630,
          alt: `Taste of Village ${locId === 'slough' ? 'Slough' : 'Hayes'} Takeaway Menu`,
        },
      ],
    },
  };
}

export default async function MenuLayout({ children, params }: MenuLayoutProps) {
  const { locationId } = await params;
  const locId = (locationId || '').toLowerCase() === 'slough' ? 'slough' : 'hayes';
  const menuSchema = getMenuSchema(locId);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://tasteofvillagerestaurants.co.uk' },
    { name: locId === 'slough' ? 'Taste of Village Slough' : 'Taste of Village Hayes', url: `https://tasteofvillagerestaurants.co.uk/${locId}` },
    { name: 'Takeaway Menu', url: `https://tasteofvillagerestaurants.co.uk/${locId}/menu` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
