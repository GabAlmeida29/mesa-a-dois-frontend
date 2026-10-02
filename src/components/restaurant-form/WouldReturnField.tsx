'use client';

import clsx from 'clsx';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { FORM } from '@/constants/texts';

const OPTIONS = [
  { value: true, icon: ThumbsUp, ...FORM.wouldReturn.yes, tone: 'good' },
  { value: false, icon: ThumbsDown, ...FORM.wouldReturn.no, tone: 'bad' },
] as const;

export function WouldReturnField({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <fieldset className="border-border rounded-2xl border p-4 sm:p-5">
      <legend className="font-display float-left w-full text-lg font-semibold">
        {FORM.wouldReturn.question}
      </legend>
      <p className="text-faint clear-both mb-4 text-sm">{FORM.wouldReturn.hint}</p>
      <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ value: option, icon: Icon, label, description, tone }) => {
          const active = value === option;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={clsx(
                'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                active && tone === 'good' && 'border-good bg-good/10',
                active && tone === 'bad' && 'border-bad bg-bad/10',
                !active && 'border-border bg-surface-2 hover:border-faint',
              )}
            >
              <span
                className={clsx(
                  'grid size-10 shrink-0 place-items-center rounded-full',
                  active && tone === 'good' && 'bg-good text-on-accent',
                  active && tone === 'bad' && 'bg-bad text-on-accent',
                  !active && 'bg-surface text-faint',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-medium">{label}</span>
                <span className="text-faint block text-xs">{description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
