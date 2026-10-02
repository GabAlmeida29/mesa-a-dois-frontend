import type { LucideIcon } from 'lucide-react';

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-muted flex items-center gap-2 text-sm">
        <Icon className="text-accent size-4" /> {label}
      </p>
      <p className="font-display mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-faint mt-1 text-xs">{hint}</p>}
    </div>
  );
}
