import { ANALYTICS } from '@/constants/texts';

const countryNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

export const numberFmt = new Intl.NumberFormat('pt-BR');
export const ratioFmt = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
export const shortDay = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });

export function countryName(code: string | null) {
  if (!code || code === '??') return ANALYTICS.unknown;
  try {
    return countryNames.of(code) ?? code;
  } catch {
    return code;
  }
}
