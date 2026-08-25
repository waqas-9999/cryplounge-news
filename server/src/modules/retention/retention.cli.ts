import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { RetentionService } from './retention.service';

/**
 * Manual retention run.
 *
 *   npm run newsroom:cleanup-drafts -- --dry-run
 *   npm run newsroom:cleanup-drafts -- --days=7 --dry-run
 *   npm run newsroom:cleanup-drafts -- --execute
 *
 * Dry-run is the default and `--execute` is required to write anything, so
 * the command cannot delete because someone forgot a flag. `--dry-run` is
 * still accepted, and still wins if both are given.
 */
async function main(): Promise<void> {
  const logger = new Logger('RetentionCli');
  const args = process.argv.slice(2);

  const execute = args.includes('--execute') && !args.includes('--dry-run');
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const retentionDays = daysArg ? Number.parseInt(daysArg.split('=')[1]!, 10) : undefined;

  if (daysArg && (!Number.isFinite(retentionDays) || retentionDays! < 1)) {
    logger.error(`--days must be a positive integer, got "${daysArg.split('=')[1]}"`);
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });

  try {
    const retention = app.get(RetentionService);

    logger.log(JSON.stringify(await retention.storageReport()));

    if (!retention.enabled) {
      logger.warn('NEWSROOM_RETENTION_ENABLED is false — the sweep will report and change nothing.');
    }

    const summary = await retention.sweep({ dryRun: !execute, retentionDays });

    if (summary.dryRun) {
      logger.log(`DRY RUN — ${summary.eligible} draft(s) would be removed. Nothing was changed.`);
      for (const row of summary.wouldDelete ?? []) {
        logger.log(`  ${row.id}  age=${row.ageDays}d  ${row.title}`);
      }
      logger.log('Re-run with --execute to apply.');
    } else {
      logger.log(`Removed ${summary.deleted} draft(s); ${summary.failed} failed.`);
    }

    process.exitCode = summary.event === 'RETENTION_SCAN_FAILED' ? 1 : 0;
  } finally {
    await app.close();
  }
}

void main();
