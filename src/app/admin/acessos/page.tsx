'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Eye, Globe2, MousePointerClick, RefreshCw, Users } from 'lucide-react';
import { ANALYTICS } from '@/constants/texts';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { AnalyticsSummary, Restaurant } from '@/lib/types';
import { AdminGuard } from '@/components/AdminGuard';
import { ErrorState, Loading } from '@/components/States';
import { VisitorsMap } from '@/components/map';

const T = ANALYTICS;
const RESTAURANT_PATH = /^\/restaurantes\/([0-9a-f-]{36})(\/editar)?$/i;
const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
const numberFmt = new Intl.NumberFormat('pt-BR');
const ratioFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
const shortDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export default function AnalyticsPage() {
  return (
    <AdminGuard>
      <AnalyticsView />
    </AdminGuard>
  );
}

function countryName(code: string | null) {
  if (!code || code === '??') return T.unknown;
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function usePageLabel(restaurants: Restaurant[]) {
  return useCallback(
    (path: string) => {
      if (T.pages[path]) return T.pages[path];
      const match = path.match(RESTAURANT_PATH);
      if (match) {
        const name = restaurants.find((r) => r.id === match[1])?.name ?? path;
        return match[2] ? T.editPage(name) : name;
      }
      return path;
    },
    [restaurants],
  );
}

function AnalyticsView() {
  const [days, setDays] = useState(30);
  const [includeAdmin, setIncludeAdmin] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const pageLabel = usePageLabel(restaurants);

  const load = useCallback(() => {
    setError(false);
    setLoading(true);
    api
      .analyticsSummary(days, includeAdmin)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [days, includeAdmin]);

  useEffect(load, [load]);
  useEffect(() => {
    api
      .listRestaurants()
      .then(setRestaurants)
      .catch(() => setRestaurants([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10" data-track-ignore>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{T.title}</h1>
          <p className="text-muted mt-2">{T.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="radiogroup"
            aria-label={T.period}
            className="border-border bg-surface flex rounded-full border p-0.5"
          >
            {T.periods.map((p) => (
              <button
                key={p.days}
                type="button"
                role="radio"
                aria-checked={days === p.days}
                onClick={() => setDays(p.days)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-sm transition',
                  days === p.days ? 'bg-surface-2 text-text' : 'text-faint hover:text-text',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="text-muted flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--color-accent)]"
              checked={includeAdmin}
              onChange={(e) => setIncludeAdmin(e.target.checked)}
            />
            {T.includeAdmin}
          </label>
          <button className="btn-ghost !p-2.5" onClick={load} aria-label={T.refresh} disabled={loading}>
            <RefreshCw className={clsx('size-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : !data ? (
        <Loading />
      ) : (
        <Dashboard data={data} pageLabel={pageLabel} />
      )}
    </div>
  );
}

function Dashboard({ data, pageLabel }: { data: AnalyticsSummary; pageLabel: (path: string) => string }) {
  const { totals } = data;
  const perVisitor = totals.visitors ? totals.pageviews / totals.visitors : 0;

  if (totals.pageviews === 0 && totals.clicks === 0) {
    return <p className="card text-muted p-10 text-center">{T.empty}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={Users}
          label={T.visitors}
          hint={T.visitorsHint}
          value={numberFmt.format(totals.visitors)}
        />
        <Stat icon={Eye} label={T.pageviews} value={numberFmt.format(totals.pageviews)} />
        <Stat icon={MousePointerClick} label={T.clicks} value={numberFmt.format(totals.clicks)} />
        <Stat icon={Globe2} label={T.perVisitor} value={ratioFmt.format(perVisitor)} />
      </div>

      <Panel title={T.dailyTitle}>
        <DailyBars daily={data.daily} />
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={T.pagesTitle}>
          <RankedBars
            rows={data.pages.map((p) => ({
              key: p.path,
              label: pageLabel(p.path),
              value: p.views,
              detail: T.visitorsCount(p.visitors),
            }))}
            format={T.views}
          />
        </Panel>
        <Panel title={T.clicksTitle}>
          <RankedBars
            rows={data.clicks.map((c) => ({
              key: `${c.target}|${c.path}`,
              label: c.target,
              value: c.clicks,
              detail: T.onPage(pageLabel(c.path)),
            }))}
            format={T.clicksCount}
          />
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={T.mapTitle} subtitle={T.geoCredit}>
          <div className="border-border h-80 overflow-hidden rounded-xl border">
            <VisitorsMap cities={data.cities} />
          </div>
        </Panel>
        <div className="grid gap-5">
          <Panel title={T.countriesTitle}>
            <RankedBars
              rows={data.countries.map((c) => ({
                key: c.country,
                label: countryName(c.country),
                value: c.visitors,
              }))}
              format={T.visitorsCount}
            />
          </Panel>
          <Panel title={T.citiesTitle}>
            <RankedBars
              rows={data.cities.slice(0, 8).map((c) => ({
                key: `${c.city}-${c.country}`,
                label: c.city,
                value: c.visitors,
                detail: [c.region, countryName(c.country)].filter(Boolean).join(', '),
              }))}
              format={T.visitorsCount}
            />
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Panel title={T.devicesTitle}>
          <RankedBars
            rows={data.devices.map((d) => ({
              key: d.label,
              label: T.devices[d.label] ?? d.label,
              value: d.visitors,
            }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.browsersTitle}>
          <RankedBars
            rows={data.browsers.map((d) => ({ key: d.label, label: d.label, value: d.visitors }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.systemsTitle}>
          <RankedBars
            rows={data.systems.map((d) => ({ key: d.label, label: d.label, value: d.visitors }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.referrersTitle}>
          <RankedBars
            rows={data.referrers.map((r) => ({ key: r.host, label: r.host, value: r.visitors }))}
            format={T.visitorsCount}
            empty={T.direct}
          />
        </Panel>
      </div>

      <Panel title={T.recentTitle}>
        <ul className="divide-border divide-y text-sm">
          {data.recent.map((e, i) => (
            <li key={`${e.occurredAt}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
              <span className="text-faint w-28 shrink-0 tabular-nums">{formatDateTime(e.occurredAt)}</span>
              <span className="min-w-0 flex-1">
                <span className="text-muted">{e.type === 'click' ? T.click : T.pageview} </span>
                <span className="font-medium">{e.type === 'click' ? e.target : pageLabel(e.path)}</span>
                {e.type === 'click' && <span className="text-faint"> · {pageLabel(e.path)}</span>}
              </span>
              <span className="text-faint text-xs">
                {[e.city, countryName(e.country), e.device ? (T.devices[e.device] ?? e.device) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-muted flex items-center gap-2 text-sm">
        <Icon className="text-accent size-4" /> {label}
      </p>
      <p className="font-display mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-faint mt-1 text-xs">{hint}</p>}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-faint text-xs">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface RankedRow {
  key: string;
  label: string;
  value: number;
  detail?: string;
}

function RankedBars({
  rows,
  format,
  empty = '—',
}: {
  rows: RankedRow[];
  format: (n: number) => string;
  empty?: string;
}) {
  if (!rows.length) return <p className="text-faint text-sm">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} title={`${r.label}: ${format(r.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {r.label}
              {r.detail && <span className="text-faint text-xs"> · {r.detail}</span>}
            </span>
            <span className="text-muted shrink-0 tabular-nums">{numberFmt.format(r.value)}</span>
          </div>
          <div className="bg-surface-2 mt-1.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-accent h-full rounded-full" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function DailyBars({ daily }: { daily: AnalyticsSummary['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const labelEvery = Math.ceil(daily.length / 8);
  const ticks = useMemo(() => [max, Math.round(max / 2), 0], [max]);

  return (
    <div className="flex gap-3">
      <div className="text-faint flex h-48 flex-col justify-between pb-5 text-right text-[11px] tabular-nums">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
          {ticks.map((_, i) => (
            <div key={i} className="border-border/60 border-t" />
          ))}
        </div>
        <div className="relative flex h-48 items-end gap-[2px] pb-5">
          {daily.map((d, i) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="bg-accent group-hover:bg-accent-strong min-h-[2px] rounded-t-[4px] transition-colors"
                style={{ height: `${(d.visitors / max) * 100}%` }}
              />
              <div className="border-border bg-surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg group-hover:block">
                <p className="font-medium">{shortDay.format(new Date(`${d.day}T00:00:00Z`))}</p>
                <p className="text-muted">{T.visitorsCount(d.visitors)}</p>
                <p className="text-muted">{T.views(d.pageviews)}</p>
              </div>
              {i % labelEvery === 0 && (
                <span className="text-faint absolute -bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-[10px] whitespace-nowrap">
                  {shortDay.format(new Date(`${d.day}T00:00:00Z`))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
