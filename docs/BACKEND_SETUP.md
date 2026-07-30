# Backend Setup

The schema, auth layer and API are in the repository. They need a Postgres
database to run against — that step has to happen on your machine, because no
database is reachable from where the code was written.

## 1. Provide a database

Any Postgres 14+ instance works. Locally, either:

```bash
docker run --name cryplounge-db -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=cryplounge -p 5432:5432 -d postgres:16
```

or a hosted instance (Neon, Supabase, Railway all provide a connection string).

## 2. Configure the environment

```bash
cp .env.example .env.local
```

Then set:

- `DATABASE_URL` — the connection string
- `AUTH_SECRET` — generate with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` in development

`.env.local` is gitignored. Never commit it.

## 3. Create the tables

```bash
npm run db:migrate
```

This creates the initial migration and applies it. For a throwaway database,
`npm run db:push` is faster but records no migration history.

## 4. Seed

```bash
SEED_ADMIN_PASSWORD='<choose a strong password>' npm run db:seed
```

The seed **refuses to run without `SEED_ADMIN_PASSWORD`**. It will not create
an account with a default credential — the previous hardcoded
`admin@cryplounge.com` / `Admin@123` pair is gone, and must not come back.

Optionally set `SEED_ADMIN_EMAIL` (defaults to `admin@cryplounge.com`).

The seed is idempotent: every write is an upsert on a natural key, so running
it twice converges rather than duplicating.

It loads: staff owner account, news and project categories, all articles with
authors and tags, the 26-project directory, events with speakers, founder
profiles, the 13 homepage sections, and English as the default language.

## 5. Verify

```bash
npm run db:studio     # browse the data
npm run dev
```

Check the API responds:

```bash
curl -i http://localhost:3000/api/auth/session
curl -i "http://localhost:3000/api/articles?perPage=3"
```

Sign in:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@cryplounge.com","password":"<the password you seeded>"}'
```

A successful response sets an httpOnly `cryplounge_session` cookie.

---

## What changed about authentication

The old `AdminAuthService` compared credentials against two pairs hardcoded in
a file that shipped to the browser, and stored "logged in" as a localStorage
key that anyone could set.

Now:

| Concern | Before | Now |
|---|---|---|
| Password storage | plaintext in client bundle | bcrypt hash, cost 12, server-side |
| Credential check | in the browser | server only |
| Session | localStorage flag | opaque token row in Postgres |
| Cookie | none | httpOnly, sameSite=lax, secure in production |
| Account enumeration | trivially possible | uniform response and timing |
| Authorisation | none | capability matrix per role |
| Audit | none | every login, failure and content change recorded |

`src/utils/adminAuth.ts` still exists and is still used by the admin UI. It is
replaced when the admin screens are wired to these endpoints — until then, do
not deploy the admin panel publicly.
