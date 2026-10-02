import { numberFmt } from './format';

interface RankedRow {
  key: string;
  label: string;
  value: number;
  detail?: string;
}

export function RankedBars({
  rows,
  format,
  empty = '—',
}: {
  rows: RankedRow[];
  format: (n: number) => string;
  empty?: string;
}) {
  if (!rows.length) return <p className="text-faint text-sm">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} title={`${r.label}: ${format(r.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">
              {r.label}
              {r.detail && <span className="text-faint text-xs"> · {r.detail}</span>}
            </span>
            <span className="text-muted shrink-0 tabular-nums">{numberFmt.format(r.value)}</span>
          </div>
          <div className="bg-surface-2 mt-1.5 h-1.5 overflow-hidden rounded-full">
            <div className="bg-accent h-full rounded-full" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
