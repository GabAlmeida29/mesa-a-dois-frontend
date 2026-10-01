'use client';

import Link from 'next/link';
import {
  CalendarDays,
  Eye,
  MapPin,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { RESTAURANTS } from '@/constants/texts';
import { formatDate, priceSymbols } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import { RatingBadge } from './RatingBadge';

interface Props {
  restaurant: Restaurant;
  isAdmin: boolean;
  onDelete: (r: Restaurant) => void;
}

export function RestaurantCard({ restaurant: r, isAdmin, onDelete }: Props) {
  const visited = formatDate(r.visitedAt);

  return (
    <article className="card group hover:border-faint flex flex-col overflow-hidden transition hover:-translate-y-0.5">
      <Link
        href={`/restaurantes/${r.id}`}
        className="from-surface-2 via-surface to-bg relative block aspect-[4/3] overflow-hidden bg-gradient-to-br"
      >
        {r.logoUrl ? (
          <img
            src={r.logoUrl}
            alt={r.name}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="font-display text-faint grid size-full place-items-center text-6xl font-semibold">
            {r.name.trim().charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="bg-bg/85 absolute top-3 right-3 rounded-full backdrop-blur">
          <RatingBadge value={r.averageRating} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg leading-tight font-semibold">
            <Link href={`/restaurantes/${r.id}`} className="hover:text-accent">
              {r.name}
            </Link>
          </h3>
          <p className="text-muted mt-0.5 text-sm">
            {[r.cuisine, priceSymbols(r.priceLevel)].filter(Boolean).join(' · ') || ' '}
          </p>
        </div>

        <div className="text-faint flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {r.city && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {r.city}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" /> {visited ?? RESTAURANTS.notVisited}
          </span>
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="size-3.5" /> {RESTAURANTS.dishCount(r.dishCount)}
          </span>
          <span className="flex items-center gap-1">
            {r.wouldReturn ? (
              <ThumbsUp className="text-good size-3.5" />
            ) : (
              <ThumbsDown className="text-bad size-3.5" />
            )}
            {r.wouldReturn ? RESTAURANTS.wouldReturn : RESTAURANTS.wouldNotReturn}
          </span>
        </div>

        <div className="mt-auto flex gap-2 pt-1">
          <Link href={`/restaurantes/${r.id}`} className="btn-ghost flex-1 !py-1.5">
            <Eye className="size-4" /> {RESTAURANTS.view}
          </Link>
          {isAdmin && (
            <>
              <Link
                href={`/restaurantes/${r.id}/editar`}
                className="btn-ghost !p-2"
                aria-label={RESTAURANTS.edit}
                title={RESTAURANTS.edit}
              >
                <Pencil className="size-4" />
              </Link>
              <button
                className="btn-danger !p-2"
                onClick={() => onDelete(r)}
                aria-label={RESTAURANTS.delete}
                title={RESTAURANTS.delete}
              >
                <Trash2 className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
