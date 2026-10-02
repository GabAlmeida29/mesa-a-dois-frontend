'use client';

import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';
import { ANALYTICS as T } from '@/constants/texts';
import { api } from '@/lib/api';
import type { AnalyticsSummary, Restaurant } from '@/lib/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ErrorState, Loading } from '@/components/ui/States';
import { Dashboard } from '@/components/analytics/Dashboard';
import { usePageLabel } from '@/components/analytics/use-page-label';

export default function AnalyticsPage() {
  return (
    <RequireAuth permission="analytics:view">
      <AnalyticsView />
    </RequireAuth>
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
