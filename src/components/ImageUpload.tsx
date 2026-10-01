'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { FORM } from '@/constants/texts';
import { useToast } from '@/contexts/ToastContext';

interface Props {
  label: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: 'logos' | 'dishes';
  shape?: 'square' | 'wide';
}

export function ImageUpload({ label, value, onChange, folder, shape = 'wide' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  async function handleFile(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload(file, folder);
      onChange(url);
    } catch (e) {
      toast(e instanceof Error ? e.message : FORM.errors.generic, 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div
        className={clsx(
          'group border-border bg-surface-2 relative overflow-hidden border border-dashed',
          shape === 'wide' && 'aspect-[16/9] rounded-xl',
          shape === 'square' && 'aspect-square rounded-xl',
        )}
      >
        {value ? (
          <img src={value} alt={label} className="size-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-faint hover:text-text flex size-full flex-col items-center justify-center gap-2 text-sm transition"
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {uploading ? FORM.uploading : FORM.upload}
          </button>
        )}
        {value && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              className="btn-ghost !p-2"
              onClick={() => inputRef.current?.click()}
              aria-label={FORM.upload}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            </button>
            <button
              type="button"
              className="btn-danger !p-2"
              onClick={() => onChange(null)}
              aria-label={FORM.removeImage}
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
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
