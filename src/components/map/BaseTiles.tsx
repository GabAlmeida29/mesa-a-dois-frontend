'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect } from 'react';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import type { StyleSpecification } from 'maplibre-gl';
import { useMap } from 'react-leaflet';
import { MAP_STYLE_URLS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import type { ResolvedTheme } from '@/lib/theme';
import { tuneStyle } from './map-style';

const styles = new Map<ResolvedTheme, Promise<StyleSpecification>>();

function loadStyle(theme: ResolvedTheme) {
  let pending = styles.get(theme);
  if (!pending) {
    pending = fetch(MAP_STYLE_URLS[theme])
      .then((r) => {
        if (!r.ok) throw new Error(`style ${r.status}`);
        return r.json() as Promise<StyleSpecification>;
      })
      .then((style) => tuneStyle(style, theme))
      .catch((e) => {
        styles.delete(theme);
        throw e;
      });
    styles.set(theme, pending);
  }
  return pending;
}

export function BaseTiles() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(() => {
    let layer: L.Layer | null = null;
    let cancelled = false;

    loadStyle(theme)
      .then((style) => {
        if (cancelled) return;
        layer = L.maplibreGL({ style, attributionControl: false });
        layer.addTo(map);
      })
      .catch((e) => console.error('[mapa] não foi possível carregar o estilo', e));

    return () => {
      cancelled = true;
      if (layer) map.removeLayer(layer);
    };
  }, [map, theme]);

  return null;
}
