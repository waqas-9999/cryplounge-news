import 'reflect-metadata';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BadRequestException, ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '@/common/decorators/public.decorator';
import { REQUIRED_PERMISSIONS } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { checkAgentPermissions } from '../agents/agent-permissions';
import { AgentsService } from '../agents/agents.service';
import { AiNewsroomController } from './ai-newsroom.controller';
import { AiNewsroomService } from './ai-newsroom.service';

/**
 * The AUTO_PUBLISH administrative control.
 *
 * Two deliberate acts are required before an agent could publish on its own:
 * a super admin selects AUTO_PUBLISH, and an administrator grants that agent
 * `news.publish`. These tests hold each act to doing only what it says — the
 * mode switch writes one setting and an audit entry, and never an agent's
 * permissions; a permission grant never changes the mode — and prove an agent
 * credential cannot reach the switch at all.
 */

const MODE_KEY = 'ai.automation.publishMode';
const ADMIN = { user: { id: 'user-super', email: 'owner@example.com' }, ipAddress: '203.0.113.9' };

interface AuditEntry {
  action: string;
  entityId?: string;
  summary: string;
  context?: typeof ADMIN;
  metadata?: Record<string, unknown>;
}

function build(initial: Record<string, unknown> = {}, newsCategories = ['bitcoin', 'policy']) {
  const settings = new Map<string, unknown>(Object.entries(initial));
  const audits: AuditEntry[] = [];
  const agentWrites: unknown[] = [];

  const prisma = {
    setting: {
      findUnique: jest.fn(async ({ where }: { where: { key: string } }) =>
        settings.has(where.key) ? { key: where.key, value: settings.get(where.key) } : null
      ),
      findMany: jest.fn(async ({ where }: { where: { key: { in: string[] } } }) =>
        where.key.in.filter(key => settings.has(key)).map(key => ({ key, value: settings.get(key) }))
      ),
      upsert: jest.fn(async ({ where, update }: { where: { key: string }; update: { value: unknown } }) => {
        settings.set(where.key, update.value);
        return {};
      }),
    },
    category: {
      findMany: jest.fn(async () =>
        newsCategories.map((slug, i) => ({ id: `cat-${i}`, slug, name: slug }))
      ),
    },
    article: { count: jest.fn(async () => 0) },
    // The status payload now reports which model each stage last resolved to,
    // read from the newsroom's telemetry. Nothing in these tests depends on
    // it; the stub exists so status() can be called.
    newsroomEvent: { findMany: jest.fn(async () => []) },
    // Present only to prove nothing reaches it.
    aiAgent: {
      update: jest.fn(async (args: unknown) => agentWrites.push(args)),
      updateMany: jest.fn(async (args: unknown) => agentWrites.push(args)),
    },
  };

  const audit = {
    record: jest.fn(async (entry: AuditEntry) => {
      audits.push(entry);
    }),
  };

  return {
    service: new AiNewsroomService(prisma as never, audit as never),
    settings,
    audits,
    agentWrites,
    prisma,
  };
}

/* ------------------------------------------------------------- enabling -- */

describe('enabling AUTO_PUBLISH', () => {
  it('persists the mode through the existing setting', async () => {
    const { service, settings } = build({ [MODE_KEY]: 'DRAFT_ONLY' });

    const status = await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(settings.get(MODE_KEY)).toBe('AUTO_PUBLISH');
    expect(status.publishMode).toBe('AUTO_PUBLISH');
  });

  it('records an audit entry naming the admin and the configuration at the time', async () => {
    const { service, audits } = build({
      [MODE_KEY]: 'DRAFT_ONLY',
      'ai.automation.enabled': true,
      'ai.automation.categories': { bitcoin: true, policy: false },
    });

    await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(audits).toHaveLength(1);
    const [entry] = audits;
    expect(entry).toMatchObject({
      action: 'SETTINGS_CHANGE',
      entityId: MODE_KEY,
      context: ADMIN,
    });
    expect(entry!.summary).toMatch(/Enabled AI automatic publishing/);
    expect(entry!.metadata).toMatchObject({
      before: 'DRAFT_ONLY',
      after: 'AUTO_PUBLISH',
      transition: 'AUTO_PUBLISH_ENABLED',
      actor: { userId: 'user-super', email: 'owner@example.com' },
      grantsAgentPermissions: false,
      configuration: {
        globalAutomationEnabled: true,
        emergencyPaused: false,
        enabledCategories: ['bitcoin'],
      },
    });
  });

  it('is allowed with no category enabled, and turns none on', async () => {
    const { service, settings, audits } = build({ 'ai.automation.categories': {} });

    await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(settings.get('ai.automation.categories')).toEqual({});
    expect((audits[0]!.metadata!.configuration as { enabledCategories: string[] }).enabledCategories).toEqual([]);
  });

  it('leaves the emergency pause exactly as it was', async () => {
    const { service, settings, prisma } = build({ 'ai.automation.emergencyPause': true });

    const status = await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(settings.get('ai.automation.emergencyPause')).toBe(true);
    expect(status.emergencyPaused).toBe(true);
    const writtenKeys = prisma.setting.upsert.mock.calls.map(([args]) => args.where.key);
    expect(writtenKeys).toEqual([MODE_KEY]);
  });

  it('does not switch global automation on', async () => {
    const { service, settings } = build({ 'ai.automation.enabled': false });

    await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(settings.get('ai.automation.enabled')).toBe(false);
  });

  it.each([
    ['global automation', 'ai.automation.enabled', 'yes'],
    ['emergency pause', 'ai.automation.emergencyPause', 1],
    ['category automation', 'ai.automation.categories', ['bitcoin']],
    ['category automation', 'ai.automation.categories', { bitcoin: 'on' }],
    ['daily auto-publish limit', 'ai.automation.autoPublishDailyLimit', -1],
    ['auto-publish strictness', 'ai.automation.autoPublishStrictness', 'EVERYTHING'],
  ])('is refused while the %s setting is malformed (%s = %j)', async (_label, key, value) => {
    const { service, settings, audits } = build({ [MODE_KEY]: 'DRAFT_ONLY', [key]: value });

    await expect(service.setPublishMode('AUTO_PUBLISH', ADMIN)).rejects.toThrow(BadRequestException);

    expect(settings.get(MODE_KEY)).toBe('DRAFT_ONLY');
    expect(audits).toHaveLength(0);
  });

  it('is refused when no NEWS category exists to configure', async () => {
    const { service, settings } = build({ [MODE_KEY]: 'DRAFT_ONLY' }, []);

    await expect(service.setPublishMode('AUTO_PUBLISH', ADMIN)).rejects.toMatchObject({
      response: { code: 'AUTO_PUBLISH_CONFIGURATION_INVALID' },
    });
    expect(settings.get(MODE_KEY)).toBe('DRAFT_ONLY');
  });
});

/* ------------------------------------------------------------ disabling -- */

describe('disabling AUTO_PUBLISH', () => {
  it('persists and records an audit entry naming the admin', async () => {
    const { service, settings, audits } = build({ [MODE_KEY]: 'AUTO_PUBLISH' });

    await service.setPublishMode('DRAFT_ONLY', ADMIN);

    expect(settings.get(MODE_KEY)).toBe('DRAFT_ONLY');
    expect(audits).toHaveLength(1);
    expect(audits[0]!.summary).toMatch(/Disabled AI automatic publishing/);
    expect(audits[0]!.context).toEqual(ADMIN);
    expect(audits[0]!.metadata).toMatchObject({
      before: 'AUTO_PUBLISH',
      after: 'DRAFT_ONLY',
      transition: 'AUTO_PUBLISH_DISABLED',
      actor: { userId: 'user-super', email: 'owner@example.com' },
    });
  });

  it('is never blocked by malformed configuration', async () => {
    // Turning automation off must work in exactly the state that makes an
    // operator want to turn it off.
    const { service, settings } = build(
      { [MODE_KEY]: 'AUTO_PUBLISH', 'ai.automation.categories': 'corrupt' },
      []
    );

    await service.setPublishMode('REVIEW_REQUIRED', ADMIN);

    expect(settings.get(MODE_KEY)).toBe('REVIEW_REQUIRED');
  });

  it('records an ordinary change between non-publishing modes without a transition', async () => {
    const { service, audits } = build({ [MODE_KEY]: 'DRAFT_ONLY' });

    await service.setPublishMode('REVIEW_REQUIRED', ADMIN);

    expect(audits[0]!.summary).toBe('Set AI publishing mode to REVIEW_REQUIRED');
    expect(audits[0]!.metadata).not.toHaveProperty('transition');
  });
});

/* ------------------------------------ two independent controls, not one -- */

describe('AUTO_PUBLISH and news.publish are independent', () => {
  it('enabling AUTO_PUBLISH writes no agent and grants no permission', async () => {
    const { service, agentWrites, prisma } = build();

    await service.setPublishMode('AUTO_PUBLISH', ADMIN);

    expect(agentWrites).toEqual([]);
    expect(prisma.aiAgent.update).not.toHaveBeenCalled();
    expect(prisma.aiAgent.updateMany).not.toHaveBeenCalled();
  });

  it('AiNewsroomService has no access to agent records at all', () => {
    const source = readFileSync(join(__dirname, 'ai-newsroom.service.ts'), 'utf8');
    expect(source).not.toMatch(/aiAgent/);
  });

  it('granting an agent news.publish does not touch the publishing mode', async () => {
    const settingWrites: unknown[] = [];
    const prisma = {
      permission: {
        findMany: jest.fn(async () => [{ key: 'news.create' }, { key: 'news.publish' }]),
      },
      aiAgent: {
        update: jest.fn(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 'agent-1',
          apiSecretHash: 'hash',
          ...data,
        })),
      },
      setting: {
        upsert: jest.fn(async (args: unknown) => settingWrites.push(args)),
        update: jest.fn(async (args: unknown) => settingWrites.push(args)),
        create: jest.fn(async (args: unknown) => settingWrites.push(args)),
      },
    };
    const agents = new AgentsService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    await agents.update('agent-1', { permissions: ['news.create', 'news.publish'] });

    expect(prisma.aiAgent.update).toHaveBeenCalledTimes(1);
    expect(settingWrites).toEqual([]);
  });
});

/* ------------------------------------------------ who may change the mode -- */

describe('authorization on the AUTO_PUBLISH switch', () => {
  const reflector = new Reflector();
  const handler = AiNewsroomController.prototype.setPublishMode;

  it('requires ai.automation.manage', () => {
    expect(reflector.get(REQUIRED_PERMISSIONS, handler)).toEqual(['ai.automation.manage']);
  });

  it('is not public, so the global JWT guard applies and an agent key alone is refused', () => {
    expect(reflector.get(IS_PUBLIC, handler)).toBeUndefined();
    expect(reflector.get(IS_PUBLIC, AiNewsroomController)).toBeUndefined();
  });

  it('protects every write on the controller the same way', () => {
    const writes = ['setEnabled', 'setPublishMode', 'setEmergencyPause', 'setAutoPublishLimits', 'setCategory', 'publishPending'] as const;
    for (const name of writes) {
      const method = AiNewsroomController.prototype[name];
      expect(reflector.get(REQUIRED_PERMISSIONS, method)).toEqual(['ai.automation.manage']);
      expect(reflector.get(IS_PUBLIC, method)).toBeUndefined();
    }
  });

  function contextFor(user: unknown): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => AiNewsroomController,
      switchToHttp: () => ({ getRequest: () => ({ user, agent: { id: 'agent-1' } }) }),
    } as unknown as ExecutionContext;
  }

  it('refuses a request carrying agent identity but no user', () => {
    const guard = new PermissionsGuard(reflector);
    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException);
  });

  it('refuses an ADMIN, who holds only ai.automation.read', () => {
    const guard = new PermissionsGuard(reflector);
    const admin = { id: 'u', role: 'ADMIN', permissions: ['ai.automation.read', 'settings.manage'] };
    expect(() => guard.canActivate(contextFor(admin))).toThrow(ForbiddenException);
  });

  it('admits a SUPER_ADMIN', () => {
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(contextFor({ id: 'u', role: 'SUPER_ADMIN', permissions: [] }))).toBe(true);
  });

  it('can never be granted to an agent', () => {
    expect(checkAgentPermissions(['ai.automation.manage']).allowed).toBe(false);
  });

  it('is not reachable from any agent-authenticated code', () => {
    const dir = join(__dirname, '..', 'agents');
    const setters = /\.(setPublishMode|setEnabled|setEmergencyPause|setAutoPublishLimits|setCategoryEnabled)\(/;
    const offenders = readdirSync(dir)
      .filter(file => file.endsWith('.ts') && !file.endsWith('.spec.ts'))
      .filter(file => setters.test(readFileSync(join(dir, file), 'utf8')));

    expect(offenders).toEqual([]);
  });
});
