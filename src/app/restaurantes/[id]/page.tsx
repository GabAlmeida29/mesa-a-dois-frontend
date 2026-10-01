'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { DISHES, RESTAURANTS } from '@/constants/texts';
import { api } from '@/lib/api';
import { googleMapsUrl, priceSymbols } from '@/lib/format';
import type { Dish, Restaurant } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { DishCard } from '@/components/DishCard';
import { RatingSummary } from '@/components/RatingSummary';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Modal } from '@/components/Modal';
import { DishForm } from '@/components/DishForm';
import { RestaurantMap } from '@/components/map';
import { ErrorState, Loading } from '@/components/States';

type DishModal = { mode: 'create' } | { mode: 'edit'; dish: Dish } | null;

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [data, setData] = useState<Restaurant | null>(null);
  const [error, setError] = useState(false);
  const [dishModal, setDishModal] = useState<DishModal>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [confirmRestaurant, setConfirmRestaurant] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(false);
    api
      .getRestaurant(id)
      .then(setData)
      .catch(() => setError(true));
  }, [id]);

  useEffect(load, [load]);

  async function deleteRestaurant() {
    setBusy(true);
    try {
      await api.deleteRestaurant(id);
      toast(RESTAURANTS.deleted);
      router.push('/restaurantes');
    } catch (e) {
      toast(e instanceof Error ? e.message : RESTAURANTS.notFound, 'error');
      setBusy(false);
    }
  }

  async function deleteDish() {
    if (!dishToDelete) return;
    setBusy(true);
    try {
      await api.deleteDish(id, dishToDelete.id);
      toast(DISHES.deleted);
      setDishToDelete(null);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : DISHES.deleted, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <div className="px-4 py-16">
        <ErrorState message={RESTAURANTS.notFound} />
      </div>
    );
  }
  if (!data) return <Loading />;

  const meta = [data.cuisine, priceSymbols(data.priceLevel)].filter(Boolean).join(' · ');

  return (
    <div className="pb-12">
      <div className="relative h-64 overflow-hidden sm:h-96">
        {data.logoUrl ? (
          <img src={data.logoUrl} alt={data.name} className="size-full object-cover" />
        ) : (
          <div className="from-accent/30 via-surface-2 to-bg size-full bg-gradient-to-br" />
        )}
        <div className="from-bg via-bg/40 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      <div className="relative mx-auto -mt-32 max-w-5xl px-4 sm:px-6">
        <Link href="/restaurantes" className="btn-ghost mb-4 !py-1.5">
          <ArrowLeft className="size-4" /> {RESTAURANTS.back}
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{data.name}</h1>
            {meta && <p className="text-muted mt-1">{meta}</p>}
            {data.description && <p className="text-muted mt-2 max-w-2xl text-sm">{data.description}</p>}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Link href={`/restaurantes/${data.id}/editar`} className="btn-ghost">
                <Pencil className="size-4" /> {RESTAURANTS.edit}
              </Link>
              <button className="btn-danger" onClick={() => setConfirmRestaurant(true)}>
                <Trash2 className="size-4" /> {RESTAURANTS.delete}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1.4fr]">
          <RatingSummary restaurant={data} />

          <div className="card p-5">
            <h2 className="font-display mb-2 text-lg font-semibold">{RESTAURANTS.review}</h2>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
              {data.review ?? RESTAURANTS.noReview}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold">{DISHES.title}</h2>
            {isAdmin && (
              <button className="btn-primary" onClick={() => setDishModal({ mode: 'create' })}>
                <Plus className="size-4" /> {DISHES.add}
              </button>
            )}
          </div>

          {data.dishes.length === 0 ? (
            <p className="card text-muted p-6 text-center text-sm">{DISHES.empty}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.dishes.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  isAdmin={isAdmin}
                  onEdit={(d) => setDishModal({ mode: 'edit', dish: d })}
                  onDelete={setDishToDelete}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">{RESTAURANTS.location}</h2>
            <a href={googleMapsUrl(data)} target="_blank" rel="noreferrer" className="btn-ghost !py-1.5">
              <ExternalLink className="size-4" /> {RESTAURANTS.openInMaps}
            </a>
          </div>
          {(data.address || data.city) && (
            <p className="text-muted mb-3 flex items-center gap-2 text-sm">
              <MapPin className="size-4" /> {[data.address, data.city].filter(Boolean).join(' — ')}
            </p>
          )}
          <div className="card h-72 overflow-hidden">
            <RestaurantMap restaurants={[data]} />
          </div>
        </section>
      </div>

      <Modal
        open={!!dishModal}
        title={dishModal?.mode === 'edit' ? DISHES.editTitle : DISHES.newTitle}
        onClose={() => setDishModal(null)}
      >
        {dishModal && (
          <DishForm
            restaurantId={data.id}
            dish={dishModal.mode === 'edit' ? dishModal.dish : undefined}
            onCancel={() => setDishModal(null)}
            onSaved={() => {
              setDishModal(null);
              load();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!dishToDelete}
        title={DISHES.confirmDeleteTitle}
        text={dishToDelete ? DISHES.confirmDeleteText(dishToDelete.name) : ''}
        confirmLabel={DISHES.delete}
        loading={busy}
        onConfirm={deleteDish}
        onClose={() => setDishToDelete(null)}
      />
      <ConfirmDialog
        open={confirmRestaurant}
        title={RESTAURANTS.confirmDeleteTitle}
        text={RESTAURANTS.confirmDeleteText(data.name)}
        confirmLabel={RESTAURANTS.delete}
        loading={busy}
        onConfirm={deleteRestaurant}
        onClose={() => setConfirmRestaurant(false)}
      />
    </div>
  );
}
