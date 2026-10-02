'use client';

import { useState } from 'react';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { ACCOUNT, SECURITY } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { fieldErrorFrom } from '@/lib/form-utils';
import { useToast } from '@/contexts/ToastContext';
import { PasswordField } from '@/components/ui/PasswordField';
import { Section } from '@/components/ui/Section';

const EMPTY = { current: '', next: '', confirm: '' };

export function PasswordSection({ userId }: { userId: string }) {
  const toast = useToast();
  const [passwords, setPasswords] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswords((p) => ({ ...p, [key]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const missing = {
      current: passwords.current ? undefined : SECURITY.required,
      next: passwords.next ? undefined : SECURITY.required,
      confirm: passwords.confirm === passwords.next ? undefined : SECURITY.passwordMismatch,
    };
    setErrors(missing);
    if (Object.values(missing).some(Boolean)) return;

    setSaving(true);
    try {
      await api.setUserPassword(userId, passwords.next, passwords.current);
      setPasswords(EMPTY);
      toast(ACCOUNT.passwordSaved);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors({
          current: fieldErrorFrom(err.details, 'currentPassword'),
          next: fieldErrorFrom(err.details, 'password'),
        });
      } else toast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section icon={KeyRound} title={ACCOUNT.passwordTitle}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <PasswordField
          id="current-password"
          label={SECURITY.currentPassword}
          autoComplete="current-password"
          value={passwords.current}
          error={errors.current}
          onChange={set('current')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            id="new-password"
            label={SECURITY.newPassword}
            autoComplete="new-password"
            value={passwords.next}
            error={errors.next}
            hint={SECURITY.passwordRules}
            onGenerate={(pw) => setPasswords((p) => ({ ...p, next: pw, confirm: pw }))}
            onChange={set('next')}
          />
          <PasswordField
            id="confirm-password"
            label={SECURITY.confirmPassword}
            autoComplete="new-password"
            value={passwords.confirm}
            error={errors.confirm}
            onChange={set('confirm')}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {ACCOUNT.passwordSave}
          </button>
        </div>
      </form>
    </Section>
  );
}
