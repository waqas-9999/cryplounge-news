# Migrating from Neon to the OVHcloud VPS

Moving both databases off Neon's free plan onto Postgres running on the VPS.

## Why

Two production outages in three weeks, both caused by free-plan limits rather
than by anything wrong with the application:

- The data-transfer quota was exhausted, which archived the branch. Prisma
  reported this as "Can't reach database server", which is misleading — the
  server was reachable and returning `SQLSTATE 53000`.
- Cold starts take ~6.2s on the pooled endpoint against Prisma's 5s default
  connect timeout, so boot failed intermittently until `connect_timeout=20`
  was added.

The data is **5.25 MB across both databases** (530 live rows). A VPS you are
already paying for removes the quota, the compute billing and the cold start
at once. The trade is that backups and uptime become yours.

## Before you start: the existing backup is empty

```
db-backups/news-data.dump    0 bytes
```

`pg_dump` is not installed on the Windows development machine, so the command
run on 2 September failed and the shell's `>` redirect left an empty file. The
copy uploaded to the VPS is the same empty file. Confirm on the server:

```bash
ls -la news-data.dump
pg_restore --list news-data.dump | head
```

An error or empty output means the archive is unusable. That is recoverable —
see "If the backup is unusable" at the end.

## Step 1 — Take a real backup, from the VPS

Do not dump from Windows. The VPS has the Postgres client tools and a fast
link to Neon, and the client version must be **17 or newer** because Neon runs
Postgres 18. An older `pg_dump` refuses with a server-version mismatch.

```bash
sudo apt update && sudo apt install -y postgresql-client-17
pg_dump --version    # must report 17.x or 18.x
```

Dump each database separately, using the **direct** (non-pooler) endpoint —
`pg_dump` opens multiple sessions and does not work through a transaction
pooler:

```bash
mkdir -p ~/backups && cd ~/backups

pg_dump "$NEON_DIRECT_URL_NEWS" -Fc -f news-$(date +%F).dump
pg_dump "$NEON_DIRECT_URL_AI"   -Fc -f ai-$(date +%F).dump
```

Set those two variables from `server/.env` (`DIRECT_URL`) and
`cryplounge-ai/.env` (`AI_DATABASE_URL`) — export them in the shell, do not
paste them into a script that gets committed.

**Verify before trusting it.** A dump is not a backup until it has been read
back:

```bash
ls -la *.dump                      # expect ~1-3 MB, never 0
pg_restore --list news-*.dump | wc -l    # expect 200+ lines
```

`-Fc` (custom format) is what makes `pg_restore --list` possible and allows
selective restore. Plain SQL dumps give you neither.

## Step 2 — Run Postgres on the VPS

`docker-compose.yml` already defines it. Two changes are needed before it is
safe to expose:

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}   # not the hardcoded default
  ports:
    - '127.0.0.1:5432:5432'                   # not 0.0.0.0
```

The committed file has `POSTGRES_PASSWORD: cryplounge` and binds `5432` on all
interfaces. On a public VPS that is a trivially guessable password on an
internet-facing port. Bind to loopback — the API container reaches Postgres
over the compose network by service name, so nothing needs the public port.

Postgres 16 restoring an 18 dump is fine here: `-Fc` archives are
forward-compatible for this schema, which uses no version-specific features.
Use `postgres:18-alpine` if you prefer to match exactly.

```bash
docker compose up -d postgres
docker compose exec postgres psql -U cryplounge -c "CREATE DATABASE cryplounge_news;"
docker compose exec postgres psql -U cryplounge -c "CREATE DATABASE cryplounge_ai;"
```

## Step 3 — Restore

```bash
docker compose exec -T postgres pg_restore -U cryplounge \
  -d cryplounge_news --no-owner --no-privileges < ~/backups/news-2026-09-05.dump
```

`--no-owner --no-privileges` drops the `neondb_owner` role references, which do
not exist on the VPS and would otherwise produce hundreds of errors.

Expect some warnings about extensions and roles. Errors mentioning missing
tables are not warnings — stop and read them.

Verify the row counts match what the audit measured:

```bash
docker compose exec postgres psql -U cryplounge -d cryplounge_news \
  -c 'SELECT (SELECT count(*) FROM "User") u, (SELECT count(*) FROM "Category") c,
             (SELECT count(*) FROM "Article") a, (SELECT count(*) FROM "Project") p;'
```

Expected: `1 | 31 | 1 | 27`. Anything less means the restore was partial.

## Step 4 — Repoint the applications

Both URLs become local, and both Neon-specific parameters come **out**:

```
# server/.env
DATABASE_URL=postgresql://cryplounge:<password>@postgres:5432/cryplounge_news?schema=public
DIRECT_URL=postgresql://cryplounge:<password>@postgres:5432/cryplounge_news?schema=public
```

Drop `sslmode=require`, `channel_binding=require`, `pgbouncer=true`,
`connection_limit=1` and `connect_timeout=20`. Every one of them exists only
because of Neon: there is no pooler, no cold start, and the connection does not
leave the host. `DATABASE_URL` and `DIRECT_URL` are now identical, which is
correct — `directUrl` exists to bypass a pooler that no longer sits in front.

Then:

```bash
docker compose up -d --build api
curl -f localhost:4000/health
```

The API runs `prisma migrate deploy` on boot. Against a freshly restored
database it is a no-op, because `_prisma_migrations` came across in the dump.

## Step 5 — Backups are now your job

This is the part that Neon was doing for you, and the reason to do it on day
one rather than after the first incident.

```bash
# /etc/cron.daily/cryplounge-backup
#!/bin/sh
set -e
d=$(date +%F)
docker compose -f /srv/cryplounge/server/docker-compose.yml exec -T postgres \
  pg_dump -U cryplounge -Fc cryplounge_news > /srv/backups/news-$d.dump
find /srv/backups -name '*.dump' -mtime +14 -delete
```

`set -e` matters: without it this script has the same failure mode that
produced the empty dump — a failing `pg_dump` still leaves a 0-byte file that
looks like a backup.

Two things make this real rather than theatre:

- **Copy the dumps off the VPS.** A backup on the same disk as the database
  does not survive the failure it exists for. OVH object storage, or `rsync`
  to another host.
- **Restore one.** Untested backups fail when you need them. Restore last
  night's dump into a scratch database once and check the row counts.

## Also move: uploaded media

`UPLOAD_DIR` is on local disk, not object storage — `docs/DEPLOYMENT.md` notes
that losing the directory loses the files. The compose file keeps it in the
`uploads` volume, so it must be copied from the Hostinger VPS separately; a
database dump does not contain it.

The `Media` table currently has **0 rows**, so there is very likely nothing to
move today. Confirm rather than assume, then set `STORAGE_PROVIDER=cloudinary`
before real uploads start, so this stops being a migration concern.

## If the backup is unusable

Rebuild rather than recover. The audit measured what would be lost: 1 user, 1
article, 31 categories, 27 projects, 3 events, 5 legal pages — all of it seed
data, and `cryplounge_ai` is empty across all 18 tables.

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npm run db:seed
```

That reproduces everything except the single article. Re-creating one article
by hand is a smaller job than trying to salvage a broken dump.

## What stays on Neon

Nothing needs to. Keep the project until the VPS has served traffic for a week
and one restore has been tested, then delete it — an idle free project costs
nothing and is a cheap rollback.

Rollback is a configuration change: put the Neon `DATABASE_URL` and
`DIRECT_URL` back, with `connect_timeout=20`, and redeploy.
