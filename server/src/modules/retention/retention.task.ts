import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RetentionService } from './retention.service';

/**
 * The one scheduled trigger for draft retention.
 *
 * Deliberately the only timer: `ScheduleModule` is already registered and
 * `AgentLogCleanupTask` sets the precedent for a nightly cleanup, so this
 * follows it rather than introducing a second scheduling mechanism. Running
 * at 4am leaves the 3am log cleanup to finish first.
 *
 * Idempotent by construction — a second run finds the rows it removed already
 * carrying `deletedAt` and skips them — so a duplicate invocation is harmless.
 */
@Injectable()
export class RetentionTask {
  private readonly logger = new Logger(RetentionTask.name);

  constructor(private readonly retention: RetentionService) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM, { name: 'newsroom-draft-retention' })
  async run(): Promise<void> {
    if (!this.retention.enabled) return;

    try {
      this.logger.log(JSON.stringify(await this.retention.storageReport()));
      await this.retention.sweep();
    } catch (error) {
      // `sweep` handles its own failures; this catches anything the report or
      // the scheduler itself throws, so a bad night cannot kill the timer.
      this.logger.error(
        JSON.stringify({
          event: 'RETENTION_SCAN_FAILED',
          error: error instanceof Error ? error.message : String(error),
        })
      );
    }
  }
}
