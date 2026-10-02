import type { Metadata } from 'next';
import Link from 'next/link';
import { AtSign, Heart, MapPinned, Star, ThumbsUp, UtensilsCrossed } from 'lucide-react';
import { ABOUT } from '@/constants/texts';

export const metadata: Metadata = { title: ABOUT.title };

const howIcons = [Star, UtensilsCrossed, ThumbsUp];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="text-center">
        <span className="bg-accent/15 text-accent mx-auto mb-4 grid size-14 place-items-center rounded-full">
          <Heart className="size-6" />
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{ABOUT.title}</h1>
        <p className="text-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">{ABOUT.intro}</p>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2">
        {ABOUT.people.map((p) => (
          <article key={p.name} className="card p-6 sm:p-8">
            <img
              src={p.photo}
              alt={`Foto de ${p.name}`}
              width={96}
              height={96}
              className="ring-accent ring-offset-surface mb-4 size-24 rounded-full object-cover ring-2 ring-offset-4"
            />
            <h2 className="font-display text-2xl font-semibold">{p.name}</h2>
            <p className="text-accent text-sm">{p.role}</p>
            <p className="text-muted mt-3 leading-relaxed">{p.bio}</p>
            <a
              href={`https://www.instagram.com/${p.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ABOUT.instagramLabel(p.instagram)}
              className="btn-ghost mt-5 !py-1.5"
            >
              <AtSign className="text-accent size-4" /> {p.instagram}
            </a>
          </article>
        ))}
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
