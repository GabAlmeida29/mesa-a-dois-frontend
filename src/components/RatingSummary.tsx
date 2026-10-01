import { CalendarDays, ThumbsDown, ThumbsUp } from 'lucide-react';
import { RESTAURANTS } from '@/constants/texts';
import { formatDate } from '@/lib/format';
import type { Restaurant } from '@/lib/types';
import { RatingBadge } from './RatingBadge';

export function RatingSummary({ restaurant }: { restaurant: Restaurant }) {
  const visited = formatDate(restaurant.visitedAt);

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <span className="text-muted text-sm">{RESTAURANTS.average}</span>
        <RatingBadge value={restaurant.averageRating} size="lg" />
      </div>
      <div className="border-border flex items-center justify-between border-t pt-4">
        <span className="text-sm">{RESTAURANTS.ratingGabriel}</span>
        <RatingBadge value={restaurant.ratingGabriel} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">{RESTAURANTS.ratingMilena}</span>
        <RatingBadge value={restaurant.ratingMilena} />
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
