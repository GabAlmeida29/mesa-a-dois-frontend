const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const dateTimeFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});
const moneyFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const ratingFmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatDate = (iso: string | null) => (iso ? dateFmt.format(new Date(`${iso}T00:00:00Z`)) : null);
export const formatDateTime = (iso: string | null) => (iso ? dateTimeFmt.format(new Date(iso)) : null);
export const formatMoney = (v: number | null) => (v === null ? null : moneyFmt.format(v));
export const formatRating = (v: number | null) => (v === null ? '–' : ratingFmt.format(v));
export const priceSymbols = (level: number | null) => (level ? '$'.repeat(level) : null);

export function ratingTone(v: number | null): 'low' | 'mid' | 'high' | 'none' {
  if (v === null) return 'none';
  if (v < 5) return 'low';
  if (v < 7.5) return 'mid';
  return 'high';
}

export function googleMapsUrl(r: {
  name: string;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
}) {
  const query = r.address ? [r.address, r.city].filter(Boolean).join(', ') : `${r.latitude},${r.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
