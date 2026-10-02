import clsx from 'clsx';

type Tone = 'good' | 'gold' | 'bad' | 'neutral' | 'accent';

const TONES: Record<Tone, string> = {
  good: 'bg-good/15 text-good',
  gold: 'bg-gold/15 text-gold',
  bad: 'bg-bad/15 text-bad',
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent/15 text-accent-strong',
};

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}
