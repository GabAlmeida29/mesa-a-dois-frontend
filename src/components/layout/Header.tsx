'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { APP, NAV } from '@/constants/texts';
import { LogoLockup } from '@/components/brand/Logo';
import { AccountMenu } from './AccountMenu';
import { AccountMenuContent } from './AccountMenuContent';

const NAV_LINKS = [
  { href: '/', label: NAV.map },
  { href: '/restaurantes', label: NAV.restaurants },
  { href: '/sobre', label: NAV.about },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="border-border/70 bg-bg/80 sticky top-0 z-[1000] border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" onClick={close} aria-label={APP.name}>
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
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

        <div className="hidden md:block">
          <AccountMenu />
        </div>

        <button
          className="btn-ghost !p-2.5 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? NAV.closeMenu : NAV.openMenu}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-border bg-bg border-t md:hidden">
          <nav className="flex flex-col gap-1 px-4 pt-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className={clsx(
                  'rounded-xl px-4 py-3',
                  isActive(l.href) ? 'bg-surface-2 text-text' : 'text-muted',
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="border-border bg-surface mx-4 my-4 overflow-hidden rounded-2xl border">
            <AccountMenuContent onNavigate={close} />
          </div>
        </div>
      )}
    </header>
  );
}
