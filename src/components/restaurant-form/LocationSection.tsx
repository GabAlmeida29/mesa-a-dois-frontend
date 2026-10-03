'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Building2, CheckCircle2, MapPin } from 'lucide-react';
import { FORM } from '@/constants/texts';
import { FieldError } from '@/components/form/FieldError';
import { MAP_DEFAULT_CENTER } from '@/constants/config';
import { reverseGeocode } from '@/lib/geocode';
import type { GeocodeSuggestion } from '@/lib/types';
import { AddressAutocomplete } from './AddressAutocomplete';
import { LocationPicker } from '@/components/map';
import type { RestaurantFormValues } from './schema';

const UPDATE = { shouldDirty: true, shouldValidate: true } as const;

export function LocationSection() {
  const {
    register,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<RestaurantFormValues>();
  const location = watch('location');
  const city = watch('city');
  const [editingCity, setEditingCity] = useState(false);
  const [resolvingCity, setResolvingCity] = useState(false);
  const near = location ?? { lat: MAP_DEFAULT_CENTER[0], lng: MAP_DEFAULT_CENTER[1] };

  async function setPin(v: { lat: number; lng: number }) {
    setValue('location', v, UPDATE);
    setResolvingCity(true);
    try {
      const place = await reverseGeocode(v.lat, v.lng);
      if (place?.city) setValue('city', place.city, UPDATE);
      if (place?.address && !getValues('address')?.trim()) setValue('address', place.address, UPDATE);
    } catch {
      setEditingCity(true);
    } finally {
      setResolvingCity(false);
    }
  }

  function applySuggestion(s: GeocodeSuggestion) {
    setValue('address', s.address ?? s.label, UPDATE);
    if (s.city) {
      setValue('city', s.city, UPDATE);
      setValue('location', { lat: s.latitude, lng: s.longitude }, UPDATE);
    } else {
      void setPin({ lat: s.latitude, lng: s.longitude });
    }
    if (!getValues('name').trim() && s.address && s.name !== s.address) setValue('name', s.name, UPDATE);
  }

  return (
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
      <FieldError message={errors.address?.message} />

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
            aria-invalid={!!errors.city}
            {...register('city')}
            onBlur={() => setEditingCity(false)}
          />
        )}
      </div>

      <FieldError message={errors.city?.message ?? errors.location?.message} />

      <Controller
        control={control}
        name="location"
        render={({ field }) => <LocationPicker value={field.value} onChange={(v) => setPin(v)} />}
      />
      <p className="text-faint text-xs">{FORM.mapHint}</p>
    </section>
  );
}
