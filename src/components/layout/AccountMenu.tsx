'use client';

import { useCallback, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, Menu } from 'lucide-react';
import { NAV } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import { useDismiss } from '@/lib/use-dismiss';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { AccountMenuContent } from './AccountMenuContent';

export function AccountMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={NAV.accountMenu}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 rounded-full border text-sm transition',
          user ? 'py-1 pr-3 pl-1' : 'p-2.5',
          open ? 'border-faint bg-surface-2' : 'border-border bg-surface hover:border-faint',
        )}
      >
        {user ? (
          <>
            <UserAvatar name={user.name} src={user.avatarUrl} size={30} />
            <span className="font-medium">{user.name}</span>
            <ChevronDown className={clsx('text-muted size-4 transition', open && 'rotate-180')} />
          </>
        ) : (
          <Menu className="size-4" />
        )}
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="border-border bg-surface absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border shadow-2xl"
        >
          <AccountMenuContent onNavigate={close} />
        </div>
      )}
    </div>
  );
}
