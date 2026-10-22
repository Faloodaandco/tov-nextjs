'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  Send,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Database,
  ExternalLink,
} from 'lucide-react';

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

export const WabaHubTab: React.FC<Props> = ({ selectedBranch }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testBranch, setTestBranch] = useState<'hayes' | 'slough'>('hayes');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchWabaData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/waba');
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error connecting to Meta Graph API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWabaData();
  }, [fetchWabaData]);

  const handleSendTestPing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientPhone.trim()) return;
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/waba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch: testBranch,
          recipientPhone: recipientPhone.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        setTestResult({ success: false, error: resData.error || 'Failed to send test ping' });
      } else {
        setTestResult({
          success: true,
          messageId: resData.metaResponse?.messages?.[0]?.id || 'Dispatched',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || 'Error dispatching message' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">Meta WhatsApp Business API Hub</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              v21.0 Cloud API
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Real-time status of Meta system user tokens, phone health ratings, commerce catalogs, and test pings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWabaData}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/30 text-xs font-semibold text-[#D3A762] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Meta Health
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2 Column Phone Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hayes Card */}
        <div className="bg-[#14231B] border border-[#D3A762]/30 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Taste of Village — Hayes Branch
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {data?.hayes?.phone?.quality_rating || 'GREEN'} Quality
            </span>
          </div>

          <div className="bg-[#0D1912] rounded-xl p-3 space-y-2 border border-[#D3A762]/10 text-xs mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Display Number:</span>
              <span className="font-bold text-white font-mono">{data?.hayes?.phone?.display_phone_number || '+44 7424 216045'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Phone ID:</span>
              <span className="font-mono text-[11px] text-[#D3A762]">1309829288888481</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">WABA Account ID:</span>
              <span className="font-mono text-[11px] text-[#FAF6F0]/80">1405724971671322</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Commerce Catalog:</span>
              <span className="font-bold text-white">{data?.hayes?.catalog?.product_count || 120} dishes</span>
            </div>
          </div>

          <div className="text-[11px] text-[#FAF6F0]/60">
            Webhook: <code className="text-[#D3A762] text-[10px]">https://www.tasteofvillagerestaurants.co.uk/api/waba/webhook</code>
          </div>
        </div>

        {/* Slough Card */}
        <div className="bg-[#14231B] border border-[#D3A762]/30 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              Taste of Village — Slough Branch
            </h3>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {data?.slough?.phone?.quality_rating || 'GREEN'} Quality
            </span>
          </div>

          <div className="bg-[#0D1912] rounded-xl p-3 space-y-2 border border-[#D3A762]/10 text-xs mb-4">
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Display Number:</span>
              <span className="font-bold text-white font-mono">{data?.slough?.phone?.display_phone_number || '+44 7337 389133'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Phone ID:</span>
              <span className="font-mono text-[11px] text-[#D3A762]">1395146440346525</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">WABA Account ID:</span>
              <span className="font-mono text-[11px] text-[#FAF6F0]/80">2476578809531282</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#FAF6F0]/60">Commerce Catalog:</span>
              <span className="font-bold text-white">{data?.slough?.catalog?.product_count || 120} dishes</span>
            </div>
          </div>

          <div className="text-[11px] text-[#FAF6F0]/60">
            Webhook: <code className="text-[#D3A762] text-[10px]">https://www.tasteofvillagerestaurants.co.uk/api/waba/webhook</code>
          </div>
        </div>
      </div>

      {/* Test Ping Diagnostic Console */}
      <div className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-5 shadow-md">
        <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
          <Send className="w-4 h-4 text-[#D3A762]" /> Test Connectivity Ping
        </h3>
        <p className="text-xs text-[#FAF6F0]/70 mb-4">
          Send an instant verification test ping to any UK mobile number from either the Hayes or Slough official number.
        </p>

        <form onSubmit={handleSendTestPing} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-[#D3A762] uppercase mb-1">
              Dispatch From
            </label>
            <select
              value={testBranch}
              onChange={(e) => setTestBranch(e.target.value as any)}
              className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
            >
              <option value="hayes">Hayes (+44 7424 216045)</option>
              <option value="slough">Slough (+44 7337 389133)</option>
            </select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-[11px] font-semibold text-[#D3A762] uppercase mb-1">
              Recipient Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 07412345678 or +447412345678"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full bg-[#0D1912] border border-[#D3A762]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D3A762]"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={sendingTest || !recipientPhone.trim()}
              className="w-full py-2 px-4 rounded-xl bg-[#D3A762] hover:bg-[#dfb774] text-[#0D1912] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {sendingTest ? 'Sending...' : 'Send Test Ping'}
            </button>
          </div>
        </form>

        {testResult && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/60 border-red-500/40 text-red-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>
              {testResult.success
                ? `Success! Meta Message ID: ${testResult.messageId}`
                : `Failed: ${testResult.error}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
