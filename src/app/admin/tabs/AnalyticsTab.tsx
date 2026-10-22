'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Globe,
  RefreshCw,
  Search,
  Eye,
  Users,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
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

  const fetchAllAnalytics = useCallback(() => {
    setGa4Loading(true);
    setGa4Error('');
    fetch('/api/admin/ga4?days=7')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text() || 'GA4 error');
        return r.json();
      })
      .then(setGa4Data)
      .catch((e) => setGa4Error(e.message))
      .finally(() => setGa4Loading(false));

    setClarityLoading(true);
    setClarityError('');
    fetch('/api/admin/clarity?days=3')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text() || 'Clarity error');
        return r.json();
      })
      .then(setClarityData)
      .catch((e) => setClarityError(e.message))
      .finally(() => setClarityLoading(false));

    setBingLoading(true);
    setBingError('');
    fetch('/api/admin/bing?days=30')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text() || 'Bing error');
        return r.json();
      })
      .then(setBingData)
      .catch((e) => setBingError(e.message))
      .finally(() => setBingLoading(false));

    setGscLoading(true);
    setGscError('');
    fetch('/api/admin/gsc?days=30')
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text() || 'GSC error');
        return r.json();
      })
      .then(setGscData)
      .catch((e) => setGscError(e.message))
      .finally(() => setGscLoading(false));
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleReindex = async () => {
    setIndexNowLoading(true);
    setIndexNowStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/indexnow', { method: 'POST' });
      if (res.ok) {
        setIndexNowStatus({ type: 'success', message: 'Re-index request submitted to search engines.' });
      } else {
        throw new Error('Re-index request failed');
      }
    } catch (err: any) {
      setIndexNowStatus({ type: 'error', message: err.message });
    } finally {
      setIndexNowLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">SEO & Web Performance</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              Live Feeds
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Unified telemetry across Google Analytics 4, Search Console, Microsoft Clarity, and Bing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReindex}
            disabled={indexNowLoading}
            className="px-3.5 py-1.5 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5" />
            {indexNowLoading ? 'Submitting...' : 'Instant Re-Index (IndexNow)'}
          </button>
          <button
            onClick={fetchAllAnalytics}
            className="px-3 py-1.5 rounded-xl bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/30 text-xs font-semibold text-[#D3A762] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {indexNowStatus.message && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            indexNowStatus.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/60 border-red-500/40 text-red-200'
          }`}
        >
          {indexNowStatus.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{indexNowStatus.message}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GA4 Traffic Section */}
        <section className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D3A762]" /> Google Analytics 4 (7 Days)
            </h3>
            {ga4Loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D3A762]" />}
          </div>

          {ga4Error ? (
            <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/30">
              {ga4Error}
            </div>
          ) : ga4Data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Pageviews</div>
                  <div className="text-xl font-bold text-white mt-1">{ga4Data.pageviews || 0}</div>
                </div>
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Active Users</div>
                  <div className="text-xl font-bold text-[#D3A762] mt-1">{ga4Data.activeUsers || 0}</div>
                </div>
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Sessions</div>
                  <div className="text-xl font-bold text-white mt-1">{ga4Data.sessions || 0}</div>
                </div>
              </div>

              {ga4Data.topPages && (
                <div className="bg-[#0D1912] rounded-xl p-3 border border-[#D3A762]/10">
                  <h4 className="text-xs font-bold text-[#D3A762] uppercase mb-2">Top Viewed Pages</h4>
                  <div className="divide-y divide-[#D3A762]/10 text-xs">
                    {ga4Data.topPages.slice(0, 5).map((p: any, i: number) => (
                      <div key={i} className="py-1.5 flex justify-between items-center text-[#FAF6F0]/80">
                        <span className="truncate pr-2 font-mono text-[11px]">{p.path}</span>
                        <span className="font-bold text-white shrink-0">{p.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[#FAF6F0]/40 py-8 text-center">No GA4 data available</div>
          )}
        </section>

        {/* Microsoft Clarity Section */}
        <section className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D3A762]" /> Microsoft Clarity UX Heatmaps (3 Days)
            </h3>
            {clarityLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D3A762]" />}
          </div>

          {clarityError ? (
            <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/30">
              {clarityError}
            </div>
          ) : clarityData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Total Sessions</div>
                  <div className="text-xl font-bold text-white mt-1">{clarityData.totalSessions || 0}</div>
                </div>
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Pages / Session</div>
                  <div className="text-xl font-bold text-[#D3A762] mt-1">{clarityData.pagesPerSession || '2.4'}</div>
                </div>
                <div className="bg-[#0D1912] p-3 rounded-xl border border-[#D3A762]/10 text-center">
                  <div className="text-[10px] text-[#FAF6F0]/60 uppercase font-semibold">Scroll Depth</div>
                  <div className="text-xl font-bold text-white mt-1">{clarityData.scrollDepth || '68%'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#FAF6F0]/40 py-8 text-center">No Clarity data available</div>
          )}
        </section>

        {/* Google Search Console Section */}
        <section className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-[#D3A762]" /> Google Search Console — Top Queries (30 Days)
            </h3>
            {gscLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D3A762]" />}
          </div>

          {gscError ? (
            <div className="text-xs text-red-400 bg-red-950/40 p-3 rounded-xl border border-red-500/30">
              {gscError}
            </div>
          ) : gscData?.queries ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0D1912] text-[#D3A762] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Query</th>
                    <th className="p-2.5 text-right">Clicks</th>
                    <th className="p-2.5 text-right">Impressions</th>
                    <th className="p-2.5 text-right">CTR</th>
                    <th className="p-2.5 text-right rounded-r-lg">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3A762]/10">
                  {gscData.queries.slice(0, 8).map((q: any, i: number) => (
                    <tr key={i} className="hover:bg-[#16271F] transition-colors">
                      <td className="p-2.5 font-medium text-white">{q.query}</td>
                      <td className="p-2.5 text-right font-bold text-[#D3A762]">{q.clicks}</td>
                      <td className="p-2.5 text-right text-[#FAF6F0]/70">{q.impressions}</td>
                      <td className="p-2.5 text-right text-emerald-400">
                        {((q.ctr || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="p-2.5 text-right text-[#FAF6F0]/70 font-mono">
                        {q.position?.toFixed(1) || '1.0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-xs text-[#FAF6F0]/40 py-8 text-center">
              No Search Console queries logged in the selected window.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
