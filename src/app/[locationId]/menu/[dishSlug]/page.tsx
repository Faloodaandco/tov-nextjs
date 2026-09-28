import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import { getMenuItems, LocationId } from '@/services/menuService';
import { slugify } from '@/utils/slugify';
import { DishCTA } from '@/components/DishCTA';
import { LOCATIONS } from '@/config/shopConfig';

interface PageProps {
  params: Promise<{ locationId: string; dishSlug: string }>;
}

/* ── Placeholder detection ── */
function hasRealPhoto(image: string | undefined): boolean {
  if (!image) return false;
  if (image.includes('tov-logo-tree')) return false;
  if (image.includes('placeholder')) return false;
  if (image.includes('tov-full-logo')) return false;
  // Deliveroo fallback images used as generic placeholders
  if (image.includes('deliveroo/')) return false;
  return true;
}

/* ── Dietary → Schema.org suitableForDiet mapping ── */
const DIET_SCHEMA_MAP: Record<string, string> = {
  vegan: 'https://schema.org/VeganDiet',
  vegetarian: 'https://schema.org/VegetarianDiet',
  'gluten-free': 'https://schema.org/GlutenFreeDiet',
  halal: 'https://schema.org/HalalDiet',
};

const DIET_LABELS: Record<string, { emoji: string; label: string }> = {
  vegan: { emoji: '🌱', label: 'Vegan' },
  vegetarian: { emoji: '🧀', label: 'Vegetarian' },
  halal: { emoji: '🌙', label: 'Halal' },
  'gluten-free': { emoji: '🌾', label: 'Gluten-Free' },
  spicy: { emoji: '🌶️', label: 'Spicy' },
};

export async function generateStaticParams() {
  const params: { locationId: string; dishSlug: string }[] = [];

  (['hayes', 'slough'] as const).forEach((loc) => {
    const menu = getMenuItems(loc);
    menu.forEach((item) => {
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
  const menu = getMenuItems(locId === 'slough' ? 'slough' : 'hayes');
  const item = menu.find((i) => slugify(i.name) === dishSlug);

  if (!item) {
    return { title: 'Dish Not Found' };
  }

  const branchName = locId === 'slough' ? 'Slough' : 'Hayes';
  const title = `${item.name} — £${item.price.toFixed(2)} | Taste of Village ${branchName}`;
  const description = item.description || `Order ${item.name} online from Taste of Village ${branchName}. Collection & delivery available.`;
  const url = `https://tasteofvillagerestaurants.co.uk/${locId}/menu/${dishSlug}`;
  const imageUrl = hasRealPhoto(item.image)
    ? `https://tasteofvillagerestaurants.co.uk${item.image}`
    : `https://tasteofvillagerestaurants.co.uk/assets/og-share-preview.jpg`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${item.name} — £${item.price.toFixed(2)}`,
      description,
      url,
      siteName: 'Taste of Village',
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

  const branchName = locId === 'slough' ? 'Slough' : 'Hayes';
  const branchConfig = LOCATIONS[locId];
  const showPhoto = hasRealPhoto(item.image);

  // Schema.org MenuItem
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'MenuItem',
    name: item.name,
    description: item.description,
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
    },
  };

  if (showPhoto) {
    schema.image = `https://tasteofvillagerestaurants.co.uk${item.image}`;
  }

  // Map dietary flags to Schema.org suitableForDiet
  if (item.dietary && item.dietary.length > 0) {
    const diets = item.dietary
      .map((d) => DIET_SCHEMA_MAP[d])
      .filter(Boolean);
    if (diets.length > 0) {
      schema.suitableForDiet = diets;
    }
  }

  // Related dishes from same category (max 3, excluding current item)
  const related = menu
    .filter((m) => m.category === item.category && m.id !== item.id && !m.is86d && m.showOnWebsite !== false)
    .slice(0, 3);

  return (
    <main className="min-h-[100dvh] bg-[#FDFBF7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Back link */}
        <Link
          href={`/${locId}/menu`}
          className="inline-flex items-center text-sm font-medium text-pine/60 hover:text-pine mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Full Menu
        </Link>

        <div className={`grid grid-cols-1 ${showPhoto ? 'md:grid-cols-2' : ''} gap-12 lg:gap-16 items-start`}>
          {/* Left: Dish Photo (only when real photo exists) */}
          {showPhoto && (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-pine/5 shadow-sm border border-pine/10">
              <Image
                src={item.image}
                alt={item.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Right: Dish Details */}
          <div className="flex flex-col space-y-6">
            {item.category && (
              <span className="text-[11px] uppercase tracking-[0.18em] text-pine/50 font-bold">
                {item.category.replace(/_/g, ' ')}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-pine leading-[1.1]">
              {item.name}
            </h1>

            <p className="text-2xl font-bold text-terracotta">
              £{item.price.toFixed(2)}
            </p>

            {/* Dietary tags */}
            {item.dietary && item.dietary.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {item.dietary.map((d) => {
                  const info = DIET_LABELS[d];
                  if (!info) return null;
                  return (
                    <span
                      key={d}
                      className="text-[10px] uppercase font-bold tracking-[0.15em] px-3 py-1 rounded-full border border-pine/10 text-pine/70 bg-white"
                    >
                      {info.emoji} {info.label}
                    </span>
                  );
                })}
              </div>
            )}

            <p className="text-lg text-pine/70 leading-relaxed max-w-[65ch]">
              {item.description}
            </p>

            {/* Branch info */}
            <p className="text-sm text-pine/60">
              Available at Taste of Village {branchName} · {branchConfig.address}, {branchConfig.postcode}
            </p>

            <div className="pt-4 border-t border-pine/10">
              <DishCTA item={item} locationId={locId} />
            </div>
          </div>
        </div>

        {/* Related dishes from same category */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-pine/10">
            <h2 className="text-2xl font-bold text-pine mb-8">
              More from {item.category.replace(/_/g, ' ')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => {
                const rSlug = slugify(r.name);
                const rHasPhoto = hasRealPhoto(r.image);
                return (
                  <Link
                    key={r.id}
                    href={`/${locId}/menu/${rSlug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-pine/10 hover:shadow-lg transition-shadow"
                  >
                    {rHasPhoto ? (
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={r.image}
                          alt={r.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/10] bg-gradient-to-br from-pine/10 via-pine/5 to-transparent flex items-center justify-center">
                        <span className="text-pine/20 text-xs font-bold uppercase tracking-widest">Taste of Village</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-pine text-lg group-hover:text-terracotta transition-colors">
                        {r.name}
                      </h3>
                      <p className="text-terracotta font-bold mt-1">£{r.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
