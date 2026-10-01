'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect } from 'react';
import L from 'leaflet';
import '@maplibre/maplibre-gl-leaflet';
import type { StyleSpecification } from 'maplibre-gl';
import { useMap } from 'react-leaflet';
import { MAP_STYLE_URL } from '@/constants/config';
import { tuneStyle } from './map-style';

let stylePromise: Promise<StyleSpecification> | null = null;
function loadStyle() {
  stylePromise ??= fetch(MAP_STYLE_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`style ${r.status}`);
      return r.json() as Promise<StyleSpecification>;
    })
    .then(tuneStyle)
    .catch((e) => {
      stylePromise = null;
      throw e;
    });
  return stylePromise;
}

export function BaseTiles() {
  const map = useMap();

  useEffect(() => {
    let layer: L.Layer | null = null;
    let cancelled = false;

    loadStyle()
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
  }, [map]);

  return null;
}
