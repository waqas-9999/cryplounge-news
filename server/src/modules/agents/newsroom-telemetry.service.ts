import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  MAX_METADATA_BYTES,
  MAX_METADATA_DEPTH,
  metadataDepth,
  type TelemetryEventDto,
} from './dto/submit-telemetry.dto';

export interface TelemetryIngestResult {
  /** Events accepted into the table by this request. */
  stored: number;
  /** Events already present, identified by the id the newsroom assigned. */
  duplicates: number;
}

/**
 * Persists newsroom telemetry.
 *
 * ## Append-only, on purpose
 *
 * Insert is the only operation. There is no update, no delete (retention is a
 * separate scheduled task), and no read — the agent permission that reaches
 * this service grants writing telemetry and nothing else, and the service
 * matches that rather than relying on the route to restrain it.
 *
 * ## Deduplication without a second table
 *
 * Each event carries an id the newsroom generated once, when the event entered
 * its delivery buffer, and reuses on every retry. So a redelivered batch
 * collides on the primary key, and `skipDuplicates` turns that collision into
 * the correct outcome instead of an error. The count of skipped rows is
 * returned rather than hidden: a caller retrying correctly should be able to
 * see that its retry was understood.
 *
 * That makes the whole batch idempotent at row level, which matters because
 * batches can overlap — a retry after a partial failure may contain events the
 * table already holds alongside events it does not.
 */
@Injectable()
export class NewsroomTelemetryService {
  private readonly logger = new Logger(NewsroomTelemetryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ingest(events: TelemetryEventDto[], agentName?: string): Promise<TelemetryIngestResult> {
    for (const event of events) this.assertMetadataWithinLimits(event);

    /*
     * Duplicate ids inside one batch would make `createMany` fail as a whole,
     * and a delivery buffer that retried while flushing can produce them. The
     * first occurrence wins; the rest are counted as duplicates, which is what
     * they are.
     */
    const seen = new Set<string>();
    const unique: TelemetryEventDto[] = [];
    let inBatchDuplicates = 0;

    for (const event of events) {
      if (seen.has(event.id)) {
        inBatchDuplicates += 1;
        continue;
      }
      seen.add(event.id);
      unique.push(event);
    }

    const result = await this.prisma.newsroomEvent.createMany({
      data: unique.map(event => ({
        id: event.id,
        type: event.type,
        occurredAt: new Date(event.occurredAt),
        workflowId: event.workflowId ?? null,
        clusterId: event.clusterId ?? null,
        articleId: event.articleId ?? null,
        stage: event.stage ?? null,
        status: event.status ?? null,
        source: event.source ?? null,
        model: event.model ?? null,
        durationMs: event.durationMs ?? null,
        metadata: (event.metadata ?? null) as never,
      })),
      skipDuplicates: true,
    });

    const duplicates = unique.length - result.count + inBatchDuplicates;

    if (duplicates > 0) {
      // Expected during retries, so info rather than warn. Logged because a
      // persistently high duplicate rate means a buffer is not advancing.
      this.logger.log(
        `Telemetry from ${agentName ?? 'agent'}: stored ${result.count}, skipped ${duplicates} duplicate(s)`
      );
    }

    return { stored: result.count, duplicates };
  }

  /**
   * Size and shape limits on `metadata`.
   *
   * Checked here rather than by a validator decorator because both limits need
   * the serialised form, and because the failure has to name which event was at
   * fault — a batch of 200 rejected with "metadata too large" and no index is
   * not a debuggable error for whoever wrote the emit call.
   */
  private assertMetadataWithinLimits(event: TelemetryEventDto): void {
    if (!event.metadata) return;

    const serialised = JSON.stringify(event.metadata);

    if (Buffer.byteLength(serialised, 'utf8') > MAX_METADATA_BYTES) {
      throw new BadRequestException({
        message: `Event ${event.type} metadata exceeds ${MAX_METADATA_BYTES} bytes`,
        code: 'TELEMETRY_METADATA_TOO_LARGE',
      });
    }

    if (metadataDepth(event.metadata) > MAX_METADATA_DEPTH) {
      throw new BadRequestException({
        message: `Event ${event.type} metadata nests deeper than ${MAX_METADATA_DEPTH} levels`,
        code: 'TELEMETRY_METADATA_TOO_DEEP',
      });
    }
  }
}
