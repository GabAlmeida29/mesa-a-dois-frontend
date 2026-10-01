'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Building2, CheckCircle2, Loader2, MapPin, Save } from 'lucide-react';
import { CUISINES, FORM } from '@/constants/texts';
import { MAP_DEFAULT_CENTER } from '@/constants/config';
import { api, ApiError } from '@/lib/api';
import { reverseGeocode } from '@/lib/geocode';
import { emptyToNull, numberToField, ratingField, toNumberOrNull } from '@/lib/form-utils';
import type { GeocodeSuggestion, Restaurant, RestaurantInput } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { ImageUpload } from './ImageUpload';
import { AddressAutocomplete } from './AddressAutocomplete';
import { LocationPicker } from './map';

const schema = z.object({
  name: z.string().trim().min(1, FORM.errors.required).max(120),
  cuisine: z.string().max(60).optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  visitedAt: z.string().optional(),
  priceLevel: z.string(),
  ratingGabriel: ratingField,
  ratingMilena: ratingField,
  review: z.string().max(3000).optional(),
  wouldReturn: z.boolean(),
  logoUrl: z.string().nullable(),
  location: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .refine((v) => Boolean(v), FORM.errors.location),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(r?: Restaurant): FormValues {
  return {
    name: r?.name ?? '',
    cuisine: r?.cuisine ?? '',
    description: r?.description ?? '',
    address: r?.address ?? '',
    city: r?.city ?? '',
    visitedAt: r?.visitedAt ?? '',
    priceLevel: String(r?.priceLevel ?? 0),
    ratingGabriel: numberToField(r?.ratingGabriel),
    ratingMilena: numberToField(r?.ratingMilena),
    review: r?.review ?? '',
    wouldReturn: r?.wouldReturn ?? true,
    logoUrl: r?.logoUrl ?? null,
    location: r ? { lat: r.latitude, lng: r.longitude } : null,
  };
}

function toPayload(v: FormValues): RestaurantInput {
  const priceLevel = Number(v.priceLevel);
  return {
    name: v.name.trim(),
    cuisine: emptyToNull(v.cuisine),
    description: emptyToNull(v.description),
    address: emptyToNull(v.address),
    city: emptyToNull(v.city),
    visitedAt: emptyToNull(v.visitedAt),
    priceLevel: priceLevel > 0 ? priceLevel : null,
    ratingGabriel: toNumberOrNull(v.ratingGabriel),
    ratingMilena: toNumberOrNull(v.ratingMilena),
    review: emptyToNull(v.review),
    wouldReturn: v.wouldReturn,
    logoUrl: v.logoUrl,
    latitude: v.location!.lat,
    longitude: v.location!.lng,
  };
}

export function RestaurantForm({ restaurant }: { restaurant?: Restaurant }) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(restaurant) });

  const cuisineOptions: string[] =
    restaurant?.cuisine && !(CUISINES as readonly string[]).includes(restaurant.cuisine)
      ? [restaurant.cuisine, ...CUISINES]
      : [...CUISINES];

  const location = watch('location');
  const city = watch('city');
  const [editingCity, setEditingCity] = useState(false);
  const [resolvingCity, setResolvingCity] = useState(false);

  async function setPin(v: { lat: number; lng: number }) {
    const opts = { shouldDirty: true, shouldValidate: true } as const;
    setValue('location', v, opts);
    setResolvingCity(true);
    try {
      const place = await reverseGeocode(v.lat, v.lng);
      if (place?.city) setValue('city', place.city, opts);
      if (place?.address && !getValues('address')?.trim()) setValue('address', place.address, opts);
    } catch {
      setEditingCity(true);
    } finally {
      setResolvingCity(false);
    }
  }
  const near = location ?? { lat: MAP_DEFAULT_CENTER[0], lng: MAP_DEFAULT_CENTER[1] };

  function applySuggestion(s: GeocodeSuggestion) {
    const opts = { shouldDirty: true, shouldValidate: true } as const;
    setValue('address', s.address ?? s.label, opts);
    if (s.city) {
      setValue('city', s.city, opts);
      setValue('location', { lat: s.latitude, lng: s.longitude }, opts);
    } else {
      void setPin({ lat: s.latitude, lng: s.longitude });
    }
    if (!getValues('name').trim() && s.address && s.name !== s.address) setValue('name', s.name, opts);
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = toPayload(values);
      const saved = restaurant
        ? await api.updateRestaurant(restaurant.id, payload)
        : await api.createRestaurant(payload);
      toast(FORM.saved);
      router.push(`/restaurantes/${saved.id}`);
      router.refresh();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : FORM.errors.generic, 'error');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
                  shape="square"
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

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">{FORM.sections.location} *</h2>

        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <AddressAutocomplete
              value={field.value ?? ''}
              onChange={field.onChange}
              onSelect={applySuggestion}
              onUseMyLocation={(lat, lng) => setPin({ lat, lng })}
              near={near}
            />
          )}
        />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span
            className={`flex items-center gap-1.5 ${
              location ? 'text-good' : errors.location ? 'text-bad' : 'text-faint'
            }`}
          >
            {location ? <CheckCircle2 className="size-4" /> : <MapPin className="size-4" />}
            {location ? FORM.pinSet : FORM.pinMissing}
          </span>
          {(city || resolvingCity) && !editingCity && (
            <span className="text-muted flex items-center gap-1.5">
              <Building2 className="size-4" />
              {resolvingCity ? FORM.cityResolving : FORM.cityLabel(city!)}
              {!resolvingCity && (
                <button
                  type="button"
                  className="text-faint hover:text-text text-xs underline-offset-2 hover:underline"
                  onClick={() => setEditingCity(true)}
                >
                  {FORM.cityEdit}
                </button>
              )}
            </span>
          )}
          {(editingCity || (location && !city && !resolvingCity)) && (
            <input
              id="city"
              aria-label={FORM.fields.city}
              placeholder={FORM.fields.city}
              className="input !w-56 !py-1.5"
              {...register('city')}
              onBlur={() => setEditingCity(false)}
            />
          )}
        </div>

        <Controller
          control={control}
          name="location"
          render={({ field }) => <LocationPicker value={field.value} onChange={(v) => setPin(v)} />}
        />
        <p className="text-faint text-xs">{FORM.mapHint}</p>
      </section>

      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">{FORM.sections.ratings}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="ratingGabriel">
              {FORM.fields.ratingGabriel}
            </label>
            <input id="ratingGabriel" className="input" inputMode="decimal" {...register('ratingGabriel')} />
            {errors.ratingGabriel && <p className="field-error">{errors.ratingGabriel.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="ratingMilena">
              {FORM.fields.ratingMilena}
            </label>
            <input id="ratingMilena" className="input" inputMode="decimal" {...register('ratingMilena')} />
            {errors.ratingMilena && <p className="field-error">{errors.ratingMilena.message}</p>}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="review">
            {FORM.fields.review}
          </label>
          <textarea
            id="review"
            rows={5}
            className="input resize-y"
            placeholder={FORM.fields.reviewPlaceholder}
            {...register('review')}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-[var(--color-accent)]"
            {...register('wouldReturn')}
          />
          {FORM.fields.wouldReturn}
        </label>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-ghost" onClick={() => router.back()} disabled={isSubmitting}>
          {FORM.cancel}
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSubmitting ? FORM.saving : FORM.save}
        </button>
      </div>
    </form>
  );
}
