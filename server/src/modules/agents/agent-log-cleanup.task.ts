import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';

const RETENTION_DAYS = 90;

/**
 * Trims `AgentRequestLog` to the last 90 days.
 *
 * Every agent call is logged, including high-volume automated ones, so this
 * table grows fast. Nothing downstream reads entries older than a few
 * months — `AiAgent.lastError` already carries the most recent failure — so
 * keeping them costs storage for no benefit.
 */
@Injectable()
export class AgentLogCleanupTask {
  private readonly logger = new Logger(AgentLogCleanupTask.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'cleanup-agent-request-logs' })
  async run(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
      const { count } = await this.prisma.agentRequestLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });
      if (count > 0) {
        this.logger.log(`Removed ${count} agent request log(s) older than ${RETENTION_DAYS} days`);
      }
    } catch (error) {
      this.logger.error(
        'Agent request log cleanup failed',
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
