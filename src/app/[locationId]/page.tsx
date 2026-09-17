'use client';

import { useParams } from 'next/navigation';
import { LOCATIONS } from '@/config/shopConfig';
import type { LocationId } from '@/config/shopConfig';

export default function BranchHome() {
  const params = useParams();
  const locationId = params.locationId as LocationId;
  const location = LOCATIONS[locationId] || LOCATIONS.hayes;

  return (
    <main className="min-h-screen bg-bg-sand">
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 text-center">
        <h1 className="font-serif text-4xl md:text-6xl text-pine mb-4">{location.name}</h1>
        <p className="text-pine/60 font-sans text-lg normal-case mb-8">{location.address}, {location.postcode}</p>
        <a href={`/${locationId}/menu`} className="inline-block bg-terracotta text-bg-sand px-8 py-4 font-bold text-sm uppercase tracking-[0.15em] hover:bg-terracotta-light transition-colors">
          View Menu & Order
        </a>
      </div>
    </main>
  );
}
