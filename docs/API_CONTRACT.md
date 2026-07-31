# Backend API Contract — Frontend Audit

Mandatory first step of the backend brief: audit the frontend and derive the
API it requires. The frontend is the specification; this document is what the
NestJS service must deliver.

Audited at `c25c089`. All paths are prefixed `/api/v1`.

---

## Architecture decision recorded

The backend is a **separate NestJS service**, not Next.js Route Handlers.

Consequence to plan around: the Next.js frontend caches aggressively (136
prerendered routes). With the API out-of-process, publishing must trigger
revalidation explicitly — Nest calls a signed revalidation webhook on the
frontend after any publish/update/delete. Without it, editors publish and the
public site keeps serving stale HTML. This is the single most important
integration point between the two services.

The existing `src/app/api/*` and `src/server/*` in the Next app are superseded
and are removed once Nest reaches parity. `prisma/schema.prisma` moves to the
Nest service and is extended, not rewritten.

---

## 1. Public read endpoints

Every one maps to a page that exists today.

| Frontend page | Endpoint | Notes |
|---|---|---|
| `/` | `GET /home` | Resolved homepage sections, in admin-configured order |
| `/news` | `GET /articles` | Paginated, published only |
| `/news/[category]` | `GET /articles?category=` | Desk listing |
| `/news/[category]/[slug]` | `GET /articles/slug/:slug` | Full article + all relations |
| `/ecosystem` | `GET /ecosystem/overview` | Featured, trending, recent, editor's picks, collections, facet counts — one call, not nine |
| `/ecosystem/[slug]` | `GET /projects/slug/:slug` | Profile + related news/research/regulation/events/founders/similar |
| `/ecosystem/category/[c]` | `GET /projects?category=` | |
| `/ecosystem/network/[n]` | `GET /projects?network=` | |
| `/ecosystem/tag/[t]` | `GET /projects?tag=` | |
| `/research` | `GET /research` | |
| `/regulation` | `GET /regulations` | |
| `/events` | `GET /events?when=upcoming\|past` | |
| `/founders` | `GET /founders` | |
| `/author/[slug]` | `GET /authors/slug/:slug` | Profile + their articles |
| `/search` | `GET /search?q=` | Postgres full-text across all six types |
| `/rss.xml` | `GET /articles?perPage=50` | Feed built by the frontend |
| sitemap | `GET /sitemap-entries` | Slugs + `updatedAt` for every published item |

**Ecosystem overview deserves emphasis.** The page currently makes nine
separate service calls. Over HTTP that becomes nine round trips on the critical
path. It must be one composed endpoint.

## 2. Content discovery

Backing the configurable homepage and section blocks. Each is a *rule*, not a
hardcoded query, so editors can change the source without a deploy.

`featured` · `trending` · `latest` · `most_read` · `editors_picks` ·
`recommended` · `popular_topics` · `market_news` · `research_picks` ·
`ecosystem_spotlight` · `founder_spotlight` · `upcoming_events` ·
`related_content`

`GET /discovery/:key?limit=` — resolves the admin's configured rule, whether
that is manual selection or automatic population.

## 3. Admin endpoints

Full CRUD per type, all requiring authentication and a permission:

`articles` · `projects` · `research` · `regulations` · `events` · `founders` ·
`categories` · `tags` · `labels` · `authors` · `media` · `users` · `roles` ·
`permissions` · `settings` · `navigation` · `homepage-sections` ·
`redirects` · `languages` · `translations` · `ads` · `audit-logs` ·
`ai-agents`

Plus: bulk operations, CSV/Excel export, admin global search, dashboard
counters, analytics, reports, site health.

## 4. Auth

`POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` ·
`GET /auth/me` · `POST /auth/password/change` ·
`POST /auth/password/forgot` · `POST /auth/password/reset`

JWT access token plus rotating refresh token, per the brief.

## 5. AI agent integration

`POST /agent/news` · `POST /agent/projects` · `POST /agent/research` ·
`POST /agent/regulations` · `POST /agent/events` · `POST /agent/founders` ·
`POST /agent/media` · `GET /agent/health`

Authenticated by API key + secret, scoped by per-agent permissions, with the
agent's configured publishing mode deciding draft/review/scheduled/immediate.
The platform validates and stores; it never generates.

---

## 6. Gaps the frontend has that the backend must close

Found during the audit — things the frontend needs that nothing currently
provides:

1. **104 hardcoded article titles** across 7 section pages (HomePage 26; 13
   each in Latest, Markets, Business, Technology, Regulation, Research). These
   render baked-in JSX, not data. Until they read from the API, no CMS edit
   will be visible on those pages. **This is the largest single gap.**
2. **Research and Regulation have no data model on the frontend at all** — both
   pages are entirely hardcoded. The backend defines these first; the frontend
   then consumes them.
3. **Author pages** render from a string field on Article. A real `Author`
   entity exists in the schema but the frontend does not use it.
4. **Search** filters an in-memory array; needs the full-text endpoint.
5. **The language selector is decorative** — no translation layer behind it.
6. **No ad slots exist** in the frontend markup.
7. **View counts do not exist**, so "most read" and "trending" have no honest
   source. The backend must record views before those endpoints can be real.
8. **Media is Unsplash URLs** in `lib/images.ts`; nothing is uploaded or owned.

Items 1–4 are frontend follow-ups once the API exists. They are recorded here
so they are not lost — the brief forbids modifying frontend behaviour, and
these are exactly the places where the frontend must eventually change to
consume the backend rather than its own hardcoded content.
