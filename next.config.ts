import type { NextConfig } from 'next';

const API_INTERNAL_URL = (process.env.API_INTERNAL_URL ?? 'http://localhost:3333').replace(/\/$/, '');
const isDev = process.env.NODE_ENV !== 'production';

const mapHosts = (process.env.NEXT_PUBLIC_MAP_HOSTS ?? 'https://tiles.openfreemap.org')
  .split(/\s+/)
  .filter(Boolean);
const geocoderHost = process.env.NEXT_PUBLIC_GEOCODER_HOST ?? 'https://photon.komoot.io';
const extraImgHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? '').split(/\s+/).filter(Boolean);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${[...mapHosts, ...extraImgHosts].join(' ')}`,
  "font-src 'self'",
  `connect-src 'self' ${geocoderHost} ${mapHosts.join(' ')}${isDev ? ' ws:' : ''}`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${API_INTERNAL_URL}/api/:path*` },
      { source: '/uploads/:path*', destination: `${API_INTERNAL_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
