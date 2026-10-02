'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { USERS } from '@/constants/texts';
import { api } from '@/lib/api';
import type { ManagedUser } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { ErrorState, Loading } from '@/components/ui/States';
import { UserActionForm } from '@/components/users/UserActionForm';
import { UserRow } from '@/components/users/UserRow';
import { actionTitle, type UserAction } from '@/components/users/user-actions';

export default function UsersPage() {
  return (
    <RequireAuth adminOnly>
      <UsersView />
    </RequireAuth>
  );
}

function UsersView() {
  const { user: me, refresh } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [error, setError] = useState(false);
  const [action, setAction] = useState<UserAction | null>(null);

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

  function done(message: string) {
    setAction(null);
    toast(message);
    load();
    void refresh();
  }

  const target = action && action.kind !== 'create' ? action.user : null;

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
          {users.map((u) => (
            <UserRow key={u.id} user={u} isMe={u.id === me?.id} onAction={setAction} onUnlock={unlock} />
          ))}
        </ul>
      )}

      <Modal open={!!action} title={action ? actionTitle(action) : ''} onClose={() => setAction(null)}>
        {action && (
          <UserActionForm
            key={`${action.kind}-${target?.id ?? 'new'}`}
            action={action}
            isMe={target?.id === me?.id}
            onDone={done}
          />
        )}
      </Modal>
    </div>
  );
}
