'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { RESTAURANTS, NAV } from '@/constants/texts';
import { api } from '@/lib/api';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { Restaurant, SortOption } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { RestaurantCard } from '@/components/restaurant/RestaurantCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, ErrorState, Loading } from '@/components/ui/States';
import { RestaurantFiltersPanel } from '@/components/restaurant/RestaurantFilters';
import {
  EMPTY_FILTERS,
  applyFilters,
  countActive,
  filtersFromParams,
  filtersToParams,
  type RestaurantFilters,
} from '@/lib/filters';

const SORTS: SortOption[] = ['recent', 'rating', 'name'];
const SEARCH_DEBOUNCE_MS = 300;

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RestaurantsView />
    </Suspense>
  );
}

function RestaurantsView() {
  const { can } = useAuth();
  const canCreate = can('restaurants:create');
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<Restaurant[] | null>(null);
  const [error, setError] = useState(false);

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const sortParam = searchParams.get('ordem') as SortOption | null;
  const sort: SortOption = sortParam && SORTS.includes(sortParam) ? sortParam : 'recent';
  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const activeCount = countActive(filters);
  const [showFilters, setShowFilters] = useState(activeCount > 0);

  const updateUrl = useCallback(
    (next: { filters?: RestaurantFilters; sort?: SortOption; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.filters) filtersToParams(next.filters, params);
      if (next.sort !== undefined) {
        if (next.sort === 'recent') params.delete('ordem');
        else params.set('ordem', next.sort);
      }
      if (next.q !== undefined) {
        if (next.q) params.set('q', next.q);
        else params.delete('q');
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const filtered = useMemo(() => (data ? applyFilters(data, filters) : null), [data, filters]);
  const [toDelete, setToDelete] = useState<Restaurant | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedQ = useDebouncedValue(q.trim(), SEARCH_DEBOUNCE_MS);

  const load = useCallback(() => {
    setError(false);
    api
      .listRestaurants({ q: debouncedQ || undefined, sort })
      .then(setData)
      .catch(() => setError(true));
  }, [debouncedQ, sort]);

  useEffect(load, [load]);

  useEffect(() => {
    if ((searchParams.get('q') ?? '') !== debouncedQ) updateUrl({ q: debouncedQ });
  }, [debouncedQ, searchParams, updateUrl]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteRestaurant(toDelete.id);
      setData((d) => d?.filter((r) => r.id !== toDelete.id) ?? null);
      toast(RESTAURANTS.deleted);
      setToDelete(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : RESTAURANTS.notFound, 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {RESTAURANTS.title}
          </h1>
          <p className="text-muted mt-2">{RESTAURANTS.subtitle}</p>
        </div>
        {canCreate && (
          <Link href="/restaurantes/novo" className="btn-primary self-start sm:self-auto">
            <Plus className="size-4" /> {NAV.newRestaurant}
          </Link>
        )}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            className="input !pl-9"
            placeholder={RESTAURANTS.searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={RESTAURANTS.searchPlaceholder}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className={clsx(
              'btn-ghost !rounded-xl !px-4',
              showFilters && '!border-accent text-accent-strong',
            )}
            aria-expanded={showFilters}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="size-4" />
            {RESTAURANTS.filters.button}
            {activeCount > 0 && (
              <span className="bg-accent text-on-accent grid size-5 place-items-center rounded-full text-xs font-semibold">
                {activeCount}
              </span>
            )}
          </button>
          <select
            className="input select flex-1 sm:!w-56 sm:flex-none"
            value={sort}
            onChange={(e) => updateUrl({ sort: e.target.value as SortOption })}
            aria-label={RESTAURANTS.sort.label}
          >
            <option value="recent">{RESTAURANTS.sort.recent}</option>
            <option value="rating">{RESTAURANTS.sort.rating}</option>
            <option value="name">{RESTAURANTS.sort.name}</option>
          </select>
        </div>
      </div>

      {showFilters && data && (
        <div className="mb-4">
          <RestaurantFiltersPanel source={data} value={filters} onChange={(f) => updateUrl({ filters: f })} />
        </div>
      )}

      {data && filtered && data.length > 0 && (
        <p className="text-faint mb-4 text-sm">{RESTAURANTS.filters.results(filtered.length, data.length)}</p>
      )}

      {error ? (
        <ErrorState onRetry={load} />
      ) : !data || !filtered ? (
        <Loading />
      ) : data.length === 0 ? (
        <EmptyState text={canCreate && !q ? RESTAURANTS.emptyAdmin : RESTAURANTS.empty}>
          {canCreate && !q && (
            <Link href="/restaurantes/novo" className="btn-primary">
              <Plus className="size-4" /> {NAV.newRestaurant}
            </Link>
          )}
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState text={RESTAURANTS.emptyFiltered}>
          <button className="btn-ghost" onClick={() => updateUrl({ filters: EMPTY_FILTERS })}>
            {RESTAURANTS.filters.clear}
          </button>
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              canEdit={can('restaurants:update')}
              canDelete={can('restaurants:delete')}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={RESTAURANTS.confirmDeleteTitle}
        text={toDelete ? RESTAURANTS.confirmDeleteText(toDelete.name) : ''}
        confirmLabel={RESTAURANTS.delete}
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
