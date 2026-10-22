'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithPin, loginWithGoogleAdmin, error, clearError } = useAdminAuth();
  const router = useRouter();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    const success = await loginWithPin(pin);
    setLoading(false);
    if (success) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const nextUrl = params?.get('next') || '/admin';
      router.replace(nextUrl);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const success = await loginWithGoogleAdmin();
    setLoading(false);
    if (success) {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const nextUrl = params?.get('next') || '/admin';
      router.replace(nextUrl);
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      clearError();
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    clearError();
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-[#0D1912] text-[#FAF6F0] flex flex-col justify-center items-center px-4 py-8 select-none relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,167,98,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md bg-[#16271F] border border-[#D3A762]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-xl z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D3A762]/10 border border-[#D3A762]/40 text-[#D3A762] mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide text-white">Taste of Village</h1>
          <p className="text-xs uppercase tracking-widest text-[#D3A762] font-semibold mt-1">
            Store & Staff Portal
          </p>
          <div className="flex justify-center gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#1C2D22] border border-[#D3A762]/30 text-[#D3A762]">
              Hayes • Slough
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-medium animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#D3A762] uppercase tracking-wider mb-2 text-center">
              Enter Staff / Manager PIN
            </label>
            <div className="flex justify-center items-center gap-3 my-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    index < pin.length
                      ? 'bg-[#D3A762] border-[#D3A762] scale-110 shadow-[0_0_12px_rgba(211,167,98,0.8)]'
                      : 'border-[#FAF6F0]/20 bg-black/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleNumberClick(digit)}
                className="h-14 rounded-2xl bg-[#1C2D22] hover:bg-[#D3A762]/20 active:scale-95 border border-[#D3A762]/20 text-lg font-semibold text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDelete}
              className="h-14 rounded-2xl bg-[#1C2D22]/60 hover:bg-red-950/40 active:scale-95 border border-red-500/30 text-xs font-semibold text-red-300 transition-all flex items-center justify-center cursor-pointer"
            >
              DEL
            </button>
            <button
              type="button"
              onClick={() => handleNumberClick('0')}
              className="h-14 rounded-2xl bg-[#1C2D22] hover:bg-[#D3A762]/20 active:scale-95 border border-[#D3A762]/20 text-lg font-semibold text-white transition-all flex items-center justify-center cursor-pointer shadow-sm"
            >
              0
            </button>
            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="h-14 rounded-2xl bg-[#D3A762] hover:bg-[#dfb774] active:scale-95 text-[#0D1912] font-bold transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(211,167,98,0.4)]"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#FAF6F0]/10" />
          </div>
          <span className="relative bg-[#16271F] px-3 text-[11px] uppercase tracking-wider text-[#FAF6F0]/50 font-medium">
            or sign in with
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-[#1C2D22] hover:bg-[#23382b] border border-[#D3A762]/30 text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17c1.8 3.7 5.6 7 10.1 7z" />
          </svg>
          Google Staff SSO
        </button>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#D3A762]/80 hover:text-[#D3A762] transition-colors underline"
          >
            ← Return to Taste of Village Website
          </Link>
        </div>
      </div>
    </div>
  );
}
