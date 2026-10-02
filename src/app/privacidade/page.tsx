import type { Metadata } from 'next';
import { AtSign, ShieldCheck } from 'lucide-react';
import { ABOUT, LEGAL } from '@/constants/texts';
import { GEOIP_CREDIT, MAP_CREDITS } from '@/constants/config';

export const metadata: Metadata = { title: LEGAL.title };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <span className="bg-accent/15 text-accent mb-4 grid size-12 place-items-center rounded-full">
        <ShieldCheck className="size-5" />
      </span>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{LEGAL.title}</h1>
      <p className="text-faint mt-2 text-sm">{LEGAL.updatedAt}</p>
      <p className="text-muted mt-6 text-lg leading-relaxed">{LEGAL.intro}</p>

      <div className="mt-10 space-y-8">
        {LEGAL.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-xl font-semibold">{section.title}</h2>
            <div className="text-muted mt-3 space-y-3 leading-relaxed">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}

        <section className="card p-6">
          <h2 className="font-display text-xl font-semibold">{LEGAL.contactTitle}</h2>
          <p className="text-muted mt-2">{LEGAL.contactText}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ABOUT.people.map((p) => (
              <a
                key={p.instagram}
                href={`https://www.instagram.com/${p.instagram}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !py-1.5"
              >
                <AtSign className="text-accent size-4" /> {p.instagram}
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">{LEGAL.credits}</h2>
          <ul className="text-muted mt-3 space-y-1 text-sm">
            {[...MAP_CREDITS, GEOIP_CREDIT].map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text underline-offset-2 hover:underline"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-faint mt-6 text-sm">{LEGAL.changesText}</p>
        </section>
      </div>
    </div>
  );
}
