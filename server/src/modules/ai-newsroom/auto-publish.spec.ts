import { ContentStatus } from '@prisma/client';
import { AutoPublishService, FACT_SCORE_MIN, QUALITY_SCORE_MIN } from './auto-publish.service';

/**
 * Automatic publishing.
 *
 * Every test here answers the same question from a different angle: **can
 * something reach a reader that a human never saw?** The gates are the answer,
 * so each one is exercised alone, with everything else passing — a gate that
 * only works when the others also fail is not a gate.
 *
 * The draft path is tested first and deliberately: turning auto mode on must
 * not change what happens when it is off, and that is the behaviour the
 * publication has depended on for its whole life.
 */

const DRAFT_ARTICLE = {
  id: 'article-1',
  title: 'Ethereum client ships hard fork upgrade with EIP-4844 support',
  status: ContentStatus.DRAFT,
  content: '<p>The client shipped, according to the release notes.</p><p>Sources: example.com</p>',
  categoryId: 'category-1',
  featuredImage: { id: 'media-1', mimeType: 'image/webp', size: 25_600 },
};

const GOOD_EVIDENCE = {
  score: 80,
  factScore: 95,
  qualityScore: 90,
  imageValidated: true,
  duplicateChecked: true,
};

interface Settings {
  mode?: string;
  enabled?: boolean;
  paused?: boolean;
  limit?: number;
  minScore?: number;
  publishedToday?: number;
  strictness?: string;
}

function build(settings: Settings = {}, article: unknown = DRAFT_ARTICLE) {
  const updated: Record<string, unknown>[] = [];

  const prisma = {
    article: {
      findUnique: async () => article,
      update: async (args: Record<string, unknown>) => {
        updated.push(args);
        return {};
      },
      count: async () => settings.publishedToday ?? 0,
      findMany: async () => [],
    },
  };

  const newsroom = {
    publishMode: async () => settings.mode ?? 'AUTO_PUBLISH',
    isEnabled: async () => settings.enabled ?? true,
    isEmergencyPaused: async () => settings.paused ?? false,
    autoPublishDailyLimit: async () => settings.limit ?? 5,
    autoPublishMinScore: async () => settings.minScore ?? 70,
    autoPublishStrictness: async () => settings.strictness ?? 'ALL_DRAFTS',
    recordAutoPublished: async () => undefined,
  };

  return {
    service: new AutoPublishService(prisma as never, newsroom as never),
    updated,
  };
}

/* ------------------------------------------------------ draft behaviour --- */

describe('draft mode is unchanged', () => {
  it('publishes nothing while the mode is DRAFT_ONLY', async () => {
    const { service, updated } = build({ mode: 'DRAFT_ONLY' });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.status).toBe(ContentStatus.DRAFT);
    expect(decision.reasons).toContain('publish mode is DRAFT_ONLY, not AUTO_PUBLISH');
    // Nothing was written. The draft is exactly as the newsroom left it.
    expect(updated).toHaveLength(0);
  });

  it('publishes nothing in REVIEW_REQUIRED either', async () => {
    const { service, updated } = build({ mode: 'REVIEW_REQUIRED' });
    expect((await service.consider('article-1', GOOD_EVIDENCE)).published).toBe(false);
    expect(updated).toHaveLength(0);
  });

  it('refuses when global automation is off, whatever the mode says', async () => {
    const { service } = build({ enabled: false });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.reasons).toContain('AI automation is switched off');
  });

  it('leaves an article alone once it is no longer a draft', async () => {
    // Guards against a double promotion, and against overriding a human who
    // has already archived or published it.
    const { service, updated } = build({}, { ...DRAFT_ARTICLE, status: ContentStatus.ARCHIVED });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.reasons[0]).toMatch(/already ARCHIVED/);
    expect(updated).toHaveLength(0);
  });
});

/* ---------------------------------------------------------- auto publish --- */

describe('auto mode publishes an article that clears every gate', () => {
  it('publishes and stamps a publication time', async () => {
    const { service, updated } = build();
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(true);
    expect(decision.status).toBe(ContentStatus.PUBLISHED);
    expect(decision.reasons).toEqual([]);

    expect(updated).toHaveLength(1);
    const data = updated[0]!.data as { status: ContentStatus; publishedAt: Date };
    expect(data.status).toBe(ContentStatus.PUBLISHED);
    expect(data.publishedAt).toBeInstanceOf(Date);
  });
});

/* ------------------------------------------------------- failed gates --- */

describe('each quality gate refuses on its own, under HIGH_CONFIDENCE', () => {
  it('refuses a score below the configured minimum', async () => {
    const { service, updated } = build({ minScore: 70, strictness: 'HIGH_CONFIDENCE' });
    const decision = await service.consider('article-1', { ...GOOD_EVIDENCE, score: 69 });

    expect(decision.published).toBe(false);
    expect(decision.reasons.some(r => /score 69 is below/.test(r))).toBe(true);
    expect(updated).toHaveLength(0);
  });

  it('refuses a fact score below the fixed floor', async () => {
    const { service } = build({ strictness: 'HIGH_CONFIDENCE' });
    const decision = await service.consider('article-1', {
      ...GOOD_EVIDENCE,
      factScore: FACT_SCORE_MIN - 1,
    });

    expect(decision.published).toBe(false);
    expect(decision.reasons.some(r => /fact score 89 is below 90/.test(r))).toBe(true);
  });

  it('refuses a quality score below the fixed floor', async () => {
    const { service } = build({ strictness: 'HIGH_CONFIDENCE' });
    const decision = await service.consider('article-1', {
      ...GOOD_EVIDENCE,
      qualityScore: QUALITY_SCORE_MIN - 1,
    });

    expect(decision.published).toBe(false);
    expect(decision.reasons.some(r => /quality score 84 is below 85/.test(r))).toBe(true);
  });

  it('refuses when image validation did not pass', async () => {
    const { service } = build({ strictness: 'HIGH_CONFIDENCE' });
    const decision = await service.consider('article-1', { ...GOOD_EVIDENCE, imageValidated: false });
    expect(decision.reasons).toContain('image validation did not pass');
  });

  it('refuses when the duplicate check did not run', async () => {
    const { service } = build();
    const decision = await service.consider('article-1', { ...GOOD_EVIDENCE, duplicateChecked: false });
    expect(decision.reasons).toContain('the duplicate check did not run');
  });

  it('refuses an article with no source attribution in the body', async () => {
    // Verified from the stored article rather than attested by the caller:
    // publishing unattributed copy under our name is the failure that matters
    // most here.
    const { service } = build({}, { ...DRAFT_ARTICLE, content: '<p>Something happened.</p>' });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.reasons).toContain('no source attribution found in the article body');
  });

  it('refuses an article with no featured image', async () => {
    const { service } = build({}, { ...DRAFT_ARTICLE, featuredImage: null });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);
    expect(decision.reasons).toContain('the article has no featured image');
  });

  it('refuses an article whose featured image is not an image', async () => {
    const { service } = build(
      {},
      { ...DRAFT_ARTICLE, featuredImage: { id: 'm', mimeType: 'text/html', size: 9000 } }
    );
    const decision = await service.consider('article-1', GOOD_EVIDENCE);
    expect(decision.reasons.some(r => /not an image/.test(r))).toBe(true);
  });

  it('refuses an article with no category', async () => {
    const { service } = build({}, { ...DRAFT_ARTICLE, categoryId: null });
    expect((await service.consider('article-1', GOOD_EVIDENCE)).reasons).toContain(
      'the article has no category'
    );
  });

  it('reports every failing gate at once, not just the first', async () => {
    const { service } = build({ minScore: 90, strictness: 'HIGH_CONFIDENCE' });
    const decision = await service.consider('article-1', {
      score: 10,
      factScore: 10,
      qualityScore: 10,
      imageValidated: false,
      duplicateChecked: false,
    });

    expect(decision.reasons.length).toBeGreaterThanOrEqual(5);
  });
});

/* ------------------------------------------------------ emergency stop --- */

describe('the emergency stop', () => {
  it('refuses immediately and reports nothing else', async () => {
    // Checked first and alone: when the operator has hit the stop, no further
    // reasoning about the article matters, and a long list of reasons would
    // bury the one that counts.
    const { service, updated } = build({ paused: true });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.reasons).toEqual(['emergency pause is active']);
    expect(updated).toHaveLength(0);
  });

  it('overrides a perfectly good article in auto mode', async () => {
    const { service } = build({ paused: true, mode: 'AUTO_PUBLISH', enabled: true });
    expect((await service.consider('article-1', GOOD_EVIDENCE)).published).toBe(false);
  });
});

/* --------------------------------------------------------- daily limit --- */

describe('the daily limit', () => {
  it('refuses once the ceiling is reached', async () => {
    const { service, updated } = build({ limit: 5, publishedToday: 5 });
    const decision = await service.consider('article-1', GOOD_EVIDENCE);

    expect(decision.published).toBe(false);
    expect(decision.reasons.some(r => /daily auto-publish limit reached \(5\/5\)/.test(r))).toBe(true);
    expect(updated).toHaveLength(0);
  });

  it('allows the last one below the ceiling', async () => {
    const { service } = build({ limit: 5, publishedToday: 4 });
    expect((await service.consider('article-1', GOOD_EVIDENCE)).published).toBe(true);
  });

  it('a limit of zero publishes nothing', async () => {
    const { service } = build({ limit: 0, publishedToday: 0 });
    expect((await service.consider('article-1', GOOD_EVIDENCE)).published).toBe(false);
  });
});

/* --------------------------------------------------------- strictness --- */

describe('ALL_DRAFTS publishes everything that reached the queue', () => {
  /**
   * The default, and what "auto publish" is normally taken to mean.
   *
   * HIGH_CONFIDENCE was tried first and held back most of what the newsroom
   * filed — score 70, fact 90 and quality 85 between them refuse the majority
   * of drafts. The loosening is of *quality* thresholds only.
   */
  const WEAK = {
    score: 20,
    factScore: 71,
    qualityScore: 60,
    imageValidated: false,
    duplicateChecked: true,
  };

  it('publishes a draft that would fail every quality threshold', async () => {
    const { service, updated } = build({ strictness: 'ALL_DRAFTS' });
    const decision = await service.consider('article-1', WEAK);

    expect(decision.published).toBe(true);
    expect(updated).toHaveLength(1);
  });

  it('refuses the same draft under HIGH_CONFIDENCE', async () => {
    // The two modes differ, and only here.
    const { service } = build({ strictness: 'HIGH_CONFIDENCE' });
    expect((await service.consider('article-1', WEAK)).published).toBe(false);
  });

  it('still refuses an article with no attribution', async () => {
    // Not a quality judgement: publishing unattributed copy under our name is
    // wrong at any setting.
    const { service } = build(
      { strictness: 'ALL_DRAFTS' },
      { ...DRAFT_ARTICLE, content: '<p>Something happened.</p>' }
    );
    const decision = await service.consider('article-1', WEAK);

    expect(decision.published).toBe(false);
    expect(decision.reasons).toContain('no source attribution found in the article body');
  });

  it('still refuses an article with no category', async () => {
    const { service } = build({ strictness: 'ALL_DRAFTS' }, { ...DRAFT_ARTICLE, categoryId: null });
    expect((await service.consider('article-1', WEAK)).published).toBe(false);
  });

  it('still refuses when the duplicate check did not run', async () => {
    const { service } = build({ strictness: 'ALL_DRAFTS' });
    const decision = await service.consider('article-1', { ...WEAK, duplicateChecked: false });

    expect(decision.published).toBe(false);
    expect(decision.reasons).toContain('the duplicate check did not run');
  });

  it('still obeys the emergency stop', async () => {
    const { service } = build({ strictness: 'ALL_DRAFTS', paused: true });
    expect((await service.consider('article-1', WEAK)).published).toBe(false);
  });

  it('still obeys the daily limit', async () => {
    const { service } = build({ strictness: 'ALL_DRAFTS', limit: 25, publishedToday: 25 });
    expect((await service.consider('article-1', WEAK)).published).toBe(false);
  });

  it('still publishes nothing in DRAFT_ONLY', async () => {
    const { service, updated } = build({ strictness: 'ALL_DRAFTS', mode: 'DRAFT_ONLY' });
    expect((await service.consider('article-1', WEAK)).published).toBe(false);
    expect(updated).toHaveLength(0);
  });
});

/* ------------------------------------------------------------- sweeping --- */

describe('sweeping drafts already in the CMS', () => {
  /**
   * The gap this closes: promotion normally happens at submission, so a draft
   * filed while the mode was DRAFT_ONLY — or before automatic publishing was
   * wired at all — would never be looked at again. Turning the mode on would
   * only affect future stories, which is not what the setting says.
   */
  function sweeper(settings: Settings, drafts: { id: string }[]) {
    const updated: Record<string, unknown>[] = [];
    let published = 0;

    const prisma = {
      article: {
        /*
         * Two different queries land here: the sweep asks for DRAFT articles,
         * and the duplicate check asks for PUBLISHED ones. Serving `drafts` to
         * both made every article look like a duplicate of itself.
         */
        findMany: async (args: { where?: { status?: string } }) =>
          args?.where?.status === ContentStatus.DRAFT ? drafts : [],
        findUnique: async () => DRAFT_ARTICLE,
        update: async (args: Record<string, unknown>) => {
          updated.push(args);
          published += 1;
          return {};
        },
        count: async () => (settings.publishedToday ?? 0) + published,
      },
    };

    const newsroom = {
      publishMode: async () => settings.mode ?? 'AUTO_PUBLISH',
      isEnabled: async () => settings.enabled ?? true,
      isEmergencyPaused: async () => settings.paused ?? false,
      autoPublishDailyLimit: async () => settings.limit ?? 25,
      autoPublishMinScore: async () => settings.minScore ?? 70,
      autoPublishStrictness: async () => settings.strictness ?? 'ALL_DRAFTS',
      recordAutoPublished: async () => undefined,
    };

    return { service: new AutoPublishService(prisma as never, newsroom as never), updated };
  }

  const three = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('publishes the waiting drafts', async () => {
    const { service, updated } = sweeper({}, three);
    const result = await service.sweepPendingDrafts();

    expect(result.considered).toBe(3);
    expect(result.published).toBe(3);
    expect(updated).toHaveLength(3);
  });

  it('publishes nothing while the mode is DRAFT_ONLY', async () => {
    const { service, updated } = sweeper({ mode: 'DRAFT_ONLY' }, three);
    const result = await service.sweepPendingDrafts();

    expect(result.published).toBe(0);
    expect(updated).toHaveLength(0);
  });

  it('publishes nothing while the emergency stop is engaged', async () => {
    const { service, updated } = sweeper({ paused: true }, three);
    expect((await service.sweepPendingDrafts()).published).toBe(0);
    expect(updated).toHaveLength(0);
  });

  it('stops at the daily limit rather than grinding through the rest', async () => {
    // Once the limit binds every remaining draft fails for the same reason,
    // so continuing would be a hundred pointless queries.
    const { service } = sweeper({ limit: 2, publishedToday: 0 }, [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
    ]);

    const result = await service.sweepPendingDrafts();
    expect(result.published).toBe(2);
  });

  it('refuses to sweep under HIGH_CONFIDENCE, and says why', async () => {
    // The score, fact and quality numbers for an existing draft are not
    // recoverable, and inventing passing values would defeat the setting.
    const { service, updated } = sweeper({ strictness: 'HIGH_CONFIDENCE' }, three);
    const result = await service.sweepPendingDrafts();

    expect(result.published).toBe(0);
    expect(result.considered).toBe(0);
    expect(result.reason).toMatch(/not recoverable/i);
    expect(updated).toHaveLength(0);
  });
});
