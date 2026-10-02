'use client';

import clsx from 'clsx';
import { Monitor, Moon, Sun } from 'lucide-react';
import { THEME } from '@/constants/texts';
import { useTheme } from '@/contexts/ThemeContext';
import type { ThemePreference } from '@/lib/theme';

const OPTIONS: Array<{ value: ThemePreference; icon: typeof Sun; label: string }> = [
  { value: 'system', icon: Monitor, label: THEME.system },
  { value: 'light', icon: Sun, label: THEME.light },
  { value: 'dark', icon: Moon, label: THEME.dark },
];

export function ThemeSwitcher({ showLabels = false }: { showLabels?: boolean }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={THEME.label}
      className={clsx(
        'border-border bg-surface flex items-center gap-0.5 rounded-full border p-0.5',
        showLabels && 'w-full',
      )}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            data-track={`Tema: ${label}`}
            onClick={() => setPreference(value)}
            className={clsx(
              'flex items-center justify-center gap-1.5 rounded-full text-xs transition',
              showLabels ? 'flex-1 px-3 py-2' : 'size-8',
              active ? 'bg-surface-2 text-text shadow-sm' : 'text-faint hover:text-text',
            )}
          >
            <Icon className="size-4" />
            {showLabels ? label : <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
