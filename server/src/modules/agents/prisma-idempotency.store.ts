import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import {
  DuplicateKeyError,
  type IdempotencyRecord,
  type IdempotencyStore,
} from './idempotency.service';

/** Prisma's code for a unique-constraint violation. */
const UNIQUE_VIOLATION = 'P2002';

/**
 * `AgentIdempotencyKey`-backed store.
 *
 * The concurrency guarantees live in the database, not in this class:
 *
 *  - `claim` relies on the unique index over (agentId, operation, key). Two
 *    workers inserting the same key at the same instant cannot both succeed;
 *    the loser gets P2002, which is surfaced as `DuplicateKeyError`.
 *  - `reclaim` is a single conditional `updateMany`. Reading the row and then
 *    updating it would let two workers retrying the same failed job both pass
 *    the read and both create an article — exactly the bug this exists to
 *    prevent. The `where` clause *is* the lock.
 */
@Injectable()
export class PrismaIdempotencyStore implements IdempotencyStore {
  constructor(private readonly prisma: PrismaService) {}

  async claim(
    record: Pick<IdempotencyRecord, 'agentId' | 'operation' | 'key' | 'requestHash'>
  ): Promise<void> {
    try {
      await this.prisma.agentIdempotencyKey.create({
        data: {
          agentId: record.agentId,
          operation: record.operation,
          key: record.key,
          requestHash: record.requestHash ?? null,
          status: 'PROCESSING',
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_VIOLATION) {
        throw new DuplicateKeyError();
      }
      throw error;
    }
  }

  async find(agentId: string, operation: string, key: string): Promise<IdempotencyRecord | null> {
    const row = await this.prisma.agentIdempotencyKey.findUnique({
      where: { agentId_operation_key: { agentId, operation, key } },
    });
    if (!row) return null;

    return {
      agentId: row.agentId,
      operation: row.operation,
      key: row.key,
      status: row.status,
      resultEntity: row.resultEntity,
      resultEntityId: row.resultEntityId,
      response: row.response,
      error: row.error,
      requestHash: row.requestHash,
      // Consumed by the staleness check, so an abandoned lock can be taken over.
      createdAt: row.createdAt,
    } as IdempotencyRecord;
  }

  /**
   * Takes over a FAILED or abandoned row, atomically.
   *
   * `updateMany` with the state predicate in `where` compiles to a single
   * `UPDATE … WHERE status = 'FAILED' OR (status = 'PROCESSING' AND createdAt < $stale)`.
   * Postgres applies row-level locking, so of two concurrent callers exactly
   * one sees `count === 1` and the other sees `0`.
   */
  async reclaim(
    agentId: string,
    operation: string,
    key: string,
    requestHash: string | null,
    staleBefore: Date
  ): Promise<boolean> {
    const { count } = await this.prisma.agentIdempotencyKey.updateMany({
      where: {
        agentId,
        operation,
        key,
        OR: [
          { status: 'FAILED' },
          // An abandoned lock: claimed, then the worker died without settling it.
          { status: 'PROCESSING', createdAt: { lt: staleBefore } },
        ],
      },
      data: {
        status: 'PROCESSING',
        createdAt: new Date(),
        error: null,
        requestHash,
        resultEntity: null,
        resultEntityId: null,
        response: Prisma.DbNull,
        completedAt: null,
      },
    });

    return count === 1;
  }

  async complete(
    agentId: string,
    operation: string,
    key: string,
    result: { resultEntity: string; resultEntityId: string; response: unknown }
  ): Promise<void> {
    await this.prisma.agentIdempotencyKey.update({
      where: { agentId_operation_key: { agentId, operation, key } },
      data: {
        status: 'COMPLETED',
        resultEntity: result.resultEntity,
        resultEntityId: result.resultEntityId,
        response: (result.response ?? Prisma.DbNull) as Prisma.InputJsonValue,
        error: null,
        completedAt: new Date(),
      },
    });
  }

  async fail(agentId: string, operation: string, key: string, error: string): Promise<void> {
    await this.prisma.agentIdempotencyKey.update({
      where: { agentId_operation_key: { agentId, operation, key } },
      data: {
        status: 'FAILED',
        // Bounded: a stack trace or provider payload could be very large, and
        // this column exists to explain a failure, not to archive it.
        error: error.slice(0, 2000),
        completedAt: new Date(),
      },
    });
  }
}
