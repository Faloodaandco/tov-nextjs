'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CampaignService, CampaignLead } from '@/services/CampaignService';

function VoucherLeadsContent() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get('scan');
  
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<CampaignLead[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      
      if (res.ok) {
        setAuthenticated(true);
        fetchLeads();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Invalid PIN');
      }
    } catch (err) {
      alert('Error connecting to server');
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await CampaignService.getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded-xl shadow-md max-w-sm w-full text-center">
          <h1 className="text-2xl font-black uppercase text-[#1A3C34] mb-4">Staff Login</h1>
          {scanId && (
            <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm font-bold">
              Scan detected for: {scanId}
            </div>
          )}
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter Staff PIN"
            className="w-full border-2 border-gray-300 rounded-lg p-3 text-center text-xl tracking-widest font-mono focus:border-[#D14836] outline-none"
          />
          <button type="submit" className="w-full bg-[#1A3C34] text-white p-3 rounded-lg font-bold mt-4">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-[#1A3C34]">Voucher Leads Dashboard</h1>
          <button onClick={fetchLeads} className="bg-gray-200 px-4 py-2 rounded font-bold text-sm">
            Refresh
          </button>
        </div>
        
        {scanId && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 flex justify-between items-center border border-green-200">
            <div>
              <p className="font-bold">Scanned Customer Code:</p>
              <p className="text-2xl font-mono">{scanId}</p>
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-black uppercase shadow hover:bg-green-700">
              Redeem Now
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 font-bold text-gray-700">Date</th>
                  <th className="p-3 font-bold text-gray-700">Name</th>
                  <th className="p-3 font-bold text-gray-700">Phone</th>
                  <th className="p-3 font-bold text-gray-700">Code</th>
                  <th className="p-3 font-bold text-gray-700">Branch</th>
                  <th className="p-3 font-bold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-100">
                    <td className="p-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-medium">{lead.name}</td>
                    <td className="p-3">{lead.phone}</td>
                    <td className="p-3 font-mono bg-gray-50">{lead.voucherCode}</td>
                    <td className="p-3 capitalize">{lead.branch || lead.location}</td>
                    <td className="p-3">
                      {lead.isUsed ? (
                        <span className="text-gray-400 font-bold text-xs uppercase bg-gray-100 px-2 py-1 rounded">Used</span>
                      ) : (
                        <span className="text-green-600 font-bold text-xs uppercase bg-green-50 px-2 py-1 rounded">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500">No leads found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VoucherLeads() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VoucherLeadsContent />
    </Suspense>
  );
}
