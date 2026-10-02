'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Check, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { IMAGE } from '@/constants/texts';
import { Modal } from '@/components/ui/Modal';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.01;

interface Props {
  source: string | null;
  round?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (area: Area) => void;
}

export function ImageCropper({ source, round = false, busy = false, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [area, setArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  return (
    <Modal open={!!source} title={IMAGE.cropTitle} onClose={onCancel}>
      {source && (
        <div className="space-y-4">
          <p className="text-muted text-sm">{IMAGE.cropHint}</p>
          <div className="bg-bg relative aspect-square w-full overflow-hidden rounded-2xl">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              aspect={1}
              cropShape={round ? 'round' : 'rect'}
              showGrid={!round}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <label className="flex items-center gap-3">
            <ZoomOut className="text-faint size-4 shrink-0" />
            <span className="sr-only">{IMAGE.zoom}</span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <ZoomIn className="text-faint size-4 shrink-0" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
              {IMAGE.cancel}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!area || busy}
              onClick={() => area && onConfirm(area)}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              {busy ? IMAGE.uploading : IMAGE.apply}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
