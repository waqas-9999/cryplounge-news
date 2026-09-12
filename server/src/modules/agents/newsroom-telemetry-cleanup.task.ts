import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Shorter than `AgentRequestLog`'s ninety days, and deliberately so.
 *
 * The newsroom emits roughly 350 events per ten-minute cycle — about 58,000
 * rows a day — so ninety days would be five million rows in a database the live
 * site shares. Telemetry answers "what is the newsroom doing" and "what did it
 * do this week"; nothing reads a fortnight back. The durable record of what was
 * actually produced lives in Article, ResearchReport and AIJob, none of which
 * this touches.
 */
const RETENTION_DAYS = 7;

/**
 * Trims `NewsroomEvent` to the last week.
 *
 * Deletes operational telemetry and nothing else. Editorial records —
 * articles, clusters, research reports, drafts, jobs, request logs, analytics —
 * have their own lifecycles and are not in scope here, which is why this is a
 * separate task rather than another branch inside the agent-log sweep.
 */
@Injectable()
export class NewsroomTelemetryCleanupTask {
  private readonly logger = new Logger(NewsroomTelemetryCleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'cleanup-newsroom-telemetry' })
  async run(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

      /*
       * Cut on `createdAt`, not `occurredAt`.
       *
       * `occurredAt` is when the newsroom observed the event and can be older
       * than arrival — a buffer that retried for an hour delivers events with
       * past timestamps. Retention is about how long the CMS keeps a row, so it
       * measures from when the row appeared, and the index supports it.
       */
      const { count } = await this.prisma.newsroomEvent.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (count > 0) {
        this.logger.log(`Removed ${count} newsroom event(s) older than ${RETENTION_DAYS} days`);
      }
    } catch (error) {
      // Never rethrow: a failed sweep is a storage problem for tomorrow's run,
      // not a reason to take down the scheduler.
      this.logger.error(
        'Newsroom telemetry cleanup failed',
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}

export { RETENTION_DAYS as TELEMETRY_RETENTION_DAYS };
