import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links | Taste of Village',
  description: 'Quick links to Taste of Village menus, social media, vouchers, and more.',
  robots: { index: false, follow: false },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
