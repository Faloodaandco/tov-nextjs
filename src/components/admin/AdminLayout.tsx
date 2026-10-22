'use client';

import React, { useState, useMemo } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  MessageSquare,
  Bell,
  Clock,
  Utensils,
  Tag,
  BarChart3,
  Settings,
  Megaphone,
  Radio,
  LogOut,
  ExternalLink,
  Search,
  Building2,
  Shield,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';

export type AdminTab =
  | 'whatsapp'
  | 'counter'
  | 'bookings'
  | 'menu'
  | 'promotions'
  | 'analytics'
  | 'waba'
  | 'announcements'
  | 'store';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  selectedBranch: 'all' | 'hayes' | 'slough';
  onBranchChange: (branch: 'all' | 'hayes' | 'slough') => void;
  children: React.ReactNode;
}

interface TabItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'operations' | 'marketing' | 'seo' | 'config';
  badge?: string;
  showDot?: boolean;
}

const ALL_TABS: TabItem[] = [
  // Operations
  { id: 'whatsapp', label: 'WhatsApp Concierge', icon: MessageSquare, category: 'operations', badge: 'Live Bot', showDot: true },
  { id: 'counter', label: 'Live Orders Counter', icon: Bell, category: 'operations', badge: 'Live' },
  { id: 'bookings', label: 'Table Reservations', icon: Clock, category: 'operations', badge: 'Bookings' },

  // Growth & Promotions
  { id: 'promotions', label: 'Online Promos & Vouchers', icon: Tag, category: 'marketing' },
  { id: 'announcements', label: 'Marquee Banner', icon: Megaphone, category: 'marketing' },

  // SEO & Visibility
  { id: 'analytics', label: 'Analytics & Search Console', icon: BarChart3, category: 'seo', badge: 'GA4/GSC' },

  // System & Catalog
  { id: 'menu', label: 'Menu Availability (86ing)', icon: Utensils, category: 'config' },
  { id: 'waba', label: 'WABA Meta Workflow Hub', icon: Radio, category: 'config', badge: 'Meta API' },
  { id: 'store', label: 'Store Timings & Settings', icon: Settings, category: 'config' },
];

const CATEGORY_LABELS: Record<'operations' | 'marketing' | 'seo' | 'config', { label: string; icon: string }> = {
  operations: { label: 'Store Operations', icon: '⚡' },
  marketing: { label: 'Promotions & Growth', icon: '🏷️' },
  seo: { label: 'SEO & Performance', icon: '📈' },
  config: { label: 'Catalog & System', icon: '⚙️' },
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  selectedBranch,
  onBranchChange,
  children,
}) => {
  const { adminUser, adminLogout } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'operations' | 'marketing' | 'seo' | 'config'>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredTabs = useMemo(() => {
    let list = ALL_TABS;
    if (activeCategoryFilter !== 'all') {
      list = list.filter((t) => t.category === activeCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.badge && t.badge.toLowerCase().includes(q))
      );
    }
    return list;
  }, [searchQuery, activeCategoryFilter]);

  const groupedTabs = useMemo(() => {
    if (searchQuery.trim() || activeCategoryFilter !== 'all') return null;
    const groups: Record<'operations' | 'marketing' | 'seo' | 'config', TabItem[]> = {
      operations: [],
      marketing: [],
      seo: [],
      config: [],
    };
    ALL_TABS.forEach((tab) => {
      groups[tab.category].push(tab);
    });
    return groups;
  }, [searchQuery, activeCategoryFilter]);

  return (
    <div className="min-h-screen bg-[#0D1912] text-[#FAF6F0] flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 bg-[#14231B] border-b border-[#D3A762]/20 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#1C2D22] text-[#D3A762] hover:bg-[#253A2C]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg text-white tracking-wide">Taste of Village</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D3A762]/20 text-[#D3A762] border border-[#D3A762]/30">
                Admin CMS
              </span>
            </div>
            <p className="text-[11px] text-[#FAF6F0]/60 hidden sm:block">
              Dual-Branch Operations & WhatsApp Concierge
            </p>
          </div>
        </div>

        {/* Center: Branch Selector */}
        <div className="flex items-center bg-[#0D1912] border border-[#D3A762]/30 rounded-xl p-1 gap-1">
          <button
            onClick={() => onBranchChange('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedBranch === 'all'
                ? 'bg-[#D3A762] text-[#0D1912] shadow-sm'
                : 'text-[#FAF6F0]/70 hover:text-white'
            }`}
          >
            All Branches
          </button>
          <button
            onClick={() => onBranchChange('hayes')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedBranch === 'hayes'
                ? 'bg-[#D3A762] text-[#0D1912] shadow-sm'
                : 'text-[#FAF6F0]/70 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Hayes
          </button>
          <button
            onClick={() => onBranchChange('slough')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              selectedBranch === 'slough'
                ? 'bg-[#D3A762] text-[#0D1912] shadow-sm'
                : 'text-[#FAF6F0]/70 hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Slough
          </button>
        </div>

        {/* Right: Staff profile & logout */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-white flex items-center justify-end gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#D3A762]" />
              {adminUser?.name || 'Authorized Staff'}
            </div>
            <div className="text-[10px] uppercase font-bold text-[#D3A762] tracking-wider">
              {adminUser?.role || 'Manager'}
            </div>
          </div>
          <button
            onClick={adminLogout}
            className="p-2 rounded-xl bg-[#1C2D22] hover:bg-red-950/50 hover:text-red-300 text-[#FAF6F0]/70 border border-[#D3A762]/20 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:block w-full md:w-64 bg-[#14231B] border-r border-[#D3A762]/20 flex flex-col shrink-0 overflow-y-auto`}
        >
          {/* Search Box */}
          <div className="p-3 border-b border-[#D3A762]/10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#FAF6F0]/40" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762]"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-4 flex-1">
            {groupedTabs ? (
              (Object.keys(groupedTabs) as Array<keyof typeof groupedTabs>).map((cat) => (
                <div key={cat} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D3A762]/80 flex items-center gap-1.5">
                    <span>{CATEGORY_LABELS[cat].icon}</span>
                    <span>{CATEGORY_LABELS[cat].label}</span>
                  </div>
                  {groupedTabs[cat].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabChange(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#D3A762] text-[#0D1912] font-bold shadow-md'
                            : 'text-[#FAF6F0]/80 hover:bg-[#1C2D22] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D1912]' : 'text-[#D3A762]'}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              isActive
                                ? 'bg-[#0D1912]/20 text-[#0D1912]'
                                : 'bg-[#D3A762]/20 text-[#D3A762]'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="space-y-1">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#D3A762] text-[#0D1912] font-bold shadow-md'
                          : 'text-[#FAF6F0]/80 hover:bg-[#1C2D22] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D1912]' : 'text-[#D3A762]'}`} />
                        <span className="truncate">{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-[#0D1912]/20 text-[#0D1912]'
                              : 'bg-[#D3A762]/20 text-[#D3A762]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#D3A762]/10 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D1912] border border-[#D3A762]/20 text-xs text-[#D3A762] hover:bg-[#1C2D22] transition-colors"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Tab Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0D1912]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
