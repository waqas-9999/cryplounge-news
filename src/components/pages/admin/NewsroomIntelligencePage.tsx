'use client';

/**
 * Admin → AI Newsroom → Intelligence.
 *
 * The newsroom pipeline drawn over the world, from the newsroom's own records.
 *
 * Three rules shape everything on this page:
 *
 *  1. **Nothing is invented.** Every node, stage, count and reason comes from
 *     `GET admin/ai/newsroom/intelligence`, which derives them from
 *     NewsroomEvent telemetry and the newsroom's discovery records. When that
 *     endpoint is unreachable the page says so and stops claiming to be live.
 *  2. **Place is the publisher's, not the story's.** A node is where a story's
 *     lead source is based. The legend says so.
 *  3. **The globe leads.** Panels float, stay quiet, and never cover it
 *     entirely at the sizes this page is built for.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { GlobeCanvas, type GlobeArc, type GlobeHandle, type GlobeNode } from '@/components/admin/newsroom-intelligence/GlobeCanvas';
import {
  CommandBar,
  EventStream,
  FilterDock,
  INSTRUMENT,
  IntelPanel,
  LABEL,
  NodeTooltip,
  PipelineRail,
  REGIONS,
  type Selection,
} from '@/components/admin/newsroom-intelligence/instruments';
import {
  ACTIVE_STAGES,
  INTEL_WINDOWS,
  PIPELINE_STAGES,
  STAGE_META,
  clockTime,
  dominantStage,
  type IntelStory,
  type IntelWindowKey,
  type NewsRegion,
  type PipelineStage,
} from '@/components/admin/newsroom-intelligence/model';
import { POLL_INTERVAL_MS, useIntelligenceFeed } from '@/components/admin/newsroom-intelligence/use-intelligence-feed';
import {
  ActivityStrip,
  HealthPanel,
  NowProcessing,
  SleepingBanner,
  StoryFlow,
} from '@/components/admin/newsroom-intelligence/operations';

/** Travelling dot on a pipeline connector. Plays once per real transition. */
const FLOW_KEYFRAMES = `
@keyframes nir-flow { from { transform: translate(-50%, -8px); opacity: 0; } 30% { opacity: 1; } to { transform: translate(-50%, 30px); opacity: 0; } }
.nir-flow { animation: nir-flow 1.1s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) { .nir-flow { animation: none; opacity: 0; } }
`;

/** How long a stage is marked as "just moved" after a real event enters it. */
const MOVING_MS = 1_600;

interface NewsroomIntelligencePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const MAX_ARCS = 40;
const MAX_PULSES_PER_POLL = 12;

/** Width of the page's own content area — the sidebar already took its share. */
function useContentWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(1184);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry!.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export function NewsroomIntelligencePage({ currentPage, onNavigate, onLogout }: NewsroomIntelligencePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  /* ------------------------------------------------ URL-reflected state -- */
  const windowParam = params.get('window');
  const windowKey: IntelWindowKey = (INTEL_WINDOWS as readonly string[]).includes(windowParam ?? '') ? (windowParam as IntelWindowKey) : 'live';
  const stageParam = params.get('stage');
  const stageFilter: PipelineStage | 'ALL' = (PIPELINE_STAGES as readonly string[]).includes(stageParam ?? '') ? (stageParam as PipelineStage) : 'ALL';
  const category = params.get('category') ?? 'ALL';
  const regionParam = params.get('region');
  const region: NewsRegion | 'GLOBAL' = (REGIONS as readonly string[]).includes(regionParam ?? '') ? (regionParam as NewsRegion) : 'GLOBAL';

  const setParam = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router]
  );

  const [paused, setPaused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /*
   * Full screen.
   *
   * Uses the browser Fullscreen API on the page root, so the globe owns the
   * whole display. Where the API is unavailable or refused (iOS Safari, an
   * embedded frame), the page still expands to fill the window with the
   * sidebar hidden — the same layout, minus the browser chrome.
   */
  const rootRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      setFullscreen(false);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => undefined);
      return;
    }
    setFullscreen(true);
    setMobileOpen(false);
    await rootRef.current?.requestFullscreen?.().catch(() => undefined);
  }, [fullscreen]);

  useEffect(() => {
    // The browser's own exit (Esc, F11, system gesture) must restore the layout.
    const onChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hover, setHover] = useState<{ node: GlobeNode; x: number; y: number } | null>(null);
  const globe = useRef<GlobeHandle>(null);
  const mainRef = useRef<HTMLElement>(null);
  const viewport = useContentWidth(mainRef);

  const feed = useIntelligenceFeed(windowKey, paused);
  const snapshot = feed.snapshot;

  /* ----------------------------------------------------------- derived -- */
  const storyById = useMemo(() => new Map((snapshot?.stories ?? []).map(story => [story.clusterId, story])), [snapshot]);

  const matches = useCallback(
    (story: IntelStory, ignoreStage = false) =>
      (ignoreStage || stageFilter === 'ALL' || story.stage === stageFilter) &&
      (category === 'ALL' || story.category === category) &&
      (region === 'GLOBAL' || story.base?.region === region || (region === 'OTHER' && !story.base)),
    [stageFilter, category, region]
  );

  const filtered = useMemo(() => (snapshot?.stories ?? []).filter(story => matches(story)), [snapshot, matches]);

  // Rail counts ignore the stage filter, so choosing a stage never zeroes the others.
  const railCounts = useMemo(() => {
    const counts = Object.fromEntries(PIPELINE_STAGES.map(stage => [stage, 0])) as Record<PipelineStage, number>;
    for (const story of snapshot?.stories ?? []) if (matches(story, true)) counts[story.stage] += 1;
    return counts;
  }, [snapshot, matches]);

  const categories = useMemo(
    () => [...new Set((snapshot?.stories ?? []).map(story => story.category).filter((c): c is string => Boolean(c)))].sort(),
    [snapshot]
  );

  const nodes: GlobeNode[] = useMemo(() => {
    if (!snapshot) return [];
    const grouped = new Map<string, IntelStory[]>();
    for (const story of filtered) {
      if (!story.base) continue;
      const list = grouped.get(story.base.key) ?? [];
      list.push(story);
      grouped.set(story.base.key, list);
    }
    return snapshot.locations.map(location => {
      const stories = grouped.get(location.key) ?? [];
      const stages: Partial<Record<PipelineStage, number>> = {};
      for (const story of stories) stages[story.stage] = (stages[story.stage] ?? 0) + 1;
      const active = stories.filter(story => ACTIVE_STAGES.includes(story.stage)).length;
      const lead = active > 0 ? dominantStage(Object.fromEntries(ACTIVE_STAGES.map(s => [s, stages[s] ?? 0]))) : dominantStage(stages);
      return {
        key: location.key,
        label: location.label,
        lat: location.lat,
        lon: location.lon,
        count: stories.length,
        total: location.storyCount,
        stages,
        activity: stories.length ? active / stories.length : 0,
        color: STAGE_META[lead].color,
      };
    });
  }, [snapshot, filtered]);

  const arcs: GlobeArc[] = useMemo(() => {
    const result: GlobeArc[] = [];
    for (const story of filtered) {
      if (!story.base) continue;
      for (const linked of story.linkedBases) {
        result.push({
          id: `${story.clusterId}:${linked.key}`,
          from: [story.base.lon, story.base.lat],
          to: [linked.lon, linked.lat],
          color: STAGE_META[story.stage].color,
        });
        if (result.length >= MAX_ARCS) return result;
      }
    }
    return result;
  }, [filtered]);

  /*
   * Where the globe rests: the story-weighted centre of mapped activity.
   *
   * A globe that spins continuously hides half of what it is showing at any
   * moment. This one holds the active hemisphere in view and sways gently
   * around it, so motion never costs the reader the data.
   */
  const anchor = useMemo((): [number, number] | null => {
    let x = 0, y = 0, z = 0, weight = 0;
    for (const node of nodes) {
      if (node.count === 0) continue;
      const lon = (node.lon * Math.PI) / 180;
      const lat = (node.lat * Math.PI) / 180;
      x += Math.cos(lat) * Math.cos(lon) * node.count;
      y += Math.cos(lat) * Math.sin(lon) * node.count;
      z += Math.sin(lat) * node.count;
      weight += node.count;
    }
    if (!weight) return null;
    return [(Math.atan2(y, x) * 180) / Math.PI, (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI];
  }, [nodes]);

  const activeStories = useMemo(
    () => filtered.filter(story => ACTIVE_STAGES.includes(story.stage)),
    [filtered]
  );

  /* ------------------------------------------ pulse on real arrivals only -- */
  const [moving, setMoving] = useState<ReadonlySet<PipelineStage>>(new Set());
  useEffect(() => {
    if (!snapshot || feed.freshEventIds.size === 0) return;
    const stages = new Set<PipelineStage>();
    for (const event of snapshot.events) {
      if (feed.freshEventIds.has(event.id) && event.stage) stages.add(event.stage);
    }
    if (stages.size === 0) return;
    setMoving(stages);
    const timer = setTimeout(() => setMoving(new Set()), MOVING_MS);
    return () => clearTimeout(timer);
  }, [feed.freshEventIds, snapshot]);

  useEffect(() => {
    if (!snapshot || feed.freshEventIds.size === 0) return;
    let fired = 0;
    for (const event of snapshot.events) {
      if (fired >= MAX_PULSES_PER_POLL) break;
      if (!feed.freshEventIds.has(event.id) || !event.clusterId) continue;
      const story = storyById.get(event.clusterId);
      if (!story?.base) continue;
      globe.current?.pulse(story.base.key, STAGE_META[event.stage ?? story.stage].color);
      fired += 1;
    }
  }, [feed.freshEventIds, snapshot, storyById]);

  /* ----------------------------------------------------------- handlers -- */
  const onSelectNode = useCallback((key: string | null) => {
    setSelection(key ? { kind: 'location', key } : null);
  }, []);

  const onHover = useCallback((node: GlobeNode | null, point: { x: number; y: number } | null) => {
    setHover(node && point ? { node, x: point.x, y: point.y } : null);
  }, []);

  const openStory = useCallback(
    (clusterId: string) => {
      const story = storyById.get(clusterId);
      setSelection({ kind: 'story', clusterId, from: story?.base ? { kind: 'location', key: story.base.key } : { kind: 'unmapped' } });
      if (story?.base) globe.current?.focus(story.base.key);
    },
    [storyById]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Close the panel first; a second Esc leaves the window-filling fallback.
      // Native fullscreen handles its own Esc and reports it via fullscreenchange.
      if (selection) setSelection(null);
      else if (!document.fullscreenElement) setFullscreen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selection]);

  // A selection that no longer exists in the data closes rather than lying.
  useEffect(() => {
    if (selection?.kind === 'story' && snapshot && !storyById.has(selection.clusterId)) setSelection(null);
  }, [selection, snapshot, storyById]);

  /* ------------------------------------------------------------ layout -- */
  // Content widths: 1440 → 1184, 1600 → 1344, 1920 → 1664 once the sidebar is out.
  const compact = viewport < 1300;
  const narrow = viewport < 900;
  const railWidth = narrow ? 0 : compact ? 200 : 232;
  // The right column is always present on desktop: the operations stack when
  // nothing is selected, the dossier when something is.
  const panelWidth = compact ? 300 : 340;
  const insets = {
    left: railWidth ? railWidth + 16 : 0,
    right: narrow ? 0 : panelWidth + 16,
    top: narrow ? 96 : 44,
    bottom: 84,
  };

  const selectedLocation = selection?.kind === 'location' ? snapshot?.locations.find(l => l.key === selection.key) ?? null : null;
  const panelStories = useMemo(() => {
    if (!selection) return [];
    if (selection.kind === 'location') return filtered.filter(story => story.base?.key === selection.key);
    if (selection.kind === 'unmapped') return filtered.filter(story => !story.base);
    return [];
  }, [selection, filtered]);

  const noResults = snapshot && snapshot.stories.length > 0 && filtered.length === 0;
  const empty = snapshot && snapshot.stories.length === 0 && snapshot.events.length === 0;

  const streamStatus =
    feed.connection === 'live' ? `polled every ${POLL_INTERVAL_MS / 1000}s`
    : feed.connection === 'paused' ? 'updates paused'
    : feed.connection === 'snapshot' ? `last ${snapshot?.window.minutes ?? ''} min`
    : feed.connection === 'reconnecting' ? 'reconnecting…'
    : feed.connection === 'unavailable' ? 'unavailable'
    : 'connecting…';

  return (
    // Scoped to .dark so the shared admin sidebar uses its own dark styling here.
    <div ref={rootRef} className={`dark flex bg-[#07080A] ${fullscreen ? 'fixed inset-0 z-[70] h-dvh w-screen' : 'h-dvh'}`}>
      {!fullscreen && (
        <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      )}

      <main ref={mainRef} className={`relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#07080A] text-[#E8EAED] antialiased ${fullscreen ? '' : 'md:ml-64'}`}>
        <CommandBar
          snapshot={snapshot}
          connection={feed.connection}
          lastSyncedAt={feed.lastSyncedAt}
          windowKey={windowKey}
          onWindow={key => setParam({ window: key === 'live' ? null : key })}
          paused={paused}
          onPause={() => setPaused(p => !p)}
          mock={feed.mock}
          onMenu={() => setMobileOpen(true)}
          fullscreen={fullscreen}
          onFullscreen={() => void toggleFullscreen()}
        />

        <div className="relative min-h-0 flex-1">
          {/* Atmosphere: a faint cool light above the Earth, nothing more. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(70,100,160,0.10),transparent_70%)]" />

          <GlobeCanvas
            ref={globe}
            nodes={nodes}
            arcs={arcs}
            selectedKey={selection?.kind === 'location' ? selection.key : selection?.kind === 'story' ? storyById.get(selection.clusterId)?.base?.key ?? null : null}
            paused={paused}
            anchor={anchor}
            insets={insets}
            onHover={onHover}
            onSelect={onSelectNode}
          />

          {hover && <NodeTooltip location={{ label: hover.node.label, count: hover.node.count, stages: hover.node.stages }} x={hover.x} y={hover.y} />}

          <style>{FLOW_KEYFRAMES}</style>

          {/* Filters and live flow, top centre over the globe's free area. */}
          <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-2" style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
            {snapshot && !narrow && <StoryFlow counts={snapshot.stages} />}
            <div className="pointer-events-auto">
              <FilterDock
                categories={categories}
                category={category}
                onCategory={value => setParam({ category: value === 'ALL' ? null : value })}
                stage={stageFilter}
                onStageFilter={value => setParam({ stage: value === 'ALL' ? null : value })}
                region={region}
                onRegion={value => setParam({ region: value === 'GLOBAL' ? null : value })}
                onReset={() => setParam({ category: null, stage: null, region: null })}
              />
            </div>
          </div>

          {/* Narrow widths: the rail collapses to a single strip, the globe keeps the space. */}
          {railWidth === 0 && snapshot && (
            <ol aria-label="Live pipeline" className={`${INSTRUMENT} absolute inset-x-3 top-14 z-10 flex items-center gap-3.5 overflow-x-auto px-3 py-1.5 [scrollbar-width:none]`}>
              {PIPELINE_STAGES.map(stage => (
                <li key={stage}>
                  <button
                    type="button"
                    aria-pressed={stageFilter === stage}
                    onClick={() => setParam({ stage: stageFilter === stage ? null : stage })}
                    className={`flex items-center gap-1.5 whitespace-nowrap text-[10px] uppercase tracking-[0.07em] ${stageFilter !== 'ALL' && stageFilter !== stage ? 'opacity-40' : ''}`}
                  >
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: STAGE_META[stage].color }} />
                    <span className="text-[#C9CDD3]">{STAGE_META[stage].label}</span>
                    <span className="font-mono tabular-nums text-[#E8EAED]">{railCounts[stage]}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          {railWidth > 0 && (
            <div className="absolute bottom-[84px] left-4 top-3 z-10 flex flex-col gap-3 overflow-y-auto [scrollbar-width:none]" style={{ width: railWidth }}>
              <PipelineRail
                counts={snapshot ? railCounts : null}
                total={filtered.length}
                stageFilter={stageFilter}
                onStage={value => setParam({ stage: value === 'ALL' ? null : value })}
                unmapped={filtered.filter(story => !story.base).length}
                onUnmapped={() => setSelection({ kind: 'unmapped' })}
                clustersFormed={snapshot ? snapshot.totals.clustersFormed : null}
                activity={snapshot?.activity ?? null}
                moving={moving}
              />
              <Legend />
            </div>
          )}

          {/* Operations stack: what the newsroom is doing, when nothing is selected. */}
          {!selection && !narrow && snapshot && (
            <div
              className="absolute bottom-[84px] right-4 top-3 z-10 flex flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&>*]:shrink-0"
              style={{ width: panelWidth }}
            >
              {snapshot.system.state === 'SLEEPING' && activeStories.length === 0 ? (
                <SleepingBanner system={snapshot.system} />
              ) : (
                <NowProcessing stories={activeStories} onOpen={openStory} />
              )}
              <ActivityStrip activity={snapshot.activity} />
              <HealthPanel connection={feed.connection} snapshot={snapshot} />
            </div>
          )}

          {selection && (
            <div
              className={`absolute z-20 ${narrow ? 'inset-x-3 bottom-[84px] top-14' : 'bottom-[84px] right-4 top-3'}`}
              style={narrow ? undefined : { width: panelWidth }}
            >
              <IntelPanel
                selection={selection}
                location={selectedLocation}
                stories={panelStories}
                storyById={storyById}
                onSelect={next => {
                  setSelection(next);
                  if (next.kind === 'location') globe.current?.focus(next.key);
                }}
                onClose={() => setSelection(null)}
              />
            </div>
          )}

          {/* State overlays: explicit, never a fake-live picture. */}
          {feed.connection === 'connecting' && !snapshot && (
            <CenterNotice icon={<Loader2 className="h-4 w-4 motion-safe:animate-spin" />} title="Synchronising with the newsroom" />
          )}
          {feed.connection === 'unavailable' && (
            <CenterNotice
              icon={<WifiOff className="h-4 w-4 text-[#E5605A]" />}
              title="Newsroom intelligence unavailable"
              body={feed.error ?? 'The CMS did not answer.'}
              action={<RetryButton onClick={feed.refresh} />}
            />
          )}
          {feed.connection === 'reconnecting' && (
            <div className="absolute left-1/2 top-14 z-20 -translate-x-1/2">
              <div className={`${INSTRUMENT} flex items-center gap-3 border-[#E0A33A]/30 px-3.5 py-2`} role="alert">
                <AlertTriangle className="h-3.5 w-3.5 text-[#E0A33A]" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#E0A33A]">Realtime connection lost</p>
                  <p className="text-[11px] text-[#8B929C]">
                    Last synchronised <span className="font-mono text-[#C9CDD3]">{clockTime(feed.lastSyncedAt)}</span> · attempting to reconnect
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* On desktop the operations stack already says the newsroom is sleeping; narrow screens need the notice. */}
          {empty && feed.connection !== 'unavailable' && (narrow || snapshot.system.state !== 'SLEEPING') && (
            <CenterNotice
              title="No newsroom activity in this window"
              body={
                snapshot.system.state === 'SLEEPING' && snapshot.system.nextCycleAt
                  ? `The newsroom is sleeping. Next cycle ${clockTime(snapshot.system.nextCycleAt)}.`
                  : 'No telemetry or discovery records were written. Try a wider window.'
              }
            />
          )}
          {noResults && !selection && (
            <CenterNotice title="No stories match these filters" action={<button type="button" onClick={() => setParam({ category: null, stage: null, region: null })} className="text-[11px] uppercase tracking-[0.08em] text-[#EFB81A] hover:text-[#F5CC55]">Reset filters</button>} />
          )}
          {snapshot && !snapshot.system.discovery.available && (
            <p className="absolute right-4 top-3 z-10 max-w-[260px] rounded border border-[#E0A33A]/25 bg-[#0B0D10]/80 px-2.5 py-1.5 text-[10.5px] text-[#E0A33A]" style={!narrow ? { right: panelWidth + 32 } : undefined}>
              Story titles unavailable: {snapshot.system.discovery.reason}
            </p>
          )}

          {/* Keyboard and screen-reader access to what the canvas shows. */}
          <ul className="sr-only">
            {nodes.filter(node => node.count > 0).map(node => (
              <li key={node.key}>
                <button type="button" onClick={() => { setSelection({ kind: 'location', key: node.key }); globe.current?.focus(node.key); }}>
                  {node.label}: {node.count} stories
                </button>
              </li>
            ))}
          </ul>

          <div className="absolute inset-x-4 bottom-4 z-10">
            <EventStream events={snapshot?.events ?? []} fresh={feed.freshEventIds} onStory={openStory} status={streamStatus} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Legend() {
  return (
    <div className="px-3.5 pt-1">
      <p className={`${LABEL} mb-1.5 !text-[#767D88]`}>Reading the globe</p>
      <dl className="space-y-1 text-[10.5px] leading-snug text-[#767D88]">
        <div><dt className="inline text-[#C9CDD3]">Node</dt> <dd className="inline">— where the lead source publisher is based, not where the story happened</dd></div>
        <div><dt className="inline text-[#C9CDD3]">Size</dt> <dd className="inline">— stories</dd></div>
        <div><dt className="inline text-[#C9CDD3]">Ring</dt> <dd className="inline">— share of stories at each stage</dd></div>
        <div><dt className="inline text-[#C9CDD3]">Arc</dt> <dd className="inline">— sources based in two places</dd></div>
        <div><dt className="inline text-[#C9CDD3]">Shade</dt> <dd className="inline">— the current night side</dd></div>
      </dl>
    </div>
  );
}

function CenterNotice({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <div className={`${INSTRUMENT} pointer-events-auto max-w-sm px-5 py-4 text-center`} role="status">
        <div className="flex items-center justify-center gap-2">
          {icon}
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#E8EAED]">{title}</p>
        </div>
        {body && <p className="mt-1.5 text-[12px] text-[#8B929C]">{body}</p>}
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded border border-white/[0.1] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#C9CDD3] hover:border-white/25 hover:text-white">
      <RefreshCw className="h-3 w-3" /> Retry
    </button>
  );
}
