import { AdminAuthProvider } from '@/context/AdminAuthContext';

export const metadata = {
  title: 'Staff Management CMS | Taste of Village',
  robots: 'noindex, nofollow',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
