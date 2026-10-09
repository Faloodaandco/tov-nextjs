'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminWabaDashboard() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'diagnostics'>('overview');

  // Test ping state
  const [testBranch, setTestBranch] = useState<'hayes' | 'slough'>('hayes');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const savedPin = sessionStorage.getItem('tov_admin_pin');
    if (savedPin) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchWabaData();
  }, [isAuthenticated]);

  const fetchWabaData = async () => {
    const savedPin = sessionStorage.getItem('tov_admin_pin');
    if (!savedPin) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/waba', {
        headers: { Authorization: `Bearer ${savedPin}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to fetch status (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error connecting to Meta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setAuthError('');
    try {
      const res = await fetch('/api/staff/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        sessionStorage.setItem('tov_admin_pin', pin);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid PIN code');
      }
    } catch {
      setAuthError('Connection error verifying PIN');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSendTestPing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone) return;
    setSendingTest(true);
    setTestResult(null);
    const savedPin = sessionStorage.getItem('tov_admin_pin');

    try {
      const res = await fetch('/api/admin/waba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${savedPin}`,
        },
        body: JSON.stringify({
          branch: testBranch,
          recipientPhone,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setTestResult({ success: false, error: resData.error || 'Failed to send message' });
      } else {
        setTestResult({ success: true, messageId: resData.metaResponse?.messages?.[0]?.id });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Network error' });
    } finally {
      setSendingTest(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-[#e5e5e5] w-full max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-[#1C2D22] text-white flex items-center justify-center mx-auto mb-4 text-2xl">
            💬
          </div>
          <h1 className="text-xl font-bold text-[#1C2D22] text-center mb-1">Meta WABA Hub</h1>
          <p className="text-xs text-[#354D3D] text-center mb-6">Enter Staff PIN to access live WhatsApp diagnostics</p>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full text-center tracking-widest text-2xl font-bold py-3 border border-[#e5e5e5] rounded-xl focus:border-[#a64036] focus:outline-none mb-4"
            autoFocus
          />
          {authError && <p className="text-[#a64036] text-xs font-semibold text-center mb-4">{authError}</p>}
          <button
            type="submit"
            disabled={isLoadingAuth || !pin}
            className="w-full bg-[#1C2D22] hover:bg-[#a64036] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {isLoadingAuth ? 'Verifying...' : 'Unlock WABA Hub'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1C2D22]">
      {/* Top Header */}
      <header className="bg-[#1C2D22] text-[#FAF6F0] p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <div>
              <h1 className="text-lg font-bold tracking-wider">TASTE OF VILLAGE — META WABA HUB</h1>
              <p className="text-xs text-[#D3A762]">Dual-Branch WhatsApp Cloud API & Catalog Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs bg-[#354D3D] hover:bg-[#a64036] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Main Admin
            </Link>
            <Link
              href="/admin/promos"
              className="text-xs bg-[#354D3D] hover:bg-[#a64036] text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Promos CMS
            </Link>
            <button
              onClick={() => { sessionStorage.removeItem('tov_admin_pin'); setIsAuthenticated(false); }}
              className="text-xs bg-red-900/60 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 py-8 space-y-6">
        
        {/* Navigation Tabs & Refresh */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-pine/10 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#1C2D22] text-white shadow-sm'
                  : 'bg-white text-[#354D3D] border border-pine/10 hover:bg-[#FAF6F0]'
              }`}
            >
              📊 Live Accounts & Health
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'workflow'
                  ? 'bg-[#1C2D22] text-white shadow-sm'
                  : 'bg-white text-[#354D3D] border border-pine/10 hover:bg-[#FAF6F0]'
              }`}
            >
              ⚡ Complete System Workflow
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'diagnostics'
                  ? 'bg-[#1C2D22] text-white shadow-sm'
                  : 'bg-white text-[#354D3D] border border-pine/10 hover:bg-[#FAF6F0]'
              }`}
            >
              🧪 Diagnostic Test Workbench
            </button>
          </div>

          <button
            onClick={fetchWabaData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-[#1C2D22]/20 hover:border-[#1C2D22] px-4 py-2 rounded-xl text-xs font-bold text-[#1C2D22] transition-all disabled:opacity-50"
          >
            <span className={`inline-block ${loading ? 'animate-spin' : ''}`}>🔄</span>
            {loading ? 'Querying Meta Graph API...' : 'Refresh Live Status'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#a64036] p-4 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={fetchWabaData} className="underline text-xs">Retry</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & LIVE STATUS CARDS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Hayes Branch Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#a64036] bg-[#a64036]/10 px-2.5 py-1 rounded-full">
                      FLAGSHIP BRANCH #1
                    </span>
                    <h2 className="text-xl font-bold text-[#1C2D22] mt-2">Taste of Village Hayes</h2>
                    <p className="text-xs text-[#354D3D]">766B Uxbridge Rd, Hayes UB4 0RU</p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-green-800">
                      {data?.hayes?.phone?.status || 'CONNECTED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Phone Number</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      {data?.hayes?.phone?.display_phone_number || '+44 7424 216045'}
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Quality Rating</p>
                    <p className="text-sm font-bold text-green-700 mt-0.5 flex items-center gap-1">
                      🟢 {data?.hayes?.phone?.quality_rating || 'GREEN'}
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Catalog Dishes</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      🍲 {data?.hayes?.catalog?.product_count || 127} Active Items
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Messaging Tier</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      {data?.hayes?.phone?.messaging_limit_tier || 'TIER_250 / UNRESTRICTED'}
                    </p>
                  </div>
                </div>

                {/* Technical IDs for Hayes */}
                <div className="space-y-2 border-t border-pine/5 pt-4 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">WABA ID:</span>
                    <span className="font-bold text-[#1C2D22]">{data?.hayes?.waba?.id || '1405724971671322'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">Phone ID:</span>
                    <span className="font-bold text-[#1C2D22]">{data?.hayes?.phone?.id || '1309829288888481'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">Catalog ID:</span>
                    <span className="font-bold text-[#a64036]">{data?.hayes?.catalog?.id || '987964757674623'}</span>
                  </div>
                </div>
              </div>

              {/* Slough Branch Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                      FLAGSHIP BRANCH #2
                    </span>
                    <h2 className="text-xl font-bold text-[#1C2D22] mt-2">Taste of Village Slough</h2>
                    <p className="text-xs text-[#354D3D]">260 Farnham Road, Slough SL1 4XL</p>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-green-800">
                      {data?.slough?.phone?.status || 'CONNECTED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Phone Number</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      {data?.slough?.phone?.display_phone_number || '+44 7337 389133'}
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Quality Rating</p>
                    <p className="text-sm font-bold text-green-700 mt-0.5 flex items-center gap-1">
                      🟢 {data?.slough?.phone?.quality_rating || 'GREEN'}
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Catalog Dishes</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      🍛 {data?.slough?.catalog?.product_count || 120} Active Items
                    </p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-pine/5">
                    <p className="text-[10px] font-bold text-[#354D3D] uppercase">Messaging Tier</p>
                    <p className="text-sm font-bold text-[#1C2D22] mt-0.5">
                      {data?.slough?.phone?.messaging_limit_tier || 'TIER_250 / UNRESTRICTED'}
                    </p>
                  </div>
                </div>

                {/* Technical IDs for Slough */}
                <div className="space-y-2 border-t border-pine/5 pt-4 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">WABA ID:</span>
                    <span className="font-bold text-[#1C2D22]">{data?.slough?.waba?.id || '2476578809531282'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">Phone ID:</span>
                    <span className="font-bold text-[#1C2D22]">{data?.slough?.phone?.id || '1395146440346525'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-dashed border-pine/10">
                    <span className="text-gray-500">Catalog ID:</span>
                    <span className="font-bold text-blue-700">{data?.slough?.catalog?.id || '1657059252594459'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Status Bar */}
            <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5] flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <h4 className="font-bold text-sm text-[#1C2D22]">Cryptographic Webhook Security</h4>
                  <p className="text-xs text-gray-500">HMAC-SHA256 signature verification active for Square & Meta</p>
                </div>
              </div>
              <div className="text-xs font-mono bg-[#FAF6F0] px-3 py-1.5 rounded-lg border border-pine/10">
                Endpoint: https://www.tasteofvillagerestaurants.co.uk/api/waba/webhook
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLETE ARCHITECTURAL WORKFLOW VISUALIZATION */}
        {activeTab === 'workflow' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 lg:p-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#1C2D22]">The Meta WABA Conversational Commerce Pipeline</h2>
              <p className="text-sm text-[#354D3D] mt-1">
                How customer messages flow from WhatsApp to your kitchen with zero marketplace fees
              </p>
            </div>

            {/* Visual Pipeline Flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              
              {/* Step 1 */}
              <div className="bg-[#FAF6F0] border-2 border-pine/20 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#a64036] transition-all">
                <div className="text-xs font-black text-[#a64036] uppercase tracking-wider mb-2">Stage 01</div>
                <div>
                  <div className="text-2xl mb-2">📱</div>
                  <h3 className="font-bold text-sm text-[#1C2D22]">Customer Interaction</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Diner taps WhatsApp link or sends text to Hayes (+447424216045) or Slough (+447337389133).
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-pine/10 text-[10px] text-gray-500 font-mono">
                  Protocols: E.164, HTTPS
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FAF6F0] border-2 border-pine/20 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#a64036] transition-all">
                <div className="text-xs font-black text-[#a64036] uppercase tracking-wider mb-2">Stage 02</div>
                <div>
                  <div className="text-2xl mb-2">☁️</div>
                  <h3 className="font-bold text-sm text-[#1C2D22]">Meta Cloud API</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Meta verifies sender, formats event JSON, and fires an HTTPS webhook to Taste of Village servers.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-pine/10 text-[10px] text-gray-500 font-mono">
                  Graph API v21.0
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#FAF6F0] border-2 border-pine/20 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#a64036] transition-all">
                <div className="text-xs font-black text-[#a64036] uppercase tracking-wider mb-2">Stage 03</div>
                <div>
                  <div className="text-2xl mb-2">🧠</div>
                  <h3 className="font-bold text-sm text-[#1C2D22]">Smart Branch Router</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Webhook reads <code className="text-[#a64036]">phone_number_id</code> to isolate Hayes vs Slough and dispatches interactive catalog lists.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-pine/10 text-[10px] text-gray-500 font-mono">
                  Gemini Flash + Postcodes.io
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#FAF6F0] border-2 border-pine/20 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#a64036] transition-all">
                <div className="text-xs font-black text-[#a64036] uppercase tracking-wider mb-2">Stage 04</div>
                <div>
                  <div className="text-2xl mb-2">💳</div>
                  <h3 className="font-bold text-sm text-[#1C2D22]">Square Direct Pay</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Customer receives secure 1-tap Apple Pay/Google Pay link with server-verified prices and anti-stacking discount rules.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-pine/10 text-[10px] text-gray-500 font-mono">
                  Square REST API v2
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-[#FAF6F0] border-2 border-pine/20 rounded-2xl p-5 flex flex-col justify-between relative group hover:border-[#a64036] transition-all">
                <div className="text-xs font-black text-[#a64036] uppercase tracking-wider mb-2">Stage 05</div>
                <div>
                  <div className="text-2xl mb-2">🔥</div>
                  <h3 className="font-bold text-sm text-[#1C2D22]">Kitchen & Live Tracker</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Square webhook confirms payment, sends instant WhatsApp receipt with live tracking URL, and queues review loop.
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-pine/10 text-[10px] text-gray-500 font-mono">
                  Firestore + 24H SEO Loop
                </div>
              </div>

            </div>

            {/* Detailed Multi-Branch Routing Matrix */}
            <div className="bg-[#FAF6F0] rounded-2xl p-6 border border-pine/10 space-y-4">
              <h3 className="font-bold text-base text-[#1C2D22]">Dual-Branch Execution Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-pine/20 text-[#354D3D]">
                      <th className="py-2 font-bold">Branch</th>
                      <th className="py-2 font-bold">Dedicated Phone</th>
                      <th className="py-2 font-bold">Phone Number ID</th>
                      <th className="py-2 font-bold">Meta Catalog ID</th>
                      <th className="py-2 font-bold">Square Location ID</th>
                      <th className="py-2 font-bold">Delivery Radius</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pine/10">
                    <tr>
                      <td className="py-2.5 font-bold text-[#a64036]">Hayes Flagship</td>
                      <td className="py-2.5 font-mono">+44 7424 216045</td>
                      <td className="py-2.5 font-mono">1309829288888481</td>
                      <td className="py-2.5 font-mono">987964757674623 (127 items)</td>
                      <td className="py-2.5 font-mono">LW0Z07P1KP8HB</td>
                      <td className="py-2.5 font-semibold">5 Miles (UB3, UB4, UB7)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold text-blue-700">Slough Flagship</td>
                      <td className="py-2.5 font-mono">+44 7337 389133</td>
                      <td className="py-2.5 font-mono">1395146440346525</td>
                      <td className="py-2.5 font-mono">1657059252594459 (120 items)</td>
                      <td className="py-2.5 font-mono">LD40KJ3QHAPGK</td>
                      <td className="py-2.5 font-semibold">5 Miles (SL1, SL2, SL3)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIAGNOSTIC TEST WORKBENCH */}
        {activeTab === 'diagnostics' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#e5e5e5] p-6 lg:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1C2D22]">Meta Cloud API Diagnostics & Ping Test</h2>
              <p className="text-sm text-[#354D3D] mt-1">
                Send a live test message from either branch directly to your mobile phone to verify API connectivity.
              </p>
            </div>

            <form onSubmit={handleSendTestPing} className="max-w-xl space-y-4 bg-[#FAF6F0] p-6 rounded-2xl border border-pine/10">
              <div>
                <label className="block text-xs font-bold text-[#1C2D22] mb-1">Select Origin Branch:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTestBranch('hayes')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      testBranch === 'hayes'
                        ? 'bg-[#a64036] text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    Hayes (+44 7424 216045)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBranch('slough')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      testBranch === 'slough'
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    Slough (+44 7337 389133)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C2D22] mb-1">Recipient Mobile Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 07424216045 or +447424216045"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-[#a64036] focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Sends an immediate diagnostics confirmation via Meta Cloud API v21.0.
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingTest || !recipientPhone}
                className="w-full bg-[#1C2D22] hover:bg-[#a64036] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {sendingTest ? 'Sending via Meta API...' : `🚀 Send Test Ping from ${testBranch.toUpperCase()}`}
              </button>

              {testResult && (
                <div className={`p-4 rounded-xl text-xs font-mono ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-[#a64036]'
                }`}>
                  {testResult.success ? (
                    <div>
                      <p className="font-bold text-sm">✅ Test Message Dispatched Successfully!</p>
                      <p className="mt-1 text-[11px]">Message ID: {testResult.messageId}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold text-sm">❌ Dispatch Failed</p>
                      <p className="mt-1 text-[11px]">{testResult.error}</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
