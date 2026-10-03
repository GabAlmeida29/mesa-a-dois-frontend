'use client';

import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { NAV, THEME } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useMenuLinks } from './menu-links';

const ITEM = 'hover:bg-surface-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm';

export function AccountMenuContent({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth();
  const links = useMenuLinks();

  return (
    <div className="flex flex-col">
      {user && (
        <>
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
            <UserAvatar name={user.name} src={user.avatarUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="text-faint truncate text-xs">{user.email}</p>
            </div>
          </div>
          <div className="border-border border-b p-1.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} role="menuitem" onClick={onNavigate} className={ITEM}>
                <Icon className="text-accent size-4" /> {label}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="border-border space-y-2 border-b px-4 py-3">
        <p className="text-faint text-xs font-medium tracking-wide uppercase">{THEME.label}</p>
        <ThemeSwitcher showLabels />
      </div>

      <div className="p-1.5">
        {user ? (
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onNavigate();
              void logout();
            }}
            className={`${ITEM} text-bad hover:!bg-bad/10`}
          >
            <LogOut className="size-4" /> {NAV.logout}
          </button>
        ) : (
          <Link href="/login" role="menuitem" onClick={onNavigate} className={ITEM}>
            <LogIn className="text-accent size-4" /> {NAV.login}
          </Link>
        )}
      </div>
    </div>
  );
}
