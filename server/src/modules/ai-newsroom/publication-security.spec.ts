import { ForbiddenException } from '@nestjs/common';
import { AuditAction, ContentStatus } from '@prisma/client';
import { join } from 'node:path';
import { AgentsService } from '../agents/agents.service';
import { AGENT_ALLOWED_PERMISSIONS } from '../agents/agent-permissions';
import { ArticlesService } from '../articles/articles.service';
import { PublishingService } from '../content-core/publishing.service';
import { AutoPublishService } from './auto-publish.service';
import { originOf, PublicationGateService } from './publication-gate.service';

/*
 * Loaded at runtime, as permission-catalogue.spec does: a static import of a
 * file outside src/ would move tsc's rootDir and break the Vercel build.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PERMISSIONS } = require(join(__dirname, '..', '..', '..', 'prisma', 'permissions')) as {
  PERMISSIONS: Array<{ key: string }>;
};

/**
 * Publication security.
 *
 * The question behind every test: can anything reach PUBLISHED that a person
 * with the authority to publish did not decide on? Before this, the answer was
 * yes by several routes — an agent's configured publish mode, `request-publish`
 * and `publish-pending` on `news.create` alone with no ownership check, and a
 * scheduled-publish job that checked nothing.
 */

/** The production newsroom agent's grant, exactly. */
const NEWSROOM_PERMISSIONS = ['news.create', 'media.upload', 'telemetry.write'];

const OWNER = { id: 'agent-1', name: 'Newsroom', permissions: [...NEWSROOM_PERMISSIONS, 'news.publish'] };

const EVIDENCE = { score: 90, factScore: 95, qualityScore: 90, imageValidated: true, duplicateChecked: true };

function draft(overrides: Record<string, unknown> = {}) {
  return {
    id: 'article-1',
    title: 'Ethereum client ships hard fork upgrade with EIP-4844 support',
    status: ContentStatus.DRAFT,
    content: '<p>The client shipped, according to the release notes.</p><p>Sources: example.com</p>',
    categoryId: 'category-1',
    category: { slug: 'market' },
    createdById: null,
    createdByAgentId: 'agent-1',
    featuredImage: { id: 'media-1', mimeType: 'image/webp', size: 25_600 },
    ...overrides,
  };
}

interface Settings {
  mode?: string;
  enabled?: boolean;
  paused?: boolean;
  limit?: number;
  publishedToday?: number;
  categories?: string[];
}

function newsroomWith(settings: Settings) {
  return {
    publishMode: async () => settings.mode ?? 'AUTO_PUBLISH',
    isEnabled: async () => settings.enabled ?? true,
    isEmergencyPaused: async () => settings.paused ?? false,
    autoPublishDailyLimit: async () => settings.limit ?? 5,
    autoPublishMinScore: async () => 70,
    autoPublishStrictness: async () => 'ALL_DRAFTS',
    enabledCategorySlugs: async () => settings.categories ?? ['market'],
    recordAutoPublished: async () => undefined,
  };
}

function autoPublish(settings: Settings = {}, article: unknown = draft()) {
  const updates: unknown[] = [];
  const sweepQueries: unknown[] = [];
  const prisma = {
    auditLog: { count: jest.fn(async () => settings.publishedToday ?? 0) },
    article: {
      findUnique: jest.fn(async () => article),
      update: jest.fn(async (args: unknown) => {
        updates.push(args);
        return {};
      }),
      findMany: jest.fn(async (args: { where: { status: string } }) => {
        if (args.where.status === ContentStatus.DRAFT) {
          sweepQueries.push(args.where);
          return [{ id: 'article-1' }];
        }
        return [];
      }),
    },
  };
  const newsroom = newsroomWith(settings);
  const gate = new PublicationGateService(prisma as never, newsroom as never);
  const service = new AutoPublishService(prisma as never, newsroom as never, { record: async () => undefined } as never, gate);
  return { service, prisma, updates, sweepQueries };
}

/* -------------------------------------------------------- agent origin --- */

describe('agent submissions', () => {
  function submit(defaultPublishMode: string, permissions: string[]) {
    const created: Array<{ data: Record<string, unknown> }> = [];
    const prisma = {
      article: {
        create: jest.fn(async (args: { data: Record<string, unknown> }) => {
          created.push(args);
          return { id: 'article-9', slug: 'a', title: 'A', status: args.data.status };
        }),
      },
      aiAgent: { update: jest.fn(async () => ({})) },
    };
    const agents = new AgentsService(
      prisma as never,
      { unique: async () => 'slug' } as never,
      new PublishingService(),
      { record: async () => undefined } as never,
      { dispatch: () => undefined } as never,
      {} as never
    );
    return {
      created,
      run: () =>
        agents.submitArticle(
          { id: 'agent-1', name: 'Newsroom', environment: 'PRODUCTION', permissions, defaultPublishMode } as never,
          {
            title: 'A story',
            summary: 'A summary of the story',
            content: '<p>Body</p>',
            scheduledFor: new Date(Date.now() + 3600_000).toISOString(),
          } as never
        ),
    };
  }

  it.each(['DRAFT', 'REVIEW', 'SCHEDULED', 'IMMEDIATE'])(
    'creates a DRAFT whatever the agent publish mode (%s), even with news.publish',
    async mode => {
      const { created, run } = submit(mode, [...NEWSROOM_PERMISSIONS, 'news.publish']);
      await run();

      expect(created[0]!.data.status).toBe(ContentStatus.DRAFT);
      expect(created[0]!.data.publishedAt).toBeNull();
      expect(created[0]!.data.scheduledFor).toBeNull();
    }
  );

  it('records the creating agent in createdByAgentId', async () => {
    const { created, run } = submit('DRAFT', NEWSROOM_PERMISSIONS);
    await run();

    expect(created[0]!.data.createdByAgentId).toBe('agent-1');
    expect(created[0]!.data.createdById).toBeUndefined();
  });
});

describe('origin', () => {
  it('is read from the recorded creator, never from the absence of a user', () => {
    expect(originOf({ createdById: null, createdByAgentId: 'agent-1' })).toBe('AGENT');
    expect(originOf({ createdById: 'user-1', createdByAgentId: null })).toBe('HUMAN');
    // No user and no agent is not "probably the newsroom".
    expect(originOf({ createdById: null, createdByAgentId: null })).toBe('UNKNOWN');
  });
});

/* ------------------------------------------------------- request-publish --- */

describe('request-publish', () => {
  it('refuses an agent without news.publish before touching the article', async () => {
    const { service, prisma, updates } = autoPublish();
    const newsroomAgent = { id: 'agent-1', permissions: NEWSROOM_PERMISSIONS };

    await expect(service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: newsroomAgent })).rejects.toThrow(
      ForbiddenException
    );
    expect(prisma.article.findUnique).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });

  it('refuses a human-created draft, even to an agent holding news.publish', async () => {
    const { service, updates } = autoPublish({}, draft({ createdById: 'user-1', createdByAgentId: null }));
    await expect(service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER })).rejects.toMatchObject({
      response: { code: 'NOT_ARTICLE_OWNER' },
    });
    expect(updates).toHaveLength(0);
  });

  it("refuses another agent's draft", async () => {
    const { service, updates } = autoPublish({}, draft({ createdByAgentId: 'agent-2' }));
    await expect(service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER })).rejects.toThrow(
      ForbiddenException
    );
    expect(updates).toHaveLength(0);
  });

  it('refuses a draft whose creator was never recorded', async () => {
    const { service, updates } = autoPublish({}, draft({ createdByAgentId: null }));
    await expect(service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER })).rejects.toThrow(
      ForbiddenException
    );
    expect(updates).toHaveLength(0);
  });

  it('will not auto-publish a human draft for an admin sweep either', async () => {
    const { service, updates } = autoPublish({}, draft({ createdById: 'user-1', createdByAgentId: null }));
    const decision = await service.consider('article-1', EVIDENCE, { kind: 'ADMIN' });

    expect(decision.published).toBe(false);
    expect(decision.reasons.join(' ')).toMatch(/not created by an AI agent/);
    expect(updates).toHaveLength(0);
  });

  it('lets the owning agent with news.publish through, when every gate passes', async () => {
    const { service, updates } = autoPublish();
    const decision = await service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER });

    expect(decision.published).toBe(true);
    expect(updates).toHaveLength(1);
  });

  it('enforces the per-category automation switch, which it never consulted before', async () => {
    const { service, updates } = autoPublish({ categories: ['policy'] });
    const decision = await service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER });

    expect(decision.published).toBe(false);
    expect(decision.reasons).toContain('AI automation is disabled for the "market" category');
    expect(updates).toHaveLength(0);
  });

  it('enforces the daily limit', async () => {
    const { service, updates } = autoPublish({ limit: 3, publishedToday: 3 });
    const decision = await service.consider('article-1', EVIDENCE, { kind: 'AGENT', agent: OWNER });

    expect(decision.reasons).toContain('daily auto-publish limit reached (3/3)');
    expect(updates).toHaveLength(0);
  });
});

/* ------------------------------------------------------- publish-pending --- */

describe('publish-pending', () => {
  it('refuses news.create alone before sweeping anything', async () => {
    const { service, prisma } = autoPublish();
    await expect(
      service.sweepPendingDrafts({ kind: 'AGENT', agent: { id: 'agent-1', permissions: NEWSROOM_PERMISSIONS } })
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.article.findMany).not.toHaveBeenCalled();
  });

  it("sweeps only the requesting agent's own drafts, by recorded agent", async () => {
    const { service, sweepQueries } = autoPublish({ mode: 'DRAFT_ONLY' });
    await service.sweepPendingDrafts({ kind: 'AGENT', agent: OWNER });

    expect(sweepQueries[0]).toMatchObject({ status: ContentStatus.DRAFT, createdByAgentId: 'agent-1' });
    expect(sweepQueries[0]).not.toHaveProperty('createdById');
  });

  it('an admin sweep covers agent-created drafts only, never unattributed ones', async () => {
    const { service, sweepQueries } = autoPublish({ mode: 'DRAFT_ONLY' });
    await service.sweepPendingDrafts({ kind: 'ADMIN' });

    expect(sweepQueries[0]).toMatchObject({ createdByAgentId: { not: null } });
    expect(sweepQueries[0]).not.toHaveProperty('createdById');
  });
});

/* ---------------------------------------------------- scheduled publishing --- */

describe('scheduled publishing', () => {
  function scheduler(settings: Settings, articles: Array<Record<string, unknown>>) {
    const published: string[] = [];
    const audits: Array<{ action: AuditAction }> = [];
    const prisma = {
      auditLog: { count: jest.fn(async () => settings.publishedToday ?? 0) },
      article: {
        findMany: jest.fn(async () => articles),
        updateMany: jest.fn(async (args: { where: { id: string } }) => {
          published.push(args.where.id);
          return { count: 1 };
        }),
      },
    };
    const gate = new PublicationGateService(prisma as never, newsroomWith(settings) as never);
    const service = new ArticlesService(
      prisma as never,
      {} as never,
      new PublishingService(),
      {} as never,
      { record: async (entry: { action: AuditAction }) => audits.push(entry) } as never,
      {} as never,
      gate
    );
    return { service, published, audits };
  }

  const agentScheduled = {
    id: 'agent-article',
    title: 'Agent story',
    publishedAt: null,
    createdById: null,
    createdByAgentId: 'agent-1',
    category: { slug: 'market' },
  };
  const humanScheduled = { ...agentScheduled, id: 'human-article', createdById: 'user-1', createdByAgentId: null };
  const unknownScheduled = { ...agentScheduled, id: 'unknown-article', createdByAgentId: null };

  it.each<[string, Settings]>([
    ['emergency pause', { paused: true }],
    ['DRAFT_ONLY mode', { mode: 'DRAFT_ONLY' }],
    ['automation switched off', { enabled: false }],
    ['daily limit reached', { limit: 2, publishedToday: 2 }],
    ['category switched off', { categories: ['policy'] }],
  ])('holds an agent-created scheduled article under %s', async (_label, settings) => {
    const { service, published } = scheduler(settings, [agentScheduled]);
    expect(await service.publishDueScheduled()).toBe(0);
    expect(published).toEqual([]);
  });

  it('holds a scheduled article of unrecorded origin even when automation would allow it', async () => {
    const { service, published } = scheduler({}, [unknownScheduled]);
    expect(await service.publishDueScheduled()).toBe(0);
    expect(published).toEqual([]);
  });

  it('publishes an agent-created article only when every gate passes, and records it against the quota', async () => {
    const { service, published, audits } = scheduler({}, [agentScheduled]);
    expect(await service.publishDueScheduled()).toBe(1);
    expect(published).toEqual(['agent-article']);
    expect(audits).toEqual([expect.objectContaining({ action: AuditAction.PUBLISH })]);
  });

  it("still publishes an editor's scheduled article on time, whatever the automation controls say", async () => {
    const { service, published } = scheduler({ paused: true, mode: 'DRAFT_ONLY', enabled: false }, [
      humanScheduled,
      agentScheduled,
    ]);
    expect(await service.publishDueScheduled()).toBe(1);
    expect(published).toEqual(['human-article']);
  });
});

/* ---------------------------------------------------- human publication --- */

describe('human editors', () => {
  it('can still publish a draft directly with news.publish', async () => {
    const existing = {
      id: 'article-1',
      title: 'Editor story',
      summary: 's',
      content: '<p>c</p>',
      slug: 'editor-story',
      status: ContentStatus.DRAFT,
      publishedAt: null,
      scheduledFor: null,
      createdById: 'user-1',
    };
    const updates: Array<{ data: Record<string, unknown> }> = [];
    const prisma = {
      article: {
        findFirst: jest.fn(async () => existing),
        update: jest.fn(async (args: { data: Record<string, unknown> }) => {
          updates.push(args);
          return { ...existing, status: args.data.status };
        }),
      },
    };
    const service = new ArticlesService(
      prisma as never,
      {} as never,
      new PublishingService(),
      { buildSet: () => ({}) } as never,
      { record: async () => undefined, diff: () => ({}) } as never,
      { sanitize: (html: string) => html } as never,
      {} as never
    );

    const editor = { id: 'user-2', role: 'EDITOR', additionalRoles: [], permissions: ['news.publish'], email: 'e@x' };
    await service.update('article-1', { status: ContentStatus.PUBLISHED } as never, editor as never, {} as never);

    expect(updates[0]!.data.status).toBe(ContentStatus.PUBLISHED);
  });
});

/* ------------------------------------------------------------ permissions --- */

describe('permissions', () => {
  const catalogue = new Set(PERMISSIONS.map(permission => permission.key));

  it('catalogues news.publish and telemetry.write', () => {
    expect(catalogue.has('news.publish')).toBe(true);
    expect(catalogue.has('telemetry.write')).toBe(true);
  });

  it("the newsroom agent's grant is valid for an agent and cannot reach publication", () => {
    for (const key of NEWSROOM_PERMISSIONS) {
      expect(AGENT_ALLOWED_PERMISSIONS as readonly string[]).toContain(key);
    }
    const gate = new PublicationGateService({} as never, {} as never);
    expect(() => gate.assertAgentMayPublish({ id: 'agent-1', permissions: NEWSROOM_PERMISSIONS })).toThrow(
      ForbiddenException
    );
  });
});
