'use client';

import clsx from 'clsx';
import { FORM } from '@/constants/texts';
import { formatRating, ratingTone } from '@/lib/format';

const STEP = 0.5;
const MIDPOINT = 5;

const toneText = {
  high: 'text-good',
  mid: 'text-gold',
  low: 'text-bad',
  none: 'text-faint',
};

interface Props {
  id: string;
  label: string;
  hint: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function ScoreInput({ id, label, hint, value, onChange }: Props) {
  const rated = value !== null;

  return (
    <div className="border-border bg-surface-2/50 rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-medium">
            {label}
          </label>
          <p className="text-faint text-xs">{hint}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {rated && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-faint hover:text-text text-xs underline-offset-2 hover:underline"
            >
              {FORM.fields.scoreClear}
            </button>
          )}
          <span
            className={clsx(
              'font-display min-w-[3ch] text-right text-xl font-semibold tabular-nums',
              toneText[ratingTone(value)],
            )}
          >
            {rated ? formatRating(value) : '–'}
          </span>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={STEP}
        value={value ?? MIDPOINT}
        aria-valuetext={rated ? formatRating(value) : FORM.fields.scoreNotRated}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={() => !rated && onChange(MIDPOINT)}
        className={clsx('mt-3 w-full accent-[var(--color-accent)]', !rated && 'opacity-40')}
      />
      <div className="text-faint flex justify-between text-[10px] tabular-nums">
        <span>0</span>
        <span>{!rated && FORM.fields.scoreNotRated}</span>
        <span>10</span>
      </div>
    </div>
  );
}
