import clsx from 'clsx';
import { Star } from 'lucide-react';
import { formatRating, ratingTone } from '@/lib/format';

const tones = {
  high: 'bg-good/15 text-good',
  mid: 'bg-gold/15 text-gold',
  low: 'bg-bad/15 text-bad',
  none: 'bg-surface-2 text-faint',
};

export function RatingBadge({
  value,
  label,
  size = 'md',
}: {
  value: number | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold tabular-nums',
        tones[ratingTone(value)],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-4 py-2 text-lg',
      )}
      title={label}
    >
      <Star className={clsx(size === 'lg' ? 'size-5' : 'size-3.5', 'fill-current')} />
      {formatRating(value)}
      {label && <span className="font-normal opacity-80">· {label}</span>}
    </span>
  );
}
