'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { LogIn, LogOut, Menu, UtensilsCrossed, X } from 'lucide-react';
import { APP, NAV } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from './UserAvatar';
import { ADMIN_LINKS, UserMenu } from './UserMenu';
import { ThemeSwitcher } from './ThemeSwitcher';

const links = [
  { href: '/', label: NAV.map },
  { href: '/restaurantes', label: NAV.restaurants },
  { href: '/sobre', label: NAV.about },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="border-border/70 bg-bg/80 sticky top-0 z-[1000] border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="bg-accent grid size-9 place-items-center rounded-full text-black">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">{APP.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                'rounded-full px-4 py-2 text-sm transition',
                isActive(l.href) ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          {user ? (
            <UserMenu user={user} onLogout={logout} />
          ) : (
            <Link href="/login" className="btn-ghost">
              <LogIn className="size-4" /> {NAV.login}
            </Link>
          )}
        </div>

        <button
          className="btn-ghost md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? NAV.closeMenu : NAV.openMenu}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-border bg-bg border-t px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  'rounded-xl px-4 py-3',
                  isActive(l.href) ? 'bg-surface-2 text-text' : 'text-muted',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <ThemeSwitcher showLabels />
            {user ? (
              <>
                <div className="bg-surface mb-2 flex items-center gap-3 rounded-xl px-4 py-3">
                  <UserAvatar name={user.name} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="text-faint truncate text-xs">{user.email}</p>
                  </div>
                </div>
                {ADMIN_LINKS.map(({ href, label, icon: Icon }, i) => (
                  <Link
                    key={href}
                    href={href}
                    className={i === 0 ? 'btn-primary' : 'btn-ghost'}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="size-4" /> {label}
                  </Link>
                ))}
                <button
                  className="btn-ghost"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  <LogOut className="size-4" /> {NAV.logout}
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)}>
                <LogIn className="size-4" /> {NAV.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
