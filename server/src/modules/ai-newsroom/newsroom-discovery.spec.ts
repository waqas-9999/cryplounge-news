import { NewsroomDiscoveryService, scoreBandFor, scoreLabelFor } from './newsroom-discovery.service';

/**
 * The two admin news views.
 *
 * The rule most worth pinning down is the boundary: a story scoring exactly 50
 * is qualified. Off-by-one here silently hides a story an editor was told to
 * expect, and no amount of manual checking would catch it reliably because
 * scores of exactly 50 are rare in live data.
 */

interface Row {
  clusterId: string | null;
  result: Record<string, unknown>;
  createdAt: Date;
}

function story(score: number, overrides: Record<string, unknown> = {}): Row {
  return {
    clusterId: `cluster-${score}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date('2026-08-22T12:00:00Z'),
    result: {
      title: `Story scoring ${score}`,
      score,
      freshness: 'RECENT',
      sources: [{ domain: 'coindesk.com', url: 'https://coindesk.com/x', isPrimary: false }],
      discoveredAt: '2026-08-22T12:00:00Z',
      outcome: 'DISCOVERED',
      ...overrides,
    },
  };
}

/** A service wired to fixed rows instead of a database. */
function serviceWith(rows: Row[]): NewsroomDiscoveryService {
  const service = new NewsroomDiscoveryService();
  const client = { $queryRaw: async () => rows, $disconnect: async () => undefined };

  // The connection is private by design — nothing outside should be able to
  // hand this service a writable client.
  (service as unknown as { connection: () => unknown }).connection = () => client;
  return service;
}

describe('the qualified threshold', () => {
  const rows = [story(87), story(76), story(50), story(49), story(32)];

  it('includes a score of exactly 50', async () => {
    const page = await serviceWith(rows).list({ minScore: 50, perPage: 50 });
    const scores = page.items.map(item => item.score).sort((a, b) => b - a);

    expect(scores).toEqual([87, 76, 50]);
    expect(scores).toContain(50);
  });

  it('excludes 49', async () => {
    const page = await serviceWith(rows).list({ minScore: 50, perPage: 50 });
    expect(page.items.map(item => item.score)).not.toContain(49);
  });

  it('shows everything when no threshold is applied', async () => {
    const page = await serviceWith(rows).list({ perPage: 50 });
    expect(page.items.map(item => item.score).sort((a, b) => b - a)).toEqual([87, 76, 50, 49, 32]);
  });

  it('keeps low-scoring and rejected stories visible', async () => {
    // Nothing disappears for scoring badly: the weak ones are the evidence
    // about whether the discovery filter is behaving.
    const withRejected = [
      story(12, { outcome: 'OFF_TOPIC', outcomeReasons: ['not a crypto story'] }),
      story(20, { outcome: 'REJECTED', outcomeReasons: ['originality 5 below 50'] }),
    ];

    const page = await serviceWith(withRejected).list({ perPage: 50 });
    expect(page.total).toBe(2);
    expect(page.items.map(item => item.status).sort()).toEqual(['OFF_TOPIC', 'REJECTED']);
    expect(page.items[0]!.statusReasons.length).toBeGreaterThan(0);
  });
});

describe('publication time is not detection time', () => {
  it('reports both, and the delay between them', async () => {
    // "Created 3 minutes ago" cannot distinguish finding a story quickly from
    // finding an old story recently.
    const rows = [
      story(60, {
        publishedAt: '2026-08-22T11:41:00Z',
        discoveredAt: '2026-08-22T11:44:00Z',
      }),
    ];

    const [item] = (await serviceWith(rows).list({ perPage: 10 })).items;

    expect(item!.publishedAt).toBe('2026-08-22T11:41:00Z');
    expect(item!.detectedAt).toBe('2026-08-22T11:44:00Z');
    expect(item!.detectionDelayMinutes).toBe(3);
  });

  it('reports no delay when the source carried no timestamp', async () => {
    const [item] = (await serviceWith([story(60)]).list({ perPage: 10 })).items;
    expect(item!.detectionDelayMinutes).toBeNull();
  });
});

describe('the default newsroom sort', () => {
  it('puts a fresher lower-scoring story above an older higher-scoring one', async () => {
    // 95 breaking beats 99 recent. This is a real-time newsroom: the older
    // story is already covered everywhere, and the new one might not be.
    const rows = [story(99, { freshness: 'RECENT' }), story(95, { freshness: 'BREAKING' })];
    const page = await serviceWith(rows).list({ perPage: 10, sort: 'newsroom' });

    expect(page.items.map(item => item.score)).toEqual([95, 99]);
  });

  it('ranks by score within a freshness band', async () => {
    const rows = [story(70, { freshness: 'BREAKING' }), story(90, { freshness: 'BREAKING' })];
    const page = await serviceWith(rows).list({ perPage: 10, sort: 'newsroom' });

    expect(page.items.map(item => item.score)).toEqual([90, 70]);
  });

  it('can be overridden with an explicit score sort', async () => {
    const rows = [story(99, { freshness: 'RECENT' }), story(95, { freshness: 'BREAKING' })];
    const page = await serviceWith(rows).list({ perPage: 10, sort: 'score' });

    expect(page.items.map(item => item.score)).toEqual([99, 95]);
  });
});

describe('sources reach the admin', () => {
  it('carries every source, with its publication time', async () => {
    const rows = [
      story(80, {
        sources: [
          { domain: 'coindesk.com', url: 'https://coindesk.com/a', isPrimary: true, publishedAt: '2026-08-22T11:41:00Z' },
          { domain: 'theblock.co', url: 'https://theblock.co/b', isPrimary: false, publishedAt: '2026-08-22T11:45:00Z' },
          { domain: 'decrypt.co', url: 'https://decrypt.co/c', isPrimary: false },
        ],
      }),
    ];

    const [item] = (await serviceWith(rows).list({ perPage: 10 })).items;

    expect(item!.sourceCount).toBe(3);
    expect(item!.sources.map(source => source.domain)).toEqual([
      'coindesk.com',
      'theblock.co',
      'decrypt.co',
    ]);
    expect(item!.sources[0]!.publishedAt).toBe('2026-08-22T11:41:00Z');
    expect(item!.sources[0]!.isPrimary).toBe(true);
  });

  it('collapses several outlets covering one event into a single story', async () => {
    // Four competitors, one CrypLounge candidate — not four.
    const rows = [
      story(85, {
        sources: ['coindesk.com', 'theblock.co', 'decrypt.co', 'cryptobriefing.com'].map(domain => ({
          domain,
          url: `https://${domain}/x`,
          isPrimary: false,
        })),
      }),
    ];

    const page = await serviceWith(rows).list({ perPage: 10 });
    expect(page.total).toBe(1);
    expect(page.items[0]!.sourceCount).toBe(4);
  });

  it('filters by source domain', async () => {
    const rows = [
      story(60, { sources: [{ domain: 'coindesk.com', url: 'https://coindesk.com/a', isPrimary: false }] }),
      story(61, { sources: [{ domain: 'theblock.co', url: 'https://theblock.co/b', isPrimary: false }] }),
    ];

    const page = await serviceWith(rows).list({ perPage: 10, sourceDomain: 'theblock.co' });
    expect(page.items).toHaveLength(1);
    expect(page.items[0]!.score).toBe(61);
  });
});

describe('the newsroom being unreachable is not an error', () => {
  it('reports unavailability rather than throwing', async () => {
    const service = new NewsroomDiscoveryService();
    (service as unknown as { connection: () => unknown }).connection = () => null;

    const page = await service.list();
    expect(page.available).toBe(false);
    expect(page.items).toEqual([]);
    expect(page.reason).toBeTruthy();
  });
});

describe('score presentation', () => {
  it('bands the score', () => {
    expect(scoreBandFor(92)).toBe('90-100');
    expect(scoreBandFor(50)).toBe('50-59');
    expect(scoreBandFor(49)).toBe('below 50');
  });

  it('gives a word as well as a number, so colour is never the only signal', () => {
    expect(scoreLabelFor(92)).toBe('Excellent');
    expect(scoreLabelFor(78)).toBe('Good');
    expect(scoreLabelFor(61)).toBe('Fair');
    expect(scoreLabelFor(48)).toBe('Weak');
    expect(scoreLabelFor(20)).toBe('Poor');
  });
});
