import { z } from 'zod';
import { FORM } from '@/constants/texts';

export const toNumberOrNull = (v: string | undefined | null): number | null => {
  if (v === undefined || v === null || v.trim() === '') return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export const ratingField = z
  .string()
  .optional()
  .refine((v) => {
    if (!v || v.trim() === '') return true;
    const n = toNumberOrNull(v);
    return n !== null && n >= 0 && n <= 10 && Number.isInteger(n * 2);
  }, FORM.errors.rating);

export const moneyField = z
  .string()
  .optional()
  .refine((v) => {
    if (!v || v.trim() === '') return true;
    const n = toNumberOrNull(v);
    return n !== null && n >= 0;
  }, FORM.errors.price);

export const emptyToNull = (v: string | undefined | null) => (v && v.trim() !== '' ? v.trim() : null);
export const numberToField = (v: number | null | undefined) =>
  v === null || v === undefined ? '' : String(v);

export function fieldErrorFrom(details: Record<string, string[]> | undefined, field: string) {
  return details?.[field]?.[0];
}
