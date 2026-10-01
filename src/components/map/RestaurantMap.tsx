'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import { CalendarDays } from 'lucide-react';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/constants/config';
import { HOME, RESTAURANTS } from '@/constants/texts';
import type { Restaurant } from '@/lib/types';
import { formatDate, priceSymbols } from '@/lib/format';
import { RatingBadge } from '../RatingBadge';
import { RestaurantThumbnail } from '../RestaurantThumbnail';
import { BaseTiles } from './BaseTiles';
import { restaurantIcon } from './leaflet-utils';

function FitBounds({ items }: { items: Restaurant[] }) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    if (items.length === 1) {
      map.setView([items[0].latitude, items[0].longitude], 15);
      return;
    }
    const bounds = L.latLngBounds(items.map((r) => [r.latitude, r.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  }, [items, map]);
  return null;
}

export default function RestaurantMap({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      minZoom={3}
      maxZoom={19}
      attributionControl={false}
      scrollWheelZoom
      className="size-full"
    >
      <BaseTiles />
      <FitBounds items={restaurants} />
      {restaurants.map((r) => {
        const meta = [r.cuisine, r.city, priceSymbols(r.priceLevel)].filter(Boolean).join(' · ');
        return (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={restaurantIcon(r.name, r.logoUrl)}>
            <Popup>
              <div className="p-5">
                <div className="flex items-center gap-3 pr-5">
                  <RestaurantThumbnail name={r.name} url={r.logoUrl} />
                  <div className="min-w-0">
                    <p className="font-display truncate text-lg leading-tight font-semibold">{r.name}</p>
                    {meta && <p className="text-muted mt-1 truncate text-xs">{meta}</p>}
                  </div>
                </div>

                <div className="border-border mt-4 flex items-center justify-between gap-3 border-t pt-4">
                  <span className="text-faint flex items-center gap-1.5 text-xs">
                    <CalendarDays className="size-3.5" />
                    {formatDate(r.visitedAt) ?? RESTAURANTS.notVisited}
                  </span>
                  <RatingBadge value={r.averageRating} size="sm" />
                </div>

                <Link
                  href={`/restaurantes/${r.id}`}
                  className="btn-primary mt-4 w-full !py-2 !text-sm !text-black"
                >
                  {HOME.seeDetails}
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
