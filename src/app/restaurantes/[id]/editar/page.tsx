'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FORM, RESTAURANTS } from '@/constants/texts';
import { api } from '@/lib/api';
import type { Restaurant } from '@/lib/types';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RestaurantForm } from '@/components/restaurant-form/RestaurantForm';
import { ErrorState, Loading } from '@/components/ui/States';

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Restaurant | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getRestaurant(id)
      .then(setData)
      .catch(() => setError(true));
  }, [id]);

  return (
    <RequireAuth permission="restaurants:update">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display mb-6 text-3xl font-semibold tracking-tight">{FORM.editTitle}</h1>
        {error ? (
          <ErrorState message={RESTAURANTS.notFound} />
        ) : !data ? (
          <Loading />
        ) : (
          <RestaurantForm restaurant={data} />
        )}
      </div>
    </RequireAuth>
  );
}
