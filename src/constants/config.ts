export const MAP_DEFAULT_CENTER: [number, number] = [-28.2628, -52.4067];
export const MAP_DEFAULT_ZOOM = 13;

export const MAP_STYLE_URLS = {
  dark: process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/dark',
  light: process.env.NEXT_PUBLIC_MAP_STYLE_URL_LIGHT || 'https://tiles.openfreemap.org/styles/positron',
} as const;

export const MAP_CREDITS = [
  { label: 'OpenStreetMap', href: 'https://www.openstreetmap.org/copyright' },
  { label: 'OpenMapTiles', href: 'https://www.openmaptiles.org/' },
  { label: 'OpenFreeMap', href: 'https://openfreemap.org' },
];

export const GEOIP_CREDIT = { label: 'IP Geolocation by DB-IP', href: 'https://db-ip.com' };

export const GEOCODER_URL = process.env.NEXT_PUBLIC_GEOCODER_URL || 'https://photon.komoot.io/api/';

export const REVERSE_GEOCODER_URL =
  process.env.NEXT_PUBLIC_REVERSE_GEOCODER_URL || 'https://photon.komoot.io/reverse';

export const GEOCODE_DEBOUNCE_MS = 350;
