'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { COMMON } from '@/constants/texts';

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
      className="border-border bg-surface text-text m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[var(--radius-card)] border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="border-border bg-surface sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <button className="btn-ghost !p-2" onClick={onClose} aria-label={COMMON.close}>
          <X className="size-4" />
        </button>
      </div>
      <div className="p-6">{open && children}</div>
    </dialog>
  );
}
