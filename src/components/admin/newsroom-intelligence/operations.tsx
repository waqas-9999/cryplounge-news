'use client';

/**
 * Operational modules: what the newsroom is doing right now.
 *
 * Every value here is read from the intelligence snapshot. Where the CMS has no
 * way to know something — the AI model's health, the image service, the
 * newsroom's database — the module says that rather than showing a green dot.
 */

import { memo, useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { INSTRUMENT, LABEL, StageDot } from './instruments';
import {
  ACTIVE_STAGES,
  STAGE_META,
  ago,
  clockTime,
  elapsed,
  numberFormat,
  type IntelSnapshot,
  type IntelStory,
  type PipelineStage,
} from './model';
import type { FeedConnection } from './use-intelligence-feed';

const MONO = 'font-mono tabular-nums';

/** A clock that re-renders only the component using it. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/* ------------------------------------------------------- now processing -- */

const MAX_PROCESSING = 5;

export const NowProcessing = memo(function NowProcessing({
  stories,
  onOpen,
}: {
  /** Stories in an active stage, most recent activity first. */
  stories: IntelStory[];
  onOpen: (clusterId: string) => void;
}) {
  const now = useNow();
  const shown = stories.slice(0, MAX_PROCESSING);

  return (
    <section aria-label="Now processing" className={`${INSTRUMENT} overflow-hidden`}>
      <header className="flex items-center justify-between px-3.5 pb-2 pt-3">
        <h2 className={LABEL}>Now processing</h2>
        <span className={`${MONO} text-[10px] text-[#767D88]`}>
          {stories.length > MAX_PROCESSING ? `${MAX_PROCESSING} of ${stories.length}` : stories.length}
        </span>
      </header>

      {shown.length === 0 ? (
        <p className="px-3.5 pb-3 text-[11.5px] text-[#8B929C]">No story is in an active stage.</p>
      ) : (
        <ol className="divide-y divide-white/[0.04] border-t border-white/[0.05]">
          {shown.map((story, index) => (
            <li key={story.clusterId}>
              <button
                type="button"
                onClick={() => onOpen(story.clusterId)}
                className="group w-full px-3.5 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.03]"
              >
                <span className="flex items-start gap-2">
                  <span className="relative mt-[5px] flex h-1.5 w-1.5 shrink-0">
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-50 motion-safe:animate-ping"
                      style={{ background: STAGE_META[story.stage].color, animationDuration: '2.4s' }}
                    />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: STAGE_META[story.stage].color }} />
                  </span>
                  <span className={`min-w-0 flex-1 ${index === 0 ? 'text-[12.5px]' : 'text-[11.5px]'} leading-snug text-[#E8EAED] group-hover:text-white`}>
                    <span className="line-clamp-2">{story.title ?? `Untitled cluster ${story.clusterId.slice(0, 8)}`}</span>
                  </span>
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-2 pl-3.5 text-[10px] uppercase tracking-[0.07em]">
                  <span style={{ color: STAGE_META[story.stage].color }}>{STAGE_META[story.stage].label}</span>
                  <span className={`${MONO} normal-case tracking-normal text-[#8B929C]`} title="Time since this story's last recorded event">
                    {elapsed(story.lastActivityAt, now)}
                  </span>
                </span>
                {index === 0 && (
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 pl-3.5 text-[10.5px]">
                    {story.leadDomain && (
                      <div className="col-span-2 flex justify-between gap-2">
                        <dt className="text-[#767D88]">Lead source</dt>
                        <dd className={`${MONO} truncate text-[#C9CDD3]`}>{story.leadDomain}</dd>
                      </div>
                    )}
                    {story.model && (
                      <div className="col-span-2 flex justify-between gap-2">
                        <dt className="text-[#767D88]">Model</dt>
                        <dd className={`${MONO} truncate text-[#C9CDD3]`}>{story.model}</dd>
                      </div>
                    )}
                    <div className="col-span-2 flex justify-between gap-2">
                      <dt className="text-[#767D88]">Sources</dt>
                      <dd className={`${MONO} text-[#C9CDD3]`}>{story.sourceCount}</dd>
                    </div>
                  </dl>
                )}
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
});

/* ----------------------------------------------------- sleeping / idle -- */

export function SleepingBanner({ system }: { system: IntelSnapshot['system'] }) {
  const now = useNow(5000);
  return (
    <section aria-label="Newsroom sleeping" className={`${INSTRUMENT} px-3.5 py-3`} role="status">
      <div className="flex items-center gap-2">
        <Moon className="h-3.5 w-3.5 text-[#8B929C]" aria-hidden />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E8EAED]">Newsroom sleeping</h2>
      </div>
      <p className="mt-1.5 text-[11.5px] leading-snug text-[#8B929C]">
        Between cycles by design. No story is being processed right now.
      </p>
      <dl className="mt-2.5 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-2.5">
        <div>
          <dt className="text-[9px] uppercase tracking-[0.1em] text-[#767D88]">Next cycle</dt>
          <dd className={`${MONO} text-[12px] text-[#E8EAED]`}>{clockTime(system.nextCycleAt)}</dd>
        </div>
        <div>
          <dt className="text-[9px] uppercase tracking-[0.1em] text-[#767D88]">Last activity</dt>
          <dd className={`${MONO} text-[12px] text-[#E8EAED]`}>{system.lastEventAt ? ago(system.lastEventAt, now) : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}

/* -------------------------------------------------------- activity strip -- */

const MOVEMENT: Array<{ stage: PipelineStage; label: string }> = [
  { stage: 'DISCOVERED', label: 'Discovered' },
  { stage: 'RESEARCH', label: 'Researched' },
  { stage: 'VERIFICATION', label: 'Checked' },
  { stage: 'IMAGE', label: 'Illustrated' },
  { stage: 'FILING', label: 'Filed' },
  { stage: 'DRAFT', label: 'Drafted' },
  { stage: 'PUBLISHED', label: 'Published' },
  { stage: 'REJECTED', label: 'Rejected' },
];

export const ActivityStrip = memo(function ActivityStrip({ activity }: { activity: IntelSnapshot['activity'] }) {
  const rows = MOVEMENT.filter(row => (activity.recent[row.stage] ?? 0) > 0);

  return (
    <section aria-label={`Activity in the last ${activity.recentMinutes} minutes`} className={`${INSTRUMENT} px-3.5 py-3`}>
      <h2 className={`${LABEL} mb-2`}>Last {activity.recentMinutes} min</h2>
      {rows.length === 0 ? (
        <p className="text-[11.5px] text-[#8B929C]">No newsroom activity.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {rows.map(row => (
            <div key={row.stage} className="flex items-baseline justify-between gap-2">
              <dt className="flex items-center gap-1.5 text-[11px] text-[#C9CDD3]">
                <StageDot stage={row.stage} size={5} />
                {row.label}
              </dt>
              <dd
                key={activity.recent[row.stage]}
                className={`${MONO} text-[12px] text-[#E8EAED] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300`}
              >
                {numberFormat.format(activity.recent[row.stage] ?? 0)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-2 text-[9.5px] text-[#767D88]">Stage transitions, counted from event timestamps.</p>
    </section>
  );
});

/* -------------------------------------------------------- newsroom health -- */

type Tone = 'ok' | 'warn' | 'bad' | 'idle';
const TONE_COLOR: Record<Tone, string> = { ok: '#4CC38A', warn: '#E0A33A', bad: '#E5605A', idle: '#767D88' };

export const HealthPanel = memo(function HealthPanel({
  connection,
  snapshot,
}: {
  connection: FeedConnection;
  snapshot: IntelSnapshot | null;
}) {
  const now = useNow(5000);

  const api: [string, Tone] =
    connection === 'live' || connection === 'snapshot' ? ['Online', 'ok']
    : connection === 'reconnecting' ? ['Reconnecting', 'warn']
    : connection === 'unavailable' ? ['Offline', 'bad']
    : connection === 'paused' ? ['Paused', 'idle']
    : ['Connecting', 'idle'];

  const last = snapshot?.system.lastEventAt;
  const telemetry: [string, Tone] = !snapshot
    ? ['Unknown', 'idle']
    : !last ? ['No events', 'warn']
    : now - new Date(last).getTime() < 15 * 60_000 ? ['Receiving', 'ok']
    : snapshot.system.state === 'SLEEPING' ? ['Idle', 'idle']
    : [`Stale · ${ago(last, now)}`, 'warn'];

  const discovery: [string, Tone] = !snapshot
    ? ['Unknown', 'idle']
    : snapshot.system.discovery.available ? ['Readable', 'ok'] : ['Unavailable', 'bad'];

  const newsroom: [string, Tone] = !snapshot
    ? ['Unknown', 'idle']
    : snapshot.system.state === 'CYCLING' ? ['Cycling', 'ok']
    : snapshot.system.state === 'SLEEPING' ? ['Sleeping', 'idle']
    : ['No signal', 'warn'];

  const errors = snapshot?.system.errorsInWindow ?? 0;

  const rows: Array<{ label: string; value: [string, Tone]; title: string }> = [
    { label: 'Newsroom', value: newsroom, title: 'From the newsroom lifecycle events' },
    { label: 'Telemetry', value: telemetry, title: 'Recency of the last event the CMS received' },
    { label: 'CMS API', value: api, title: 'This page polling the intelligence endpoint' },
    { label: 'Discovery records', value: discovery, title: 'The CMS read of the newsroom database' },
    { label: 'Errors in window', value: [String(errors), errors > 0 ? 'bad' : 'ok'], title: 'NEWSROOM_ERROR events in the selected window' },
  ];

  return (
    <section aria-label="Newsroom health" className={`${INSTRUMENT} px-3.5 py-3`}>
      <h2 className={`${LABEL} mb-2`}>Newsroom health</h2>
      <dl className="space-y-1.5">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between gap-3" title={row.title}>
            <dt className="flex items-center gap-2 text-[11px] text-[#C9CDD3]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_COLOR[row.value[1]] }} />
              {row.label}
            </dt>
            <dd className="text-[10.5px] font-medium uppercase tracking-[0.07em]" style={{ color: TONE_COLOR[row.value[1]] }}>
              {row.value[0]}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[9.5px] leading-snug text-[#767D88]">
        Model, image service and newsroom database health are not reported to the CMS, so they are not shown.
      </p>
    </section>
  );
});

/* ------------------------------------------------------ live story flow -- */

export const StoryFlow = memo(function StoryFlow({ counts }: { counts: Record<PipelineStage, number> }) {
  const live = ACTIVE_STAGES.filter(stage => counts[stage] > 0);
  if (live.length === 0) return null;

  return (
    <div className={`${INSTRUMENT} flex items-center gap-2 px-3 py-1.5`} aria-label="Live story flow">
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#767D88]">Live flow</span>
      <ol className="flex items-center gap-1.5">
        {live.map((stage, index) => (
          <li key={stage} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden className="text-[10px] text-[#767D88]">→</span>}
            <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.07em] text-[#C9CDD3]">
              <StageDot stage={stage} size={5} />
              {STAGE_META[stage].label}
              <span key={counts[stage]} className={`${MONO} text-[#E8EAED] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300`}>
                {counts[stage]}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
});
