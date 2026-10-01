'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { DISHES, FORM } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { emptyToNull, moneyField, numberToField, ratingField, toNumberOrNull } from '@/lib/form-utils';
import type { Dish } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { ImageUpload } from './ImageUpload';

const schema = z.object({
  name: z.string().trim().min(1, FORM.errors.required).max(120),
  description: z.string().max(500).optional(),
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
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: dish?.name ?? '',
      description: dish?.description ?? '',
      price: numberToField(dish?.price),
      ratingGabriel: numberToField(dish?.ratingGabriel),
      ratingMilena: numberToField(dish?.ratingMilena),
      photoUrl: dish?.photoUrl ?? null,
    },
  });

  async function onSubmit(v: FormValues) {
    const payload = {
      name: v.name.trim(),
      description: emptyToNull(v.description),
      price: toNumberOrNull(v.price),
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
      toast(e instanceof ApiError ? e.message : FORM.errors.generic, 'error');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Controller
        control={control}
        name="photoUrl"
        render={({ field }) => (
          <ImageUpload
            label={FORM.fields.dishPhoto}
            folder="dishes"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <div>
        <label className="label" htmlFor="dish-name">
          {FORM.fields.dishName} *
        </label>
        <input id="dish-name" className="input" {...register('name')} />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>
      <div>
        <label className="label" htmlFor="dish-description">
          {FORM.fields.dishDescription}
        </label>
        <textarea id="dish-description" rows={3} className="input resize-y" {...register('description')} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="dish-price">
            {FORM.fields.dishPrice}
          </label>
          <input id="dish-price" className="input" inputMode="decimal" {...register('price')} />
          {errors.price && <p className="field-error">{errors.price.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="dish-rg">
            {FORM.fields.ratingGabriel}
          </label>
          <input id="dish-rg" className="input" inputMode="decimal" {...register('ratingGabriel')} />
          {errors.ratingGabriel && <p className="field-error">{errors.ratingGabriel.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="dish-rm">
            {FORM.fields.ratingMilena}
          </label>
          <input id="dish-rm" className="input" inputMode="decimal" {...register('ratingMilena')} />
          {errors.ratingMilena && <p className="field-error">{errors.ratingMilena.message}</p>}
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
