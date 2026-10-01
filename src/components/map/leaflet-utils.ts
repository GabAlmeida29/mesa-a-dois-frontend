import L from 'leaflet';

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}

export function restaurantIcon(name: string, logoUrl?: string | null) {
  const inner = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="" />`
    : `<span>${escapeHtml(name.trim().charAt(0).toUpperCase() || '?')}</span>`;
  return L.divIcon({
    className: '',
    html: `<div class="mesa-pin">${inner}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40],
  });
}

export const pickerIcon = L.divIcon({
  className: '',
  html: '<div class="mesa-pin"><span>●</span></div>',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});
