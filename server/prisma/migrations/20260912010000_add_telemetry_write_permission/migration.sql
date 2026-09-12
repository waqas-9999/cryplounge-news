-- Make `telemetry.write` grantable.
--
-- The key is on the agent allow-list (`agent-permissions.ts`), but the admin
-- API also requires every granted key to exist in the "Permission" catalogue,
-- and production deploys run `prisma migrate deploy` only — never the seed. So
-- without this row the permission cannot be granted at all.
--
-- Data only, and idempotent: the key is unique, and a row created earlier by
-- `npm run db:seed` (which upserts on key) is left exactly as it is.
--
-- The id is fixed rather than generated because "Permission"."id" has no
-- database default (cuid() is applied by Prisma Client, not Postgres).

INSERT INTO "Permission" ("id", "key", "module", "description")
VALUES (
  'perm_telemetry_write',
  'telemetry.write',
  'AI Agents',
  'Append newsroom operational telemetry'
)
ON CONFLICT ("key") DO NOTHING;

-- Parity with the seed, which grants every catalogue key to SUPER_ADMIN via its
-- wildcard. SUPER_ADMIN already passes every permission check by role, so this
-- changes no access; it keeps the role editor showing the same grants a fresh
-- seed would. Skipped silently when the role has not been seeded.
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "RoleDefinition" r
JOIN "Permission" p ON p."key" = 'telemetry.write'
WHERE r."key" = 'SUPER_ADMIN'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
