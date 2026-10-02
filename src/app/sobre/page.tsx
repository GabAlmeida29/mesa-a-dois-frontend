import Link from 'next/link';
import { MapPinned, Star, ThumbsUp, UtensilsCrossed } from 'lucide-react';
import { TeamCards } from '@/components/team/TeamCards';
import { LogoFull } from '@/components/brand/Logo';
import { ABOUT } from '@/constants/texts';

const howIcons = [Star, UtensilsCrossed, ThumbsUp];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="text-center">
        <LogoFull className="mx-auto mb-6 w-56 sm:w-64" />
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{ABOUT.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">{ABOUT.intro}</p>
      </section>

      <section className="mt-14">
        <TeamCards />
      </section>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-center text-3xl font-semibold">{ABOUT.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ABOUT.how.map((item, i) => {
            const Icon = howIcons[i] ?? Star;
            return (
              <div key={item.title} className="card p-5">
                <Icon className="text-gold mb-3 size-5" />
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-muted mt-1 text-sm">{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card mt-14 flex flex-col items-center gap-4 p-8 text-center">
        <MapPinned className="text-accent size-8" />
        <h2 className="font-display text-2xl font-semibold">{ABOUT.ctaTitle}</h2>
        <Link href="/" className="btn-primary">
          {ABOUT.ctaButton}
        </Link>
      </section>
    </div>
  );
}
