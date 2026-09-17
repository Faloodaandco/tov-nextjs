'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-[60] w-full">
        <Navbar />
      </div>
      {children}
      <Footer />
    </>
  );
}
