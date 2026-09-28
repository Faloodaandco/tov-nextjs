import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { getMenuItems, LocationId } from '@/services/menuService';
import { slugify } from '@/utils/slugify';
import { DishCTA } from '@/components/DishCTA';

interface PageProps {
  params: Promise<{ locationId: string; dishSlug: string }>;
}

export async function generateStaticParams() {
  const params: { locationId: string; dishSlug: string }[] = [];

  ['hayes', 'slough'].forEach((loc) => {
    const menu = getMenuItems(loc as LocationId);
    menu.forEach((item) => {
      // Only generate pages for items meant to be visible and available
      if (item.showOnWebsite !== false && !item.is86d) {
        params.push({
          locationId: loc,
          dishSlug: slugify(item.name),
        });
      }
    });
  });

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locationId, dishSlug } = await params;
  const locId = (locationId || '').toLowerCase() as LocationId;
  const menu = getMenuItems(locId);
  const item = menu.find((i) => slugify(i.name) === dishSlug);

  if (!item) {
    return { title: 'Dish Not Found' };
  }

  const title = `${item.name} | Taste of Village ${locId === 'slough' ? 'Slough' : 'Hayes'}`;
  const description = item.description || `Order ${item.name} online from Taste of Village.`;
  const url = `https://tasteofvillagerestaurants.co.uk/${locId}/menu/${dishSlug}`;
  const imageUrl = `https://tasteofvillagerestaurants.co.uk${item.image}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: item.name }],
      type: 'website',
    },
  };
}

export default async function DishPage({ params }: PageProps) {
  const { locationId, dishSlug } = await params;
  const locId = (locationId || '').toLowerCase() as LocationId;
  
  if (locId !== 'hayes' && locId !== 'slough') {
    notFound();
  }

  const menu = getMenuItems(locId);
  const item = menu.find((i) => slugify(i.name) === dishSlug);

  if (!item) {
    notFound();
  }

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    image: `https://tasteofvillagerestaurants.co.uk${item.image}`,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <main className="min-h-[100dvh] bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <Link 
          href={`/${locId}/menu`}
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Full Menu
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Dish Photo */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 shadow-sm border border-zinc-100">
            <img 
              src={item.image} 
              alt={item.name} 
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right: Dish Details */}
          <div className="flex flex-col space-y-6">
            {item.category && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-medium">
                {item.category.replace(/_/g, ' ')}
              </span>
            )}
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
              {item.name}
            </h1>
            
            <p className="text-2xl font-medium text-zinc-900">
              £{item.price.toFixed(2)}
            </p>
            
            <p className="text-lg text-zinc-600 leading-relaxed max-w-[65ch]">
              {item.description}
            </p>
            
            <div className="pt-4 border-t border-zinc-100">
              <DishCTA item={item} locationId={locId} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
