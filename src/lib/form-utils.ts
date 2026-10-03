import './zod-pt';
import { z } from 'zod';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { FORM } from '@/constants/texts';
import { ApiError } from './api';

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

export const emptyToNull = (v: string | undefined | null) => (v && v.trim() !== '' ? v.trim() : null);
export const moneyField = z.number().min(0).max(99_999_999.99).nullable();

export const numberToField = (v: number | null | undefined) =>
  v === null || v === undefined ? '' : String(v);

export function fieldErrorFrom(details: Record<string, string[]> | undefined, field: string) {
  return details?.[field]?.[0];
}

export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (!(error instanceof ApiError) || !error.details) return false;
  const entries = Object.entries(error.details).filter(([, messages]) => messages?.length);
  entries.forEach(([field, messages], index) =>
    setError(field as Path<T>, { type: 'server', message: messages[0] }, { shouldFocus: index === 0 }),
  );
  return entries.length > 0;
}
