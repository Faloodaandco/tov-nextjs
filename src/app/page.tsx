'use client';

import Link from 'next/link';
import { LOCATIONS } from '@/config/shopConfig';
import { trackBranchSelect } from '@/utils/analytics';

export default function SplashSelector() {
  const handleBranchSelect = (branchId: string, branchName: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tov_selected_location', branchId);
    }
    trackBranchSelect(branchId, branchName);
  };

  return (
    <main className="min-h-screen bg-pine flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: 'url(/tov-cinematic-bg.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-pine/80 via-pine/60 to-pine/90" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="/assets/tov-full-logo-transparent-inverted.webp"
            alt="Taste of Village"
            className="w-48 md:w-64 mx-auto"
          />
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-bg-sand mb-4 tracking-wider">
          Select Your Branch
        </h1>
        <p className="text-bg-sand/60 font-sans text-sm md:text-base mb-12 normal-case">
          Authentic Lahori & Gujranwala cuisine
        </p>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {Object.values(LOCATIONS).map((loc) => (
            <Link
              key={loc.id}
              href={`/${loc.id}`}
              onClick={() => handleBranchSelect(loc.id, loc.name)}
              className="group block bg-bg-sand/10 border border-bg-sand/20 p-8 hover:bg-bg-sand/20 transition-all duration-300"
            >
              <h2 className="font-serif text-xl md:text-2xl text-bg-sand mb-2 tracking-wider">
                {loc.name.replace('Taste Of Village ', '')}
              </h2>
              <p className="text-bg-sand/50 font-sans text-sm normal-case mb-1">
                {loc.address}
              </p>
              <p className="text-bg-sand/40 font-sans text-xs normal-case">
                {loc.postcode}
              </p>
              <p className="text-terracotta font-sans text-sm mt-4 normal-case">
                {loc.phone}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
