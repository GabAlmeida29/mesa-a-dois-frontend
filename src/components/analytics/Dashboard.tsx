import { Eye, Globe2, MousePointerClick, Users } from 'lucide-react';
import { ANALYTICS as T } from '@/constants/texts';
import { formatDateTime } from '@/lib/format';
import type { AnalyticsSummary } from '@/lib/types';
import { VisitorsMap } from '@/components/map';
import { DailyBars } from './DailyBars';
import { Panel } from './Panel';
import { RankedBars } from './RankedBars';
import { StatCard } from './StatCard';
import { countryName, numberFmt, ratioFmt } from './format';

export function Dashboard({
  data,
  pageLabel,
}: {
  data: AnalyticsSummary;
  pageLabel: (path: string) => string;
}) {
  const { totals } = data;
  const perVisitor = totals.visitors ? totals.pageviews / totals.visitors : 0;

  if (totals.pageviews === 0 && totals.clicks === 0) {
    return <p className="card text-muted p-10 text-center">{T.empty}</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label={T.visitors}
          hint={T.visitorsHint}
          value={numberFmt.format(totals.visitors)}
        />
        <StatCard icon={Eye} label={T.pageviews} value={numberFmt.format(totals.pageviews)} />
        <StatCard icon={MousePointerClick} label={T.clicks} value={numberFmt.format(totals.clicks)} />
        <StatCard icon={Globe2} label={T.perVisitor} value={ratioFmt.format(perVisitor)} />
      </div>

      <Panel title={T.dailyTitle}>
        <DailyBars daily={data.daily} />
      </Panel>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel title={T.pagesTitle}>
          <RankedBars
            rows={data.pages.map((p) => ({
              key: p.path,
              label: pageLabel(p.path),
              value: p.views,
              detail: T.visitorsCount(p.visitors),
            }))}
            format={T.views}
          />
        </Panel>
        <Panel title={T.clicksTitle}>
          <RankedBars
            rows={data.clicks.map((c) => ({
              key: `${c.target}|${c.path}`,
              label: c.target,
              value: c.clicks,
              detail: T.onPage(pageLabel(c.path)),
            }))}
            format={T.clicksCount}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={T.mapTitle} subtitle={T.geoCredit}>
          <div className="border-border h-80 overflow-hidden rounded-xl border">
            <VisitorsMap cities={data.cities} />
          </div>
        </Panel>
        <div className="grid grid-cols-1 gap-5">
          <Panel title={T.countriesTitle}>
            <RankedBars
              rows={data.countries.map((c) => ({
                key: c.country,
                label: countryName(c.country),
                value: c.visitors,
              }))}
              format={T.visitorsCount}
            />
          </Panel>
          <Panel title={T.citiesTitle}>
            <RankedBars
              rows={data.cities.slice(0, 8).map((c) => ({
                key: `${c.city}-${c.country}`,
                label: c.city,
                value: c.visitors,
                detail: [c.region, countryName(c.country)].filter(Boolean).join(', '),
              }))}
              format={T.visitorsCount}
            />
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Panel title={T.devicesTitle}>
          <RankedBars
            rows={data.devices.map((d) => ({
              key: d.label,
              label: T.devices[d.label] ?? d.label,
              value: d.visitors,
            }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.browsersTitle}>
          <RankedBars
            rows={data.browsers.map((d) => ({ key: d.label, label: d.label, value: d.visitors }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.systemsTitle}>
          <RankedBars
            rows={data.systems.map((d) => ({ key: d.label, label: d.label, value: d.visitors }))}
            format={T.visitorsCount}
          />
        </Panel>
        <Panel title={T.referrersTitle}>
          <RankedBars
            rows={data.referrers.map((r) => ({ key: r.host, label: r.host, value: r.visitors }))}
            format={T.visitorsCount}
            empty={T.direct}
          />
        </Panel>
      </div>

      <Panel title={T.recentTitle}>
        <ul className="divide-border divide-y text-sm">
          {data.recent.map((e, i) => (
            <li
              key={`${e.occurredAt}-${i}`}
              className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="text-faint shrink-0 text-xs tabular-nums sm:w-28 sm:text-sm">
                {formatDateTime(e.occurredAt)}
              </span>
              <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                <span className="text-muted">{e.type === 'click' ? T.click : T.pageview} </span>
                <span className="font-medium">{e.type === 'click' ? e.target : pageLabel(e.path)}</span>
                {e.type === 'click' && <span className="text-faint"> · {pageLabel(e.path)}</span>}
              </span>
              <span className="text-faint text-xs">
                {[e.city, countryName(e.country), e.device ? (T.devices[e.device] ?? e.device) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
