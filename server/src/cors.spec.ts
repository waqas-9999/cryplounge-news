import { Controller, HttpCode, Module, Post, UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { configureApp } from './bootstrap';
import { appConfig, storageConfig } from './config/configuration';

/**
 * Cross-origin access to the API from the admin and public site.
 *
 * ## The production failure this pins
 *
 * Admin login worked on one laptop and failed on every other device with the
 * generic "Login failed. Please try again." The cause was not credentials,
 * cookies or sessions — auth here is a bearer token, so there is no cookie to
 * mis-scope. It was this allowlist.
 *
 * The site answers on both `https://www.cryplounge.com` and the bare
 * `https://cryplounge.com` (the apex does not redirect), while the API lives on
 * `https://api.cryplounge.com`. Production `CORS_ORIGINS` listed only the
 * `www` origin. A browser on the apex sent its preflight, got no
 * `Access-Control-Allow-Origin` back, and refused to make the login request —
 * so `fetch` threw a `TypeError` instead of returning the API's 401, and the
 * login page, which only shows the server's message for a real API error,
 * fell back to the generic one. The laptop worked because it was on `www`.
 *
 * The code was right and stays strict: an explicit list, no wildcard,
 * credentials only for listed origins. These tests drive the real
 * `configureApp` and the real `CORS_ORIGINS` parser, so they fail if either
 * starts accepting origins it was not given — or stops accepting ones it was.
 */

@Controller('auth')
class LoginProbeController {
  /** Stands in for the real login: a wrong password, answered as the API does. */
  @Post('login')
  @HttpCode(401)
  login(): never {
    throw new UnauthorizedException('Invalid email or password');
  }
}

const WWW = 'https://www.cryplounge.com';
const APEX = 'https://cryplounge.com';
const LOGIN = '/api/v1/auth/login';

async function appWith(corsOrigins: string): Promise<NestExpressApplication> {
  process.env.CORS_ORIGINS = corsOrigins;
  // configureApp creates the upload directory off Vercel; keep it out of the repo.
  process.env.UPLOAD_DIR = mkdtempSync(join(tmpdir(), 'cors-spec-'));

  @Module({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig, storageConfig] })],
    controllers: [LoginProbeController],
  })
  class ProbeModule {}

  const moduleRef = await Test.createTestingModule({ imports: [ProbeModule] }).compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
  await configureApp(app);
  await app.init();
  return app;
}

function preflight(app: NestExpressApplication, origin: string) {
  return request(app.getHttpServer())
    .options(LOGIN)
    .set('Origin', origin)
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');
}

/*
 * Each test boots a real Nest application through `configureApp`. That takes
 * a few seconds on its own and longer when Jest runs every suite in parallel,
 * which tipped one test over the 5s default intermittently. The work is real,
 * so the limit is raised rather than the boot faked.
 */
jest.setTimeout(30_000);

describe('CORS: which origins may call the API', () => {
  const saved = { cors: process.env.CORS_ORIGINS, upload: process.env.UPLOAD_DIR };
  let app: NestExpressApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
    // Restore rather than delete: other suites read these too.
    if (saved.cors === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = saved.cors;
    if (saved.upload === undefined) delete process.env.UPLOAD_DIR;
    else process.env.UPLOAD_DIR = saved.upload;
  });

  describe('with the production allowlist covering both site hosts', () => {
    beforeEach(async () => {
      app = await appWith(`${WWW},${APEX}`);
    });

    it('lets the www site call the API with credentials', async () => {
      const res = await preflight(app!, WWW);
      expect(res.headers['access-control-allow-origin']).toBe(WWW);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('lets the bare domain call the API too — the case that broke login', async () => {
      const res = await preflight(app!, APEX);
      expect(res.headers['access-control-allow-origin']).toBe(APEX);
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('allows the Authorization header the bearer-token session depends on', async () => {
      const res = await preflight(app!, APEX);
      expect(res.headers['access-control-allow-headers']).toMatch(/Authorization/);
      expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
    });

    it('lets a wrong password reach the browser as a readable 401, not a network error', async () => {
      // The whole point: the login page shows the server's message for a real
      // API error. A CORS-blocked response is unreadable, so it can't.
      const res = await request(app!.getHttpServer())
        .post(LOGIN)
        .set('Origin', APEX)
        .send({ email: 'nobody@example.invalid', password: 'wrong-password' });
      expect(res.status).toBe(401);
      expect(res.headers['access-control-allow-origin']).toBe(APEX);
    });

    it('still refuses an origin that is not listed', async () => {
      const res = await preflight(app!, 'https://evil.example');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('does not treat a lookalike subdomain as the site', async () => {
      const res = await preflight(app!, 'https://cryplounge.com.evil.example');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('never answers with a wildcard, which credentials would forbid anyway', async () => {
      for (const origin of [WWW, APEX, 'https://evil.example']) {
        const res = await preflight(app!, origin);
        expect(res.headers['access-control-allow-origin']).not.toBe('*');
      }
    });
  });

  describe('with only www listed — the configuration production had', () => {
    beforeEach(async () => {
      app = await appWith(WWW);
    });

    it('refuses the bare domain, which is exactly why login failed there', async () => {
      const res = await preflight(app!, APEX);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('still serves www, which is why one laptop kept working', async () => {
      const res = await preflight(app!, WWW);
      expect(res.headers['access-control-allow-origin']).toBe(WWW);
    });
  });

  describe('parsing CORS_ORIGINS', () => {
    it('tolerates spaces and stray commas around the list', async () => {
      app = await appWith(` ${WWW} , ${APEX} ,`);
      for (const origin of [WWW, APEX]) {
        const res = await preflight(app, origin);
        expect(res.headers['access-control-allow-origin']).toBe(origin);
      }
    });

    it('matches origins exactly, so a trailing slash in the env would not match', async () => {
      // Browsers send the origin without a path. Documented here because it is
      // the easiest way to break this list again without noticing.
      app = await appWith(`${APEX}/`);
      const res = await preflight(app, APEX);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
