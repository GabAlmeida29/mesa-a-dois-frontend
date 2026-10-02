'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Wand2 } from 'lucide-react';
import { SECURITY } from '@/constants/texts';
import { generateStrongPassword } from '@/lib/password';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  onGenerate?: (password: string) => void;
}

export const PasswordField = forwardRef<HTMLInputElement, Props>(function PasswordField(
  { label, error, hint, onGenerate, id, ...input },
  ref,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="label" htmlFor={id}>
          {label}
        </label>
        {onGenerate && (
          <button
            type="button"
            className="text-accent hover:text-accent-strong mb-1.5 flex items-center gap-1 text-xs"
            onClick={() => {
              onGenerate(generateStrongPassword());
              setVisible(true);
            }}
          >
            <Wand2 className="size-3.5" /> {SECURITY.generate}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          className="input !pr-10 font-mono"
          {...input}
        />
        <button
          type="button"
          className="text-faint hover:text-text absolute top-1/2 right-3 -translate-y-1/2"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? SECURITY.hide : SECURITY.show}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && !error && <p className="text-faint mt-1 text-xs">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
});
