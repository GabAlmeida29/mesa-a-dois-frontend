'use client';

import { FORM } from '@/constants/texts';
import { AdminGuard } from '@/components/AdminGuard';
import { RestaurantForm } from '@/components/RestaurantForm';

export default function NewRestaurantPage() {
  return (
    <AdminGuard>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-display mb-6 text-3xl font-semibold tracking-tight">{FORM.newTitle}</h1>
        <RestaurantForm />
      </div>
    </AdminGuard>
  );
}
