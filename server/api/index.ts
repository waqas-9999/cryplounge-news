import 'reflect-metadata';

import type { IncomingMessage, ServerResponse } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express, { type Express } from 'express';
// Compiled output, not `../src/*`: Vercel's default function bundler uses
// esbuild, which does not reliably emit `emitDecoratorMetadata` for Nest's
// constructor-parameter DI (confirmed locally — bundling straight from `src`
// resolved `AuthService`'s constructor args as `undefined`). Importing the
// `nest build` (tsc) output sidesteps that entirely; this file itself has no
// decorators, so esbuild bundling *this* shim is safe.
import { AppModule } from '../dist/app.module';
import { configureApp } from '../dist/bootstrap';

/**
 * Vercel serverless entrypoint.
 *
 * Every existing Nest module, controller, guard, pipe and the `/api/v1`
 * prefix come from `AppModule`/`configureApp` unchanged — nothing here
 * duplicates or replaces application code. The only difference from
 * `src/main.ts` is *how* the Express instance receives requests:
 *
 *   main.ts    → app.listen(port)           (Nest/Node owns the socket)
 *   api/index.ts → exported (req, res) fn   (Vercel owns the socket, and
 *                                             calls this function per request)
 *
 * `NestFactory.create` is given a pre-built Express app via `ExpressAdapter`
 * so that app itself — which is directly callable as `(req, res)` — can be
 * exported as the Vercel handler. No extra adapter package is needed.
 *
 * The Nest application is built once per warm serverless instance and
 * reused (`bootstrapPromise`), the same way a Prisma client is normally
 * cached across invocations — this avoids re-running module init (and
 * reopening the Prisma connection) on every request.
 *
 * Requires `npm run build` (nest build / tsc) to have produced `dist/`
 * before this function is bundled — see `vercel.json`'s `buildCommand`.
 */
const expressApp: Express = express();
let bootstrapPromise: Promise<NestExpressApplication> | null = null;

function bootstrapServer(): Promise<NestExpressApplication> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const app = await NestFactory.create<NestExpressApplication>(
        AppModule,
        new ExpressAdapter(expressApp),
        { bufferLogs: true }
      );
      await configureApp(app);
      await app.init();
      return app;
    })().catch(error => {
      // Don't cache a failed bootstrap attempt — the next invocation should retry.
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await bootstrapServer();
  expressApp(req, res);
}
