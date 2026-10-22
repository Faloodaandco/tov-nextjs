'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Phone,
  Mail,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Booking {
  id: string;
  name?: string;
  customerName?: string;
  phone?: string;
  customerPhone?: string;
  email?: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  branch: string;
  status?: string;
  notes?: string;
}

interface Props {
  selectedBranch: 'all' | 'hayes' | 'slough';
}

export const BookingsTab: React.FC<Props> = ({ selectedBranch }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'CONFIRMED' | 'SEATED' | 'CANCELLED'>('all');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings?admin=true');
      const data = await res.json();
      if (data?.bookings) {
        setBookings(data.bookings);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = (id: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const filtered = bookings.filter((b) => {
    const bBranch = (b.branch || '').toLowerCase();
    const branchMatch = selectedBranch === 'all' || bBranch.includes(selectedBranch);
    const statusMatch = statusFilter === 'all' || (b.status || 'CONFIRMED').toUpperCase() === statusFilter;
    const name = (b.name || b.customerName || '').toLowerCase();
    const phone = (b.phone || b.customerPhone || '').toLowerCase();
    const searchMatch = !searchQuery || name.includes(searchQuery.toLowerCase()) || phone.includes(searchQuery.toLowerCase());
    return branchMatch && statusMatch && searchMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-lg text-white">Table Reservations</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3A762] bg-[#D3A762]/10 px-2 py-0.5 rounded border border-[#D3A762]/30">
              Dine-In Management
            </span>
          </div>
          <p className="text-xs text-[#FAF6F0]/70 mt-0.5">
            Review guest bookings, seat walk-ins, and manage table allocation across Hayes and Slough.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#1C2D22] hover:bg-[#253A2C] border border-[#D3A762]/30 text-xs font-semibold text-[#D3A762] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#FAF6F0]/40" />
          <input
            type="text"
            placeholder="Search booking by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#14231B] border border-[#D3A762]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#FAF6F0]/40 focus:outline-none focus:border-[#D3A762]"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-[#14231B] border border-[#D3A762]/20 rounded-xl p-1">
          {(['all', 'CONFIRMED', 'SEATED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#D3A762] text-[#0D1912] font-bold'
                  : 'text-[#FAF6F0]/70 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="bg-[#14231B] border border-[#D3A762]/20 rounded-2xl p-12 text-center text-[#FAF6F0]/50">
          <Clock className="w-12 h-12 text-[#D3A762]/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No reservations found</p>
          <p className="text-xs text-[#FAF6F0]/60 max-w-sm mx-auto mt-1">
            Bookings made by customers on the website will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const guestName = b.name || b.customerName || 'Guest';
            const guestPhone = b.phone || b.customerPhone;
            const currentStatus = (b.status || 'CONFIRMED').toUpperCase();

            return (
              <div
                key={b.id}
                className="bg-[#14231B] border border-[#D3A762]/25 rounded-2xl p-4 flex flex-col justify-between hover:border-[#D3A762]/50 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-white">{guestName}</h3>
                      <span className="text-[10px] text-[#FAF6F0]/50 font-mono">ID: {b.id.slice(0, 8)}</span>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                        currentStatus === 'CONFIRMED'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : currentStatus === 'SEATED'
                          ? 'bg-blue-950/40 text-blue-300 border-blue-500/30'
                          : 'bg-red-950/40 text-red-300 border-red-500/30'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>

                  <div className="bg-[#0D1912] rounded-xl p-3 my-3 space-y-2 border border-[#D3A762]/10 text-xs text-[#FAF6F0]/80">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-white font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-[#D3A762]" />
                        {b.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-white font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#D3A762]" />
                        {b.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#D3A762]/10">
                      <span className="flex items-center gap-1.5 text-[#D3A762]">
                        <Users className="w-3.5 h-3.5" />
                        {b.guests || 2} Guests
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF6F0]/60">
                        {b.branch || 'Hayes'}
                      </span>
                    </div>
                    {guestPhone && (
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-[#FAF6F0]/70">
                        <Phone className="w-3 h-3 text-[#D3A762]" />
                        {guestPhone}
                      </div>
                    )}
                    {b.notes && (
                      <div className="text-[11px] text-amber-300/80 italic pt-1 border-t border-[#D3A762]/10">
                        &quot;{b.notes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                {/* Status controls */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#D3A762]/10">
                  <button
                    onClick={() => updateBookingStatus(b.id, 'CONFIRMED')}
                    className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      currentStatus === 'CONFIRMED'
                        ? 'bg-emerald-500 text-black shadow-sm'
                        : 'bg-[#1C2D22] text-[#FAF6F0]/70 hover:text-white'
                    }`}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'SEATED')}
                    className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      currentStatus === 'SEATED'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'bg-[#1C2D22] text-[#FAF6F0]/70 hover:text-white'
                    }`}
                  >
                    Seated
                  </button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                    className={`py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      currentStatus === 'CANCELLED'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-[#1C2D22] text-[#FAF6F0]/70 hover:text-white'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
