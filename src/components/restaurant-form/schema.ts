import { z } from 'zod';
import { CRITERIA, FORM } from '@/constants/texts';
import { emptyToNull } from '@/lib/form-utils';
import type { Restaurant, RestaurantInput, ScoreKey } from '@/lib/types';

const score = z.number().min(0).max(10).nullable();
const scoresSchema = z.object(
  Object.fromEntries(CRITERIA.map((c) => [c.key, score])) as Record<ScoreKey, typeof score>,
);

export const restaurantFormSchema = z.object({
  name: z.string().trim().min(1, FORM.errors.required).max(120),
  cuisine: z.string().max(60).optional(),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(80).optional(),
  visitedAt: z.string().optional(),
  priceLevel: z.string(),
  scores: scoresSchema,
  review: z.string().max(3000).optional(),
  wouldReturn: z.boolean(),
  logoUrl: z.string().nullable(),
  location: z
    .object({ lat: z.number(), lng: z.number() })
    .nullable()
    .refine((v) => Boolean(v), FORM.errors.location),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;

export function toFormValues(r?: Restaurant): RestaurantFormValues {
  return {
    name: r?.name ?? '',
    cuisine: r?.cuisine ?? '',
    description: r?.description ?? '',
    address: r?.address ?? '',
    city: r?.city ?? '',
    visitedAt: r?.visitedAt ?? '',
    priceLevel: String(r?.priceLevel ?? 0),
    scores: Object.fromEntries(CRITERIA.map((c) => [c.key, r?.[c.key] ?? null])) as Record<
      ScoreKey,
      number | null
    >,
    review: r?.review ?? '',
    wouldReturn: r?.wouldReturn ?? true,
    logoUrl: r?.logoUrl ?? null,
    location: r ? { lat: r.latitude, lng: r.longitude } : null,
  };
}

export function toPayload(v: RestaurantFormValues): RestaurantInput {
  const priceLevel = Number(v.priceLevel);
  return {
    name: v.name.trim(),
    cuisine: emptyToNull(v.cuisine),
    description: emptyToNull(v.description),
    address: emptyToNull(v.address),
    city: emptyToNull(v.city),
    visitedAt: emptyToNull(v.visitedAt),
    priceLevel: priceLevel > 0 ? priceLevel : null,
    ...v.scores,
    review: emptyToNull(v.review),
    wouldReturn: v.wouldReturn,
    logoUrl: v.logoUrl,
    latitude: v.location!.lat,
    longitude: v.location!.lng,
  };
}
