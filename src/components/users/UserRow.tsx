'use client';

import { KeyRound, Lock, LockOpen, Pencil, ShieldAlert, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { PERMISSION_LABELS, ROLES, USERS } from '@/constants/texts';
import { formatDateTime } from '@/lib/format';
import type { ManagedUser } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import type { UserAction } from './user-actions';

interface Props {
  user: ManagedUser;
  isMe: boolean;
  onAction: (action: UserAction) => void;
  onUnlock: (user: ManagedUser) => void;
}

function accessSummary(user: ManagedUser) {
  if (user.role === 'admin') return null;
  if (!user.permissions.length) return USERS.noPermissions;
  return user.permissions.map((p) => PERMISSION_LABELS[p].short).join(' · ');
}

export function UserRow({ user, isMe, onAction, onUnlock }: Props) {
  const lastLogin = formatDateTime(user.lastLoginAt);
  const summary = accessSummary(user);

  return (
    <li className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <UserAvatar name={user.name} src={user.avatarUrl} size={48} />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 font-medium">
            <span className="truncate">{user.name}</span>
            {isMe && <span className="text-faint text-xs font-normal">({USERS.you})</span>}
          </p>
          <p className="text-muted truncate text-sm">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={user.role === 'admin' ? 'accent' : 'neutral'}>{ROLES[user.role].label}</Badge>
            {user.twoFactorEnabled ? (
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
            {user.lockedUntil && (
              <Badge tone="bad">
                <Lock className="size-3" /> {USERS.locked}
              </Badge>
            )}
          </div>
          {summary && <p className="text-faint mt-1.5 text-xs">{summary}</p>}
          <p className="text-faint mt-1 text-xs">
            {lastLogin ? USERS.lastLogin(lastLogin) : USERS.neverLogged}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {user.lockedUntil && (
          <button className="btn-ghost !py-1.5" onClick={() => onUnlock(user)}>
            <LockOpen className="size-4" /> {USERS.unlock}
          </button>
        )}
        <IconButton label={USERS.edit} onClick={() => onAction({ kind: 'edit', user })}>
          <Pencil className="size-4" />
        </IconButton>
        <IconButton label={USERS.resetPassword} onClick={() => onAction({ kind: 'password', user })}>
          <KeyRound className="size-4" />
        </IconButton>
        {user.twoFactorEnabled && !isMe && (
          <IconButton label={USERS.resetTwoFactor} onClick={() => onAction({ kind: 'reset-2fa', user })}>
            <Smartphone className="size-4" />
          </IconButton>
        )}
        {!isMe && (
          <IconButton label={USERS.remove} danger onClick={() => onAction({ kind: 'remove', user })}>
            <Trash2 className="size-4" />
          </IconButton>
        )}
      </div>
    </li>
  );
}
