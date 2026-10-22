'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export interface AdminUser {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'admin';
  branch?: 'hayes' | 'slough' | 'all';
  email?: string;
  method: 'pin' | 'google';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  loginWithPin: (pin: string) => Promise<boolean>;
  loginWithGoogleAdmin: () => Promise<boolean>;
  adminLogout: () => void;
  error: string | null;
  clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'tov_admin_session_user';

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from sessionStorage after mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
      if (saved) {
        setAdminUser(JSON.parse(saved));
      } else {
        // Fallback check for legacy pin
        const legacyPin = sessionStorage.getItem('tov_admin_pin');
        if (legacyPin) {
          setAdminUser({
            id: 'legacy_staff',
            name: 'Staff Member',
            role: 'manager',
            branch: 'all',
            method: 'pin',
          });
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  // Sync state to sessionStorage
  useEffect(() => {
    if (!hydrated) return;
    if (adminUser) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      sessionStorage.removeItem('tov_admin_pin');
    }
  }, [adminUser, hydrated]);

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    setError(null);
    const cleanPin = pin.trim();
    if (!cleanPin) {
      setError('Please enter a PIN code.');
      return false;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'pin', pin: cleanPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.user);
        sessionStorage.setItem('tov_admin_pin', cleanPin);
        return true;
      }

      setError(data.error || 'Invalid PIN code.');
      return false;
    } catch {
      setError('Connection failed. Please check network.');
      return false;
    }
  }, []);

  const loginWithGoogleAdmin = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (!auth || !googleProvider) {
      setError('Google Authentication is not initialized.');
      return false;
    }

    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      if (!idToken) {
        await signOut(auth);
        setError('Failed to obtain authentication token.');
        return false;
      }

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'google', idToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.user);
        return true;
      }

      await signOut(auth);
      setError(data.error || 'Access denied for this Google account.');
      return false;
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in error.');
      }
      return false;
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdminUser(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem('tov_admin_pin');
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    if (auth) {
      signOut(auth).catch(() => {});
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        loginWithPin,
        loginWithGoogleAdmin,
        adminLogout,
        error,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
