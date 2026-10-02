export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'mesa-theme';

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0c0b0e',
  light: '#f5efe7',
};

export const themeInitScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');var t=p==='light'||p==='dark'?p:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
