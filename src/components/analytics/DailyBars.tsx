import clsx from 'clsx';
import { ANALYTICS as T } from '@/constants/texts';
import type { AnalyticsSummary } from '@/lib/types';
import { shortDay } from './format';

type Day = AnalyticsSummary['daily'][number];

const formatDay = (day: string) => shortDay.format(new Date(`${day}T00:00:00Z`));

function axisLabels(daily: Day[]) {
  if (daily.length <= 1) return daily.map((d) => ({ day: d.day, wide: false }));
  const last = daily.length - 1;
  const positions = [0, Math.round(last / 4), Math.round(last / 2), Math.round((last * 3) / 4), last];
  return [...new Set(positions)].map((index, i, all) => ({
    day: daily[index].day,
    wide: i !== 0 && i !== all.length - 1 && index !== Math.round(last / 2),
  }));
}

function tooltipPosition(index: number, total: number) {
  if (index < total / 3) return 'left-0';
  if (index > (total * 2) / 3) return 'right-0';
  return 'left-1/2 -translate-x-1/2';
}

export function DailyBars({ daily }: { daily: Day[] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const ticks = [max, Math.round(max / 2), 0];

  return (
    <div className="flex gap-3">
      <div className="text-faint flex h-48 flex-col justify-between text-right text-[11px] tabular-nums">
        {ticks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-48">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((_, i) => (
              <div key={i} className="border-border/60 border-t" />
            ))}
          </div>
          <div className="relative flex h-full items-end gap-[2px]">
            {daily.map((d, i) => (
              <div key={d.day} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
                <div
                  className="bg-accent group-hover:bg-accent-strong min-h-[2px] rounded-t-[4px] transition-colors"
                  style={{ height: `${(d.visitors / max) * 100}%` }}
                />
                <div
                  className={clsx(
                    'border-border bg-surface pointer-events-none absolute top-0 z-10 hidden rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg group-hover:block',
                    tooltipPosition(i, daily.length),
                  )}
                >
                  <p className="font-medium">{formatDay(d.day)}</p>
                  <p className="text-muted">{T.visitorsCount(d.visitors)}</p>
                  <p className="text-muted">{T.views(d.pageviews)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-faint mt-1.5 flex justify-between gap-2 text-[10px] whitespace-nowrap">
          {axisLabels(daily).map(({ day, wide }) => (
            <span key={day} className={clsx(wide && 'hidden sm:inline')}>
              {formatDay(day)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
