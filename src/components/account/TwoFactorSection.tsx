'use client';

import { useState } from 'react';
import { Loader2, ShieldCheck, Smartphone } from 'lucide-react';
import { ACCOUNT, SECURITY, TWO_FACTOR } from '@/constants/texts';
import { api } from '@/lib/api';
import type { Enrollment } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { PasswordField } from '@/components/ui/PasswordField';
import { TwoFactorEnrollment } from '@/components/auth/TwoFactorEnrollment';
import { Section } from '@/components/ui/Section';

const message = (err: unknown) => (err instanceof Error ? err.message : String(err));

export function TwoFactorSection() {
  const { enroll } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setPassword('');
    setEnrollment(null);
    setError(null);
  }

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setEnrollment(await api.startTwoFactorSetup(password));
    } catch (err) {
      setError(message(err));
    } finally {
      setBusy(false);
    }
  }

  async function finish(code: string) {
    if (!enrollment) return;
    setError(null);
    try {
      await enroll(enrollment.enrollmentToken, code);
      close();
      toast(TWO_FACTOR.done);
    } catch (err) {
      setError(message(err));
    }
  }

  return (
    <Section icon={ShieldCheck} title={ACCOUNT.twoFactorTitle}>
      <p className="text-good flex items-center gap-2 text-sm">
        <ShieldCheck className="size-4" /> {ACCOUNT.twoFactorOn}
      </p>
      <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-sm">{ACCOUNT.twoFactorResetHint}</p>
        <button type="button" className="btn-ghost shrink-0" onClick={() => setOpen(true)}>
          <Smartphone className="size-4" /> {ACCOUNT.twoFactorReset}
        </button>
      </div>

      <Modal open={open} title={ACCOUNT.twoFactorModal} onClose={close}>
        {enrollment ? (
          <TwoFactorEnrollment
            enrollment={enrollment}
            submitLabel={TWO_FACTOR.confirmAccount}
            onSubmit={finish}
            error={error}
          />
        ) : (
          <form onSubmit={start} className="space-y-4">
            <p className="text-muted text-sm">{SECURITY.currentPasswordHint}</p>
            <PasswordField
              id="two-factor-password"
              label={SECURITY.currentPassword}
              autoComplete="current-password"
              autoFocus
              value={password}
              error={error ?? undefined}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full" disabled={busy || !password}>
              {busy && <Loader2 className="size-4 animate-spin" />} {ACCOUNT.continue}
            </button>
          </form>
        )}
      </Modal>
    </Section>
  );
}
