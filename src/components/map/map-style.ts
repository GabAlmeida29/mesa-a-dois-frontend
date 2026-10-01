import type { StyleSpecification } from 'maplibre-gl';

const PALETTE = {
  background: '#121015',
  water: '#16202c',
  green: '#151b17',
  residential: '#141217',
  building: '#1a171e',
  roadMinor: '#2a2630',
  roadMajor: '#38323f',
  roadCasing: 'rgba(70,64,78,0.6)',
  label: '#8f8898',
  labelHalo: '#121015',
};

type AnyLayer = {
  id: string;
  type: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

export function tuneStyle(style: StyleSpecification): StyleSpecification {
  const layers = (style.layers as unknown as AnyLayer[]).map((layer) => {
    const l = { ...layer, paint: { ...(layer.paint ?? {}) } };
    const id = l.id;
    const set = (key: string, value: unknown) => {
      l.paint[key] = value;
    };

    if (l.type === 'background') set('background-color', PALETTE.background);
    else if (id === 'water') set('fill-color', PALETTE.water);
    else if (id === 'waterway') set('line-color', PALETTE.water);
    else if (id === 'landcover_wood' || id === 'landuse_park') set('fill-color', PALETTE.green);
    else if (id === 'landuse_residential') set('fill-color', PALETTE.residential);
    else if (id === 'building') set('fill-color', PALETTE.building);
    else if (id === 'highway_minor' || id === 'highway_path') set('line-color', PALETTE.roadMinor);
    else if (id.endsWith('_inner') || id.endsWith('_subtle')) set('line-color', PALETTE.roadMajor);
    else if (id.endsWith('_casing') && id.startsWith('highway')) set('line-color', PALETTE.roadCasing);
    else if (l.type === 'symbol' && l.layout?.['text-field']) {
      set('text-color', PALETTE.label);
      set('text-halo-color', PALETTE.labelHalo);
      set('text-halo-width', 1.2);
    }
    return l;
  });
  return { ...style, layers } as unknown as StyleSpecification;
}
