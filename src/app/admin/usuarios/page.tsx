'use client';

import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { SECURITY, USERS } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { fieldErrorFrom } from '@/lib/form-utils';
import { formatDateTime } from '@/lib/format';
import type { ManagedUser } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { AdminGuard } from '@/components/AdminGuard';
import { Modal } from '@/components/Modal';
import { PasswordField } from '@/components/PasswordField';
import { UserAvatar } from '@/components/UserAvatar';
import { ErrorState, Loading } from '@/components/States';

type Action =
  | { kind: 'create' }
  | { kind: 'edit'; user: ManagedUser }
  | { kind: 'password'; user: ManagedUser }
  | { kind: 'reset-2fa'; user: ManagedUser }
  | { kind: 'remove'; user: ManagedUser };

const EMPTY_FORM = { name: '', email: '', password: '', currentPassword: '' };

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersView />
    </AdminGuard>
  );
}

function Badge({ tone, children }: { tone: 'good' | 'gold' | 'bad'; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        tone === 'good' && 'bg-good/15 text-good',
        tone === 'gold' && 'bg-gold/15 text-gold',
        tone === 'bad' && 'bg-bad/15 text-bad',
      )}
    >
      {children}
    </span>
  );
}

function UsersView() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState(false);
  const [action, setAction] = useState<Action | null>(null);

  const load = useCallback(() => {
    setError(false);
    api
      .listUsers()
      .then(setUsers)
      .catch(() => setError(true));
  }, []);

  useEffect(load, [load]);

  async function unlock(user: ManagedUser) {
    try {
      await api.unlockUser(user.id);
      toast(USERS.unlocked);
      load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), 'error');
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{USERS.title}</h1>
          <p className="text-muted mt-2">{USERS.subtitle}</p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={() => setAction({ kind: 'create' })}>
          <Plus className="size-4" /> {USERS.add}
        </button>
      </div>

      {error ? (
        <ErrorState onRetry={load} />
      ) : !users ? (
        <Loading />
      ) : (
        <ul className="space-y-3">
          {users.map((u) => {
            const isMe = u.id === me?.id;
            const lastLogin = formatDateTime(u.lastLoginAt);
            return (
              <li key={u.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <UserAvatar name={u.name} size={48} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      <span className="truncate">{u.name}</span>
                      {isMe && <span className="text-faint text-xs font-normal">({USERS.you})</span>}
                    </p>
                    <p className="text-muted truncate text-sm">{u.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {u.twoFactorEnabled ? (
                        <Badge tone="good">
                          <ShieldCheck className="size-3" /> {USERS.twoFactorOn}
                        </Badge>
                      ) : (
                        <span title={USERS.twoFactorPendingHint}>
                          <Badge tone="gold">
                            <ShieldAlert className="size-3" /> {USERS.twoFactorPending}
                          </Badge>
                        </span>
                      )}
                      {u.lockedUntil && (
                        <Badge tone="bad">
                          <Lock className="size-3" /> {USERS.locked}
                        </Badge>
                      )}
                      <span className="text-faint text-xs">
                        {lastLogin ? USERS.lastLogin(lastLogin) : USERS.neverLogged}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {u.lockedUntil && (
                    <button className="btn-ghost !py-1.5" onClick={() => unlock(u)}>
                      <LockOpen className="size-4" /> {USERS.unlock}
                    </button>
                  )}
                  <IconAction label={USERS.edit} onClick={() => setAction({ kind: 'edit', user: u })}>
                    <Pencil className="size-4" />
                  </IconAction>
                  <IconAction
                    label={USERS.resetPassword}
                    onClick={() => setAction({ kind: 'password', user: u })}
                  >
                    <KeyRound className="size-4" />
                  </IconAction>
                  {u.twoFactorEnabled && !isMe && (
                    <IconAction
                      label={USERS.resetTwoFactor}
                      onClick={() => setAction({ kind: 'reset-2fa', user: u })}
                    >
                      <Smartphone className="size-4" />
                    </IconAction>
                  )}
                  {!isMe && (
                    <IconAction
                      label={USERS.remove}
                      danger
                      onClick={() => setAction({ kind: 'remove', user: u })}
                    >
                      <Trash2 className="size-4" />
                    </IconAction>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <UserActionModal
        action={action}
        onClose={() => setAction(null)}
        onDone={(message) => {
          setAction(null);
          toast(message);
          load();
        }}
      />
    </div>
  );
}

function IconAction({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={clsx(danger ? 'btn-danger' : 'btn-ghost', '!p-2.5')}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function modalTitle(action: Action) {
  switch (action.kind) {
    case 'create':
      return USERS.createTitle;
    case 'edit':
      return USERS.editTitle(action.user.name);
    case 'password':
      return USERS.passwordTitle(action.user.name);
    case 'reset-2fa':
      return USERS.resetTwoFactorTitle(action.user.name);
    case 'remove':
      return USERS.removeTitle(action.user.name);
  }
}

function UserActionModal({
  action,
  onClose,
  onDone,
}: {
  action: Action | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  return (
    <Modal open={!!action} title={action ? modalTitle(action) : ''} onClose={onClose}>
      {action && <UserActionForm key={JSON.stringify(action)} action={action} onDone={onDone} />}
    </Modal>
  );
}

function UserActionForm({ action, onDone }: { action: Action; onDone: (message: string) => void }) {
  const target = action.kind === 'create' ? null : action.user;
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    name: target?.name ?? '',
    email: target?.email ?? '',
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [busy, setBusy] = useState(false);

  const needs = {
    profile: action.kind === 'create' || action.kind === 'edit',
    password: action.kind === 'create' || action.kind === 'password',
    reauth: action.kind !== 'edit',
  };
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing: Record<string, string | undefined> = {};
    if (needs.profile && !form.name.trim()) missing.name = SECURITY.required;
    if (needs.profile && !form.email.trim()) missing.email = SECURITY.required;
    if (needs.password && !form.password) missing.password = SECURITY.required;
    if (needs.reauth && !form.currentPassword) missing.currentPassword = SECURITY.required;
    setErrors(missing);
    if (Object.keys(missing).length) return;

    setBusy(true);
    try {
      switch (action.kind) {
        case 'create':
          await api.createUser({ ...form, name: form.name.trim(), email: form.email.trim() });
          return onDone(USERS.created);
        case 'edit':
          await api.updateUser(action.user.id, { name: form.name.trim(), email: form.email.trim() });
          return onDone(USERS.updated);
        case 'password':
          await api.setUserPassword(action.user.id, form.password, form.currentPassword);
          return onDone(USERS.passwordChanged);
        case 'reset-2fa':
          await api.resetUserTwoFactor(action.user.id, form.currentPassword);
          return onDone(USERS.twoFactorReset);
        case 'remove':
          await api.deleteUser(action.user.id, form.currentPassword);
          return onDone(USERS.removed);
      }
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors({
          name: fieldErrorFrom(err.details, 'name'),
          email: fieldErrorFrom(err.details, 'email'),
          password: fieldErrorFrom(err.details, 'password'),
          currentPassword: fieldErrorFrom(err.details, 'currentPassword'),
        });
      } else {
        setErrors({ form: err instanceof Error ? err.message : String(err) });
      }
    } finally {
      setBusy(false);
    }
  }

  const description =
    action.kind === 'create'
      ? USERS.createHint
      : action.kind === 'password'
        ? USERS.passwordHint
        : action.kind === 'reset-2fa'
          ? USERS.resetTwoFactorText
          : action.kind === 'remove'
            ? USERS.removeText
            : null;
  const danger = action.kind === 'remove' || action.kind === 'reset-2fa';

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {description && <p className="text-muted text-sm">{description}</p>}

      {needs.profile && (
        <>
          <div>
            <label className="label" htmlFor="user-name">
              {USERS.name}
            </label>
            <input id="user-name" className="input" value={form.name} onChange={set('name')} maxLength={80} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label className="label" htmlFor="user-email">
              {USERS.email}
            </label>
            <input
              id="user-email"
              type="email"
              className="input"
              value={form.email}
              onChange={set('email')}
              autoComplete="off"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
        </>
      )}

      {needs.password && (
        <PasswordField
          id="user-password"
          label={SECURITY.newPassword}
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          hint={SECURITY.passwordRules}
          onGenerate={(pw) => setForm((f) => ({ ...f, password: pw }))}
          onChange={set('password')}
        />
      )}

      {needs.reauth && (
        <div className="border-border border-t pt-4">
          <PasswordField
            id="user-current-password"
            label={SECURITY.currentPassword}
            autoComplete="current-password"
            value={form.currentPassword}
            error={errors.currentPassword}
            hint={SECURITY.currentPasswordHint}
            onChange={set('currentPassword')}
          />
        </div>
      )}

      {errors.form && <p className="bg-bad/10 text-bad rounded-xl px-3 py-2 text-sm">{errors.form}</p>}

      <button type="submit" className={clsx(danger ? 'btn-danger' : 'btn-primary', 'w-full')} disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {action.kind === 'remove'
          ? USERS.remove
          : action.kind === 'reset-2fa'
            ? USERS.resetTwoFactor
            : USERS.save}
      </button>
    </form>
  );
}
