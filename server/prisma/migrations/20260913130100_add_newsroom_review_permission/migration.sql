-- Make `ai.newsroom.review` exist and grant it to the roles that edit content.
--
-- Production deploys run `prisma migrate deploy` only — never the seed — so
-- without this row the permission could not be checked or granted.
--
-- What it allows: reading the newsroom's held-back stories with their evidence,
-- and asking the newsroom to re-run one through its full pipeline, retry it, or
-- drop it. It cannot publish, approve, or change automation settings; a
-- recovered story still has to pass every gate and ends at most as a draft.
--
-- Data only, and idempotent. The id is fixed because "Permission"."id" has no
-- database default (cuid() is applied by Prisma Client, not Postgres).

INSERT INTO "Permission" ("id", "key", "module", "description")
VALUES (
  'perm_ai_newsroom_review',
  'ai.newsroom.review',
  'AI Newsroom',
  'Review stories the AI newsroom held back and request recovery'
)
ON CONFLICT ("key") DO NOTHING;

-- SUPER_ADMIN for parity with the seed's wildcard; ADMIN and EDITOR because
-- deciding whether a refused story deserves another look is editorial work.
-- Roles that have not been seeded are skipped silently.
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "RoleDefinition" r
JOIN "Permission" p ON p."key" = 'ai.newsroom.review'
WHERE r."key" IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
