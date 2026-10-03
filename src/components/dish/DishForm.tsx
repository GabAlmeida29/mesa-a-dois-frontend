'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { DISHES, FORM } from '@/constants/texts';
import { LIMITS } from '@/constants/limits';
import { api, ApiError } from '@/lib/api';
import {
  applyServerErrors,
  emptyToNull,
  moneyField,
  numberToField,
  ratingField,
  toNumberOrNull,
} from '@/lib/form-utils';
import type { Dish } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { ImageUpload } from '@/components/image/ImageUpload';
import { CharCount } from '@/components/form/CharCount';
import { FieldError } from '@/components/form/FieldError';
import { MoneyInput } from '@/components/form/MoneyInput';

const schema = z.object({
  name: z.string().trim().min(1).max(LIMITS.dishName),
  description: z.string().max(LIMITS.dishDescription),
  price: moneyField,
  ratingGabriel: ratingField,
  ratingMilena: ratingField,
  photoUrl: z.string().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  restaurantId: string;
  dish?: Dish;
  onSaved: (dish: Dish) => void;
  onCancel: () => void;
}

export function DishForm({ restaurantId, dish, onSaved, onCancel }: Props) {
  const toast = useToast();
  const {
    register,
    control,
    watch,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: dish?.name ?? '',
      description: dish?.description ?? '',
      price: dish?.price ?? null,
      ratingGabriel: numberToField(dish?.ratingGabriel),
      ratingMilena: numberToField(dish?.ratingMilena),
      photoUrl: dish?.photoUrl ?? null,
    },
  });
  const description = watch('description');

  async function onSubmit(v: FormValues) {
    const payload = {
      name: v.name.trim(),
      description: emptyToNull(v.description),
      price: v.price,
      ratingGabriel: toNumberOrNull(v.ratingGabriel),
      ratingMilena: toNumberOrNull(v.ratingMilena),
      photoUrl: v.photoUrl,
    };
    try {
      const saved = dish
        ? await api.updateDish(restaurantId, dish.id, payload)
        : await api.createDish(restaurantId, payload);
      toast(DISHES.saved);
      onSaved(saved);
    } catch (e) {
      if (applyServerErrors(e, setError)) toast(FORM.errors.invalidForm, 'error');
      else toast(e instanceof ApiError ? e.message : FORM.errors.generic, 'error');
    }
  }

  const onInvalid = () => toast(FORM.errors.invalidForm, 'error');

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4" noValidate>
      <Controller
        control={control}
        name="photoUrl"
        render={({ field }) => (
          <ImageUpload
            label={FORM.fields.dishPhoto}
            folder="dishes"
            className="mx-auto w-full max-w-60"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <div>
        <label className="label" htmlFor="dish-name">
          {FORM.fields.dishName} *
        </label>
        <input id="dish-name" className="input" aria-invalid={!!errors.name} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="dish-description">
            {FORM.fields.dishDescription}
          </label>
          <CharCount length={description.length} max={LIMITS.dishDescription} />
        </div>
        <textarea
          id="dish-description"
          rows={3}
          className="input resize-y"
          aria-invalid={!!errors.description}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="dish-price">
            {FORM.fields.dishPrice}
          </label>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <MoneyInput
                ref={field.ref}
                id="dish-price"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.price}
              />
            )}
          />
          <FieldError message={errors.price?.message} />
        </div>
        <div>
          <label className="label" htmlFor="dish-rg">
            {FORM.fields.ratingGabriel}
          </label>
          <input
            id="dish-rg"
            className="input"
            inputMode="decimal"
            aria-invalid={!!errors.ratingGabriel}
            {...register('ratingGabriel')}
          />
          <FieldError message={errors.ratingGabriel?.message} />
        </div>
        <div>
          <label className="label" htmlFor="dish-rm">
            {FORM.fields.ratingMilena}
          </label>
          <input
            id="dish-rm"
            className="input"
            inputMode="decimal"
            aria-invalid={!!errors.ratingMilena}
            {...register('ratingMilena')}
          />
          <FieldError message={errors.ratingMilena?.message} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel} disabled={isSubmitting}>
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
