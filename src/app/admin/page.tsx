'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  const [ga4Data, setGa4Data] = useState<any>(null);
  const [ga4Loading, setGa4Loading] = useState(false);
  const [ga4Error, setGa4Error] = useState('');

  const [clarityData, setClarityData] = useState<any>(null);
  const [clarityLoading, setClarityLoading] = useState(false);
  const [clarityError, setClarityError] = useState('');

  const [bingData, setBingData] = useState<any>(null);
  const [bingLoading, setBingLoading] = useState(false);
  const [bingError, setBingError] = useState('');

  const [gscData, setGscData] = useState<any>(null);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscError, setGscError] = useState('');

  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [indexNowStatus, setIndexNowStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const savedPin = sessionStorage.getItem('tov_admin_pin');
    if (savedPin) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    const savedPin = sessionStorage.getItem('tov_admin_pin');
    const headers = { Authorization: `Bearer ${savedPin}` };

    setGa4Loading(true); setGa4Error('');
    fetch('/api/admin/ga4?days=7', { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text() || 'GA4 fetch error'); return r.json(); })
      .then(setGa4Data)
      .catch(e => setGa4Error(e.message))
      .finally(() => setGa4Loading(false));

    setClarityLoading(true); setClarityError('');
    fetch('/api/admin/clarity?days=3', { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text() || 'Clarity fetch error'); return r.json(); })
      .then(setClarityData)
      .catch(e => setClarityError(e.message))
      .finally(() => setClarityLoading(false));

    setBingLoading(true); setBingError('');
    fetch('/api/admin/bing?days=30', { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text() || 'Bing fetch error'); return r.json(); })
      .then(setBingData)
      .catch(e => setBingError(e.message))
      .finally(() => setBingLoading(false));

    setGscLoading(true); setGscError('');
    fetch('/api/admin/gsc?days=30', { headers })
      .then(async (r) => { if (!r.ok) throw new Error(await r.text() || 'GSC fetch error'); return r.json(); })
      .then(setGscData)
      .catch(e => setGscError(e.message))
      .finally(() => setGscLoading(false));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAuth(true);
    setAuthError('');
    try {
      const res = await fetch('/api/staff/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        sessionStorage.setItem('tov_admin_pin', pin);
        setIsAuthenticated(true);
      } else {
        setAuthError('Invalid PIN code');
      }
    } catch (err) {
      setAuthError('Connection error verifying PIN');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleReindex = async () => {
    const savedPin = sessionStorage.getItem('tov_admin_pin');
    setIndexNowLoading(true);
    setIndexNowStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/indexnow', {
        method: 'POST',
        headers: { Authorization: `Bearer ${savedPin}` }
      });
      if (res.ok) {
        setIndexNowStatus({ type: 'success', message: 'Re-index request accepted.' });
      } else {
        throw new Error('Re-index failed');
      }
    } catch (err: any) {
      setIndexNowStatus({ type: 'error', message: err.message });
    } finally {
      setIndexNowLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="animate-spin h-6 w-6 border-2 border-[#a64036] border-t-transparent rounded-full mx-auto"></div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-[#e5e5e5]">
          <h1 className="text-2xl font-bold text-[#1C2D22] text-center mb-6">Staff Access Required</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-[#354D3D] mb-1">Enter PIN</label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-2 border border-[#354D3D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D3A762] text-[#1C2D22]"
                required
                maxLength={8}
                pattern="[0-9]*"
                inputMode="numeric"
              />
            </div>
            {authError && <p className="text-[#a64036] text-sm font-medium">{authError}</p>}
            <button
              type="submit"
              disabled={isLoadingAuth}
              className="w-full bg-[#1C2D22] text-[#FAF6F0] py-2 px-4 rounded-md font-semibold hover:bg-[#354D3D] transition-colors disabled:opacity-50"
            >
              {isLoadingAuth ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#1C2D22]">
      <header className="bg-[#1C2D22] text-[#FAF6F0] p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">TASTE OF VILLAGE — ADMIN</h1>
          <button 
            onClick={() => { sessionStorage.removeItem('tov_admin_pin'); setIsAuthenticated(false); }}
            className="text-sm bg-[#354D3D] px-3 py-1 rounded hover:bg-[#a64036] transition-colors"
          >
            Lock
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Traffic Overview (GA4) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1C2D22]">Traffic Overview (7 Days)</h2>
              {ga4Loading && <LoadingSpinner />}
            </div>
            {ga4Error ? (
              <div className="text-[#a64036] text-sm mb-2">{ga4Error}</div>
            ) : ga4Data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FAF6F0] p-4 rounded-lg text-center">
                    <p className="text-sm text-[#354D3D] font-medium mb-1">Pageviews</p>
                    <p className="text-2xl font-bold text-[#1C2D22]">{ga4Data.pageviews || 0}</p>
                  </div>
                  <div className="bg-[#FAF6F0] p-4 rounded-lg text-center">
                    <p className="text-sm text-[#354D3D] font-medium mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-[#1C2D22]">{ga4Data.activeUsers || 0}</p>
                  </div>
                  <div className="bg-[#FAF6F0] p-4 rounded-lg text-center">
                    <p className="text-sm text-[#354D3D] font-medium mb-1">Sessions</p>
                    <p className="text-2xl font-bold text-[#1C2D22]">{ga4Data.sessions || 0}</p>
                  </div>
                </div>
                
                {ga4Data.topPages && (
                  <div>
                    <h3 className="text-sm font-bold text-[#354D3D] mb-2 border-b border-[#FAF6F0] pb-1">Top Pages</h3>
                    <ul className="space-y-2 text-sm">
                      {ga4Data.topPages.slice(0, 5).map((page: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center">
                          <span className="truncate pr-4 text-[#1C2D22]">{page.path}</span>
                          <span className="font-semibold bg-[#D3A762]/20 px-2 rounded text-[#1C2D22]">{page.views}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {ga4Data.branchSplit && (
                  <div>
                    <h3 className="text-sm font-bold text-[#354D3D] mb-2 border-b border-[#FAF6F0] pb-1">Branch Split (Location Pages)</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-green-50 border border-green-100 p-2 rounded">
                        <span className="block text-xs text-green-800 font-bold mb-1">HAYES</span>
                        <span className="text-lg font-semibold">{ga4Data.branchSplit.hayes || 0} views</span>
                      </div>
                      <div className="flex-1 bg-blue-50 border border-blue-100 p-2 rounded">
                        <span className="block text-xs text-blue-800 font-bold mb-1">SLOUGH</span>
                        <span className="text-lg font-semibold">{ga4Data.branchSplit.slough || 0} views</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#354D3D]">No data available.</p>
            )}
          </section>

          {/* Section 2: UX Health (Clarity) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1C2D22]">UX Health (3 Days)</h2>
              {clarityLoading && <LoadingSpinner />}
            </div>
            {clarityError ? (
              <div className="text-[#a64036] text-sm mb-2">{clarityError}</div>
            ) : clarityData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg text-center ${clarityData.deadClicks > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                    <p className="text-xs font-bold text-gray-700 mb-1">Dead Clicks</p>
                    <p className="text-2xl font-bold">{clarityData.deadClicks || 0}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${clarityData.rageClicks > 0 ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'}`}>
                    <p className="text-xs font-bold text-gray-700 mb-1">Rage Clicks</p>
                    <p className="text-2xl font-bold">{clarityData.rageClicks || 0}</p>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${clarityData.quickBacks > 0 ? 'bg-orange-50 border border-orange-100' : 'bg-green-50 border border-green-100'}`}>
                    <p className="text-xs font-bold text-gray-700 mb-1">Quick Backs</p>
                    <p className="text-2xl font-bold">{clarityData.quickBacks || 0}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-[#354D3D]">Average Scroll Depth</span>
                    <span className="text-sm font-bold text-[#1C2D22]">{clarityData.scrollDepth || 0}%</span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] rounded-full h-2.5">
                    <div className="bg-[#D3A762] h-2.5 rounded-full" style={{ width: `${clarityData.scrollDepth || 0}%` }}></div>
                  </div>
                </div>

                {clarityData.engagementTime && (
                  <div className="bg-[#FAF6F0] p-3 rounded flex justify-between items-center">
                    <span className="text-sm font-medium text-[#354D3D]">Avg Engagement Time</span>
                    <span className="font-bold text-[#1C2D22]">{clarityData.engagementTime}</span>
                  </div>
                )}

                {clarityData.breakdowns && (
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-bold text-[#354D3D] mb-1">Top Devices</p>
                      <ul className="text-gray-600 space-y-1">
                        {clarityData.breakdowns.devices?.slice(0,3).map((d: any, i: number) => <li key={i}>• {d}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-[#354D3D] mb-1">Top Browsers</p>
                      <ul className="text-gray-600 space-y-1">
                        {clarityData.breakdowns.browsers?.slice(0,3).map((b: any, i: number) => <li key={i}>• {b}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="font-bold text-[#354D3D] mb-1">Top Countries</p>
                      <ul className="text-gray-600 space-y-1">
                        {clarityData.breakdowns.countries?.slice(0,3).map((c: any, i: number) => <li key={i}>• {c}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#354D3D]">No data available.</p>
            )}
          </section>

          {/* Section 3: Search Performance (Bing) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1C2D22]">Search Performance (30 Days)</h2>
              {bingLoading && <LoadingSpinner />}
            </div>
            {bingError ? (
              <div className="text-[#a64036] text-sm mb-2">{bingError}</div>
            ) : bingData && bingData.topQueries?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF6F0] text-[#354D3D]">
                    <tr>
                      <th className="p-2 font-semibold">Query</th>
                      <th className="p-2 font-semibold text-right">Impressions</th>
                      <th className="p-2 font-semibold text-right">Clicks</th>
                      <th className="p-2 font-semibold text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bingData.topQueries.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#FAF6F0] last:border-0 hover:bg-[#FAF6F0]/50">
                        <td className="p-2 text-[#1C2D22] font-medium">{item.query}</td>
                        <td className="p-2 text-right text-gray-600">{item.impressions}</td>
                        <td className="p-2 text-right font-semibold text-[#1C2D22]">{item.clicks}</td>
                        <td className="p-2 text-right text-gray-600">{item.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !bingLoading ? (
              <div className="text-center py-8 bg-[#FAF6F0] rounded-lg">
                <p className="text-[#354D3D] font-medium">No search data available for this period.</p>
                <p className="text-xs text-gray-500 mt-1">Check back later once Bing indexes more pages.</p>
              </div>
            ) : null}
          </section>

          {/* Section 3b: Google Search Console (30 Days) */}
          <section className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1C2D22]">Google Search (30 Days)</h2>
              {gscLoading && <LoadingSpinner />}
            </div>
            {gscError ? (
              <div className="text-[#a64036] text-sm mb-2">{gscError}</div>
            ) : gscData && gscData.rows?.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#FAF6F0] p-3 rounded-lg text-center">
                    <p className="text-xs text-[#354D3D] font-medium">Impressions</p>
                    <p className="text-xl font-bold text-[#1C2D22]">{gscData.totals.impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-lg text-center">
                    <p className="text-xs text-[#354D3D] font-medium">Clicks</p>
                    <p className="text-xl font-bold text-[#1C2D22]">{gscData.totals.clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3 rounded-lg text-center">
                    <p className="text-xs text-[#354D3D] font-medium">CTR</p>
                    <p className="text-xl font-bold text-[#1C2D22]">{gscData.totals.ctr}%</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#FAF6F0] text-[#354D3D]">
                      <tr>
                        <th className="p-2 font-semibold">Search Query</th>
                        <th className="p-2 font-semibold text-right">Clicks</th>
                        <th className="p-2 font-semibold text-right">Impressions</th>
                        <th className="p-2 font-semibold text-right">CTR</th>
                        <th className="p-2 font-semibold text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gscData.rows.slice(0, 20).map((row: any, idx: number) => (
                        <tr key={idx} className="border-b border-[#FAF6F0] last:border-0 hover:bg-[#FAF6F0]/50">
                          <td className="p-2 text-[#1C2D22] font-medium">{row.query}</td>
                          <td className="p-2 text-right font-semibold text-[#1C2D22]">{row.clicks}</td>
                          <td className="p-2 text-right text-gray-600">{row.impressions}</td>
                          <td className="p-2 text-right text-gray-600">{row.ctr}%</td>
                          <td className="p-2 text-right text-gray-600">{row.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {gscData.dateRange && (
                  <p className="text-xs text-gray-400 mt-2">{gscData.dateRange.start} → {gscData.dateRange.end}</p>
                )}
              </div>
            ) : !gscLoading ? (
              <div className="text-center py-8 bg-[#FAF6F0] rounded-lg">
                <p className="text-[#354D3D] font-medium">No Google search data yet.</p>
                <p className="text-xs text-gray-500 mt-1">Data takes ~3 days to appear after the service account was added.</p>
              </div>
            ) : null}
          </section>

          {/* Section 4: Controls */}
          <section className="bg-white rounded-xl shadow-sm border border-[#e5e5e5] p-6 md:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-bold text-[#1C2D22] mb-4">Controls & Quick Links</h2>
            
            <div className="mb-8 p-4 bg-[#FAF6F0] border border-[#e5e5e5] rounded-lg">
              <h3 className="font-bold text-[#1C2D22] mb-2">Search Engine Indexing</h3>
              <p className="text-sm text-[#354D3D] mb-4">Notify search engines of recent content changes.</p>
              <button
                onClick={handleReindex}
                disabled={indexNowLoading}
                className="bg-[#a64036] hover:bg-red-800 text-white font-semibold py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center min-w-[160px]"
              >
                {indexNowLoading ? 'Sending...' : '🚀 Re-index All Pages'}
              </button>
              {indexNowStatus.message && (
                <p className={`mt-2 text-sm font-medium ${indexNowStatus.type === 'error' ? 'text-[#a64036]' : 'text-green-700'}`}>
                  {indexNowStatus.message}
                </p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-[#1C2D22] mb-3">External Dashboards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="https://analytics.google.com/analytics/web/#/p551410064" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-[#e5e5e5] rounded hover:border-[#D3A762] hover:bg-[#FAF6F0] transition-all group">
                  <span className="text-xl mr-3 opacity-80 group-hover:opacity-100">📊</span>
                  <span className="text-sm font-semibold text-[#1C2D22]">Google Analytics</span>
                </a>
                <a href="https://search.google.com/search-console?resource_id=https%3A%2F%2Ftasteofvillagerestaurants.co.uk%2F" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-[#e5e5e5] rounded hover:border-[#D3A762] hover:bg-[#FAF6F0] transition-all group">
                  <span className="text-xl mr-3 opacity-80 group-hover:opacity-100">🔎</span>
                  <span className="text-sm font-semibold text-[#1C2D22]">Google Search Console</span>
                </a>
                <a href="https://clarity.microsoft.com/projects/view/ydv01vt483/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-[#e5e5e5] rounded hover:border-[#D3A762] hover:bg-[#FAF6F0] transition-all group">
                  <span className="text-xl mr-3 opacity-80 group-hover:opacity-100">🔥</span>
                  <span className="text-sm font-semibold text-[#1C2D22]">MS Clarity</span>
                </a>
                <a href="https://www.bing.com/webmasters/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-[#e5e5e5] rounded hover:border-[#D3A762] hover:bg-[#FAF6F0] transition-all group">
                  <span className="text-xl mr-3 opacity-80 group-hover:opacity-100">🔍</span>
                  <span className="text-sm font-semibold text-[#1C2D22]">Bing Webmaster</span>
                </a>
                <a href="https://squareup.com/dashboard" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-[#e5e5e5] rounded hover:border-[#D3A762] hover:bg-[#FAF6F0] transition-all group">
                  <span className="text-xl mr-3 opacity-80 group-hover:opacity-100">💳</span>
                  <span className="text-sm font-semibold text-[#1C2D22]">Square (Hayes)</span>
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
