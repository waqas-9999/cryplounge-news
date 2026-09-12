'use client';

/**
 * The instrument panels around the globe.
 *
 * One visual rule for all of them: they are quiet. Hairline borders, a
 * translucent graphite ground only where they float over the Earth, 10-11px
 * uppercase labels, tabular numbers. The globe carries the colour; these carry
 * the numbers.
 */

import { memo, useEffect, useState } from 'react';
import { ArrowUpRight, ChevronRight, Menu, Pause, Play, RotateCcw, X } from 'lucide-react';
import {
  ACTIVE_STAGES,
  INTEL_WINDOWS,
  PIPELINE_STAGES,
  REGION_LABEL,
  REJECTION_LABEL,
  REJECTION_POINT_LABEL,
  STAGE_META,
  ago,
  categoryLabel,
  clockTime,
  numberFormat,
  type IntelEvent,
  type IntelLocation,
  type IntelSnapshot,
  type IntelStory,
  type IntelWindowKey,
  type NewsRegion,
  type PipelineStage,
} from './model';
import type { FeedConnection } from './use-intelligence-feed';

export const INSTRUMENT =
  'rounded-md border border-white/[0.07] bg-[#0B0D10]/78 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]';
export const LABEL = 'text-[10px] font-semibold uppercase tracking-[0.09em] text-[#8B929C]';
const MONO = 'font-mono tabular-nums';

export function StageDot({ stage, size = 6 }: { stage: PipelineStage; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: STAGE_META[stage].color, boxShadow: `0 0 8px ${STAGE_META[stage].color}55` }}
    />
  );
}

/** Re-renders a relative time every few seconds without re-rendering its parent. */
function Ago({ iso }: { iso: string }) {
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow(n => n + 1), 5000);
    return () => clearInterval(id);
  }, []);
  return <>{ago(iso)}</>;
}

/* ----------------------------------------------------------- command bar -- */

const CONNECTION_COPY: Record<FeedConnection, { label: string; tone: string }> = {
  connecting: { label: 'Connecting', tone: '#8B929C' },
  live: { label: 'Live', tone: '#4CC38A' },
  reconnecting: { label: 'Reconnecting', tone: '#E0A33A' },
  unavailable: { label: 'Offline', tone: '#E5605A' },
  paused: { label: 'Paused', tone: '#8B929C' },
  snapshot: { label: 'Window', tone: '#6E9BF5' },
};

const STATE_COPY: Record<IntelSnapshot['system']['state'], { label: string; tone: string }> = {
  CYCLING: { label: 'Cycling', tone: '#4CC38A' },
  SLEEPING: { label: 'Sleeping', tone: '#8B929C' },
  SILENT: { label: 'No signal', tone: '#E0A33A' },
};

export const CommandBar = memo(function CommandBar({
  snapshot,
  connection,
  lastSyncedAt,
  windowKey,
  onWindow,
  paused,
  onPause,
  mock,
  onMenu,
}: {
  snapshot: IntelSnapshot | null;
  connection: FeedConnection;
  lastSyncedAt: string | null;
  windowKey: IntelWindowKey;
  onWindow: (key: IntelWindowKey) => void;
  paused: boolean;
  onPause: () => void;
  mock: boolean;
  onMenu: () => void;
}) {
  const conn = CONNECTION_COPY[connection];
  const totals = snapshot?.totals;
  const system = snapshot ? STATE_COPY[snapshot.system.state] : null;
  const metrics: Array<{ label: string; value: number | undefined; tone?: string }> = [
    { label: 'In pipeline', value: totals?.active },
    { label: 'Drafts', value: totals?.drafts, tone: STAGE_META.DRAFT.color },
    { label: 'Published', value: totals?.published, tone: STAGE_META.PUBLISHED.color },
    { label: 'Rejected', value: totals?.rejected, tone: STAGE_META.REJECTED.color },
  ];

  return (
    <header className="relative z-20 flex h-12 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-[#08090B] px-3 sm:px-4">
      <button type="button" onClick={onMenu} className="rounded p-1.5 text-[#8B929C] hover:text-[#E8EAED] md:hidden" aria-label="Open navigation">
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex shrink-0 items-center gap-2.5">
        <span aria-hidden className="h-3.5 w-[3px] rounded-full bg-[#EFB81A]" />
        <h1 className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.12em] text-[#E8EAED]">
<span className="hidden lg:inline">CrypLounge </span><span className="text-[#8B929C]">AI Newsroom</span>
        </h1>
      </div>

      <div className="flex items-center gap-1.5" role="status" aria-live="polite">
        <span className="relative flex h-2 w-2">
          {connection === 'live' && (
            <span className="absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping" style={{ background: conn.tone }} />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: conn.tone }} />
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: conn.tone }}>
          {conn.label}
        </span>
        {system && (
          <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-[#767D88]" title="Newsroom state, from its own lifecycle events">
            · <span style={{ color: system.tone }}>{system.label}</span>
            {snapshot?.system.nextCycleAt && <span className={`${MONO} ml-1 normal-case tracking-normal`}>next {clockTime(snapshot.system.nextCycleAt)}</span>}
          </span>
        )}
        {mock && (
          <span className="ml-2 hidden whitespace-nowrap rounded-sm lg:inline border border-[#E0A33A]/40 px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.1em] text-[#E0A33A]">
            Development mock data
          </span>
        )}
      </div>

      <dl className="ml-1 hidden min-w-0 items-center overflow-hidden xl:flex">
        {metrics.map(metric => (
          <div key={metric.label} className="flex items-baseline gap-2 whitespace-nowrap border-l border-white/[0.06] px-3.5 first:border-l-0">
            <dt className={LABEL}>{metric.label}</dt>
            <dd className={`${MONO} text-[13px] font-medium`} style={{ color: metric.tone ?? '#E8EAED' }}>
              {metric.value === undefined ? '—' : numberFormat.format(metric.value)}
            </dd>
          </div>
        ))}
      </dl>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <span className={`${MONO} hidden whitespace-nowrap text-[10px] text-[#767D88] 2xl:inline`}>
          {lastSyncedAt ? `synced ${clockTime(lastSyncedAt)}` : ''}
        </span>
        <button
          type="button"
          onClick={onPause}
          className="flex h-7 items-center gap-1.5 rounded border border-white/[0.08] px-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#C9CDD3] transition-colors duration-150 hover:border-white/20 hover:text-white"
          aria-pressed={paused}
        >
          {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <div role="radiogroup" aria-label="Time window" className="flex h-7 items-center rounded border border-white/[0.08] p-0.5">
          {INTEL_WINDOWS.map(key => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={windowKey === key}
              onClick={() => onWindow(key)}
              className={`h-full rounded-[3px] px-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 ${
                windowKey === key ? 'bg-white/[0.09] text-[#E8EAED]' : 'text-[#767D88] hover:text-[#C9CDD3]'
              }`}
            >
              {key === 'live' ? 'Live' : key}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
});

/* --------------------------------------------------------- pipeline rail -- */

const RAIL_ORDER: PipelineStage[] = ['DISCOVERED', 'RESEARCH', 'VERIFICATION', 'IMAGE', 'FILING', 'DRAFT', 'PUBLISHED', 'REJECTED', 'HELD'];

export const PipelineRail = memo(function PipelineRail({
  counts,
  total,
  stageFilter,
  onStage,
  unmapped,
  onUnmapped,
  clustersFormed,
}: {
  counts: Record<PipelineStage, number> | null;
  total: number;
  stageFilter: PipelineStage | 'ALL';
  onStage: (stage: PipelineStage | 'ALL') => void;
  unmapped: number;
  onUnmapped: () => void;
  clustersFormed: number | null;
}) {
  const max = Math.max(1, ...RAIL_ORDER.map(stage => counts?.[stage] ?? 0));

  return (
    <nav aria-label="Live pipeline" className={`${INSTRUMENT} flex w-full flex-col py-3`}>
      <div className="flex items-center justify-between px-3.5 pb-2.5">
        <h2 className={LABEL}>Live pipeline</h2>
        {stageFilter !== 'ALL' && (
          <button type="button" onClick={() => onStage('ALL')} className="text-[10px] uppercase tracking-[0.08em] text-[#EFB81A] hover:text-[#F5CC55]">
            Clear
          </button>
        )}
      </div>

      <ol className="flex flex-col">
        {RAIL_ORDER.map((stage, index) => {
          const count = counts?.[stage] ?? 0;
          const active = stageFilter === stage;
          const faded = stageFilter !== 'ALL' && !active;
          const terminalStart = stage === 'DRAFT';
          const failStart = stage === 'REJECTED';
          return (
            <li key={stage} className={terminalStart || failStart ? 'mt-2 border-t border-white/[0.05] pt-2' : ''}>
              <button
                type="button"
                onClick={() => onStage(active ? 'ALL' : stage)}
                aria-pressed={active}
                title={STAGE_META[stage].hint}
                className={`group relative flex w-full items-center gap-2.5 px-3.5 py-[7px] text-left transition-[background-color,opacity] duration-150 hover:bg-white/[0.03] ${
                  faded ? 'opacity-40' : ''
                } ${active ? 'bg-white/[0.04]' : ''}`}
              >
                {active && <span aria-hidden className="absolute inset-y-1 left-0 w-[2px] rounded-r bg-[#EFB81A]" />}
                <span className="relative flex w-3 justify-center">
                  <StageDot stage={stage} />
                  {index < 4 && !terminalStart && (
                    <span aria-hidden className="absolute top-[11px] h-[20px] w-px bg-white/[0.06]" />
                  )}
                </span>
                <span className="flex-1 text-[11px] font-medium uppercase tracking-[0.07em] text-[#C9CDD3] group-hover:text-[#E8EAED]">
                  {STAGE_META[stage].label}
                </span>
                <span className={`${MONO} text-[12px] ${count ? 'text-[#E8EAED]' : 'text-[#767D88]'}`}>{count}</span>
              </button>
              <div aria-hidden className="mx-3.5 -mt-0.5 mb-0.5 ml-[38px] h-[2px] overflow-hidden rounded-full bg-white/[0.03]">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${(count / max) * 100}%`, background: `${STAGE_META[stage].color}99` }}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 space-y-1.5 border-t border-white/[0.05] px-3.5 pt-3 text-[11px]">
        <div className="flex justify-between text-[#8B929C]">
          <span>Stories in window</span>
          <span className={`${MONO} text-[#C9CDD3]`}>{numberFormat.format(total)}</span>
        </div>
        {clustersFormed !== null && (
          <div className="flex justify-between text-[#8B929C]" title="Reported per newsroom cycle, not per story">
            <span>Clusters formed</span>
            <span className={`${MONO} text-[#C9CDD3]`}>{numberFormat.format(clustersFormed)}</span>
          </div>
        )}
        {unmapped > 0 && (
          <button type="button" onClick={onUnmapped} className="flex w-full justify-between text-[#8B929C] hover:text-[#E8EAED]">
            <span className="underline decoration-white/15 underline-offset-2">Unmapped sources</span>
            <span className={`${MONO} text-[#C9CDD3]`}>{unmapped}</span>
          </button>
        )}
      </div>
    </nav>
  );
});

/* ------------------------------------------------------------- filters -- */

export const REGIONS: Array<NewsRegion | 'GLOBAL'> = ['GLOBAL', 'AMERICAS', 'EUROPE', 'MIDDLE_EAST', 'ASIA', 'OTHER'];

function Segment<T extends string>({
  label,
  options,
  value,
  onChange,
  render,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  render: (value: T) => string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#767D88]">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className="h-6 cursor-pointer appearance-none rounded border-0 bg-transparent pr-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#E8EAED] outline-none hover:text-white focus-visible:ring-1 focus-visible:ring-[#EFB81A]/40 [&>option]:bg-[#0F1115]"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {render(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

export const FilterDock = memo(function FilterDock({
  categories,
  category,
  onCategory,
  stage,
  onStageFilter,
  region,
  onRegion,
  onReset,
}: {
  categories: string[];
  category: string;
  onCategory: (value: string) => void;
  stage: PipelineStage | 'ALL';
  onStageFilter: (value: PipelineStage | 'ALL') => void;
  region: NewsRegion | 'GLOBAL';
  onRegion: (value: NewsRegion | 'GLOBAL') => void;
  onReset: () => void;
}) {
  const dirty = category !== 'ALL' || stage !== 'ALL' || region !== 'GLOBAL';
  return (
    <div className={`${INSTRUMENT} flex max-w-full items-center gap-4 overflow-x-auto px-3 py-1 [scrollbar-width:none]`} role="group" aria-label="Filters">
      <Segment label="Category" options={['ALL', ...categories]} value={category} onChange={onCategory} render={v => (v === 'ALL' ? 'All' : categoryLabel(v))} />
      <span aria-hidden className="h-3 w-px bg-white/[0.08]" />
      <Segment<PipelineStage | 'ALL'>
        label="Stage"
        options={['ALL', ...PIPELINE_STAGES]}
        value={stage}
        onChange={onStageFilter}
        render={v => (v === 'ALL' ? 'All' : STAGE_META[v].label)}
      />
      <span aria-hidden className="h-3 w-px bg-white/[0.08]" />
      <Segment label="Region" options={REGIONS} value={region} onChange={onRegion} render={v => REGION_LABEL[v]} />
      {dirty && (
        <button type="button" onClick={onReset} aria-label="Reset filters" className="text-[#767D88] hover:text-[#E8EAED]">
          <RotateCcw className="h-3 w-3" />
        </button>
      )}
    </div>
  );
});

/* ------------------------------------------------------ hover tooltip -- */

export function NodeTooltip({ location, x, y }: { location: { label: string; count: number; stages: Partial<Record<PipelineStage, number>> }; x: number; y: number }) {
  const rows = PIPELINE_STAGES.filter(stage => (location.stages[stage] ?? 0) > 0);
  return (
    <div
      className="pointer-events-none absolute z-30 min-w-[168px] rounded-md border border-white/[0.09] bg-[#0B0D10]/92 px-3 py-2.5 shadow-2xl backdrop-blur-md"
      style={{ left: x + 16, top: y - 12, transform: 'translateZ(0)' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E8EAED]">{location.label}</p>
      <p className={`${MONO} mb-2 text-[11px] text-[#8B929C]`}>{location.count} {location.count === 1 ? 'story' : 'stories'}</p>
      <ul className="space-y-1">
        {rows.map(stage => (
          <li key={stage} className="flex items-center gap-2 text-[11px] text-[#C9CDD3]">
            <StageDot stage={stage} size={5} />
            <span className="flex-1">{STAGE_META[stage].label}</span>
            <span className={`${MONO} text-[#E8EAED]`}>{location.stages[stage]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 border-t border-white/[0.06] pt-1.5 text-[9px] uppercase tracking-[0.09em] text-[#767D88]">Publisher base · double-click to focus</p>
    </div>
  );
}

/* ------------------------------------------------- intelligence panel -- */

export type Selection =
  | { kind: 'location'; key: string }
  | { kind: 'story'; clusterId: string; from?: { kind: 'location'; key: string } | { kind: 'unmapped' } }
  | { kind: 'unmapped' };

const PAGE = 40;

function StoryRow({ story, onOpen }: { story: IntelStory; onOpen: () => void }) {
  return (
    <li>
      <button type="button" onClick={onOpen} className="group flex w-full items-start gap-2.5 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.03]">
        <span className="mt-[5px]"><StageDot stage={story.stage} /></span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[12.5px] leading-snug text-[#E8EAED] group-hover:text-white">
            {story.title ?? <span className="text-[#8B929C]">Untitled cluster {story.clusterId.slice(0, 8)}</span>}
          </span>
          <span className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.07em] text-[#767D88]">
            <span style={{ color: STAGE_META[story.stage].color }}>{STAGE_META[story.stage].label}</span>
            <span aria-hidden>·</span>
            <span className={MONO}><Ago iso={story.lastActivityAt} /></span>
          </span>
        </span>
        <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#767D88] opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      </button>
    </li>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className={LABEL}>{label}</dt>
      <dd className="text-right text-[12px] text-[#E8EAED]">{children}</dd>
    </div>
  );
}

export function IntelPanel({
  selection,
  location,
  stories,
  storyById,
  onSelect,
  onClose,
}: {
  selection: Selection;
  location: IntelLocation | null;
  stories: IntelStory[];
  storyById: Map<string, IntelStory>;
  onSelect: (selection: Selection) => void;
  onClose: () => void;
}) {
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [selection]);

  const close = (
    <button type="button" onClick={onClose} aria-label="Close panel" className="rounded p-1 text-[#767D88] hover:text-[#E8EAED]">
      <X className="h-3.5 w-3.5" />
    </button>
  );

  if (selection.kind === 'story') {
    const story = storyById.get(selection.clusterId);
    if (!story) return null;
    const back = selection.from;
    return (
      <aside aria-label="Story intelligence" className={`${INSTRUMENT} flex max-h-full flex-col overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-200`}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          {back ? (
            <button type="button" onClick={() => onSelect(back)} className="text-[10px] uppercase tracking-[0.09em] text-[#8B929C] hover:text-[#E8EAED]">
              ← {back.kind === 'location' ? 'Base' : 'Unmapped'}
            </button>
          ) : (
            <span className={LABEL}>Story</span>
          )}
          {close}
        </div>
        <div className="overflow-y-auto px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <StageDot stage={story.stage} size={7} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: STAGE_META[story.stage].color }}>
              {STAGE_META[story.stage].label}
            </span>
          </div>
          <h3 className="text-[15px] font-medium leading-snug text-[#F2F4F7]">
            {story.title ?? `Untitled cluster ${story.clusterId.slice(0, 8)}`}
          </h3>

          {story.rejection && (
            <section className="mt-4 rounded border border-[#E5605A]/25 bg-[#E5605A]/[0.06] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#E5605A]">Rejected</p>
              <p className="mt-1 text-[12.5px] text-[#F2F4F7]">{REJECTION_LABEL[story.rejection.kind]}</p>
              {story.rejection.reasons.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 text-[11.5px] leading-snug text-[#C9CDD3]">
                  {story.rejection.reasons.slice(0, 4).map(reason => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              )}
              <dl className="mt-2 grid grid-cols-2 gap-2 border-t border-[#E5605A]/15 pt-2">
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.1em] text-[#8B929C]">Rejected at</dt>
                  <dd className="text-[11px] text-[#E8EAED]">{REJECTION_POINT_LABEL[story.rejection.at]}</dd>
                </div>
                <div>
                  <dt className="text-[9px] uppercase tracking-[0.1em] text-[#8B929C]">Time</dt>
                  <dd className={`${MONO} text-[11px] text-[#E8EAED]`}>{clockTime(story.rejection.occurredAt)}</dd>
                </div>
              </dl>
            </section>
          )}

          {story.stage === 'HELD' && story.heldReasons.length > 0 && (
            <p className="mt-4 rounded border border-white/[0.07] px-3 py-2 text-[11.5px] text-[#C9CDD3]">{story.heldReasons[0]}</p>
          )}

          <dl className="mt-4 divide-y divide-white/[0.04]">
            <Field label="Category">{categoryLabel(story.category)}</Field>
            <Field label="Publisher base">{story.base ? story.base.label : <span className="text-[#8B929C]">Unmapped</span>}</Field>
            <Field label="Lead source">{story.leadDomain ?? '—'}</Field>
            <Field label="Sources"><span className={MONO}>{story.sourceCount}</span></Field>
            {story.score !== null && <Field label="Opportunity score"><span className={MONO}>{story.score}</span></Field>}
            {story.factCheckScore !== null && <Field label="Fact check"><span className={MONO}>{story.factCheckScore}</span></Field>}
            {story.qualityScore !== null && <Field label="Quality"><span className={MONO}>{story.qualityScore}</span></Field>}
            <Field label="First seen"><span className={MONO}>{clockTime(story.firstSeenAt)}</span></Field>
            <Field label="Last activity"><span className={MONO}><Ago iso={story.lastActivityAt} /></span></Field>
          </dl>

          {story.sourceDomains.length > 0 && (
            <div className="mt-4">
              <p className={`${LABEL} mb-1.5`}>Source publishers</p>
              <ul className="flex flex-wrap gap-1">
                {story.sourceDomains.map(domain => (
                  <li key={domain} className={`${MONO} rounded-sm border border-white/[0.07] px-1.5 py-0.5 text-[10.5px] text-[#C9CDD3]`}>{domain}</li>
                ))}
              </ul>
            </div>
          )}

          {story.articleId && (
            <a
              href={`/admin/news/edit/${story.articleId}`}
              className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#EFB81A] hover:text-[#F5CC55]"
            >
              Open in CMS <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          <p className={`${MONO} mt-5 text-[10px] text-[#767D88]`}>cluster {story.clusterId}</p>
        </div>
      </aside>
    );
  }

  const isUnmapped = selection.kind === 'unmapped';
  const heading = isUnmapped ? 'Unmapped sources' : location?.label ?? '';
  const activeCount = stories.filter(story => ACTIVE_STAGES.includes(story.stage)).length;
  const categoryTop = Object.entries(
    stories.reduce<Record<string, number>>((acc, story) => {
      const key = story.category ?? 'uncategorised';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0];
  const sources = new Set(stories.flatMap(story => story.sourceDomains)).size;
  const last = stories[0]?.lastActivityAt;

  return (
    <aside aria-label="Base intelligence" className={`${INSTRUMENT} flex max-h-full flex-col overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-200`}>
      <div className="flex items-start justify-between border-b border-white/[0.06] px-4 pb-3 pt-3">
        <div>
          <p className={LABEL}>{isUnmapped ? 'No established base' : location?.basis === 'REGULATOR_JURISDICTION' ? 'Regulator jurisdiction' : 'Publisher base'}</p>
          <h3 className="mt-1 text-[16px] font-semibold uppercase tracking-[0.06em] text-[#F2F4F7]">{heading}</h3>
          <p className={`${MONO} mt-0.5 text-[12px] text-[#8B929C]`}>
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
            {activeCount > 0 && <span className="text-[#4FC3D9]"> · {activeCount} in pipeline</span>}
          </p>
        </div>
        {close}
      </div>

      <dl className="grid grid-cols-3 border-b border-white/[0.06] px-4 py-2.5">
        <div>
          <dt className="text-[9px] uppercase tracking-[0.1em] text-[#767D88]">Category</dt>
          <dd className="truncate text-[11.5px] text-[#E8EAED]">{categoryTop ? categoryLabel(categoryTop === 'uncategorised' ? null : categoryTop) : '—'}</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.1em] text-[#767D88]">Sources</dt>
          <dd className={`${MONO} text-[11.5px] text-[#E8EAED]`}>{sources}</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.1em] text-[#767D88]">Last activity</dt>
          <dd className={`${MONO} text-[11.5px] text-[#E8EAED]`}>{last ? <Ago iso={last} /> : '—'}</dd>
        </div>
      </dl>

      {stories.length > 0 && (
        <div aria-hidden className="flex h-[3px] w-full">
          {PIPELINE_STAGES.map(stage => {
            const n = stories.filter(story => story.stage === stage).length;
            return n ? <span key={stage} style={{ flex: n, background: STAGE_META[stage].color }} className="opacity-80" /> : null;
          })}
        </div>
      )}

      {stories.length === 0 ? (
        <p className="px-4 py-6 text-[12px] text-[#8B929C]">No stories here match the current filters.</p>
      ) : (
        <ul className="flex-1 divide-y divide-white/[0.03] overflow-y-auto py-1">
          {stories.slice(0, limit).map(story => (
            <StoryRow
              key={story.clusterId}
              story={story}
              onOpen={() => onSelect({ kind: 'story', clusterId: story.clusterId, from: isUnmapped ? { kind: 'unmapped' } : { kind: 'location', key: location!.key } })}
            />
          ))}
          {stories.length > limit && (
            <li className="px-4 py-2">
              <button type="button" onClick={() => setLimit(n => n + PAGE)} className="text-[10px] uppercase tracking-[0.09em] text-[#8B929C] hover:text-[#E8EAED]">
                Show {Math.min(PAGE, stories.length - limit)} more
              </button>
            </li>
          )}
        </ul>
      )}
    </aside>
  );
}

/* -------------------------------------------------------- event stream -- */

const TONE: Record<IntelEvent['tone'], string> = {
  progress: '#8B929C',
  pass: '#4CC38A',
  fail: '#E5605A',
  system: '#767D88',
};

export const EventStream = memo(function EventStream({
  events,
  fresh,
  onStory,
  status,
}: {
  events: IntelEvent[];
  fresh: ReadonlySet<string>;
  onStory: (clusterId: string) => void;
  status: React.ReactNode;
}) {
  return (
    <section aria-label="Newsroom event stream" className={`${INSTRUMENT} flex h-[64px] items-stretch overflow-hidden`}>
      <div className="flex w-[124px] shrink-0 flex-col justify-center gap-1 border-r border-white/[0.06] px-3.5">
        <h2 className={LABEL}>Event stream</h2>
        <div className="text-[10px] text-[#767D88]">{status}</div>
      </div>
      {events.length === 0 ? (
        <p className="flex items-center px-4 text-[12px] text-[#8B929C]">No newsroom events in this window.</p>
      ) : (
        <ol className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
          {events.slice(0, 60).map(event => {
            const isFresh = fresh.has(event.id);
            const color = event.stage ? STAGE_META[event.stage].color : TONE[event.tone];
            return (
              <li
                key={event.id}
                className={`flex w-[216px] shrink-0 border-r border-white/[0.04] ${isFresh ? 'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-3 motion-safe:duration-300 bg-white/[0.025]' : ''}`}
              >
                <button
                  type="button"
                  disabled={!event.clusterId}
                  onClick={() => event.clusterId && onStory(event.clusterId)}
                  className="flex w-full flex-col justify-center gap-0.5 px-3 text-left transition-colors duration-150 enabled:hover:bg-white/[0.03] disabled:cursor-default"
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`${MONO} text-[10px] text-[#767D88]`}>{clockTime(event.occurredAt)}</span>
                    <span aria-hidden className="h-1 w-1 rounded-full" style={{ background: color }} />
                    <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.07em]" style={{ color: event.tone === 'fail' ? TONE.fail : '#E8EAED' }}>
                      {event.label}
                    </span>
                  </span>
                  <span className="truncate text-[11.5px] text-[#C9CDD3]">{event.title ?? event.detail ?? '—'}</span>
                  {event.title && event.detail && <span className="truncate text-[10.5px] text-[#767D88]">{event.detail}</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
});
