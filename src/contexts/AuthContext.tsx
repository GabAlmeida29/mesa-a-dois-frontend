'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { can as userCan, isAdminUser } from '@/lib/permissions';
import type { Permission, Profile } from '@/lib/types';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  can: (permission: Permission) => boolean;
  login: (email: string, password: string, code?: string) => Promise<void>;
  enroll: (enrollmentToken: string, code: string) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setUser((await api.me()).user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const onUnauthorized = () => setUser(null);
    window.addEventListener('mesa:unauthorized', onUnauthorized);
    return () => window.removeEventListener('mesa:unauthorized', onUnauthorized);
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string, code?: string) => {
      await api.login(email, password, code);
      await refresh();
    },
    [refresh],
  );

  const enroll = useCallback(
    async (enrollmentToken: string, code: string) => {
      await api.enrollTwoFactor(enrollmentToken, code);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: isAdminUser(user),
      can: (permission: Permission) => userCan(user, permission),
      login,
      enroll,
      refresh,
      setUser,
      logout,
    }),
    [user, loading, login, enroll, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
