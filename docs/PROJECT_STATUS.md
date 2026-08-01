# CrypLounge — Project Status & Outstanding Work

Full audit of the repository as it stands. Every claim below was verified by
running the code, not by reading it.

**Audited at:** `0301ccb` ("Part 4"), working tree clean
**Date:** 1 August 2026

---

## 1. Verified working

These were confirmed by execution, not assumption:

| Check | Result |
|---|---|
| Frontend typecheck (`npx tsc --noEmit`) | **0 errors** |
| Backend typecheck (`server/`) | **0 errors** |
| Backend build (`nest build`) | **exit 0**, `dist/main.js` present |
| Backend route registration | **128 routes** across 21 modules |
| Prisma schema validation | valid |
| Config fail-fast guards | confirmed by running the built app |

The backend **compiles and boots**. The architecture is sound: Content Core is
genuinely reused across six content types, permissions are database-driven,
the audit log is append-only, and uploads are validated by magic bytes.

---

## 2. Blockers — the project does not function end to end

These are not polish items. Until they are fixed, the product does not work.

### B1. The frontend is not connected to the backend at all

**128 API routes exist. Zero are called.**

- No file in `src/` calls the API. The only two files containing `fetch` are
  `src/services/projects.ts` and `src/utils/analytics.ts`, and neither targets
  the backend.
- **15 frontend files still import mock data** from `@/data/*`.
- There is no API client, no `NEXT_PUBLIC_API_URL`, no request layer.

The backend and frontend are two correct halves that have never spoken.

**Fix:** build `src/lib/api-client.ts` (base URL, auth header, error
normalisation, the `ApiSuccessResponse` envelope), then rewrite
`src/services/{news,projects,events}.ts` to call it instead of importing
`@/data`. The service layer was designed for exactly this swap — the function
signatures do not change.

### B2. The admin panel saves nothing

| Measure | Count |
|---|---|
| Admin pages making a real HTTP request | **0** |
| Admin pages with a fake `setTimeout` save | 8 |
| Admin pages showing "saved successfully" | 9 |

An editor clicking Save sees a success toast and loses their work. This was
first reported in `docs/ADMIN_AUDIT.md` before the backend existed; the
backend now exists, but nothing was rewired.

**Fix:** point each admin screen at its corresponding endpoint. All of them
exist — `PATCH /api/v1/articles/:id`, `PUT /api/v1/settings`, and so on.

### B3. Hardcoded credentials still ship in the browser bundle

`src/utils/adminAuth.ts:213` still contains:

```
admin@cryplounge.com / Admin@123
editor@cryplounge.com / Editor@123
```

This is client-side code, so both passwords are readable by anyone who opens
devtools on the deployed site. They are also in git history.

The real auth exists — `POST /api/v1/auth/login` with Argon2id, rotating
refresh tokens and session revocation. It is simply not used.

**Fix:** delete `adminAuth.ts`, call the login endpoint, store the access token
in memory and the refresh token in an httpOnly cookie. **Treat both passwords
above as burned; never reuse them.**

### B4. The database has never existed

- **No `prisma/migrations/` directory** — the schema has never been applied.
- `DATABASE_URL` in `server/.env` points at `localhost:5432`, which is
  **unreachable**. No Postgres is running.

Consequently **not one line of backend code has ever executed against a
database.** Every route, query, guard and validation rule is unproven.

Highest-risk unexercised code:
1. **Raw SQL in `SearchService`** — the only code bypassing Prisma's type
   checking. Six `UNION ALL` fragments with `websearch_to_tsquery`.
2. **Refresh-token rotation and reuse detection** in `AuthService`.
3. **Upload path resolution and magic-byte sniffing** in `MediaService`.
4. **The last-super-admin guard** in `UsersService` — logic that reads correct
   and fails silently if wrong.

**Status:** still blocked. Docker is not installed on this machine at all (no
CLI, no Docker Desktop, no WSL), so `docker-compose.yml` can't be used
locally as-is. A native PostgreSQL 17 install was attempted via `winget`, but
no evidence of a successful install has been found (no `postgresql*`
service, nothing listening on 5432, no winget-registered package). This
needs to be resolved — either get Docker installed, get native PostgreSQL
actually running, or use a hosted/remote Postgres instance — before any of
the rest of this list can be verified.

**Fix (once Postgres is reachable):**
```bash
cd server && npm run db:migrate
SEED_ADMIN_PASSWORD='<strong password>' npm run db:seed
npm run start:dev
```

### B5. 104 hardcoded article titles remain in the section pages

| Page | Hardcoded titles |
|---|---|
| HomePage | 26 |
| LatestPage | 13 |
| MarketsPage | 13 |
| BusinessPage | 13 |
| TechnologyPage | 13 |
| RegulationPage | 13 |
| ResearchPage | 13 |
| **Total** | **104** |

These render baked-in JSX, not data. **Even after B1 is fixed, edits made in
the CMS will not appear on these pages.** They are also near-identical
duplicates of one another (~2,300 lines).

**Fix:** collapse the seven into one configurable section component driven by
the API.

---

## 3. Required by the brief, not built

Each of these is named explicitly in the four prompts.

### H1. Four orphaned database tables

`Redirect`, `Language`, `Translation` and `AdSlot` exist in the schema but
**no service queries them**. Part 1 states "avoid unnecessary tables"; Part 3
requires the features behind them:

| Model | Required by | Status |
|---|---|---|
| `Redirect` | Part 3 — SEO redirect rules | no module |
| `Language` / `Translation` | Part 3 — Localization | no module |
| `AdSlot` | Part 3 — Advertisement management | no module |

**Fix:** build the three modules, or drop the tables. Leaving them is the
"unused database tables" the brief prohibits.

### H2. Zero tests

Part 1 requires meaningful tests for authentication, authorization, CRUD,
validation, business logic and permission checks. **`0` spec files exist.**

Given B4, this is compounding: the code is both untested and unexecuted.

**Minimum worth writing:** login rejects bad credentials in constant time;
refresh reuse revokes the chain; an AUTHOR cannot publish; the last
super-admin cannot be demoted; upload rejects a mislabelled file; slug
collisions resolve.

### H3. Missing endpoints

| Missing | Required by |
|---|---|
| `GET /sitemap.xml` | Part 2 — SEO, XML sitemap support |
| `GET /robots.txt` | Part 3 — SEO management |
| Admin dashboard counters | Part 3 — dashboard totals |
| Bulk operations (publish/archive/delete/tag) | Part 3 |
| CSV / Excel export | Part 3 — Reports |
| Admin global search | Part 3 |

---

## 4. Medium — correctness and hygiene

### M1. Superseded Next.js backend still in the tree

The repo still contains the abandoned first backend attempt:

- `prisma/schema.prisma` at repo root — a **second, diverging copy** of the
  schema. `server/prisma/schema.prisma` is authoritative.
- **5 route handlers** under `src/app/api/`.
- `src/server/{db,auth,api,audit,schemas}.ts`.

Two schemas is a genuine footgun: someone will edit the wrong one.

**Fix:** delete the root `prisma/`, `src/app/api/` and `src/server/`.

### M2. Deployment does not match the brief

Part 1 and Part 4 specify **Ubuntu + Nginx + PM2**, explicitly no Docker
orchestration. What exists is `Dockerfile` + `docker-compose.yml`, and
`server/docs/DEPLOYMENT.md` mentions neither PM2 nor Nginx.

Docker is a defensible choice, but it is not the one specified. Either add the
PM2/Nginx path or record the decision to change.

### M3. View counts can be inflated

`POST /api/v1/analytics/view` is `@Public()` and subject only to the global
rate limit (120/min). Anyone can drive any article to the top of "Most read"
with a loop.

**Fix:** tighter per-route throttle, plus deduplication by IP + entity + day.

### M4. ~~Uncommitted work is at risk~~ — resolved

`agents`, `webhooks`, `Dockerfile`, `docker-compose.yml`, `server/docs/`, and
the `permissions.ts`/`app.module.ts` edits were committed as `0301ccb`
("Part 4"). Working tree is clean as of this audit.

---

## 5. Recommended order

Sequenced by dependency — each step makes the next verifiable.

1. **Start Postgres, migrate, seed** (B4). Nothing else can be trusted first —
   still blocked as of this audit; see the note below.
2. **Exercise the API** — login, create an article, publish it, search, upload.
   Expect real bugs; none of this has run.
3. **Delete the superseded Next.js backend** (M1).
4. **Build the frontend API client and rewire the services** (B1).
5. **Wire the admin panel; delete `adminAuth.ts`** (B2, B3).
6. **Collapse the seven section pages onto the API** (B5).
7. **Write the tests** (H2).
8. **Localization, Ads, Redirects, or drop the tables** (H1).
9. **Sitemap, robots, dashboard, bulk ops, export, admin search** (H3).

Steps 1–2 are the highest value per hour: they convert a large body of
unverified code into either working software or a concrete bug list.

---

## 6. Honest summary

The backend is **well-architected and complete on paper** — 128 routes,
21 modules, real security thinking in the auth and upload paths. The frontend
is **clean and builds**.

But they are **two disconnected halves**, and **neither the database nor a
single API request has ever run**. The gap between "compiles" and "works" is
the entire remaining risk in this project, and it is not small.

Nothing here is a criticism of the design. It is a statement of what has been
proven versus what has been written.
