'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { SECURITY, USERS } from '@/constants/texts';
import { api, ApiError } from '@/lib/api';
import { fieldErrorFrom } from '@/lib/form-utils';
import type { UserAccess } from '@/lib/types';
import { PasswordField } from '@/components/ui/PasswordField';
import { AccessEditor } from './AccessEditor';
import { actionDescription, actionSubmitLabel, isDangerous, type UserAction } from './user-actions';

interface Props {
  action: UserAction;
  isMe: boolean;
  onDone: (message: string) => void;
}

type Errors = Partial<Record<'name' | 'email' | 'password' | 'currentPassword' | 'form', string>>;

const DEFAULT_ACCESS: UserAccess = { role: 'member', permissions: ['restaurants:create'] };

async function submitAction(action: UserAction, form: FormState, includeAccess: boolean): Promise<string> {
  const profile = { name: form.name.trim(), email: form.email.trim() };
  switch (action.kind) {
    case 'create':
      await api.createUser({
        ...profile,
        ...form.access,
        password: form.password,
        currentPassword: form.currentPassword,
      });
      return USERS.created;
    case 'edit':
      await api.updateUser(action.user.id, includeAccess ? { ...profile, ...form.access } : profile);
      return USERS.updated;
    case 'password':
      await api.setUserPassword(action.user.id, form.password, form.currentPassword);
      return USERS.passwordChanged;
    case 'reset-2fa':
      await api.resetUserTwoFactor(action.user.id, form.currentPassword);
      return USERS.twoFactorReset;
    case 'remove':
      await api.deleteUser(action.user.id, form.currentPassword);
      return USERS.removed;
  }
}

interface FormState {
  name: string;
  email: string;
  password: string;
  currentPassword: string;
  access: UserAccess;
}

export function UserActionForm({ action, isMe, onDone }: Props) {
  const target = action.kind === 'create' ? null : action.user;
  const needs = {
    profile: action.kind === 'create' || action.kind === 'edit',
    access: action.kind === 'create' || (action.kind === 'edit' && !isMe),
    password: action.kind === 'create' || action.kind === 'password',
    reauth: action.kind !== 'edit',
  };
  const [form, setForm] = useState<FormState>({
    name: target?.name ?? '',
    email: target?.email ?? '',
    password: '',
    currentPassword: '',
    access: target ? { role: target.role, permissions: target.permissions } : DEFAULT_ACCESS,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const set =
    (key: 'name' | 'email' | 'password' | 'currentPassword') => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate(): Errors {
    const missing: Errors = {};
    if (needs.profile && !form.name.trim()) missing.name = SECURITY.required;
    if (needs.profile && !form.email.trim()) missing.email = SECURITY.required;
    if (needs.password && !form.password) missing.password = SECURITY.required;
    if (needs.reauth && !form.currentPassword) missing.currentPassword = SECURITY.required;
    return missing;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = validate();
    setErrors(missing);
    if (Object.keys(missing).length) return;

    setBusy(true);
    try {
      onDone(await submitAction(action, form, needs.access));
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

  const description = actionDescription(action);

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

      {needs.access && (
        <AccessEditor value={form.access} onChange={(access) => setForm((f) => ({ ...f, access }))} />
      )}
      {action.kind === 'edit' && isMe && <p className="text-faint text-xs">{USERS.ownAccess}</p>}

      {needs.password && (
        <PasswordField
          id="user-password"
          label={SECURITY.newPassword}
          autoComplete="new-password"
          value={form.password}
          error={errors.password}
          hint={SECURITY.passwordRules}
          onGenerate={(password) => setForm((f) => ({ ...f, password }))}
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

      <button
        type="submit"
        className={clsx(isDangerous(action) ? 'btn-danger' : 'btn-primary', 'w-full')}
        disabled={busy}
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        {actionSubmitLabel(action)}
      </button>
    </form>
  );
}
