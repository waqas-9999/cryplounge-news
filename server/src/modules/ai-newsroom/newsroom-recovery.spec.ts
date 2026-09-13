import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConflictException, ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IS_PUBLIC } from '@/common/decorators/public.decorator';
import { REQUIRED_PERMISSIONS } from '../auth/decorators/require-permissions.decorator';
import { AGENT_ALLOWED_PERMISSIONS } from '../agents/agent-permissions';
import { AgentSubmissionController } from '../agents/agent-submission.controller';
import { bottleneckOf, NewsroomPipelineReader, type ClusterSnapshot } from './newsroom-pipeline.reader';
import { recoveryAssist } from './newsroom-recovery.assist';
import { NewsroomRecoveryController } from './newsroom-recovery.controller';
import { NewsroomRecoveryService } from './newsroom-recovery.service';

/**
 * Editor recovery of stories the newsroom held back.
 *
 * What these pin down: an override is audited with everything the brief asks
 * for; it is recorded once however often it is submitted; it is refused when
 * the story cannot be verified or has already been filed; only the newsroom
 * settles it; only editors can make one; and the CMS gains no write path to
 * the newsroom database.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PERMISSIONS, ROLES } = require(join(__dirname, '..', '..', '..', 'prisma', 'permissions')) as {
  PERMISSIONS: Array<{ key: string; module: string; description: string }>;
  ROLES: Array<{ key: string; permissions: string[] | '*' }>;
};

const EDITOR = { user: { id: 'user-editor', email: 'editor@example.com' }, ipAddress: '203.0.113.7' };

const CLUSTER: ClusterSnapshot = {
  id: 'cluster-treasury',
  title: 'Treasury faces $7.5T refinancing wall',
  state: 'HUMAN_REVIEW',
  stateCode: 'REWRITES_EXHAUSTED',
  stateReason: 'editor verdict REJECT; 1 unsupported claim(s)',
  decisionClass: 'EDITORIAL',
  recoverable: true,
  rewriteCount: 2,
  pipelineVersion: '2026-09-13.recoverable-1',
};

type Row = Record<string, unknown> & { id: string; status: string; idempotencyKey: string; clusterId: string; action: string };

function build(options: { cluster?: ClusterSnapshot | null | { available: false; reason: string }; retryable?: number } = {}) {
  const rows: Row[] = [];
  const audits: Array<{ entityId?: string; summary: string; context?: unknown; metadata?: Record<string, unknown> }> = [];
  let seq = 0;

  const pick = (row: Row | undefined) => (row ? { ...row } : null);
  const prisma = {
    newsroomRecoveryRequest: {
      findUnique: jest.fn(async ({ where }: { where: { id?: string; idempotencyKey?: string } }) =>
        pick(rows.find(row => (where.id ? row.id === where.id : row.idempotencyKey === where.idempotencyKey)))
      ),
      findUniqueOrThrow: jest.fn(async ({ where }: { where: { id: string } }) => pick(rows.find(row => row.id === where.id))!),
      findFirst: jest.fn(async ({ where }: { where: { clusterId: string; status: string } }) =>
        pick(rows.find(row => row.clusterId === where.clusterId && row.status === where.status))
      ),
      findMany: jest.fn(async ({ where, select }: { where: { status?: string }; select?: Record<string, boolean> }) =>
        rows
          .filter(row => !where.status || row.status === where.status)
          .map(row => (select ? Object.fromEntries(Object.keys(select).map(key => [key, row[key]])) : row))
      ),
      count: jest.fn(async () => rows.length),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        if (rows.some(row => row.idempotencyKey === data.idempotencyKey)) {
          throw new Prisma.PrismaClientKnownRequestError('unique', { code: 'P2002', clientVersion: 'test' });
        }
        seq += 1;
        const row = { id: `req-${seq}`, status: 'PENDING', createdAt: new Date('2026-09-13T12:00:00Z'), ...data } as unknown as Row;
        rows.push(row);
        return { ...row };
      }),
      updateMany: jest.fn(async ({ where, data }: { where: { id: string; status: string }; data: Record<string, unknown> }) => {
        const row = rows.find(item => item.id === where.id && item.status === where.status);
        if (row) Object.assign(row, data);
        return { count: row ? 1 : 0 };
      }),
    },
  };

  const audit = { record: jest.fn(async (entry: (typeof audits)[number]) => void audits.push(entry)) };
  const reader = {
    clusterSnapshot: jest.fn(async () => (options.cluster === undefined ? CLUSTER : options.cluster)),
    retryableJobCount: jest.fn(async () => options.retryable ?? 0),
  };

  return {
    service: new NewsroomRecoveryService(prisma as never, audit as never, reader as never),
    rows,
    audits,
    prisma,
    reader,
  };
}

describe('recording an override', () => {
  it('queues nothing itself and audits every field the brief requires', async () => {
    const { service, rows, audits } = build();

    const { request, replayed } = await service.request(
      CLUSTER.id,
      { action: 'ADVANCE_TO_RESEARCH', reason: 'Primary Treasury data; research should verify it', note: 'check TBAC' },
      EDITOR,
      'user:form-submit-0001'
    );

    expect(replayed).toBe(false);
    expect(request).toMatchObject({ status: 'PENDING', requestedState: 'RESEARCH_QUEUED', previousState: 'HUMAN_REVIEW' });
    expect(rows).toHaveLength(1);
    expect(audits).toHaveLength(1);
    expect(audits[0]!.metadata).toMatchObject({
      clusterId: CLUSTER.id,
      editorId: 'user-editor',
      previousState: 'HUMAN_REVIEW',
      newState: 'RESEARCH_QUEUED',
      originalRejectionReason: CLUSTER.stateReason,
      overrideReason: 'Primary Treasury data; research should verify it',
      editorNote: 'check TBAC',
      pipelineVersion: CLUSTER.pipelineVersion,
      requestId: request.id,
      idempotencyKey: 'user:form-submit-0001',
    });
    expect(typeof audits[0]!.metadata!.requestedAt).toBe('string');
  });

  it('records one request however many times the same submission arrives', async () => {
    const { service, rows, audits } = build();
    const dto = { action: 'REQUIRE_REWRITE' as const, reason: 'The unsupported claim is fixable' };

    const first = await service.request(CLUSTER.id, dto, EDITOR, null);
    const second = await service.request(CLUSTER.id, dto, EDITOR, null);

    expect(second).toMatchObject({ replayed: true, request: { id: first.request.id } });
    expect(rows).toHaveLength(1);
    expect(audits).toHaveLength(1);
  });

  it('refuses a key reused for a different action', async () => {
    const { service } = build();
    await service.request(CLUSTER.id, { action: 'DISMISS', reason: 'promotional content' }, EDITOR, 'user:same-key-01');
    await expect(
      service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'changed my mind' }, EDITOR, 'user:same-key-01')
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses a second request while one is still waiting for the newsroom', async () => {
    const { service } = build();
    await service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'worth another look' }, EDITOR, null);
    await expect(
      service.request(CLUSTER.id, { action: 'DISMISS', reason: 'on reflection, promotional' }, EDITOR, null)
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('records nothing when the newsroom database cannot confirm the story', async () => {
    const { service, rows, audits } = build({ cluster: { available: false, reason: 'unreachable' } });
    await expect(
      service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'worth another look' }, EDITOR, null)
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(rows).toHaveLength(0);
    expect(audits).toHaveLength(0);
  });

  it('refuses a story the newsroom does not have', async () => {
    const { service } = build({ cluster: null });
    await expect(
      service.request('nope', { action: 'ADVANCE_TO_RESEARCH', reason: 'worth another look' }, EDITOR, null)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('will not re-run a story already filed to the CMS, but will let it be dismissed', async () => {
    const filed = { ...CLUSTER, state: 'CMS_DRAFT' };
    await expect(
      build({ cluster: filed }).service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'run it again' }, EDITOR, null)
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      build({ cluster: filed }).service.request(CLUSTER.id, { action: 'DISMISS', reason: 'duplicate of an existing piece' }, EDITOR, null)
    ).resolves.toMatchObject({ request: { requestedState: 'REJECTED' } });
  });

  it('refuses a retry when there is nothing to retry', async () => {
    await expect(
      build({ retryable: 0 }).service.request(CLUSTER.id, { action: 'RETRY', reason: 'provider outage' }, EDITOR, null)
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      build({ retryable: 1 }).service.request(CLUSTER.id, { action: 'RETRY', reason: 'provider outage' }, EDITOR, null)
    ).resolves.toMatchObject({ request: { requestedState: 'RETRYABLE' } });
  });
});

describe('the newsroom settles requests', () => {
  it('hands the newsroom pending requests without the editor identity', async () => {
    const { service } = build();
    await service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'worth another look' }, EDITOR, null);

    const pending = await service.pendingForNewsroom();
    expect(pending).toHaveLength(1);
    expect(Object.keys(pending[0]!).sort()).toEqual(['action', 'clusterId', 'createdAt', 'id', 'note', 'reason']);
  });

  it('acknowledges once, audits it, and replays a repeat', async () => {
    const { service, audits } = build();
    const { request } = await service.request(CLUSTER.id, { action: 'ADVANCE_TO_RESEARCH', reason: 'worth another look' }, EDITOR, null);

    const first = await service.acknowledge(request.id, { status: 'QUEUED', detail: 'queued for the full pipeline', jobId: 'job-1' }, 'cryplounge-newsroom');
    const again = await service.acknowledge(request.id, { status: 'QUEUED', detail: 'already applied', jobId: 'job-1' }, 'cryplounge-newsroom');

    expect(first).toMatchObject({ replayed: false, request: { status: 'QUEUED', jobId: 'job-1', acknowledgedBy: 'cryplounge-newsroom' } });
    expect(again.replayed).toBe(true);
    expect(audits.filter(entry => entry.summary.startsWith('Newsroom'))).toHaveLength(1);
  });

  it('refuses to change a settled outcome', async () => {
    const { service } = build();
    const { request } = await service.request(CLUSTER.id, { action: 'DISMISS', reason: 'promotional content' }, EDITOR, null);
    await service.acknowledge(request.id, { status: 'APPLIED', detail: 'dismissed' }, 'newsroom');
    await expect(service.acknowledge(request.id, { status: 'REJECTED', detail: 'x' }, 'newsroom')).rejects.toBeInstanceOf(
      ConflictException
    );
  });

  it('refuses an unknown request', async () => {
    await expect(build().service.acknowledge('missing', { status: 'QUEUED', detail: 'x' }, 'newsroom')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});

describe('who can reach it', () => {
  const routes = ['health', 'decisions', 'story', 'requestRecovery', 'recoveries'] as const;

  it.each(routes)('%s requires ai.newsroom.review and is not public', route => {
    const handler = NewsroomRecoveryController.prototype[route];
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS, handler)).toEqual(['ai.newsroom.review']);
    expect(Reflect.getMetadata(IS_PUBLIC, handler)).toBeUndefined();
  });

  it('grants the permission to editors and admins, and never to authors, viewers or agents', () => {
    const holds = (role: string) => {
      const grants = ROLES.find(item => item.key === role)!.permissions;
      return grants === '*' || grants.includes('ai.newsroom.review');
    };
    expect(PERMISSIONS.some(item => item.key === 'ai.newsroom.review')).toBe(true);
    expect(['SUPER_ADMIN', 'ADMIN', 'EDITOR'].map(holds)).toEqual([true, true, true]);
    expect(['AUTHOR', 'MODERATOR', 'VIEWER'].map(holds)).toEqual([false, false, false]);
    expect(AGENT_ALLOWED_PERMISSIONS as readonly string[]).not.toContain('ai.newsroom.review');
  });

  it('the data migration inserts the catalogued key idempotently for exactly those roles', () => {
    const sql = readFileSync(
      join(__dirname, '..', '..', '..', 'prisma', 'migrations', '20260913130100_add_newsroom_review_permission', 'migration.sql'),
      'utf8'
    );
    const catalogued = PERMISSIONS.find(item => item.key === 'ai.newsroom.review')!;
    expect(sql).toContain(`'${catalogued.description}'`);
    expect(sql).toMatch(/ON CONFLICT \("key"\) DO NOTHING/);
    expect(sql).toMatch(/ON CONFLICT \("roleId", "permissionId"\) DO NOTHING/);
    expect(sql).toContain(`IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')`);
  });

  it('an agent without news.create cannot pull or acknowledge recovery requests', async () => {
    const recoveries = { pendingForNewsroom: jest.fn(), acknowledge: jest.fn() };
    const controller = new AgentSubmissionController({} as never, {} as never, {} as never, {} as never, {} as never, recoveries as never);
    const observer = { permissions: ['telemetry.write'], name: 'observer' } as never;

    await expect(controller.pendingRecoveries(observer)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.acknowledgeRecovery('r', { status: 'QUEUED', detail: 'x' }, observer, { headers: {} } as never)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(recoveries.pendingForNewsroom).not.toHaveBeenCalled();
    expect(recoveries.acknowledge).not.toHaveBeenCalled();
  });
});

describe('reading the newsroom database', () => {
  it('reports the newsroom as unavailable rather than failing when it is not configured', async () => {
    const reader = new NewsroomPipelineReader({ readOnlyClient: () => null } as never);
    await expect(reader.health()).resolves.toMatchObject({ available: false });
    await expect(reader.story('c')).resolves.toMatchObject({ available: false });
  });

  it('says so when the newsroom database predates the recoverable pipeline', async () => {
    const client = { $queryRaw: jest.fn(async () => [{ present: 0 }]) };
    const reader = new NewsroomPipelineReader({ readOnlyClient: () => client } as never);
    const result = await reader.decisions();
    expect(result).toMatchObject({ available: false });
    expect((result as { reason: string }).reason).toMatch(/recoverable pipeline/);
  });

  it('issues only SELECT statements', async () => {
    const statements: string[] = [];
    const client = {
      $queryRaw: jest.fn(async (strings: TemplateStringsArray | Prisma.Sql) => {
        const text = Array.isArray(strings) ? strings.join('?') : (strings as Prisma.Sql).sql;
        statements.push(text);
        if (text.includes('information_schema')) return [{ present: 3 }];
        return [];
      }),
    };
    const reader = new NewsroomPipelineReader({ readOnlyClient: () => client, storiesForClusters: async () => new Map() } as never);

    await reader.health('24h');
    await reader.decisions({ decisionClass: 'EDITORIAL' });
    await reader.story('cluster-1');

    expect(statements.length).toBeGreaterThan(0);
    for (const text of statements) {
      expect(text.trim()).toMatch(/^SELECT/i);
      expect(text).not.toMatch(/\b(INSERT|UPDATE|DELETE|ALTER|DROP|TRUNCATE)\b/i);
    }
  });
});

describe('the editor assist', () => {
  const evidence = { sources: 3, primarySources: 1, claims: 4, verified: 3, partiallyVerified: 1 };

  it('never ranks a hard rejection', () => {
    expect(
      recoveryAssist({ discoveryScore: 95, decisionClass: 'EDITORIAL', stateCode: 'EDITOR_DISMISSED', recoverable: false, rewriteCount: 0, research: evidence })
    ).toMatchObject({ score: 0, band: 'HARD_REJECTION' });
  });

  it('ranks a system failure above an editorial refusal on the same evidence, and explains why', () => {
    const base = { discoveryScore: 80, stateCode: null, recoverable: true, rewriteCount: 0, research: evidence };
    const system = recoveryAssist({ ...base, decisionClass: 'SYSTEM' });
    const editorial = recoveryAssist({ ...base, decisionClass: 'EDITORIAL' });

    expect(system.score).toBeGreaterThan(editorial.score);
    expect(system.factors.some(factor => /system failure/.test(factor))).toBe(true);
  });

  it('is deterministic', () => {
    const input = { discoveryScore: 62, decisionClass: 'WRITING', stateCode: 'ORIGINALITY_REJECTED', recoverable: true, rewriteCount: 2, research: evidence };
    expect(recoveryAssist(input)).toEqual(recoveryAssist(input));
  });
});

describe('the bottleneck', () => {
  it('puts stuck work ahead of slow work ahead of common refusals', () => {
    const codes = [{ code: 'REWRITES_EXHAUSTED', decisionClass: 'EDITORIAL', count: 9 }];
    expect(bottleneckOf({ jobCounts: { STALLED: 1 }, oldestWaitingMinutes: 90, codes, invalid: 0, reviews: 0 })?.kind).toBe('STALLED_JOBS');
    expect(bottleneckOf({ jobCounts: { QUEUED: 2 }, oldestWaitingMinutes: 90, codes, invalid: 0, reviews: 0 })?.kind).toBe('QUEUE_BACKLOG');
    expect(bottleneckOf({ jobCounts: {}, oldestWaitingMinutes: 5, codes, invalid: 4, reviews: 10 })?.kind).toBe('EDITOR_RESPONSES');
    expect(bottleneckOf({ jobCounts: {}, oldestWaitingMinutes: null, codes, invalid: 0, reviews: 10 })?.kind).toBe('REFUSAL');
    expect(bottleneckOf({ jobCounts: {}, oldestWaitingMinutes: null, codes: [], invalid: 0, reviews: 0 })).toBeNull();
  });
});
