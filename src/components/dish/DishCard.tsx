import { Pencil, Trash2, UtensilsCrossed } from 'lucide-react';
import { DISHES, RESTAURANTS } from '@/constants/texts';
import { formatMoney } from '@/lib/format';
import type { Dish } from '@/lib/types';
import { RatingBadge } from '@/components/restaurant/RatingBadge';

interface Props {
  dish: Dish;
  canManage: boolean;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

export function DishCard({ dish, canManage, onEdit, onDelete }: Props) {
  return (
    <article className="card overflow-hidden">
      <div className="bg-surface-2 relative aspect-[4/3]">
        {dish.photoUrl ? (
          <img src={dish.photoUrl} alt={dish.name} loading="lazy" className="size-full object-cover" />
        ) : (
          <div className="text-faint grid size-full place-items-center">
            <UtensilsCrossed className="size-8" />
          </div>
        )}
        <div className="bg-bg/85 absolute top-3 right-3 rounded-full backdrop-blur">
          <RatingBadge value={dish.averageRating} size="sm" />
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{dish.name}</h3>
          {dish.price !== null && (
            <span className="text-gold shrink-0 text-sm tabular-nums">{formatMoney(dish.price)}</span>
          )}
        </div>
        {dish.description && <p className="text-muted text-sm">{dish.description}</p>}
        <div className="text-faint flex gap-3 text-xs">
          <span>
            {RESTAURANTS.ratingGabriel}: {dish.ratingGabriel ?? '–'}
          </span>
          <span>
            {RESTAURANTS.ratingMilena}: {dish.ratingMilena ?? '–'}
          </span>
        </div>
        {canManage && (
          <div className="flex gap-2 pt-2">
            <button className="btn-ghost flex-1 !py-1.5" onClick={() => onEdit(dish)}>
              <Pencil className="size-4" /> {RESTAURANTS.edit}
            </button>
            <button className="btn-danger !p-2" onClick={() => onDelete(dish)} aria-label={DISHES.delete}>
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
