# Deployment

## Docker (recommended)

```bash
cp .env.example .env   # fill in secrets
docker compose up -d --build
```

`docker-compose.yml` runs Postgres and the API. On boot the API container
runs `prisma migrate deploy` before starting — safe to run on every restart,
a no-op when the schema is already current. Seed roles and permissions once,
against the running container:

```bash
docker compose exec api npm run db:seed
```

## Bare metal / VM

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start:prod
```

Requires Node 22+, a reachable Postgres instance, and every variable in
`.env.example` set. The process exits immediately if env validation fails —
check the logs, not the health endpoint, when a deploy doesn't come up.

## Required environment

See `.env.example` for the full list. In production:

- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate independently, 64+
  random hex characters each. Rotating either invalidates every session.
- `CORS_ORIGINS` — the production frontend origin(s) only. An empty value
  closes CORS entirely rather than defaulting to `*`.
- `SWAGGER_ENABLED` — set `false` in production; the docs UI has no auth of
  its own.
- `UPLOAD_DIR` — must be a persistent volume. Media is stored on local disk,
  not object storage, so losing this directory loses uploaded files.

## Health checks

- `GET /health` — liveness, no dependencies.
- `GET /health/ready` — readiness, checks the database connection. Use this
  one for a load balancer or orchestrator's readiness probe.

## Background jobs

`@nestjs/schedule` runs in-process — there is no separate worker. Running
more than one API instance means these run once per instance:

- Scheduled article publishing, every 5 minutes.
- Agent request log cleanup (90-day retention), daily at 03:00.

Both are idempotent, so duplicate runs across instances are harmless, just
redundant. If the deployment scales beyond a couple of instances, move these
to a single designated instance (e.g. a `WORKER=true` env flag that gates
`ScheduleModule.forRoot()`), rather than running them everywhere.

## AI agents and webhooks

Agents authenticate with `X-Agent-Key` / `X-Agent-Secret` headers, issued via
`POST /api/v1/admin/agents` (requires `agents.manage`). The secret is shown
once in that response and cannot be recovered — only regenerated
(`POST /api/v1/admin/agents/:id/regenerate-secret`), which invalidates the
old one immediately.

Webhook deliveries (`POST /api/v1/admin/webhooks`) are signed with
HMAC-SHA256 over the raw JSON body, sent as `X-Webhook-Signature`. Verify it
before trusting a payload:

```ts
const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
```

Delivery is fire-and-forget from the API's perspective (publishing never
blocks on a receiver) and retries up to 3 times with backoff; failed
attempts are visible via `GET /api/v1/admin/webhooks/:id/deliveries`.
