import clsx from 'clsx';
import { CalendarDays, ThumbsDown, ThumbsUp } from 'lucide-react';
import { CRITERIA, RESTAURANTS } from '@/constants/texts';
import { formatDate, formatRating, ratingTone } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import { RatingBadge } from './RatingBadge';

const barTone = {
  high: 'bg-good',
  mid: 'bg-gold',
  low: 'bg-bad',
  none: 'bg-faint',
};

export function RatingSummary({ restaurant }: { restaurant: Restaurant }) {
  const visited = formatDate(restaurant.visitedAt);
  const rated = CRITERIA.map((c) => ({ ...c, value: restaurant[c.key] })).filter(
    (c): c is typeof c & { value: number } => c.value !== null,
  );

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{RESTAURANTS.average}</p>
          <p className="text-faint text-xs">{RESTAURANTS.averageHint}</p>
        </div>
        <RatingBadge value={restaurant.averageRating} size="lg" />
      </div>
      <div className="border-border space-y-3 border-t pt-4">
        <p className="text-faint text-xs font-medium tracking-wide uppercase">{RESTAURANTS.criteriaTitle}</p>
        {rated.length === 0 ? (
          <p className="text-muted text-sm">{RESTAURANTS.notRated}</p>
        ) : (
          rated.map((c) => (
            <div key={c.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="truncate">{c.label}</span>
              <span className="bg-surface-2 h-1.5 overflow-hidden rounded-full">
                <span
                  className={clsx('block h-full rounded-full', barTone[ratingTone(c.value)])}
                  style={{ width: `${(c.value / 10) * 100}%` }}
                />
              </span>
              <span className="text-right font-medium tabular-nums">{formatRating(c.value)}</span>
            </div>
          ))
        )}
      </div>
      <div className="border-border text-muted space-y-2 border-t pt-4 text-sm">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          {visited ? RESTAURANTS.visitedOn(visited) : RESTAURANTS.notVisited}
        </p>
        <p className="flex items-center gap-2">
          {restaurant.wouldReturn ? (
            <ThumbsUp className="text-good size-4" />
          ) : (
            <ThumbsDown className="text-bad size-4" />
          )}
          {restaurant.wouldReturn ? RESTAURANTS.wouldReturn : RESTAURANTS.wouldNotReturn}
        </p>
      </div>
    </div>
  );
}
