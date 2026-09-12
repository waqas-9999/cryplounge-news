import {
  ACTIVE_STAGES,
  PIPELINE_STAGES,
  type IntelEvent,
  type IntelLocation,
  type IntelSnapshot,
  type IntelStory,
  type IntelWindowKey,
  type PipelineStage,
  type PublisherBase,
  type RejectionKind,
} from './model';

/**
 * DEVELOPMENT-ONLY synthetic data.
 *
 * Exists so the page can be designed and verified without a running newsroom.
 * It can only switch on when BOTH:
 *
 *   NEXT_PUBLIC_NEWSROOM_INTEL_MOCK=true   and   NODE_ENV !== 'production'
 *
 * so a production build can never display it, whatever an env file says. When
 * it is on, the page shows a persistent "Development mock data" badge. Nothing
 * here is sent to, or stored by, the server.
 */
export const MOCK_ENABLED =
  process.env.NEXT_PUBLIC_NEWSROOM_INTEL_MOCK === 'true' && process.env.NODE_ENV !== 'production';

const BASES: Array<PublisherBase & { domains: string[] }> = [
  { key: 'washington', label: 'Washington', region: 'AMERICAS', lat: 38.9072, lon: -77.0369, basis: 'REGULATOR_JURISDICTION', domains: ['sec.gov', 'cftc.gov', 'treasury.gov'] },
  { key: 'new-york', label: 'New York', region: 'AMERICAS', lat: 40.7128, lon: -74.006, basis: 'PUBLISHER_HEADQUARTERS', domains: ['coindesk.com', 'theblock.co', 'blockworks.co', 'decrypt.co'] },
  { key: 'london', label: 'London', region: 'EUROPE', lat: 51.5072, lon: -0.1276, basis: 'PUBLISHER_HEADQUARTERS', domains: ['dlnews.com', 'fca.org.uk'] },
  { key: 'zug', label: 'Zug', region: 'EUROPE', lat: 47.1662, lon: 8.5155, basis: 'PUBLISHER_HEADQUARTERS', domains: ['glassnode.com', 'ethereum.org'] },
  { key: 'san-francisco', label: 'San Francisco', region: 'AMERICAS', lat: 37.7749, lon: -122.4194, basis: 'PUBLISHER_HEADQUARTERS', domains: ['kraken.com'] },
  { key: 'nashville', label: 'Nashville', region: 'AMERICAS', lat: 36.1627, lon: -86.7816, basis: 'PUBLISHER_HEADQUARTERS', domains: ['bitcoinmagazine.com'] },
  { key: 'jersey', label: 'Jersey', region: 'EUROPE', lat: 49.1868, lon: -2.107, basis: 'PUBLISHER_HEADQUARTERS', domains: ['coinshares.com'] },
];

const TITLES = [
  'Spot bitcoin ETF flows turn positive for a third session',
  'SEC delays decision on staked ether fund structure',
  'Treasury sanctions mixer used in exchange laundering case',
  'Ethereum client teams schedule next network upgrade call',
  'Stablecoin issuer publishes monthly reserve attestation',
  'Exchange reports record derivatives open interest',
  'FCA adds unregistered crypto firms to warning list',
  'On-chain data shows long-term holders distributing supply',
  'Bitcoin miners extend hashrate gains after difficulty change',
  'Tokenised treasury fund crosses new assets milestone',
  'CFTC settles with offshore derivatives venue',
  'Layer-2 network publishes post-mortem on sequencer outage',
  'Asset manager files amended ETF prospectus',
  'Kraken expands regulated futures to new market',
  'Validator set grows as staking yield compresses',
];

const CATEGORIES = ['market', 'regulation', 'etf', 'security', 'infrastructure', 'defi'];
const REJECTIONS: Array<{ kind: RejectionKind; at: 'DISCOVERY' | 'RESEARCH' | 'VERIFICATION'; reason: string }> = [
  { kind: 'DUPLICATE', at: 'DISCOVERY', reason: 'same event as an article published 40 minutes earlier' },
  { kind: 'FACT_CHECK', at: 'VERIFICATION', reason: 'fact-check score 72 below 90' },
  { kind: 'WEAK_EVIDENCE', at: 'DISCOVERY', reason: 'single aggregator source, no primary' },
  { kind: 'QUALITY', at: 'VERIFICATION', reason: 'quality score 64 below 85' },
  { kind: 'RESEARCH', at: 'RESEARCH', reason: 'no citable source reached' },
];

function hash(value: number): number {
  const x = Math.sin(value * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function mockSnapshot(windowKey: IntelWindowKey): IntelSnapshot {
  const now = Date.now();
  const tick = Math.floor(now / 6000);
  const minutes = { live: 60, '5m': 5, '30m': 30, '1h': 60, '24h': 1440 }[windowKey];
  const scale = windowKey === '24h' ? 6 : windowKey === '5m' ? 0.4 : 1;
  const count = Math.round(46 * scale);

  const stories: IntelStory[] = [];
  const events: IntelEvent[] = [];

  for (let i = 0; i < count; i += 1) {
    const r = hash(i + 1);
    const base = BASES[Math.floor(hash(i + 7) * BASES.length ** 1.4) % BASES.length]!;
    // Each story advances one stage every few ticks, so the page visibly moves.
    const progress = Math.floor((tick + i * 3) / (3 + Math.floor(r * 4)));
    const rejected = hash(i + 31) < 0.22 && progress % 9 >= 3;
    const flow: PipelineStage[] = ['DISCOVERED', 'RESEARCH', 'VERIFICATION', 'IMAGE', 'FILING', r > 0.8 ? 'PUBLISHED' : 'DRAFT'];
    const stage: PipelineStage = rejected ? 'REJECTED' : flow[Math.min(progress % 9, flow.length - 1)]!;
    const rejection = rejected ? REJECTIONS[i % REJECTIONS.length]! : null;
    const last = new Date(now - ((i * 97_000) % (minutes * 60_000))).toISOString();
    const domains = base.domains.slice(0, 1 + (i % base.domains.length));
    const second = i % 4 === 0 ? BASES[(BASES.indexOf(base) + 1) % BASES.length]!.domains[0]! : null;

    stories.push({
      clusterId: `mock-${i}`,
      title: TITLES[i % TITLES.length]!,
      category: CATEGORIES[i % CATEGORIES.length]!,
      score: 55 + Math.round(r * 40),
      stage,
      rejection: rejection ? { at: rejection.at, kind: rejection.kind, reasons: [rejection.reason], occurredAt: last } : null,
      heldReasons: [],
      leadDomain: domains[0]!,
      sourceDomains: second ? [...domains, second] : domains,
      sourceCount: domains.length + (second ? 1 : 0),
      base,
      linkedBases: second ? [(({ domains: _d, ...rest }) => rest)(BASES[(BASES.indexOf(base) + 1) % BASES.length]!)] : [],
      articleId: stage === 'DRAFT' || stage === 'PUBLISHED' ? `mock-article-${i}` : null,
      factCheckScore: ['VERIFICATION', 'IMAGE', 'FILING', 'DRAFT', 'PUBLISHED'].includes(stage) ? 90 + (i % 9) : null,
      qualityScore: ['VERIFICATION', 'IMAGE', 'FILING', 'DRAFT', 'PUBLISHED'].includes(stage) ? 85 + (i % 12) : null,
      firstSeenAt: last,
      lastActivityAt: last,
    });
  }
  stories.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  const locations = new Map<string, IntelLocation>();
  for (const story of stories) {
    const base = story.base!;
    const location =
      locations.get(base.key) ??
      ({ ...base, storyCount: 0, stages: {}, categories: {}, lastActivityAt: story.lastActivityAt, clusterIds: [] } as IntelLocation);
    location.storyCount += 1;
    location.stages[story.stage] = (location.stages[story.stage] ?? 0) + 1;
    location.categories[story.category!] = (location.categories[story.category!] ?? 0) + 1;
    location.clusterIds.push(story.clusterId);
    locations.set(base.key, location);
  }

  const labels: Record<PipelineStage, string> = {
    DISCOVERED: 'Story discovered',
    RESEARCH: 'Research started',
    VERIFICATION: 'Checks passed',
    IMAGE: 'Image stage complete',
    FILING: 'Filing to CMS',
    DRAFT: 'Draft created',
    PUBLISHED: 'Published',
    HELD: 'Not filed',
    REJECTED: 'Rejected',
  };
  for (let k = 0; k < 40; k += 1) {
    const story = stories[(k * 7 + tick) % stories.length]!;
    events.push({
      // Stable per story and stage, so only a real change reads as an arrival.
      id: `mock-evt-${story.clusterId}-${story.stage}`,
      type: 'MOCK',
      label: labels[story.stage],
      tone: story.stage === 'REJECTED' ? 'fail' : story.stage === 'PUBLISHED' || story.stage === 'VERIFICATION' ? 'pass' : 'progress',
      occurredAt: new Date(now - k * 11_000).toISOString(),
      clusterId: story.clusterId,
      title: story.title,
      detail: story.rejection?.reasons[0] ?? (story.factCheckScore ? `Fact ${story.factCheckScore} · Quality ${story.qualityScore}` : null),
      stage: story.stage,
    });
  }

  const stageCounts = Object.fromEntries(PIPELINE_STAGES.map(stage => [stage, 0])) as Record<PipelineStage, number>;
  stories.forEach(story => (stageCounts[story.stage] += 1));

  return {
    generatedAt: new Date(now).toISOString(),
    window: { key: windowKey, minutes, since: new Date(now - minutes * 60_000).toISOString() },
    totals: {
      stories: stories.length,
      active: ACTIVE_STAGES.reduce((sum, stage) => sum + stageCounts[stage], 0),
      drafts: stageCounts.DRAFT,
      published: stageCounts.PUBLISHED,
      rejected: stageCounts.REJECTED,
      held: stageCounts.HELD,
      unmapped: 0,
      clustersFormed: Math.round(stories.length * 1.6),
      events: events.length,
    },
    stages: stageCounts,
    system: {
      state: 'CYCLING',
      lastEventAt: events[0]!.occurredAt,
      nextCycleAt: null,
      errorsInWindow: 0,
      discovery: { available: true },
    },
    locations: [...locations.values()].sort((a, b) => b.storyCount - a.storyCount),
    stories,
    events,
  };
}
