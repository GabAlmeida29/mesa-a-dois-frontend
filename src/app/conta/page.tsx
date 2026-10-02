'use client';

import { useState } from 'react';
import { KeyRound, Loader2, LogOut, Save, ShieldCheck, Smartphone, UserRound } from 'lucide-react';
import { ACCOUNT, SECURITY, TWO_FACTOR } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { fieldErrorFrom } from '@/lib/form-utils';
import type { Enrollment } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Modal } from '@/components/Modal';
import { PasswordField } from '@/components/PasswordField';
import { TwoFactorEnrollment } from '@/components/TwoFactorEnrollment';
import { UserAvatar } from '@/components/UserAvatar';

export default function AccountPage() {
  return (
    <AdminGuard>
      <AccountView />
    </AdminGuard>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
        <Icon className="text-accent size-5" /> {title}
      </h2>
      {children}
    </section>
  );
}

function AccountView() {
  const { user, setUser, enroll } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user!.name);
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string | undefined>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [twoFactorStep, setTwoFactorStep] = useState<'closed' | 'confirm' | 'scan'>('closed');
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [busy, setBusy] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const { user: updated } = await api.updateMe(name.trim());
      setUser(updated);
      toast(ACCOUNT.profileSaved);
    } catch (err) {
      toast(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const errors = {
      current: passwords.current ? undefined : SECURITY.required,
      next: passwords.next ? undefined : SECURITY.required,
      confirm: passwords.confirm === passwords.next ? undefined : SECURITY.passwordMismatch,
    };
    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPassword(true);
    try {
      await api.setUserPassword(user!.id, passwords.next, passwords.current);
      setPasswords({ current: '', next: '', confirm: '' });
      toast(ACCOUNT.passwordSaved);
    } catch (err) {
      if (err instanceof ApiError) {
        setPasswordErrors({
          current: fieldErrorFrom(err.details, 'currentPassword'),
          next: fieldErrorFrom(err.details, 'password'),
        });
        if (!err.details) toast(err.message, 'error');
      }
    } finally {
      setSavingPassword(false);
    }
  }

  function closeTwoFactor() {
    setTwoFactorStep('closed');
    setTwoFactorPassword('');
    setTwoFactorError(null);
    setEnrollment(null);
  }

  async function startTwoFactor(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTwoFactorError(null);
    try {
      setEnrollment(await api.startTwoFactorSetup(twoFactorPassword));
      setTwoFactorStep('scan');
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function finishTwoFactor(code: string) {
    if (!enrollment) return;
    setTwoFactorError(null);
    try {
      await enroll(enrollment.enrollmentToken, code);
      closeTwoFactor();
      toast(TWO_FACTOR.done);
    } catch (err) {
      setTwoFactorError(err instanceof Error ? err.message : String(err));
    }
  }

  async function logoutOthers() {
    setBusy(true);
    try {
      await api.logoutOthers();
      toast(ACCOUNT.sessionsDone);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-center gap-4">
        <UserAvatar name={user!.name} size={64} />
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{ACCOUNT.title}</h1>
          <p className="text-muted mt-1">{ACCOUNT.subtitle}</p>
        </div>
      </div>

      <div className="space-y-5">
        <Section icon={UserRound} title={ACCOUNT.profileTitle}>
          <form onSubmit={saveName} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div>
              <label className="label" htmlFor="account-name">
                {ACCOUNT.name}
              </label>
              <input
                id="account-name"
                className="input"
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="account-email">
                {ACCOUNT.email}
              </label>
              <input id="account-email" className="input opacity-70" value={user!.email} readOnly />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={savingName || !name.trim() || name.trim() === user!.name}
            >
              {savingName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {ACCOUNT.saveProfile}
            </button>
          </form>
        </Section>

        <Section icon={KeyRound} title={ACCOUNT.passwordTitle}>
          <form onSubmit={savePassword} className="space-y-4" noValidate>
            <PasswordField
              id="current-password"
              label={SECURITY.currentPassword}
              autoComplete="current-password"
              value={passwords.current}
              error={passwordErrors.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                id="new-password"
                label={SECURITY.newPassword}
                autoComplete="new-password"
                value={passwords.next}
                error={passwordErrors.next}
                hint={SECURITY.passwordRules}
                onGenerate={(pw) => setPasswords((p) => ({ ...p, next: pw, confirm: pw }))}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
              />
              <PasswordField
                id="confirm-password"
                label={SECURITY.confirmPassword}
                autoComplete="new-password"
                value={passwords.confirm}
                error={passwordErrors.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={savingPassword}>
                {savingPassword ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {ACCOUNT.passwordSave}
              </button>
            </div>
          </form>
        </Section>

        <Section icon={ShieldCheck} title={ACCOUNT.twoFactorTitle}>
          <p className="text-good flex items-center gap-2 text-sm">
            <ShieldCheck className="size-4" /> {ACCOUNT.twoFactorOn}
          </p>
          <div className="border-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted text-sm">{ACCOUNT.twoFactorResetHint}</p>
            <button type="button" className="btn-ghost shrink-0" onClick={() => setTwoFactorStep('confirm')}>
              <Smartphone className="size-4" /> {ACCOUNT.twoFactorReset}
            </button>
          </div>
        </Section>

        <Section icon={LogOut} title={ACCOUNT.sessionsTitle}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted text-sm">{ACCOUNT.sessionsText}</p>
            <button type="button" className="btn-ghost shrink-0" onClick={logoutOthers} disabled={busy}>
              <LogOut className="size-4" /> {ACCOUNT.sessionsButton}
            </button>
          </div>
        </Section>
      </div>

      <Modal open={twoFactorStep !== 'closed'} title={ACCOUNT.twoFactorModal} onClose={closeTwoFactor}>
        {twoFactorStep === 'scan' && enrollment ? (
          <TwoFactorEnrollment
            enrollment={enrollment}
            submitLabel={TWO_FACTOR.confirmAccount}
            onSubmit={finishTwoFactor}
            error={twoFactorError}
          />
        ) : (
          <form onSubmit={startTwoFactor} className="space-y-4">
            <p className="text-muted text-sm">{SECURITY.currentPasswordHint}</p>
            <PasswordField
              id="two-factor-password"
              label={SECURITY.currentPassword}
              autoComplete="current-password"
              autoFocus
              value={twoFactorPassword}
              error={twoFactorError ?? undefined}
              onChange={(e) => setTwoFactorPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full" disabled={busy || !twoFactorPassword}>
              {busy && <Loader2 className="size-4 animate-spin" />} {ACCOUNT.continue}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
