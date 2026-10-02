'use client';

import dynamic from 'next/dynamic';
import { createElement } from 'react';
import { Loading } from '../States';

export const RestaurantMap = dynamic(() => import('./RestaurantMap'), {
  ssr: false,
  loading: () => createElement(Loading),
});

export const LocationPicker = dynamic(() => import('./LocationPicker'), {
  ssr: false,
  loading: () => createElement(Loading),
});

export const VisitorsMap = dynamic(() => import('./VisitorsMap'), {
  ssr: false,
  loading: () => createElement(Loading),
});
