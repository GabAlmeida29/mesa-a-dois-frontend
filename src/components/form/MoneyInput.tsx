'use client';

import { forwardRef } from 'react';
import clsx from 'clsx';

const MAX_DIGITS = 10;
const formatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface Props {
  id: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur?: () => void;
  invalid?: boolean;
  describedBy?: string;
}

export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(
  { id, value, onChange, onBlur, invalid, describedBy },
  ref,
) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS);
    onChange(digits ? Number(digits) / 100 : null);
  }

  return (
    <div className="relative">
      <span className="text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium">
        R$
      </span>
      <input
        ref={ref}
        id={id}
        className={clsx('input !pl-10 text-right tabular-nums', invalid && '!border-bad')}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        value={value === null ? '' : formatter.format(value)}
        onChange={handleChange}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
    </div>
  );
});
