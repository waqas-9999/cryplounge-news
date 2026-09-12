import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AGENT_ALLOWED_PERMISSIONS } from './agent-permissions';

/*
 * Loaded at runtime, never imported statically.
 *
 * `nest build` compiles everything under src/ — specs included — and a static
 * import of a file outside src/ pulls it into the program, which moves tsc's
 * rootDir up a level. The output then lands at dist/src/app.module.js instead
 * of dist/app.module.js, and the Vercel entrypoint (`api/index.ts`) can no
 * longer find `../dist/app.module`. A runtime require is invisible to tsc.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PERMISSIONS } = require(join(__dirname, '..', '..', '..', 'prisma', 'permissions')) as {
  PERMISSIONS: Array<{ key: string; module: string; description: string }>;
};

/**
 * The agent allow-list and the permission catalogue must agree.
 *
 * Granting a key to an agent passes two checks: the key must exist in the
 * "Permission" table, and it must be on the agent allow-list. A key on the
 * allow-list but missing from the catalogue is therefore ungrantable, and the
 * failure only shows up when an administrator tries to grant it — which is how
 * `telemetry.write` shipped.
 */

const MIGRATIONS = join(__dirname, '..', '..', '..', 'prisma', 'migrations');

describe('the permission catalogue', () => {
  it('contains every key an agent may be granted', () => {
    const catalogue = new Set(PERMISSIONS.map(permission => permission.key));
    const missing = AGENT_ALLOWED_PERMISSIONS.filter(key => !catalogue.has(key));

    expect(missing).toEqual([]);
  });

  it('has no duplicate keys', () => {
    const keys = PERMISSIONS.map(permission => permission.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('lists telemetry.write', () => {
    expect(PERMISSIONS.find(permission => permission.key === 'telemetry.write')).toMatchObject({
      module: 'AI Agents',
    });
  });
});

describe('the telemetry.write data migration', () => {
  // Production deploys run `prisma migrate deploy` and never the seed, so the
  // migration — not permissions.ts — is what makes the key exist there.
  const sql = readFileSync(
    join(MIGRATIONS, '20260912010000_add_telemetry_write_permission', 'migration.sql'),
    'utf8'
  );
  const catalogued = PERMISSIONS.find(permission => permission.key === 'telemetry.write')!;

  it('inserts the same module and description the catalogue declares', () => {
    expect(sql).toContain(`'${catalogued.key}'`);
    expect(sql).toContain(`'${catalogued.module}'`);
    expect(sql).toContain(`'${catalogued.description}'`);
  });

  it('is idempotent, so a database the seed already reached is left alone', () => {
    expect(sql).toMatch(/INSERT INTO "Permission"[\s\S]*ON CONFLICT \("key"\) DO NOTHING/);
    expect(sql).toMatch(/INSERT INTO "RolePermission"[\s\S]*ON CONFLICT \("roleId", "permissionId"\) DO NOTHING/);
  });

  it('grants nothing to any role except SUPER_ADMIN, which passes every check anyway', () => {
    const roleKeys = [...sql.matchAll(/r\."key" = '([A-Z_]+)'/g)].map(match => match[1]);
    expect(roleKeys).toEqual(['SUPER_ADMIN']);
  });
});
