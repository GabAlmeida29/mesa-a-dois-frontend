'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { CRITERIA, FORM } from '@/constants/texts';
import { LIMITS } from '@/constants/limits';
import { CharCount } from '@/components/form/CharCount';
import { FieldError } from '@/components/form/FieldError';
import { formatRating } from '@/lib/format';
import { ScoreInput } from './ScoreInput';
import { WouldReturnField } from './WouldReturnField';
import type { RestaurantFormValues } from './schema';

function average(values: Array<number | null>) {
  const filled = values.filter((v): v is number => v !== null);
  if (!filled.length) return null;
  return Math.round((filled.reduce((a, b) => a + b, 0) / filled.length) * 10) / 10;
}

export function RatingsSection() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<RestaurantFormValues>();
  const review = watch('review');
  const previewAverage = average(Object.values(watch('scores')));

  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">{FORM.sections.ratings}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted max-w-xl text-sm">{FORM.sections.ratingsHint}</p>
        <span className="bg-surface-2 rounded-full px-3 py-1 text-sm">
          {FORM.fields.scoreAverage}:{' '}
          <strong className="text-accent tabular-nums">{formatRating(previewAverage)}</strong>
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {CRITERIA.map((c) => (
          <Controller
            key={c.key}
            control={control}
            name={`scores.${c.key}`}
            render={({ field }) => (
              <ScoreInput
                id={c.key}
                label={c.label}
                hint={c.hint}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="review">
            {FORM.fields.review}
          </label>
          <CharCount length={review?.length ?? 0} max={LIMITS.review} />
        </div>
        <textarea
          id="review"
          rows={5}
          className="input resize-y"
          placeholder={FORM.fields.reviewPlaceholder}
          aria-invalid={!!errors.review}
          {...register('review')}
        />
        <FieldError message={errors.review?.message} />
      </div>
      <Controller
        control={control}
        name="wouldReturn"
        render={({ field }) => <WouldReturnField value={field.value} onChange={field.onChange} />}
      />
    </section>
  );
}
