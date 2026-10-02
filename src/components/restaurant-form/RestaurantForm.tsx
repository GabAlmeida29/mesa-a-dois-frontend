'use client';

import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { FORM } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import type { Restaurant } from '@/lib/types';
import { useToast } from '@/contexts/ToastContext';
import { BasicInfoSection } from './BasicInfoSection';
import { LocationSection } from './LocationSection';
import { RatingsSection } from './RatingsSection';
import { restaurantFormSchema, toFormValues, toPayload, type RestaurantFormValues } from './schema';

export function RestaurantForm({ restaurant }: { restaurant?: Restaurant }) {
  const router = useRouter();
  const toast = useToast();
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: toFormValues(restaurant),
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: RestaurantFormValues) {
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
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <BasicInfoSection currentCuisine={restaurant?.cuisine} />
        <LocationSection />
        <RatingsSection />
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
    </FormProvider>
  );
}
