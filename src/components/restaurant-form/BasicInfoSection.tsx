'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { CUISINES, FORM } from '@/constants/texts';
import { ImageUpload } from '@/components/image/ImageUpload';
import type { RestaurantFormValues } from './schema';

export function BasicInfoSection({ currentCuisine }: { currentCuisine?: string | null }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RestaurantFormValues>();

  const cuisineOptions: string[] =
    currentCuisine && !(CUISINES as readonly string[]).includes(currentCuisine)
      ? [currentCuisine, ...CUISINES]
      : [...CUISINES];

  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold">{FORM.sections.basic}</h2>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="mx-auto flex w-full max-w-56 flex-col gap-2 sm:mx-0 sm:w-48">
          <Controller
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <ImageUpload
                label={FORM.fields.logo}
                folder="logos"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <p className="text-faint text-xs">{FORM.fields.logoHint}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="name">
              {FORM.fields.name} *
            </label>
            <input id="name" className="input" {...register('name')} />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cuisine">
                {FORM.fields.cuisine}
              </label>
              <select id="cuisine" className="input select" {...register('cuisine')}>
                <option value="">{FORM.fields.cuisinePlaceholder}</option>
                {cuisineOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="priceLevel">
                {FORM.fields.priceLevel}
              </label>
              <select id="priceLevel" className="input select" {...register('priceLevel')}>
                {FORM.priceLevels.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="visitedAt">
                {FORM.fields.visitedAt}
              </label>
              <input id="visitedAt" type="date" className="input" {...register('visitedAt')} />
            </div>
            <div>
              <label className="label" htmlFor="description">
                {FORM.fields.description}
              </label>
              <input id="description" className="input" {...register('description')} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
