import { Heart } from 'lucide-react';
import { APP } from '@/constants/texts';
import { MAP_CREDITS } from '@/constants/config';

export function Footer() {
  return (
    <footer className="border-border/70 border-t py-8">
      <div className="text-faint mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm sm:flex-row sm:px-6">
        <span className="font-display text-muted text-base">{APP.name}</span>
        <span className="flex items-center gap-1.5">
          <Heart className="text-accent size-3.5" /> {APP.footer} · {new Date().getFullYear()}
        </span>
      </div>
      <p className="text-faint/70 mx-auto mt-3 max-w-7xl px-4 text-center text-[11px] sm:px-6 sm:text-right">
        {APP.mapCredits}{' '}
        {MAP_CREDITS.map((c, i) => (
          <span key={c.href}>
            {i > 0 && ' · '}
            <a href={c.href} target="_blank" rel="noreferrer" className="hover:text-muted">
              {c.label}
            </a>
          </span>
        ))}
      </p>
    </footer>
  );
}
