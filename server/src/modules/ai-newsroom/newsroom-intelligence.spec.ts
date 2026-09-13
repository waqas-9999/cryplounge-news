import type { DiscoveryStory } from './newsroom-discovery.service';
import { buildSnapshot, classifyReasons, transitionFor, type TelemetryRow } from './newsroom-intelligence.derive';
import { publisherBase } from './publisher-bases';

/**
 * The intelligence read model.
 *
 * What the globe shows is only as honest as this mapping: every stage must come
 * from an event or outcome the newsroom actually recorded, no story may be
 * placed at a location its sources do not establish, and nothing may move
 * backwards because events arrived out of order.
 */

const NOW = new Date('2026-09-13T12:00:00.000Z');
let seq = 0;

function event(type: string, over: Partial<TelemetryRow> = {}, minutesAgo = 5): TelemetryRow {
  seq += 1;
  return {
    id: `evt-${seq}`,
    type,
    occurredAt: new Date(NOW.getTime() - minutesAgo * 60_000),
    workflowId: 'w1',
    clusterId: 'c1',
    articleId: null,
    stage: null,
    status: null,
    source: null,
    model: null,
    durationMs: null,
    metadata: null,
    ...over,
  };
}

function record(over: Partial<DiscoveryStory> = {}): DiscoveryStory {
  return {
    clusterId: 'c1',
    title: 'SEC approves spot ether ETF options',
    score: 81,
    scoreBand: 'HIGH',
    scoreLabel: 'High',
    scoreReasons: [],
    freshness: 'FRESH',
    ageMinutes: 12,
    ageBasis: null,
    category: 'regulation',
    evidenceGrade: 'STRONG',
    sources: [
      { domain: 'sec.gov', url: 'https://sec.gov/x', isPrimary: true, discoveryOnly: false },
      { domain: 'coindesk.com', url: 'https://coindesk.com/x', isPrimary: false, discoveryOnly: false },
    ],
    sourceCount: 2,
    publishedAt: null,
    detectedAt: NOW.toISOString(),
    detectionDelayMinutes: null,
    status: 'DISCOVERED',
    statusReasons: [],
    outcomeCode: null,
    decisionClass: null,
    recoverable: null,
    retryable: null,
    outcomeAt: null,
    cmsArticleId: null,
    recordedAt: new Date(NOW.getTime() - 20 * 60_000).toISOString(),
    ...over,
  };
}

const snapshot = (events: TelemetryRow[], stories: DiscoveryStory[] = [record()]) =>
  buildSnapshot({ now: NOW, windowKey: 'live', events, discovery: { stories, available: true } });

describe('stages come from recorded events', () => {
  it('follows a story through research and verification', () => {
    const result = snapshot([event('STORY_DISCOVERED', {}, 9), event('RESEARCH_STARTED', {}, 8), event('ARTICLE_VALIDATED', { metadata: { factCheckScore: 94, qualityScore: 88 } }, 6)]);
    const story = result.stories[0]!;

    expect(story.stage).toBe('VERIFICATION');
    expect(story.factCheckScore).toBe(94);
    expect(story.qualityScore).toBe(88);
  });

  it('does not move a story backwards when events arrive out of order', () => {
    const result = snapshot([event('PUBLICATION_STARTED', {}, 2), event('RESEARCH_STARTED', {}, 1)]);
    expect(result.stories[0]!.stage).toBe('FILING');
  });

  it('distinguishes a draft from an automatic publication', () => {
    expect(transitionFor(event('PUBLICATION_SUCCEEDED', { status: 'DRAFT' }))!.stage).toBe('DRAFT');
    expect(transitionFor(event('PUBLICATION_SUCCEEDED', { metadata: { autoPublished: true } }))!.stage).toBe('PUBLISHED');
  });

  it('treats a held promotion of an existing article as a draft, not a rejection', () => {
    expect(transitionFor(event('PUBLICATION_FAILED', { articleId: 'a1', stage: 'cms-promotion' }))!.stage).toBe('DRAFT');
  });

  it('has no stage for events that say nothing about a story', () => {
    expect(transitionFor(event('MODEL_ROUTED'))).toBeNull();
    expect(transitionFor(event('NEWSROOM_SLEEPING'))).toBeNull();
  });
});

describe('rejections are inspectable', () => {
  it('records where and why, from the real reasons', () => {
    const result = snapshot([
      event('RESEARCH_STARTED', {}, 8),
      event('ARTICLE_REJECTED', { metadata: { reasons: ['fact-check score 71 below 90'] } }, 3),
    ]);
    const story = result.stories[0]!;

    expect(story.stage).toBe('REJECTED');
    expect(story.rejection).toMatchObject({ at: 'VERIFICATION', kind: 'FACT_CHECK', reasons: ['fact-check score 71 below 90'] });
    expect(result.totals.rejected).toBe(1);
  });

  it('keeps a rejection terminal even if a later progress event arrives', () => {
    const result = snapshot([event('RESEARCH_FAILED', { metadata: { reasons: ['no citable source'] } }, 4), event('STORY_DISCOVERED', {}, 1)]);
    expect(result.stories[0]!.rejection?.at).toBe('RESEARCH');
  });

  it('uses the discovery outcome when telemetry never covered the story', () => {
    const result = snapshot([], [record({ status: 'DUPLICATE', statusReasons: ['same event as c0'] })]);
    expect(result.stories[0]!.rejection).toMatchObject({ at: 'DISCOVERY', kind: 'DUPLICATE' });
  });

  it('classifies reasons with the newsroom funnel wording', () => {
    expect(classifyReasons(['quality score 60 below 85'])).toBe('QUALITY');
    expect(classifyReasons(['reproduced source wording'])).toBe('ORIGINALITY');
    expect(classifyReasons(['something else'])).toBe('OTHER');
  });
});

describe('refusals are not one undifferentiated "rejected" figure', () => {
  it('an editorial rewrite keeps the story in progress', () => {
    const result = snapshot([
      event('RESEARCH_STARTED', {}, 9),
      event('REWRITE_REQUIRED', { metadata: { reasons: ['1 unsupported claim(s)'] } }, 6),
      event('REWRITE_STARTED', {}, 5),
    ]);
    expect(result.stories[0]!.stage).toBe('VERIFICATION');
    expect(result.stories[0]!.rejection).toBeNull();
    expect(result.totals.rejected).toBe(0);
  });

  it('labels an editor refusal as editorial, with its code and recoverability', () => {
    const result = snapshot([
      event(
        'ARTICLE_REJECTED',
        { metadata: { reasons: ['editor verdict REJECT'], code: 'REWRITES_EXHAUSTED', decisionClass: 'EDITORIAL', recoverable: true } },
        3
      ),
    ]);
    expect(result.stories[0]!.rejection).toMatchObject({
      at: 'EDITORIAL',
      kind: 'EDITORIAL',
      code: 'REWRITES_EXHAUSTED',
      decisionClass: 'EDITORIAL',
      recoverable: true,
    });
    expect(result.totals.rejectedByClass).toEqual({ EDITORIAL: 1 });
    expect(result.totals.recoverable).toBe(1);
  });

  it('an unreadable editor response is a system error, never an editorial judgement', () => {
    const story = snapshot([event('EDITOR_RESPONSE_INVALID', { metadata: { reasons: ['verdict missing'] } }, 2)]).stories[0]!;
    expect(story.rejection).toMatchObject({ kind: 'SYSTEM_ERROR', decisionClass: 'SYSTEM', recoverable: true });
  });

  it('a CMS outage is a filing error', () => {
    const story = snapshot([], [record({ status: 'FAILED', outcomeCode: 'CMS_UNAVAILABLE', decisionClass: 'SYSTEM', statusReasons: ['503'] })])
      .stories[0]!;
    expect(story.rejection).toMatchObject({ at: 'FILING', kind: 'FILING_ERROR', code: 'CMS_UNAVAILABLE' });
  });

  it('a story skipped before research is held, not rejected', () => {
    const story = snapshot([], [record({ status: 'SKIPPED', outcomeCode: 'DAILY_CAP', statusReasons: ['daily cap reached'] })]).stories[0]!;
    expect(story.stage).toBe('HELD');
    expect(story.heldReasons).toEqual(['daily cap reached']);
  });

  it('older records without a class keep their reason-wording classification', () => {
    const story = snapshot([], [record({ status: 'REJECTED', statusReasons: ['originality 5 below 50'] })]).stories[0]!;
    expect(story.rejection).toMatchObject({ at: 'VERIFICATION', kind: 'ORIGINALITY', decisionClass: null });
  });
});

describe('recovered stories', () => {
  it('an editor recovery reopens a rejected story, and the new run is what is shown', () => {
    const result = snapshot(
      [
        event('ARTICLE_REJECTED', { metadata: { reasons: ['editor verdict REJECT'], decisionClass: 'EDITORIAL' } }, 30),
        event('HUMAN_OVERRIDE', { metadata: { action: 'ADVANCE_TO_RESEARCH', reasons: ['primary source'] } }, 10),
        event('RESEARCH_STARTED', {}, 8),
      ],
      [record({ status: 'EDITOR_REJECTED', decisionClass: 'EDITORIAL', outcomeAt: new Date(NOW.getTime() - 30 * 60_000).toISOString() })]
    );
    const story = result.stories[0]!;
    expect(story.stage).toBe('RESEARCH');
    expect(story.rejection).toBeNull();
    expect(story.timeline.map(item => item.label)).toContain('Editor override');
  });

  it('a dismissal is final', () => {
    const story = snapshot([
      event('ARTICLE_REJECTED', { metadata: { reasons: ['x'], decisionClass: 'EDITORIAL' } }, 30),
      event('HUMAN_OVERRIDE', { metadata: { action: 'DISMISS', reasons: ['promotional'] } }, 10),
    ]).stories[0]!;
    expect(story.rejection).toMatchObject({ code: 'EDITOR_DISMISSED', recoverable: false });
  });
});

describe('geography is the publisher base, never invented', () => {
  it('places a story at its lead source base', () => {
    const result = snapshot([event('STORY_DISCOVERED')]);
    expect(result.stories[0]!.base).toMatchObject({ key: 'washington', basis: 'REGULATOR_JURISDICTION' });
    expect(result.locations[0]).toMatchObject({ key: 'washington', storyCount: 1 });
  });

  it('counts a story with no established base as unmapped', () => {
    const result = snapshot([event('STORY_DISCOVERED')], [
      record({ sources: [{ domain: 'medium.com', url: 'https://medium.com/x', isPrimary: true, discoveryOnly: false }] }),
    ]);
    expect(result.stories[0]!.base).toBeNull();
    expect(result.locations).toEqual([]);
    expect(result.totals.unmapped).toBe(1);
  });

  it('knows no base for aggregators', () => {
    expect(publisherBase('news.google.com')).toBeNull();
    expect(publisherBase('www.coindesk.com')?.label).toBe('New York');
  });
});

describe('system state', () => {
  it('reports sleeping with the next cycle the newsroom announced', () => {
    const result = snapshot([
      event('NEWSROOM_SLEEPING', { clusterId: null, metadata: { nextCycleAt: '2026-09-13T12:05:00.000Z' } }, 1),
    ]);
    expect(result.system).toMatchObject({ state: 'SLEEPING', nextCycleAt: '2026-09-13T12:05:00.000Z' });
  });

  it('reports silence when there is nothing, rather than implying health', () => {
    expect(snapshot([], []).system.state).toBe('SILENT');
  });

  it('streams newest first with titles joined from discovery', () => {
    const result = snapshot([event('STORY_DISCOVERED', {}, 9), event('RESEARCH_STARTED', { model: 'nemotron' }, 2)]);
    expect(result.events[0]).toMatchObject({ label: 'Research started', detail: 'nemotron', title: 'SEC approves spot ether ETF options' });
  });
});

describe('corroboration links', () => {
  it('links a story to the other places its sources are based', () => {
    const result = snapshot([event('STORY_DISCOVERED')]);
    expect(result.stories[0]!.linkedBases.map(base => base.key)).toEqual(['new-york']);
  });
});

describe('story timelines', () => {
  it('holds every recorded event for the story, oldest first, from all telemetry', () => {
    const result = snapshot([
      event('STORY_DISCOVERED', { source: 'sec.gov' }, 9),
      event('RESEARCH_STARTED', { model: 'nemotron' }, 8),
      event('ARTICLE_REJECTED', { metadata: { reasons: ['quality score 60 below 85'] } }, 3),
    ]);
    const story = result.stories[0]!;
    expect(story.timeline.map(item => item.label)).toEqual(['Story discovered', 'Research started', 'Rejected']);
    expect(story.model).toBe('nemotron');
    expect(story.timelineTruncated).toBe(false);
  });

  it('shows no step that did not happen', () => {
    const result = snapshot([event('STORY_DISCOVERED', {}, 2)]);
    expect(result.stories[0]!.timeline).toHaveLength(1);
  });

  it('is not limited by the 150-event stream', () => {
    const noise = Array.from({ length: 200 }, (_, i) => event('STORY_DISCOVERED', { clusterId: `other-${i}` }, 1));
    const result = snapshot([event('STORY_DISCOVERED', {}, 50), ...noise], [record()]);
    expect(result.events).toHaveLength(150);
    expect(result.stories.find(s => s.clusterId === 'c1')!.timeline).toHaveLength(1);
  });
});

describe('activity', () => {
  it('counts transitions in the recent window from event timestamps', () => {
    const result = snapshot([
      event('STORY_DISCOVERED', { clusterId: 'a' }, 40),
      event('STORY_DISCOVERED', { clusterId: 'b' }, 10),
      event('RESEARCH_STARTED', { clusterId: 'b' }, 5),
    ]);
    expect(result.activity.recentMinutes).toBe(15);
    expect(result.activity.recent).toEqual({ DISCOVERED: 1, RESEARCH: 1 });
    expect(result.activity.buckets).toHaveLength(12);
    expect(result.activity.buckets.reduce((n, b) => n + (b.stages.DISCOVERED ?? 0), 0)).toBe(2);
  });

  it('reports no movement when there is none', () => {
    expect(snapshot([], []).activity.recent).toEqual({});
  });

  it('reports a cycle in progress only while its start is the newest lifecycle event', () => {
    const running = snapshot([event('NEWSROOM_CYCLE_STARTED', { clusterId: null }, 2)]);
    expect(running.cycle.startedAt).not.toBeNull();
    const done = snapshot([
      event('NEWSROOM_CYCLE_STARTED', { clusterId: null }, 5),
      event('NEWSROOM_CYCLE_COMPLETED', { clusterId: null }, 1),
    ]);
    expect(done.cycle.startedAt).toBeNull();
    expect(done.cycle.lastCompletedAt).not.toBeNull();
  });
});
