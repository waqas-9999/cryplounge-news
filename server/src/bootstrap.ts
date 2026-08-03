import { mkdir } from 'node:fs/promises';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { buildValidationPipe } from './common/pipes/validation.pipe';

/**
 * Shared app configuration, used by both the local long-running server
 * (`main.ts`, which calls `app.listen()` after this) and the Vercel
 * serverless entrypoint (`api/index.ts`, which calls `app.init()` instead —
 * Vercel's Node runtime owns the socket, not Nest).
 *
 * Static upload serving is skipped on Vercel: the function filesystem is
 * read-only outside `/tmp` and is not shared across invocations, so
 * `mkdir`/`useStaticAssets` against `UPLOAD_DIR` would either throw at boot
 * or silently serve nothing. See server/DEPLOYMENT.md for what replacing
 * local disk storage with a real object store requires.
 */
export async function configureApp(app: NestExpressApplication): Promise<void> {
  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);
  const corsOrigins = config.get<string[]>('app.corsOrigins') ?? [];
  const uploadDir = String(config.get('storage.uploadDir'));
  const isVercel = Boolean(process.env.VERCEL);

  if (!isVercel) {
    // Media lives on the local disk; the directory must exist before the
    // health check or the first upload runs. Not possible on Vercel's
    // read-only function filesystem.
    await mkdir(uploadDir, { recursive: true });

    // MediaService/LocalStorageProvider hand back URLs of the form
    // `/uploads/<path>` — this is what actually serves them.
    app.useStaticAssets(uploadDir, { prefix: '/uploads/' });
  } else {
    logger.warn(
      'Running on Vercel: local-disk media storage is disabled (ephemeral filesystem). ' +
        'Uploads will fail until MediaModule is switched to a cloud storage provider.'
    );
  }

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
        .addBearerAuth(
          { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Admin/editorial user access token' },
          'bearer'
        )
        .addApiKey(
          { type: 'apiKey', name: 'X-Agent-Key', in: 'header', description: 'Agent API key' },
          'agent-key'
        )
        .addApiKey(
          { type: 'apiKey', name: 'X-Agent-Secret', in: 'header', description: 'Agent API secret' },
          'agent-secret'
        )
        .build()
    );
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log('Swagger UI at /docs');
  }

  logger.log(`CORS origins: ${corsOrigins.join(', ') || 'none'}`);
}
