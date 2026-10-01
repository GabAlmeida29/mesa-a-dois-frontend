import { GEOCODER_URL, REVERSE_GEOCODER_URL } from '@/constants/config';
import type { GeocodeSuggestion } from './types';

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: Record<string, string | undefined>;
}

export function toSuggestion(f: PhotonFeature, typedNumber?: string): GeocodeSuggestion {
  const p = f.properties;
  const street = [p.street, p.housenumber].filter(Boolean).join(', ') || null;
  const city = p.city ?? p.town ?? p.village ?? null;
  const isStreet = p.type === 'street' || p.osm_key === 'highway';

  const address = isStreet
    ? [p.name, p.housenumber ?? typedNumber].filter(Boolean).join(', ')
    : (street ?? p.district ?? null);
  const name = (isStreet ? address : p.name) || street || city || 'Local';
  const label = [name, address !== name ? address : null, p.district, city].filter(Boolean).join(' · ');
  return {
    label,
    name,
    address,
    city,
    state: p.state ?? null,
    latitude: f.geometry.coordinates[1],
    longitude: f.geometry.coordinates[0],
  };
}

const cache = new Map<string, GeocodeSuggestion[]>();

export async function geocode(
  q: string,
  near?: { lat: number; lng: number },
  signal?: AbortSignal,
): Promise<GeocodeSuggestion[]> {
  const url = new URL(GEOCODER_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '8');
  if (near) {
    url.searchParams.set('lat', near.lat.toFixed(3));
    url.searchParams.set('lon', near.lng.toFixed(3));
  }
  const key = url.toString();
  const hit = cache.get(key);
  if (hit) return hit;

  const res = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!res.ok) throw new Error(`geocoder ${res.status}`);
  const body = (await res.json()) as { features?: PhotonFeature[] };

  const typedNumber = q.match(/\b(\d{1,6})\b/)?.[1];
  const seen = new Set<string>();
  const data = (body.features ?? [])
    .filter((f) => !f.properties.countrycode || f.properties.countrycode === 'BR')
    .map((f) => toSuggestion(f, typedNumber))

    .filter((s) => {
      const k = `${s.name}|${s.label}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 6);

  if (cache.size > 200) cache.clear();
  cache.set(key, data);
  return data;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeSuggestion | null> {
  const url = new URL(REVERSE_GEOCODER_URL);
  url.searchParams.set('lat', lat.toFixed(6));
  url.searchParams.set('lon', lng.toFixed(6));
  url.searchParams.set('limit', '1');
  const res = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!res.ok) return null;
  const body = (await res.json()) as { features?: PhotonFeature[] };
  const f = body.features?.[0];
  return f ? toSuggestion(f) : null;
}
