import { useCallback } from 'react';
import { ANALYTICS as T } from '@/constants/texts';
import type { Restaurant } from '@/lib/types';

const RESTAURANT_PATH = /^\/restaurantes\/([0-9a-f-]{36})(\/editar)?$/i;

export function usePageLabel(restaurants: Restaurant[]) {
  return useCallback(
    (path: string) => {
      if (T.pages[path]) return T.pages[path];
      const match = path.match(RESTAURANT_PATH);
      if (match) {
        const name = restaurants.find((r) => r.id === match[1])?.name ?? path;
        return match[2] ? T.editPage(name) : name;
      }
      return path;
    },
    [restaurants],
  );
}
