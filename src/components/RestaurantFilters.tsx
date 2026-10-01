'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import { RESTAURANTS } from '@/constants/texts';
import { EMPTY_FILTERS, distinctOptions, norm, type RestaurantFilters } from '@/lib/filters';
import type { Restaurant } from '@/lib/types';

const T = RESTAURANTS.filters;
const RATINGS = [5, 6, 7, 8, 9];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'rounded-full border px-3 py-1.5 text-sm transition',
        active
          ? 'border-accent bg-accent/15 text-accent-strong'
          : 'border-border bg-surface-2 text-muted hover:border-faint hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="text-faint mb-2 text-xs font-medium tracking-wide uppercase">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function RestaurantFiltersPanel({
  source,
  value,
  onChange,
}: {
  source: Restaurant[];
  value: RestaurantFilters;
  onChange: (f: RestaurantFilters) => void;
}) {
  const cuisines = distinctOptions(source, (r) => r.cuisine);
  const cities = distinctOptions(source, (r) => r.city);

  const toggle = <K extends 'cuisines' | 'cities'>(key: K, label: string) => {
    const has = value[key].some((v) => norm(v) === norm(label));
    onChange({
      ...value,
      [key]: has ? value[key].filter((v) => norm(v) !== norm(label)) : [...value[key], label],
    });
  };
  const isOn = (key: 'cuisines' | 'cities', label: string) => value[key].some((v) => norm(v) === norm(label));

  return (
    <div className="card space-y-5 p-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Group title={T.cuisine}>
          {cuisines.length === 0 && <span className="text-faint text-sm">{T.none}</span>}
          {cuisines.map((c) => (
            <Chip
              key={c.label}
              active={isOn('cuisines', c.label)}
              onClick={() => toggle('cuisines', c.label)}
            >
              {c.label} <span className="opacity-60">({c.count})</span>
            </Chip>
          ))}
        </Group>

        <Group title={T.city}>
          {cities.length === 0 && <span className="text-faint text-sm">{T.none}</span>}
          {cities.map((c) => (
            <Chip key={c.label} active={isOn('cities', c.label)} onClick={() => toggle('cities', c.label)}>
              {c.label} <span className="opacity-60">({c.count})</span>
            </Chip>
          ))}
        </Group>

        <Group title={T.price}>
          {[1, 2, 3, 4].map((p) => (
            <Chip
              key={p}
              active={value.prices.includes(p)}
              onClick={() =>
                onChange({
                  ...value,
                  prices: value.prices.includes(p)
                    ? value.prices.filter((x) => x !== p)
                    : [...value.prices, p],
                })
              }
            >
              {'$'.repeat(p)}
            </Chip>
          ))}
        </Group>

        <Group title={T.rating}>
          <Chip active={!value.minRating} onClick={() => onChange({ ...value, minRating: 0 })}>
            {T.ratingAny}
          </Chip>
          {RATINGS.map((n) => (
            <Chip key={n} active={value.minRating === n} onClick={() => onChange({ ...value, minRating: n })}>
              ★ {T.ratingMin(n)}
            </Chip>
          ))}
        </Group>

        <Group title={T.period}>
          <label className="text-muted flex items-center gap-2 text-sm">
            {T.from}
            <input
              type="date"
              className="input !w-auto !py-1.5"
              value={value.from}
              max={value.to || undefined}
              onChange={(e) => onChange({ ...value, from: e.target.value })}
            />
          </label>
          <label className="text-muted flex items-center gap-2 text-sm">
            {T.to}
            <input
              type="date"
              className="input !w-auto !py-1.5"
              value={value.to}
              min={value.from || undefined}
              onChange={(e) => onChange({ ...value, to: e.target.value })}
            />
          </label>
        </Group>

        <Group title={T.wouldReturn}>
          {(['all', 'yes', 'no'] as const).map((opt) => (
            <Chip
              key={opt}
              active={value.wouldReturn === opt}
              onClick={() => onChange({ ...value, wouldReturn: opt })}
            >
              {T[opt]}
            </Chip>
          ))}
        </Group>
      </div>

      <div className="border-border flex justify-end border-t pt-4">
        <button type="button" className="btn-ghost !py-1.5" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="size-4" /> {T.clear}
        </button>
      </div>
    </div>
  );
}
