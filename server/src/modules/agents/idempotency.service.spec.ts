import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import {
  DuplicateKeyError,
  IdempotencyService,
  type IdempotencyRecord,
  type IdempotencyStore,
} from './idempotency.service';

/**
 * In-memory store with the same unique-constraint behaviour as Postgres:
 * a second claim on the same (agent, operation, key) throws.
 */
class MemoryStore implements IdempotencyStore {
  readonly rows = new Map<string, IdempotencyRecord & { createdAt: Date }>();

  private id(agentId: string, operation: string, key: string) {
    return `${agentId}::${operation}::${key}`;
  }

  async claim(record: Pick<IdempotencyRecord, 'agentId' | 'operation' | 'key' | 'requestHash'>) {
    const id = this.id(record.agentId, record.operation, record.key);
    if (this.rows.has(id)) throw new DuplicateKeyError();
    this.rows.set(id, { ...record, status: 'PROCESSING', createdAt: new Date() });
  }

  async find(agentId: string, operation: string, key: string) {
    return this.rows.get(this.id(agentId, operation, key)) ?? null;
  }

  /** Mirrors the conditional UPDATE the Prisma store will perform. */
  async reclaim(
    agentId: string,
    operation: string,
    key: string,
    requestHash: string | null,
    staleBefore: Date
  ) {
    const row = this.rows.get(this.id(agentId, operation, key));
    if (!row) return false;

    const takeable =
      row.status === 'FAILED' || (row.status === 'PROCESSING' && row.createdAt < staleBefore);
    if (!takeable) return false;

    Object.assign(row, { status: 'PROCESSING', createdAt: new Date(), error: null, requestHash });
    return true;
  }

  async complete(
    agentId: string,
    operation: string,
    key: string,
    result: { resultEntity: string; resultEntityId: string; response: unknown }
  ) {
    const row = this.rows.get(this.id(agentId, operation, key));
    if (row) Object.assign(row, { ...result, status: 'COMPLETED' });
  }

  async fail(agentId: string, operation: string, key: string, error: string) {
    const row = this.rows.get(this.id(agentId, operation, key));
    if (row) Object.assign(row, { status: 'FAILED', error });
  }
}

const PARAMS = { agentId: 'agent_1', operation: 'articles.submit', key: 'newsroom-job-20260813-001' };

describe('idempotent article submission', () => {
  let store: MemoryStore;
  let service: IdempotencyService;

  beforeEach(() => {
    store = new MemoryStore();
    service = new IdempotencyService(store);
  });

  /** Counts how many times the underlying work actually ran. */
  function articleWork(id = 'article_1') {
    const work = jest.fn(async () => ({
      entity: 'Article',
      entityId: id,
      response: { id, title: 'Bitcoin ETF inflows rise' },
    }));
    return work;
  }

  it('runs the work on the first call', async () => {
    const work = articleWork();
    const outcome = await service.execute(PARAMS, work);

    expect(work).toHaveBeenCalledTimes(1);
    expect(outcome.replayed).toBe(false);
    expect(outcome.result).toEqual({ id: 'article_1', title: 'Bitcoin ETF inflows rise' });
  });

  it('creates only one article when the same key is used twice', async () => {
    const work = articleWork();

    const first = await service.execute(PARAMS, work);
    const second = await service.execute(PARAMS, work);

    // The whole point: the second call must not create another article.
    expect(work).toHaveBeenCalledTimes(1);
    expect(first.replayed).toBe(false);
    expect(second.replayed).toBe(true);
    expect(second.result).toEqual(first.result);
  });

  it('creates separate articles for different keys', async () => {
    const first = articleWork('article_1');
    const second = articleWork('article_2');

    await service.execute(PARAMS, first);
    await service.execute({ ...PARAMS, key: 'newsroom-job-20260813-002' }, second);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    expect(store.rows.size).toBe(2);
  });

  it('scopes keys per agent, so two agents may use the same string', async () => {
    const first = articleWork('article_1');
    const second = articleWork('article_2');

    await service.execute(PARAMS, first);
    await service.execute({ ...PARAMS, agentId: 'agent_2' }, second);

    expect(second).toHaveBeenCalledTimes(1);
    expect(store.rows.size).toBe(2);
  });

  it('allows a retry after a failure, because nothing was created', async () => {
    const failing = jest.fn(async () => {
      throw new Error('Cloudinary upload failed');
    });

    await expect(service.execute(PARAMS, failing)).rejects.toThrow('Cloudinary upload failed');
    expect((await store.find(PARAMS.agentId, PARAMS.operation, PARAMS.key))?.status).toBe('FAILED');

    const retry = articleWork();
    const outcome = await service.execute(PARAMS, retry);

    expect(retry).toHaveBeenCalledTimes(1);
    expect(outcome.replayed).toBe(false);
  });

  it('refuses a duplicate that arrives while the first is still running', async () => {
    // Simulates two workers picking up the same job simultaneously: the first
    // has claimed the key and has not finished.
    let release: () => void = () => {};
    const slow = jest.fn(
      () =>
        new Promise<{ entity: string; entityId: string; response: unknown }>(resolve => {
          release = () => resolve({ entity: 'Article', entityId: 'article_1', response: { id: 'article_1' } });
        })
    );

    const inFlight = service.execute(PARAMS, slow);
    await Promise.resolve();

    await expect(service.execute(PARAMS, articleWork())).rejects.toThrow(ConflictException);

    release();
    await inFlight;
    expect(slow).toHaveBeenCalledTimes(1);
  });

  it('does not double-create when two callers race the same key', async () => {
    const work = articleWork();

    // Both start before either has claimed; exactly one must win.
    const results = await Promise.allSettled([
      service.execute(PARAMS, work),
      service.execute(PARAMS, work),
    ]);

    const fulfilled = results.filter(r => r.status === 'fulfilled');
    expect(work).toHaveBeenCalledTimes(1);
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    expect(store.rows.size).toBe(1);
  });

  it('refuses a key reused with a different request body', async () => {
    await service.execute({ ...PARAMS, requestBody: { title: 'First story' } }, articleWork());

    await expect(
      service.execute({ ...PARAMS, requestBody: { title: 'A completely different story' } }, articleWork())
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('replays when the same key carries the same body', async () => {
    const body = { title: 'Bitcoin ETF inflows rise', categoryId: 'cat_market' };
    const work = articleWork();

    await service.execute({ ...PARAMS, requestBody: body }, work);
    // Key order differs but the content is identical — must still match.
    const second = await service.execute(
      { ...PARAMS, requestBody: { categoryId: 'cat_market', title: 'Bitcoin ETF inflows rise' } },
      work
    );

    expect(second.replayed).toBe(true);
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('lets an abandoned in-flight request be retried once it is stale', async () => {
    const stalled = jest.fn(() => new Promise<never>(() => {}));
    void service.execute(PARAMS, stalled);
    await Promise.resolve();

    // The worker that claimed this died 20 minutes ago.
    const row = store.rows.get(`${PARAMS.agentId}::${PARAMS.operation}::${PARAMS.key}`)!;
    row.createdAt = new Date(Date.now() - 20 * 60 * 1000);

    const retry = articleWork();
    const outcome = await service.execute(PARAMS, retry);

    expect(retry).toHaveBeenCalledTimes(1);
    expect(outcome.replayed).toBe(false);
  });

  it('hashes request bodies independently of key order', () => {
    expect(IdempotencyService.hashRequest({ a: 1, b: 2 })).toBe(
      IdempotencyService.hashRequest({ b: 2, a: 1 })
    );
    expect(IdempotencyService.hashRequest({ a: 1 })).not.toBe(IdempotencyService.hashRequest({ a: 2 }));
  });
});
