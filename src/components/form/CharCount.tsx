import clsx from 'clsx';

export function CharCount({ length, max }: { length: number; max: number }) {
  const over = length > max;
  return (
    <span className={clsx('text-xs tabular-nums', over ? 'text-bad font-medium' : 'text-faint')}>
      {length}/{max}
    </span>
  );
}
