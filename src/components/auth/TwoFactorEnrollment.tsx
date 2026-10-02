'use client';

import { useState } from 'react';
import { Check, Copy, Loader2, ShieldCheck } from 'lucide-react';
import { TWO_FACTOR } from '@/constants/texts';
import type { Enrollment } from '@/lib/types';

interface Props {
  enrollment: Enrollment;
  submitLabel?: string;
  onSubmit: (code: string) => Promise<void>;
  error?: string | null;
  children?: React.ReactNode;
}

export function TwoFactorEnrollment({
  enrollment,
  submitLabel = TWO_FACTOR.confirm,
  onSubmit,
  error,
  children,
}: Props) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;
    setBusy(true);
    try {
      await onSubmit(code);
    } finally {
      setBusy(false);
      setCode('');
    }
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(enrollment.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const steps = [TWO_FACTOR.step1, TWO_FACTOR.step2, TWO_FACTOR.step3];

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-muted text-sm">{TWO_FACTOR.intro}</p>
      <ol className="space-y-2 text-sm">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="bg-accent/15 text-accent grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-center gap-3">
        <img
          src={enrollment.qrCode}
          alt={TWO_FACTOR.qrAlt}
          width={200}
          height={200}
          className="rounded-2xl bg-white p-2"
        />
        <p className="text-faint text-center text-xs">{TWO_FACTOR.manualKey}</p>
        <div className="flex w-full items-center gap-2">
          <code className="bg-surface-2 text-gold flex-1 rounded-xl px-3 py-2 text-center font-mono text-[11px] tracking-tight break-all">
            {enrollment.secret.match(/.{1,4}/g)?.join(' ')}
          </code>
          <button
            type="button"
            className="btn-ghost !p-2.5"
            onClick={copyKey}
            aria-label={TWO_FACTOR.copy}
            title={copied ? TWO_FACTOR.copied : TWO_FACTOR.copy}
          >
            {copied ? <Check className="text-good size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
        <p className="text-faint text-xs">{TWO_FACTOR.expires}</p>
      </div>

      <div>
        <label className="label" htmlFor="enroll-code">
          {TWO_FACTOR.code}
        </label>
        <input
          id="enroll-code"
          className="input text-center font-mono text-2xl tracking-[0.5em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
      </div>
      {error && <p className="bg-bad/10 text-bad rounded-xl px-3 py-2 text-sm">{error}</p>}
      <button type="submit" className="btn-primary w-full !py-2.5" disabled={busy || code.length !== 6}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        {busy ? TWO_FACTOR.confirming : submitLabel}
      </button>
      {children}
    </form>
  );
}
