'use client';

import { useEffect, useRef } from 'react';
import { COMMON } from '@/constants/texts';

interface Props {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = COMMON.confirm,
  loading,
  onConfirm,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="border-border bg-surface text-text m-auto w-[calc(100%-2rem)] max-w-md rounded-[var(--radius-card)] border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-muted mt-2 text-sm">{text}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            {COMMON.cancel}
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
