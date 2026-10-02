type EventType = 'pageview' | 'click';

const ENDPOINT = '/api/analytics/collect';
const MAX_LABEL = 80;

function trackingAllowed() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.doNotTrack !== '1' && nav.globalPrivacyControl !== true;
}

export function track(type: EventType, data: { path: string; target?: string; referrer?: string }) {
  if (!trackingAllowed()) return;
  fetch(ENDPOINT, {
    method: 'POST',
    keepalive: true,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'mesa-a-dois' },
    body: JSON.stringify({ type, ...data }),
  }).catch(() => undefined);
}

export function clickLabel(el: HTMLElement): string | null {
  const raw =
    el.dataset.track ?? el.getAttribute('aria-label') ?? el.getAttribute('title') ?? el.textContent ?? '';
  const label = raw.replace(/\s+/g, ' ').trim();
  return label ? label.slice(0, MAX_LABEL) : null;
}
