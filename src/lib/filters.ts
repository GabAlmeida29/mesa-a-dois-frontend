import type { Restaurant } from './types';

export interface RestaurantFilters {
  cuisines: string[];
  cities: string[];
  prices: number[];

  minRating: number;

  from: string;
  to: string;
  wouldReturn: 'all' | 'yes' | 'no';
}

export const EMPTY_FILTERS: RestaurantFilters = {
  cuisines: [],
  cities: [],
  prices: [],
  minRating: 0,
  from: '',
  to: '',
  wouldReturn: 'all',
};

export const norm = (v: string | null | undefined) =>
  (v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

export function countActive(f: RestaurantFilters) {
  return (
    f.cuisines.length +
    f.cities.length +
    f.prices.length +
    (f.minRating ? 1 : 0) +
    (f.from || f.to ? 1 : 0) +
    (f.wouldReturn !== 'all' ? 1 : 0)
  );
}

export function applyFilters(list: Restaurant[], f: RestaurantFilters): Restaurant[] {
  const cuisines = new Set(f.cuisines.map(norm));
  const cities = new Set(f.cities.map(norm));
  return list.filter((r) => {
    if (cuisines.size && !cuisines.has(norm(r.cuisine))) return false;
    if (cities.size && !cities.has(norm(r.city))) return false;
    if (f.prices.length && (!r.priceLevel || !f.prices.includes(r.priceLevel))) return false;
    if (f.minRating && (r.averageRating ?? -1) < f.minRating) return false;
    if (f.from && (!r.visitedAt || r.visitedAt < f.from)) return false;
    if (f.to && (!r.visitedAt || r.visitedAt > f.to)) return false;
    if (f.wouldReturn === 'yes' && !r.wouldReturn) return false;
    if (f.wouldReturn === 'no' && r.wouldReturn) return false;
    return true;
  });
}

export function distinctOptions(list: Restaurant[], pick: (r: Restaurant) => string | null) {
  const map = new Map<string, { label: string; count: number }>();
  for (const r of list) {
    const raw = pick(r)?.trim();
    if (!raw) continue;
    const key = norm(raw);
    const cur = map.get(key);
    if (cur) cur.count++;
    else map.set(key, { label: raw, count: 1 });
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

export function filtersToParams(f: RestaurantFilters, params = new URLSearchParams()) {
  const set = (k: string, v: string) => (v ? params.set(k, v) : params.delete(k));
  set('cozinha', f.cuisines.join('|'));
  set('cidade', f.cities.join('|'));
  set('preco', f.prices.join(','));
  set('nota', f.minRating ? String(f.minRating) : '');
  set('de', f.from);
  set('ate', f.to);
  set('voltaria', f.wouldReturn === 'all' ? '' : f.wouldReturn === 'yes' ? 'sim' : 'nao');
  return params;
}

export function filtersFromParams(p: URLSearchParams): RestaurantFilters {
  const list = (k: string, sep: string) => (p.get(k) ?? '').split(sep).filter(Boolean);
  const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(p.get(k) ?? '') ? p.get(k)! : '');
  const v = p.get('voltaria');
  return {
    cuisines: list('cozinha', '|'),
    cities: list('cidade', '|'),
    prices: list('preco', ',')
      .map(Number)
      .filter((n) => n >= 1 && n <= 4),
    minRating: Math.min(10, Math.max(0, Number(p.get('nota')) || 0)),
    from: date('de'),
    to: date('ate'),
    wouldReturn: v === 'sim' ? 'yes' : v === 'nao' ? 'no' : 'all',
  };
}
