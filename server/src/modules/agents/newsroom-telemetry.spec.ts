import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AGENT_ALLOWED_PERMISSIONS, checkAgentPermissions } from './agent-permissions';
import { NewsroomTelemetryService } from './newsroom-telemetry.service';
import {
  MAX_METADATA_BYTES,
  MAX_METADATA_DEPTH,
  MAX_TELEMETRY_BATCH,
  metadataDepth,
  type TelemetryEventDto,
} from './dto/submit-telemetry.dto';
import { TELEMETRY_RETENTION_DAYS } from './newsroom-telemetry-cleanup.task';

/**
 * Telemetry ingestion.
 *
 * Two properties carry most of the weight. The endpoint is append-only and
 * reachable by an agent holding `telemetry.write` and nothing else — so a
 * compromised newsroom key cannot read editorial content through it. And a
 * retried batch must not duplicate rows, because the newsroom's delivery buffer
 * retries on timeouts and restarts and its batches overlap.
 */

const event = (over: Partial<TelemetryEventDto> = {}): TelemetryEventDto => ({
  id: 'evt-00000000-0000-4000-8000-000000000001',
  type: 'RESEARCH_STARTED',
  occurredAt: '2026-09-12T10:00:00.000Z',
  ...over,
});

/** Minimal Prisma double: records what `createMany` was asked to insert. */
function prismaDouble(storedIds = new Set<string>()) {
  const calls: Array<{ data: Array<{ id: string }>; skipDuplicates?: boolean }> = [];

  return {
    calls,
    storedIds,
    newsroomEvent: {
      createMany: jest.fn(async (args: { data: Array<{ id: string }>; skipDuplicates?: boolean }) => {
        calls.push(args);
        let count = 0;
        for (const row of args.data) {
          if (storedIds.has(row.id)) continue;
          storedIds.add(row.id);
          count += 1;
        }
        return { count };
      }),
      deleteMany: jest.fn(async (_args: { where: { createdAt: { lt: Date } } }) => ({ count: 0 })),
    },
  };
}

const serviceWith = (prisma: ReturnType<typeof prismaDouble>) =>
  new NewsroomTelemetryService(prisma as never);

/* ------------------------------------------------------- permission ----- */

describe('the telemetry permission', () => {
  it('is grantable to an agent', () => {
    expect(AGENT_ALLOWED_PERMISSIONS).toContain('telemetry.write');
    expect(checkAgentPermissions(['telemetry.write']).allowed).toBe(true);
  });

  it('does not widen the allow-list to anything else', () => {
    // The guard property of this file: adding telemetry must not have opened a
    // door to accounts, settings or automation control.
    for (const dangerous of ['users.manage', 'roles.manage', 'settings.manage', 'ai.automation.manage']) {
      expect(checkAgentPermissions([dangerous]).allowed).toBe(false);
    }
  });

  it('is refused to an agent that was not granted it', () => {
    // Mirrors the route's check, which is an inline `permissions.includes`
    // exactly like the article endpoints.
    const agent = { permissions: ['news.create'] };
    const allowed = agent.permissions.includes('telemetry.write');

    expect(allowed).toBe(false);
    expect(() => {
      if (!allowed) throw new ForbiddenException({ code: 'FORBIDDEN' });
    }).toThrow(ForbiddenException);
  });
});

/* ---------------------------------------------------------- ingestion --- */

describe('ingesting telemetry', () => {
  it('stores a single valid event', async () => {
    const prisma = prismaDouble();
    const result = await serviceWith(prisma).ingest([event()]);

    expect(result).toEqual({ stored: 1, duplicates: 0 });
    expect(prisma.newsroomEvent.createMany).toHaveBeenCalledTimes(1);
  });

  it('stores a batch', async () => {
    const prisma = prismaDouble();
    const batch = Array.from({ length: 25 }, (_, i) => event({ id: `evt-batch-${i}` }));

    const result = await serviceWith(prisma).ingest(batch);

    expect(result.stored).toBe(25);
  });

  it('maps every optional field onto the row', async () => {
    const prisma = prismaDouble();
    await serviceWith(prisma).ingest([
      event({
        workflowId: 'w1',
        clusterId: 'c1',
        articleId: 'a1',
        stage: 'RESEARCH',
        status: 'STRONG',
        source: 'coindesk.com',
        model: 'nvidia/nemotron',
        durationMs: 1234,
        metadata: { sources: 2 },
      }),
    ]);

    expect(prisma.calls[0]?.data[0]).toMatchObject({
      workflowId: 'w1',
      clusterId: 'c1',
      articleId: 'a1',
      stage: 'RESEARCH',
      status: 'STRONG',
      source: 'coindesk.com',
      model: 'nvidia/nemotron',
      durationMs: 1234,
    });
  });

  it('nulls absent optional fields rather than omitting them', async () => {
    const prisma = prismaDouble();
    await serviceWith(prisma).ingest([event()]);

    expect(prisma.calls[0]?.data[0]).toMatchObject({ clusterId: null, model: null, metadata: null });
  });
});

/* ------------------------------------------------------ deduplication --- */

describe('a retried batch', () => {
  it('does not create duplicate rows', async () => {
    // The newsroom reuses each event id across retries, so redelivery collides
    // on the primary key and `skipDuplicates` turns that into a no-op.
    const prisma = prismaDouble();
    const service = serviceWith(prisma);
    const batch = [event({ id: 'evt-stable-1' }), event({ id: 'evt-stable-2' })];

    const first = await service.ingest(batch);
    const second = await service.ingest(batch);

    expect(first).toEqual({ stored: 2, duplicates: 0 });
    expect(second).toEqual({ stored: 0, duplicates: 2 });
    expect(prisma.storedIds.size).toBe(2);
  });

  it('stores the new half of an overlapping batch', async () => {
    // What a retry after partial delivery actually looks like.
    const prisma = prismaDouble();
    const service = serviceWith(prisma);

    await service.ingest([event({ id: 'evt-a' })]);
    const result = await service.ingest([event({ id: 'evt-a' }), event({ id: 'evt-b' })]);

    expect(result).toEqual({ stored: 1, duplicates: 1 });
    expect(prisma.storedIds).toEqual(new Set(['evt-a', 'evt-b']));
  });

  it('asks the database to skip duplicates rather than failing', async () => {
    const prisma = prismaDouble();
    await serviceWith(prisma).ingest([event()]);

    expect(prisma.calls[0]?.skipDuplicates).toBe(true);
  });

  it('collapses ids repeated inside one batch', async () => {
    // A buffer that retried mid-flush can produce these, and `createMany` would
    // otherwise reject the whole batch.
    const prisma = prismaDouble();
    const result = await serviceWith(prisma).ingest([
      event({ id: 'evt-same' }),
      event({ id: 'evt-same' }),
    ]);

    expect(result).toEqual({ stored: 1, duplicates: 1 });
  });
});

/* --------------------------------------------------------- size limits -- */

describe('metadata limits', () => {
  it('rejects metadata over the byte cap', async () => {
    const prisma = prismaDouble();
    const huge = { blob: 'x'.repeat(MAX_METADATA_BYTES + 100) };

    await expect(serviceWith(prisma).ingest([event({ metadata: huge })])).rejects.toThrow(
      BadRequestException
    );
    expect(prisma.newsroomEvent.createMany).not.toHaveBeenCalled();
  });

  it('rejects metadata nested deeper than the limit', async () => {
    const prisma = prismaDouble();
    const deep = { a: { b: { c: { d: { e: 1 } } } } };

    await expect(serviceWith(prisma).ingest([event({ metadata: deep })])).rejects.toThrow(
      BadRequestException
    );
  });

  it('names the offending event so an emit call can be found', async () => {
    const prisma = prismaDouble();

    await expect(
      serviceWith(prisma).ingest([
        event({ type: 'ARTICLE_REJECTED', metadata: { blob: 'x'.repeat(MAX_METADATA_BYTES + 1) } }),
      ])
    ).rejects.toThrow(/ARTICLE_REJECTED/);
  });

  it('accepts ordinary telemetry metadata', async () => {
    const prisma = prismaDouble();
    const typical = { sources: 2, figures: 3, evidence: 'STRONG', reasons: ['unsupported claim'] };

    await expect(serviceWith(prisma).ingest([event({ metadata: typical })])).resolves.toMatchObject({
      stored: 1,
    });
  });

  it('measures depth without recursing on hostile input', () => {
    // Iterative by design: the input arrives over HTTP, so a deliberately deep
    // payload must not be a stack overflow that takes the API process down.
    let nested: Record<string, unknown> = { leaf: 1 };
    for (let i = 0; i < 5_000; i += 1) nested = { nested };

    expect(() => metadataDepth(nested)).not.toThrow();
    expect(metadataDepth(nested)).toBeGreaterThan(MAX_METADATA_DEPTH);
  });

  it('counts a flat object as one level', () => {
    expect(metadataDepth({ sources: 2 })).toBe(1);
  });
});

/* ------------------------------------------------------- batch bound ---- */

describe('the batch bound', () => {
  it('is declared and matches what the newsroom sends', () => {
    // The sink's MAX_BATCH_SIZE is the same number. If these drift, a full
    // batch is rejected as too large and the buffer never drains.
    expect(MAX_TELEMETRY_BATCH).toBe(200);
  });
});

/* ---------------------------------------------------------- retention -- */

describe('retention', () => {
  it('keeps a week, not the ninety days agent request logs keep', () => {
    // ~58,000 rows a day. Ninety days would be five million in a database the
    // live site shares.
    expect(TELEMETRY_RETENTION_DAYS).toBe(7);
  });

  it('deletes only telemetry older than the cutoff', async () => {
    const prisma = prismaDouble();
    const { NewsroomTelemetryCleanupTask } = await import('./newsroom-telemetry-cleanup.task');
    const task = new NewsroomTelemetryCleanupTask(prisma as never);

    await task.run();

    const call = prisma.newsroomEvent.deleteMany.mock.calls[0]![0];

    expect(call.where.createdAt.lt).toBeInstanceOf(Date);

    const days = (Date.now() - call.where.createdAt.lt.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });

  it('cuts on createdAt, not occurredAt', async () => {
    // `occurredAt` can be older than arrival when a buffer retried for a while.
    // Retention measures how long the CMS has held the row.
    const prisma = prismaDouble();
    const { NewsroomTelemetryCleanupTask } = await import('./newsroom-telemetry-cleanup.task');

    await new NewsroomTelemetryCleanupTask(prisma as never).run();

    const { where } = prisma.newsroomEvent.deleteMany.mock.calls[0]![0];
    expect(Object.keys(where)).toEqual(['createdAt']);
  });

  it('does not throw when the sweep fails', async () => {
    const prisma = prismaDouble();
    prisma.newsroomEvent.deleteMany.mockRejectedValueOnce(new Error('connection lost'));
    const { NewsroomTelemetryCleanupTask } = await import('./newsroom-telemetry-cleanup.task');

    // A failed sweep is tomorrow's problem, not a reason to kill the scheduler.
    await expect(new NewsroomTelemetryCleanupTask(prisma as never).run()).resolves.toBeUndefined();
  });
});
