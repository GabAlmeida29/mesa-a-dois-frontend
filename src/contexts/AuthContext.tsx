'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;

  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, code?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .me()
      .then(({ user: u }) => active && setUser(u))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));

    const onUnauthorized = () => setUser(null);
    window.addEventListener('mesa:unauthorized', onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('mesa:unauthorized', onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string, code?: string) => {
    const { user: u } = await api.login(email, password, code);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAdmin: !!user, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
