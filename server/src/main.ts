import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';

/**
 * Local / traditional-host bootstrap (`npm run start:dev`, `npm run
 * start:prod`). Not used on Vercel — see `api/index.ts` for the serverless
 * entrypoint, which shares this same config via `configureApp`.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });

  await configureApp(app);

  const config = app.get(ConfigService);
  const port = Number(config.get('app.port'));
  const isProduction = Boolean(config.get('app.isProduction'));

  // Lets Nest run onModuleDestroy hooks (Prisma disconnect) on SIGTERM.
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');

  logger.log(`API listening on port ${port} (${isProduction ? 'production' : 'development'})`);
}

bootstrap().catch(error => {
  // Config validation failures land here; the process must not stay up.
  // eslint-disable-next-line no-console
  console.error('Failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
