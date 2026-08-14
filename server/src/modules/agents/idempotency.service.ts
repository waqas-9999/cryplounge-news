import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';

/**
 * DI token for the store. `IdempotencyStore` is an interface and so erased at
 * runtime; Nest needs a concrete token to resolve the provider.
 */
export const IDEMPOTENCY_STORE = Symbol('IDEMPOTENCY_STORE');

/**
 * Idempotent execution for agent submissions.
 *
 * The problem: AI workflows retry. A timeout, a worker restart, a scheduler
 * firing twice or a webhook redelivery all replay a request whose first
 * attempt may already have succeeded. Without a record of that, every retry
 * creates another article.
 *
 * The mechanism is a unique constraint, not a lookup. Two concurrent callers
 * both race to claim the same key; the database lets exactly one win and the
 * loser sees a unique-constraint violation, which is treated as "already in
 * flight". A read-then-write check would leave a window in which both callers
 * see nothing and both proceed — which is precisely the failure being fixed.
 *
 * The store is an interface so this logic is testable without a database, and
 * so the migration is not a prerequisite for using it.
 */

export type IdempotencyStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IdempotencyRecord {
  agentId: string;
  operation: string;
  key: string;
  status: IdempotencyStatus;
  resultEntity?: string | null;
  resultEntityId?: string | null;
  response?: unknown;
  error?: string | null;
  requestHash?: string | null;
}

/** Thrown by a store when the unique constraint rejects a claim. */
export class DuplicateKeyError extends Error {
  constructor() {
    super('Idempotency key already claimed');
    this.name = 'DuplicateKeyError';
  }
}

export interface IdempotencyStore {
  /** Inserts a PROCESSING row. Must throw `DuplicateKeyError` if it exists. */
  claim(record: Pick<IdempotencyRecord, 'agentId' | 'operation' | 'key' | 'requestHash'>): Promise<void>;
  /**
   * Takes over an existing row that is FAILED or abandoned, moving it back to
   * PROCESSING. Returns false if another worker got there first.
   *
   * Must be a single conditional update (`WHERE status = 'FAILED' OR ...`), not
   * a read followed by a write — two workers retrying the same failed job at
   * once would otherwise both succeed and both create an article.
   */
  reclaim(
    agentId: string,
    operation: string,
    key: string,
    requestHash: string | null,
    staleBefore: Date
  ): Promise<boolean>;
  find(agentId: string, operation: string, key: string): Promise<IdempotencyRecord | null>;
  complete(
    agentId: string,
    operation: string,
    key: string,
    result: { resultEntity: string; resultEntityId: string; response: unknown }
  ): Promise<void>;
  fail(agentId: string, operation: string, key: string, error: string): Promise<void>;
}

export interface IdempotentOutcome<T> {
  result: T;
  /** True when this call replayed a stored result instead of doing the work. */
  replayed: boolean;
}

/**
 * A submission still marked PROCESSING after this long is treated as abandoned
 * — the worker that claimed it died before completing or failing. Without a
 * cutoff, one crashed job would block that key permanently.
 */
const STALE_PROCESSING_MS = 15 * 60 * 1000;

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);

  constructor(@Inject(IDEMPOTENCY_STORE) private readonly store: IdempotencyStore) {}

  /** Stable fingerprint of a request body, with key order normalised. */
  static hashRequest(body: unknown): string {
    return createHash('sha256').update(stableStringify(body)).digest('hex');
  }

  /**
   * Runs `work` at most once per (agent, operation, key).
   *
   * - First call: claims the key, runs the work, stores the result.
   * - Repeat after success: returns the stored result without re-running.
   * - Repeat while in flight: refuses with 409 rather than duplicating.
   * - Repeat after failure: retries, because a failure left nothing behind.
   */
  async execute<T>(
    params: { agentId: string; operation: string; key: string; requestBody?: unknown },
    work: () => Promise<{ entity: string; entityId: string; response: T }>
  ): Promise<IdempotentOutcome<T>> {
    const { agentId, operation, key } = params;
    const requestHash =
      params.requestBody === undefined ? null : IdempotencyService.hashRequest(params.requestBody);

    const existing = await this.store.find(agentId, operation, key);

    if (existing) {
      const replay = this.replayIfSettled<T>(existing, requestHash, key);
      if (replay) return replay;

      // Not settled: the previous attempt failed, or was abandoned mid-flight.
      // The row already exists, so `claim` would hit the unique constraint —
      // it has to be taken over instead.
      const tookOver = await this.store.reclaim(
        agentId,
        operation,
        key,
        requestHash,
        new Date(Date.now() - STALE_PROCESSING_MS)
      );

      if (!tookOver) {
        throw new ConflictException({
          message: `A request with idempotency key "${key}" is already being processed`,
          code: 'IDEMPOTENCY_IN_PROGRESS',
        });
      }
    } else {
      try {
        await this.store.claim({ agentId, operation, key, requestHash });
      } catch (error) {
        if (!(error instanceof DuplicateKeyError)) throw error;

        // Lost the race to insert. Re-read: the winner may already have
        // finished, in which case this call can legitimately replay it.
        const winner = await this.store.find(agentId, operation, key);
        if (winner) {
          const replay = this.replayIfSettled<T>(winner, requestHash, key);
          if (replay) return replay;
        }
        throw new ConflictException({
          message: `A request with idempotency key "${key}" is already being processed`,
          code: 'IDEMPOTENCY_IN_PROGRESS',
        });
      }
    }

    try {
      const outcome = await work();
      await this.store.complete(agentId, operation, key, {
        resultEntity: outcome.entity,
        resultEntityId: outcome.entityId,
        response: outcome.response,
      });
      return { result: outcome.response, replayed: false };
    } catch (error) {
      // Recorded as FAILED rather than deleted, so the failure is visible and
      // a later retry is a deliberate re-attempt rather than a fresh unknown.
      const message = error instanceof Error ? error.message : String(error);
      await this.store.fail(agentId, operation, key, message).catch(() => undefined);
      throw error;
    }
  }

  /**
   * Decides what a repeat call gets, given an existing record.
   *
   * Returns null when the caller should proceed — i.e. the previous attempt
   * failed, or was abandoned mid-flight.
   */
  private replayIfSettled<T>(
    record: IdempotencyRecord,
    requestHash: string | null,
    key: string
  ): IdempotentOutcome<T> | null {
    // A key reused for different content is a caller bug. Returning the old
    // article would silently discard the new submission, so it is refused.
    if (requestHash && record.requestHash && record.requestHash !== requestHash) {
      throw new UnprocessableEntityException({
        message: `Idempotency key "${key}" was already used with a different request body`,
        code: 'IDEMPOTENCY_KEY_REUSED',
      });
    }

    if (record.status === 'COMPLETED') {
      this.logger.log({ key, entityId: record.resultEntityId }, 'Replaying stored idempotent result');
      return { result: record.response as T, replayed: true };
    }

    if (record.status === 'PROCESSING') {
      if (this.isStale(record)) {
        this.logger.warn({ key }, 'Idempotency record is stale; allowing a retry');
        return null;
      }
      throw new ConflictException({
        message: `A request with idempotency key "${key}" is already being processed`,
        code: 'IDEMPOTENCY_IN_PROGRESS',
      });
    }

    // FAILED: nothing was created, so retrying is safe and expected.
    return null;
  }

  private isStale(record: IdempotencyRecord & { createdAt?: Date }): boolean {
    if (!record.createdAt) return false;
    return Date.now() - record.createdAt.getTime() > STALE_PROCESSING_MS;
  }
}

/** JSON with object keys sorted, so key order never changes the hash. */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);

  return `{${entries.join(',')}}`;
}
