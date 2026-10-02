'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';
import { HOME } from '@/constants/texts';
import { api } from '@/lib/api';
import { formatRating } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import { RestaurantMap } from '@/components/map';
import { ErrorState, Loading } from '@/components/ui/States';

export default function HomePage() {
  const [data, setData] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api
      .listRestaurants()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  const stats = useMemo(() => {
    if (!data) return null;
    const rated = data.filter((r) => r.averageRating !== null);
    return {
      restaurants: data.length,
      dishes: data.reduce((sum, r) => sum + r.dishCount, 0),
      cities: new Set(data.map((r) => r.city?.toLowerCase()).filter(Boolean)).size,
      average: rated.length ? rated.reduce((s, r) => s + (r.averageRating ?? 0), 0) / rated.length : null,
    };
  }, [data]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{HOME.title}</h1>
          <p className="text-muted mt-2 max-w-xl">{HOME.subtitle}</p>
        </div>
        <Link href="/restaurantes" className="btn-ghost self-start sm:self-auto">
          <LayoutGrid className="size-4" /> {HOME.seeAll}
        </Link>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [stats.restaurants, HOME.stats.restaurants],
            [stats.dishes, HOME.stats.dishes],
            [stats.cities, HOME.stats.cities],
            [formatRating(stats.average), HOME.stats.average],
          ].map(([value, label]) => (
            <div key={String(label)} className="card px-4 py-3">
              <p className="font-display text-accent text-2xl font-semibold tabular-nums">{value}</p>
              <p className="text-muted text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card relative h-[65dvh] min-h-[420px] overflow-hidden">
        {error ? (
          <div className="grid size-full place-items-center p-4">
            <ErrorState onRetry={load} />
          </div>
        ) : !data ? (
          <Loading />
        ) : (
          <>
            <RestaurantMap restaurants={data} />
            {data.length === 0 && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] mx-auto max-w-md">
                <p className="card text-muted px-4 py-3 text-center text-sm">{HOME.empty}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
