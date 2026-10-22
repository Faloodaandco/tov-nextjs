'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout, AdminTab } from '@/components/admin/AdminLayout';
import dynamic from 'next/dynamic';

// Code-split tabs for high performance
const WhatsAppInboxTab = dynamic(
  () => import('./tabs/WhatsAppInboxTab').then((m) => ({ default: m.WhatsAppInboxTab })),
  { ssr: false }
);
const CounterMonitorTab = dynamic(
  () => import('./tabs/CounterMonitorTab').then((m) => ({ default: m.CounterMonitorTab })),
  { ssr: false }
);
const BookingsTab = dynamic(
  () => import('./tabs/BookingsTab').then((m) => ({ default: m.BookingsTab })),
  { ssr: false }
);
const MenuManagerTab = dynamic(
  () => import('./tabs/MenuManagerTab').then((m) => ({ default: m.MenuManagerTab })),
  { ssr: false }
);
const PromotionsTab = dynamic(
  () => import('./tabs/PromotionsTab').then((m) => ({ default: m.PromotionsTab })),
  { ssr: false }
);
const AnalyticsTab = dynamic(
  () => import('./tabs/AnalyticsTab').then((m) => ({ default: m.AnalyticsTab })),
  { ssr: false }
);
const WabaHubTab = dynamic(
  () => import('./tabs/WabaHubTab').then((m) => ({ default: m.WabaHubTab })),
  { ssr: false }
);
const StoreInfoTab = dynamic(
  () => import('./tabs/StoreInfoTab').then((m) => ({ default: m.StoreInfoTab })),
  { ssr: false }
);
const AnnouncementsTab = dynamic(
  () => import('./tabs/AnnouncementsTab').then((m) => ({ default: m.AnnouncementsTab })),
  { ssr: false }
);

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<AdminTab>('whatsapp');
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'hayes' | 'slough'>('all');

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D1912] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-7 w-7 border-2 border-[#D3A762] border-t-transparent rounded-full" />
          <span className="text-xs text-[#D3A762] font-semibold tracking-wider uppercase">
            Verifying Staff Access...
          </span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      selectedBranch={selectedBranch}
      onBranchChange={setSelectedBranch}
    >
      {currentTab === 'whatsapp' && <WhatsAppInboxTab selectedBranch={selectedBranch} />}
      {currentTab === 'counter' && <CounterMonitorTab selectedBranch={selectedBranch} />}
      {currentTab === 'bookings' && <BookingsTab selectedBranch={selectedBranch} />}
      {currentTab === 'menu' && <MenuManagerTab selectedBranch={selectedBranch} />}
      {currentTab === 'promotions' && <PromotionsTab selectedBranch={selectedBranch} />}
      {currentTab === 'analytics' && <AnalyticsTab />}
      {currentTab === 'waba' && <WabaHubTab selectedBranch={selectedBranch} />}
      {currentTab === 'store' && <StoreInfoTab selectedBranch={selectedBranch} />}
      {currentTab === 'announcements' && <AnnouncementsTab />}
    </AdminLayout>
  );
}
