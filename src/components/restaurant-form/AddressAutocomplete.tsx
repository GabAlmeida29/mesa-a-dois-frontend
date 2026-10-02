'use client';

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import { FORM } from '@/constants/texts';
import { GEOCODE_DEBOUNCE_MS } from '@/constants/config';
import { geocode } from '@/lib/geocode';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { GeocodeSuggestion } from '@/lib/types';

const MIN_QUERY_LENGTH = 3;

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSelect: (s: GeocodeSuggestion) => void;
  onUseMyLocation: (lat: number, lng: number) => void;

  near?: { lat: number; lng: number };
  error?: string;
}

export function AddressAutocomplete({ value, onChange, onSelect, onUseMyLocation, near, error }: Props) {
  const listId = useId();
  const [items, setItems] = useState<GeocodeSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const typed = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const query = useDebouncedValue(value.trim(), GEOCODE_DEBOUNCE_MS);
  const nearLat = near ? Number(near.lat.toFixed(2)) : undefined;
  const nearLng = near ? Number(near.lng.toFixed(2)) : undefined;

  useEffect(() => {
    if (!typed.current) return;
    if (query.length < MIN_QUERY_LENGTH) {
      setItems([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const bias = nearLat !== undefined && nearLng !== undefined ? { lat: nearLat, lng: nearLng } : undefined;

    setLoading(true);
    setFailed(false);
    geocode(query, bias, controller.signal)
      .then((results) => {
        setItems(results);
        setActive(results.length ? 0 : -1);
        setOpen(true);
      })
      .catch((error: Error) => {
        if (error.name === 'AbortError') return;
        setFailed(true);
        setItems([]);
        setOpen(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, nearLat, nearLng]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function choose(s: GeocodeSuggestion) {
    typed.current = false;
    onSelect(s);
    setOpen(false);
    setItems([]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % items.length);
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      choose(items[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <label className="label" htmlFor={`${listId}-input`}>
        {FORM.addressLabel}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-faint pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            id={`${listId}-input`}
            className="input !pr-9 !pl-9"
            value={value}
            placeholder={FORM.addressPlaceholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onChange={(e) => {
              typed.current = true;
              onChange(e.target.value);
            }}
            onFocus={() => items.length && setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {loading && (
            <Loader2 className="text-faint absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
          )}
          {open && (
            <ul
              id={listId}
              role="listbox"
              className="border-border bg-surface absolute inset-x-0 top-full z-[1100] mt-2 max-h-72 overflow-y-auto rounded-xl border p-1 shadow-2xl"
            >
              {failed ? (
                <li className="text-bad px-3 py-3 text-sm">{FORM.geocodeError}</li>
              ) : items.length === 0 ? (
                <li className="text-muted px-3 py-3 text-sm">{FORM.noSuggestions}</li>
              ) : (
                items.map((s, i) => (
                  <li
                    key={`${s.latitude},${s.longitude},${i}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      choose(s);
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={clsx(
                      'flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5',
                      i === active ? 'bg-surface-2' : '',
                    )}
                  >
                    <MapPin className="text-accent mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="text-text block truncate text-sm">{s.name}</span>
                      <span className="text-muted block truncate text-xs">
                        {[s.address !== s.name ? s.address : null, s.city, s.state]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="btn-ghost !px-3"
          title={FORM.useMyLocation}
          aria-label={FORM.useMyLocation}
          onClick={() =>
            navigator.geolocation?.getCurrentPosition((p) =>
              onUseMyLocation(p.coords.latitude, p.coords.longitude),
            )
          }
        >
          <Crosshair className="size-4" />
        </button>
      </div>

      <p className={clsx('mt-1.5 text-xs', error ? 'text-bad' : 'text-faint')}>{error ?? FORM.addressHint}</p>
    </div>
  );
}
