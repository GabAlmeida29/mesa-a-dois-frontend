'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { clickLabel, track } from '@/lib/analytics';

const CLICKABLE = 'a, button, summary, [role="menuitem"], [role="radio"], [data-track]';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const firstView = useRef(true);

  useEffect(() => {
    track('pageview', {
      path: pathname,
      referrer: firstView.current ? document.referrer || undefined : undefined,
    });
    firstView.current = false;
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(CLICKABLE);
      if (!el || el.closest('[data-track-ignore]')) return;
      const target = clickLabel(el);
      if (target) track('click', { path: window.location.pathname, target });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}
