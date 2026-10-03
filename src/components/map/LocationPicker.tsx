'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import type { Marker as LeafletMarker } from 'leaflet';
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from '@/constants/config';
import { BaseTiles } from './BaseTiles';
import { pickerIcon } from './leaflet-utils';

interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
}

function ClickHandler({ onChange }: { onChange: (v: LatLng) => void }) {
  useMapEvents({ click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Recenter({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 16));
  }, [value, map]);
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  return (
    <div className="border-border h-72 overflow-hidden rounded-xl border sm:h-80">
      <MapContainer
        center={value ? [value.lat, value.lng] : MAP_DEFAULT_CENTER}
        zoom={value ? 16 : MAP_DEFAULT_ZOOM}
        minZoom={3}
        maxZoom={19}
        attributionControl={false}
        className="size-full"
      >
        <BaseTiles />
        <ClickHandler onChange={onChange} />
        <Recenter value={value} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={pickerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as LeafletMarker).getLatLng();
                onChange({ lat: ll.lat, lng: ll.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
