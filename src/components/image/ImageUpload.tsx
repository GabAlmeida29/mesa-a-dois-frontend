'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import type { Area } from 'react-easy-crop';
import { Crop, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { IMAGE } from '@/constants/texts';
import { api, type ImageFolder } from '@/lib/api';
import { canPreview, cropToSquare } from '@/lib/crop-image';
import { useToast } from '@/contexts/ToastContext';
import { ImageCropper } from './ImageCropper';

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: ImageFolder;
  round?: boolean;
  className?: string;
}

interface Pending {
  source: string;
  file?: File;
}

export function ImageUpload({ label, value, onChange, folder, round = false, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!pending?.file) return;
    const source = pending.source;
    return () => URL.revokeObjectURL(source);
  }, [pending]);

  async function upload(blob: Blob) {
    setUploading(true);
    try {
      const { url } = await api.upload(blob, folder);
      onChange(url);
      setPending(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : IMAGE.error, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function selectFile(file?: File) {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    const source = URL.createObjectURL(file);
    if (await canPreview(source)) {
      setPending({ source, file });
      return;
    }
    URL.revokeObjectURL(source);
    toast(IMAGE.noPreview);
    await upload(file);
  }

  async function confirmCrop(area: Area) {
    if (!pending) return;
    try {
      await upload(await cropToSquare(pending.source, area));
    } catch (e) {
      toast(e instanceof Error ? e.message : IMAGE.error, 'error');
    }
  }

  const pick = () => inputRef.current?.click();
  const shape = round ? 'rounded-full' : 'rounded-xl';

  return (
    <div className={className}>
      <span className="label">{label}</span>
      <div
        className={clsx(
          'group border-border bg-surface-2 relative aspect-square overflow-hidden border border-dashed',
          shape,
        )}
      >
        {value ? (
          <img src={value} alt={label} className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={pick}
            disabled={uploading}
            className="text-faint hover:text-text flex size-full flex-col items-center justify-center gap-2 text-sm transition"
          >
            {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {uploading ? IMAGE.uploading : IMAGE.upload}
          </button>
        )}
        {value && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/55 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              className="btn-ghost !p-2"
              onClick={pick}
              aria-label={IMAGE.replace}
              title={IMAGE.replace}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            </button>
            <button
              type="button"
              className="btn-ghost !p-2"
              onClick={() => setPending({ source: value })}
              aria-label={IMAGE.adjust}
              title={IMAGE.adjust}
            >
              <Crop className="size-4" />
            </button>
            <button
              type="button"
              className="btn-danger !p-2"
              onClick={() => onChange(null)}
              aria-label={IMAGE.remove}
              title={IMAGE.remove}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => selectFile(e.target.files?.[0])}
      />
      <ImageCropper
        key={pending?.source}
        source={pending?.source ?? null}
        round={round}
        busy={uploading}
        onCancel={() => setPending(null)}
        onConfirm={confirmCrop}
      />
    </div>
  );
}
