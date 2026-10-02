'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet';
import { MAP_DEFAULT_CENTER } from '@/constants/config';
import { ANALYTICS } from '@/constants/texts';
import type { AnalyticsSummary } from '@/lib/types';
import { BaseTiles } from './BaseTiles';

type City = AnalyticsSummary['cities'][number];

const MIN_RADIUS = 6;
const MAX_RADIUS = 26;

function FitCities({ cities }: { cities: City[] }) {
  const map = useMap();
  useEffect(() => {
    if (!cities.length) return;
    const bounds = L.latLngBounds(cities.map((c) => [c.latitude, c.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
  }, [cities, map]);
  return null;
}

export default function VisitorsMap({ cities }: { cities: City[] }) {
  const max = Math.max(1, ...cities.map((c) => c.visitors));
  const radius = (v: number) => MIN_RADIUS + Math.sqrt(v / max) * (MAX_RADIUS - MIN_RADIUS);

  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={4}
      minZoom={2}
      maxZoom={12}
      attributionControl={false}
      scrollWheelZoom={false}
      className="size-full"
    >
      <BaseTiles />
      <FitCities cities={cities} />
      {cities.map((c) => (
        <CircleMarker
          key={`${c.city}-${c.country}`}
          center={[c.latitude, c.longitude]}
          radius={radius(c.visitors)}
          pathOptions={{ className: 'visitor-dot', weight: 2, fillOpacity: 0.7 }}
        >
          <Tooltip direction="top" offset={[0, -4]}>
            <strong>{c.city}</strong>
            {c.region && c.region !== c.city ? `, ${c.region}` : ''} · {ANALYTICS.visitorsCount(c.visitors)}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
