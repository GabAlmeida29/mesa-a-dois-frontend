import { useMemo } from 'react';
import { ANALYTICS as T } from '@/constants/texts';
import type { AnalyticsSummary } from '@/lib/types';
import { shortDay } from './format';

export function DailyBars({ daily }: { daily: AnalyticsSummary['daily'] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const labelEvery = Math.ceil(daily.length / 8);
  const ticks = useMemo(() => [max, Math.round(max / 2), 0], [max]);

  return (
    <div className="flex gap-3">
      <div className="text-faint flex h-48 flex-col justify-between pb-5 text-right text-[11px] tabular-nums">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-5 flex flex-col justify-between">
          {ticks.map((_, i) => (
            <div key={i} className="border-border/60 border-t" />
          ))}
        </div>
        <div className="relative flex h-48 items-end gap-[2px] pb-5">
          {daily.map((d, i) => (
            <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="bg-accent group-hover:bg-accent-strong min-h-[2px] rounded-t-[4px] transition-colors"
                style={{ height: `${(d.visitors / max) * 100}%` }}
              />
              <div className="border-border bg-surface pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg group-hover:block">
                <p className="font-medium">{shortDay.format(new Date(`${d.day}T00:00:00Z`))}</p>
                <p className="text-muted">{T.visitorsCount(d.visitors)}</p>
                <p className="text-muted">{T.views(d.pageviews)}</p>
              </div>
              {i % labelEvery === 0 && (
                <span className="text-faint absolute -bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-[10px] whitespace-nowrap">
                  {shortDay.format(new Date(`${d.day}T00:00:00Z`))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
