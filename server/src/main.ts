import 'reflect-metadata';

import { mkdir } from 'node:fs/promises';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { buildValidationPipe } from './common/pipes/validation.pipe';

/**
 * Bootstrap.
 *
 * Order is deliberate: security headers before anything renders, body limits
 * before parsing, validation before controllers, and shutdown hooks last so
 * in-flight requests drain on SIGTERM instead of being cut off mid-write.
 */
async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(ConfigService);
  const port = Number(config.get('app.port'));
  const isProduction = Boolean(config.get('app.isProduction'));
  const corsOrigins = config.get<string[]>('app.corsOrigins') ?? [];
  const uploadDir = String(config.get('storage.uploadDir'));

  // Media lives on the local disk; the directory must exist before the health
  // check or the first upload runs.
  await mkdir(uploadDir, { recursive: true });

  app.use(
    helmet({
      // The API serves JSON and static uploads, never HTML, so CSP here would
      // only constrain the images it hands back.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(compression());

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Agent-Key', 'X-Agent-Secret'],
  });

  app.setGlobalPrefix('api', { exclude: ['health', 'health/ready'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(buildValidationPipe());

  if (config.get('app.swaggerEnabled')) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('CrypLounge API')
        .setDescription(
          'Editorial platform API. Public read endpoints power the site; ' +
            'admin endpoints require a bearer token; agent endpoints authenticate ' +
            'with an API key and secret.'
        )
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', name: 'X-Agent-Key', in: 'header' }, 'agent-key')
        .build()
    );
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger UI at /api/docs`);
  }

  // Lets Nest run onModuleDestroy hooks (Prisma disconnect) on SIGTERM.
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');

  logger.log(`API listening on port ${port} (${isProduction ? 'production' : 'development'})`);
  logger.log(`CORS origins: ${corsOrigins.join(', ') || 'none'}`);
}

bootstrap().catch(error => {
  // Config validation failures land here; the process must not stay up.
  // eslint-disable-next-line no-console
  console.error('Failed to start:', error instanceof Error ? error.message : error);
  process.exit(1);
});
