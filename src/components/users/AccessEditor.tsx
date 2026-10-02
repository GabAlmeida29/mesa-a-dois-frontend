'use client';

import clsx from 'clsx';
import { PERMISSION_LABELS, ROLES, USERS } from '@/constants/texts';
import { ALL_PERMISSIONS } from '@/lib/permissions';
import type { Permission, Role, UserAccess } from '@/lib/types';

interface Props {
  value: UserAccess;
  onChange: (value: UserAccess) => void;
}

export function AccessEditor({ value, onChange }: Props) {
  const togglePermission = (permission: Permission) =>
    onChange({
      ...value,
      permissions: value.permissions.includes(permission)
        ? value.permissions.filter((p) => p !== permission)
        : [...value.permissions, permission],
    });

  return (
    <fieldset className="space-y-3">
      <legend className="label">{USERS.accessTitle}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(ROLES) as Role[]).map((role) => {
          const active = value.role === role;
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ ...value, role })}
              className={clsx(
                'rounded-xl border p-3 text-left transition',
                active ? 'border-accent bg-accent/10' : 'border-border bg-surface-2 hover:border-faint',
              )}
            >
              <span className={clsx('block text-sm font-medium', active && 'text-accent-strong')}>
                {ROLES[role].label}
              </span>
              <span className="text-faint block text-xs">{ROLES[role].description}</span>
            </button>
          );
        })}
      </div>

      {value.role === 'member' && (
        <div className="border-border space-y-2 rounded-xl border p-3">
          <p className="text-faint text-xs font-medium tracking-wide uppercase">{USERS.permissionsTitle}</p>
          {ALL_PERMISSIONS.map((permission) => (
            <label key={permission} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-[var(--color-accent)]"
                checked={value.permissions.includes(permission)}
                onChange={() => togglePermission(permission)}
              />
              {PERMISSION_LABELS[permission].label}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
