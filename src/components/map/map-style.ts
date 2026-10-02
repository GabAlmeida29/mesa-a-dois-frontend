import type { StyleSpecification } from 'maplibre-gl';
import type { ResolvedTheme } from '@/lib/theme';

interface Palette {
  background: string;
  water: string;
  green: string;
  residential: string;
  building: string;
  roadMinor: string;
  roadMajor: string;
  roadCasing: string;
  label: string;
  labelHalo: string;
}

const PALETTES: Record<ResolvedTheme, Palette> = {
  dark: {
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
  },
  light: {
    background: '#f3ece2',
    water: '#cfe1e8',
    green: '#dfe9d6',
    residential: '#efe7dc',
    building: '#e7ddd0',
    roadMinor: '#fbf8f3',
    roadMajor: '#ffffff',
    roadCasing: 'rgba(196,182,166,0.7)',
    label: '#7b7069',
    labelHalo: '#f6f1ea',
  },
};

type AnyLayer = {
  id: string;
  type: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
};

export function tuneStyle(style: StyleSpecification, theme: ResolvedTheme): StyleSpecification {
  const palette = PALETTES[theme];
  const layers = (style.layers as unknown as AnyLayer[]).map((layer) => {
    const l = { ...layer, paint: { ...(layer.paint ?? {}) } };
    const id = l.id;
    const set = (key: string, value: unknown) => {
      l.paint[key] = value;
    };

    if (l.type === 'background') set('background-color', palette.background);
    else if (id === 'water' || (l.type === 'fill' && id.includes('water'))) set('fill-color', palette.water);
    else if (id === 'waterway' || (l.type === 'line' && id.includes('waterway')))
      set('line-color', palette.water);
    else if (l.type === 'fill' && /wood|park|grass|landcover/.test(id)) set('fill-color', palette.green);
    else if (id === 'landuse_residential') set('fill-color', palette.residential);
    else if (l.type === 'fill' && id.startsWith('building')) set('fill-color', palette.building);
    else if (id === 'highway_minor' || id === 'highway_path') set('line-color', palette.roadMinor);
    else if (id.endsWith('_inner') || id.endsWith('_subtle')) set('line-color', palette.roadMajor);
    else if (id.endsWith('_casing') && id.startsWith('highway')) set('line-color', palette.roadCasing);
    else if (l.type === 'symbol' && l.layout?.['text-field']) {
      set('text-color', palette.label);
      set('text-halo-color', palette.labelHalo);
      set('text-halo-width', 1.2);
    }
    return l;
  });
  return { ...style, layers } as unknown as StyleSpecification;
}
