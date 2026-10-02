'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { THEME_COLORS, THEME_STORAGE_KEY, type ResolvedTheme, type ThemePreference } from '@/lib/theme';

interface ThemeState {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const LIGHT_QUERY = '(prefers-color-scheme: light)';

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

const systemTheme = (): ResolvedTheme => (matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark');

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [system, setSystem] = useState<ResolvedTheme>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPreferenceState(readPreference());
    setReady(true);
    setSystem(systemTheme());
    const media = matchMedia(LIGHT_QUERY);
    const onChange = () => setSystem(systemTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const theme: ResolvedTheme = preference === 'system' ? system : preference;

  useEffect(() => {
    if (ready) applyTheme(theme);
  }, [ready, theme]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    try {
      if (p === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, p);
    } catch {
      return;
    }
  }, []);

  const value = useMemo(() => ({ preference, theme, setPreference }), [preference, theme, setPreference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
