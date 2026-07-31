import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticlesService } from './articles.service';

/**
 * Publishes articles whose scheduled time has arrived.
 *
 * Runs every five minutes rather than every minute: publishing is not
 * second-sensitive, and a wider interval means fewer wake-ups on an idle box.
 * The job is idempotent, so a missed or repeated run is harmless.
 */
@Injectable()
export class ScheduledPublishTask {
  private readonly logger = new Logger(ScheduledPublishTask.name);

  constructor(private readonly articles: ArticlesService) {}

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'publish-scheduled-articles' })
  async run(): Promise<void> {
    try {
      const published = await this.articles.publishDueScheduled();
      if (published > 0) {
        this.logger.log(`Published ${published} scheduled article(s)`);
      }
    } catch (error) {
      // A failed run must not stop the scheduler from trying again.
      this.logger.error(
        'Scheduled publishing run failed',
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
