// @ts-nocheck
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, User, Phone, Loader2, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) => {
  const { sendMagicLink, loginWithGoogle, setupRecaptcha, sendPhoneCode, confirmPhoneCode } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    otp: '',
  });

  const [verificationResult, setVerificationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setError('');
      setSuccess('');
      setForm({ email: '', name: '', phone: '', otp: '' });
      setVerificationResult(null);
      
      // Initialize reCAPTCHA when modal opens
      if (!recaptchaVerifierRef.current) {
         try {
           recaptchaVerifierRef.current = setupRecaptcha('recaptcha-container');
         } catch (e) {
           console.error("Recaptcha setup error", e);
         }
      }
    }
  }, [isOpen, defaultTab, setupRecaptcha]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (tab === 'login') {
        await sendMagicLink(form.email);
        setSuccess('Check your email for the login link!');
      } else if (tab === 'signup') {
        if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return; }
        await sendMagicLink(form.email, form.name, form.phone || undefined);
        setSuccess('Account created! Check your email to login.');
      }
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please refresh and try again.');
      } else {
        const msg = err?.message?.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim();
        setError(msg || 'Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (tab === 'signup' && !form.name.trim()) { 
        setError('Please enter your name'); 
        setLoading(false); 
        return; 
    }

    try {
      let phoneNumber = form.phone.trim();
      if (!phoneNumber.startsWith('+')) {
         // Default to UK if no country code provided
         if (phoneNumber.startsWith('0')) {
             phoneNumber = '+44' + phoneNumber.substring(1);
         } else {
             phoneNumber = '+44' + phoneNumber;
         }
      }
      
      if (recaptchaVerifierRef.current) {
        const result = await sendPhoneCode(phoneNumber, recaptchaVerifierRef.current);
        setVerificationResult(result);
        setSuccess('SMS code sent!');
        setTimeout(() => setSuccess(''), 3000); // clear success msg after 3s to show OTP input
      } else {
        setError('reCAPTCHA not initialized. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please refresh and try again.');
      } else {
        const msg = err?.message?.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim();
        setError(msg || 'Failed to send SMS. Make sure the number is valid.');
      }
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationResult) return;
    
    setError('');
    setLoading(true);

    try {
      await confirmPhoneCode(verificationResult, form.otp, tab === 'signup' ? form.name : undefined);
      setSuccess('Successfully logged in!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
       const msg = err?.message?.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim();
       setError(msg || 'Invalid SMS code. Please try again.');
    }
    setLoading(false);
  }

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(form.phone);
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User closed popup
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please refresh and try again.');
      } else if (err?.code === 'auth/configuration-not-found' || err?.code === 'auth/operation-not-allowed' || err?.message?.includes('CONFIGURATION_NOT_FOUND')) {
        setError('Google sign-in is undergoing scheduled setup. Please use email or phone.');
      } else {
        const msg = err?.message?.replace(/^Firebase:\s*/i, '').replace(/\(auth\/[a-z0-9-]+\)\.?/i, '').trim();
        setError(msg || 'Google sign-in failed. Please try another method.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-md rounded-none p-8 sm:p-10 shadow-2xl z-10 max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button aria-label="Close" onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        <div id="recaptcha-container"></div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl font-bold text-brand-text">
            {tab === 'login' ? 'Welcome Back' : 'Join Taste of Village'}
          </h2>
          <p className="text-brand-text/50 text-sm mt-2">
            {tab === 'login' ? 'Sign in to view your rewards' :
             'Create an account to track rewards & orders'}
          </p>
        </div>

        {/* Google Sign-In */}
        {!verificationResult && !success && (
          <>
            <button aria-label="Button"
              onClick={handleGoogle}
              disabled={loading || !!success}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-none border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all font-bold text-brand-text disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-brand-text/30 text-xs font-bold uppercase">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button aria-label="Button" 
                type="button"
                onClick={() => {setAuthMethod('email'); setError('');}}
                className={`flex-1 py-3 text-sm font-bold border-2 transition-colors flex items-center justify-center gap-2 ${authMethod === 'email' ? 'border-brand-text bg-brand-text text-white' : 'border-gray-100 text-brand-text hover:border-gray-200'}`}
              >
                <Mail size={16} /> Email Link
              </button>
              <button aria-label="Button" 
                type="button"
                onClick={() => {setAuthMethod('phone'); setError('');}}
                className={`flex-1 py-3 text-sm font-bold border-2 transition-colors flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'border-brand-text bg-brand-text text-white' : 'border-gray-100 text-brand-text hover:border-gray-200'}`}
              >
                <Smartphone size={16} /> SMS Code
              </button>
            </div>
          </>
        )}

        {/* Phone OTP Verification Form */}
        {verificationResult && !success && (
           <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-up">
              <p className="text-sm text-brand-text/70 mb-4 text-center">
                We sent a 6-digit code to {form.phone}.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={form.otp}
                  onChange={e => setForm(f => ({ ...f, otp: e.target.value }))}
                  placeholder="6-digit Code"
                  className="w-full px-4 py-4 rounded-none border-2 border-gray-100 focus:border-brand-pink outline-none text-brand-text font-medium transition-colors text-center text-xl tracking-widest disabled:opacity-50"
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-none">{error}</p>
              )}
              <button aria-label="Button"
                type="submit"
                disabled={loading || form.otp.length < 6}
                className="w-full py-4 bg-brand-text text-white font-bold rounded-none hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Login'}
              </button>
              <button aria-label="Button"
                 type="button"
                 onClick={() => { setVerificationResult(null); setForm(f => ({...f, otp: ''})); setError(''); }}
                 className="w-full text-center text-sm font-bold text-brand-text/50 hover:text-brand-text mt-4"
              >
                 Change phone number
              </button>
           </form>
        )}

        {/* Main Form */}
        {!verificationResult && (
          <form onSubmit={authMethod === 'email' ? handleEmailSubmit : handlePhoneSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30" />
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Full Name"
                  className="w-full pl-12 pr-4 py-4 rounded-none border-2 border-gray-100 focus:border-brand-pink outline-none text-brand-text font-medium transition-colors disabled:opacity-50"
                  required
                  disabled={!!success || loading}
                />
              </div>
            )}

            {authMethod === 'email' ? (
              <>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 rounded-none border-2 border-gray-100 focus:border-brand-pink outline-none text-brand-text font-medium transition-colors disabled:opacity-50"
                    required
                    disabled={!!success || loading}
                  />
                </div>
                {tab === 'signup' && (
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="Phone (optional — links your rewards)"
                      className="w-full pl-12 pr-4 py-4 rounded-none border-2 border-gray-100 focus:border-brand-pink outline-none text-brand-text font-medium transition-colors disabled:opacity-50"
                      disabled={!!success || loading}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/30" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Mobile Number (e.g. 07123456789)"
                  className="w-full pl-12 pr-4 py-4 rounded-none border-2 border-gray-100 focus:border-brand-pink outline-none text-brand-text font-medium transition-colors disabled:opacity-50"
                  required
                  disabled={!!success || loading}
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-none">{error}</p>
            )}
            
            {success && authMethod === 'email' && (
              <div className="text-green-600 text-sm font-bold bg-green-50 p-4 rounded-none flex flex-col items-center justify-center gap-2 text-center animate-slide-up">
                <CheckCircle size={24} />
                <span>{success}</span>
                <p className="text-green-600/70 text-xs font-medium mt-1">You can safely close this window.</p>
              </div>
            )}
            
            {success && authMethod === 'phone' && (
              <div className="text-green-600 text-sm font-bold bg-green-50 p-4 rounded-none flex flex-col items-center justify-center gap-2 text-center animate-slide-up">
                <CheckCircle size={24} />
                <span>{success}</span>
              </div>
            )}

            {!success && (
              <button aria-label="Button"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-text text-white font-bold rounded-none hover:bg-brand-text/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    {authMethod === 'email' ? (tab === 'login' ? 'Send Login Link' : 'Send Signup Link') : 'Send SMS Code'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </form>
        )}

        {/* Footer links */}
        {!success && !verificationResult && (
          <div className="mt-6 text-center text-sm">
            {tab === 'login' && (
              <p className="text-brand-text/40">
                Don't have an account?{' '}
                <button aria-label="Button" onClick={() => { setTab('signup'); setError(''); }} className="text-brand-pink font-bold hover:underline">
                  Sign Up
                </button>
              </p>
            )}
            {tab === 'signup' && (
              <p className="text-brand-text/40">
                Already have an account?{' '}
                <button aria-label="Button" onClick={() => { setTab('login'); setError(''); }} className="text-brand-pink font-bold hover:underline">
                  Sign In
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};
