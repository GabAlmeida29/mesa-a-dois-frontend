'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ChevronDown, LogOut } from 'lucide-react';
import { NAV } from '@/constants/texts';
import type { User } from '@/lib/types';
import { useMenuLinks } from './menu-links';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const links = useMenuLinks();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm transition',
          open ? 'border-faint bg-surface-2' : 'border-border bg-surface hover:border-faint',
        )}
      >
        <UserAvatar name={user.name} src={user.avatarUrl} size={30} />
        <span className="font-medium">{user.name}</span>
        <ChevronDown className={clsx('text-muted size-4 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="border-border bg-surface absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl"
        >
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
            <UserAvatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="text-faint truncate text-xs">{user.email}</p>
            </div>
          </div>
          <div className="p-1.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={close}
                className="hover:bg-surface-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm"
              >
                <Icon className="text-accent size-4" /> {label}
              </Link>
            ))}
            <div className="border-border my-1.5 border-t" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                onLogout();
              }}
              className="text-bad hover:bg-bad/10 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm"
            >
              <LogOut className="size-4" /> {NAV.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
