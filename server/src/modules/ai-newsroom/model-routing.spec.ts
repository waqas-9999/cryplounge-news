import 'reflect-metadata';
import { BadRequestException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from '@/common/decorators/public.decorator';
import { REQUIRED_PERMISSIONS } from '../auth/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AiNewsroomController } from './ai-newsroom.controller';
import { AiNewsroomService } from './ai-newsroom.service';
import {
  MODEL_STAGES,
  emptyModelSettings,
  readModelSettings,
  validateModelSettings,
} from './model-settings';

/**
 * Choosing the model from the dashboard.
 *
 * Two things are being protected. The first is that an operator can change
 * where a stage runs without a deploy, and can hand a stage back to the
 * newsroom's own configuration — which is what an unset value has to mean.
 * The second is that this control, unlike the ones beside it, must stay
 * boring: it can route a stage, and it can do nothing else. It cannot publish,
 * cannot grant an agent anything, and cannot be reached by an agent.
 */

const KEY = 'ai.automation.models';
const ADMIN = { user: { id: 'user-super', email: 'owner@example.com' }, ipAddress: '203.0.113.9' };

interface AuditEntry {
  action: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

function build(initial: Record<string, unknown> = {}) {
  const settings = new Map<string, unknown>(Object.entries(initial));
  const audits: AuditEntry[] = [];
  const agentWrites: unknown[] = [];

  const prisma = {
    setting: {
      findUnique: jest.fn(async ({ where }: { where: { key: string } }) =>
        settings.has(where.key) ? { key: where.key, value: settings.get(where.key) } : null
      ),
      upsert: jest.fn(async ({ where, update }: { where: { key: string }; update: { value: unknown } }) => {
        settings.set(where.key, update.value);
        return {};
      }),
    },
    category: { findMany: jest.fn(async () => [{ id: 'cat-0', slug: 'policy', name: 'Policy' }]) },
    article: { count: jest.fn(async () => 0) },
    // Present only to prove nothing reaches it.
    aiAgent: {
      update: jest.fn(async (args: unknown) => agentWrites.push(args)),
      updateMany: jest.fn(async (args: unknown) => agentWrites.push(args)),
    },
  };

  const audit = { record: jest.fn(async (entry: AuditEntry) => void audits.push(entry)) };

  return { service: new AiNewsroomService(prisma as never, audit as never), settings, audits, agentWrites };
}

/* ------------------------------------------------------------ validation -- */

describe('what may be routed where', () => {
  it('accepts a provider and model for a text stage', () => {
    const { settings, errors } = validateModelSettings({
      writer: { provider: 'google-gemini', model: 'gemini-flash-latest' },
    });

    expect(errors).toEqual([]);
    expect(settings.writer).toEqual({ provider: 'google-gemini', model: 'gemini-flash-latest' });
  });

  it('accepts the model ids providers actually use', () => {
    const ids = [
      'claude-opus-5',
      'gemini-2.5-flash-image',
      'nvidia/nemotron-3-super-120b-a12b',
      'upstage/solar-pro4:free',
      'gpt-image-1',
    ];

    for (const model of ids) {
      expect(validateModelSettings({ writer: { model } }).errors).toEqual([]);
    }
  });

  it('refuses an image provider on a text stage, and the reverse', () => {
    expect(validateModelSettings({ writer: { provider: 'gemini' } }).errors[0]).toMatchObject({ stage: 'writer' });
    expect(validateModelSettings({ image: { provider: 'google-gemini' } }).errors[0]).toMatchObject({ stage: 'image' });
  });

  it('refuses the mock provider, which would invent article text', () => {
    expect(validateModelSettings({ writer: { provider: 'mock' } }).errors).toHaveLength(1);
  });

  it('refuses a stage that does not exist rather than ignoring it', () => {
    const { errors } = validateModelSettings({ writter: { model: 'claude-opus-5' } });

    expect(errors).toHaveLength(1);
    expect(errors[0]!.message).toMatch(/Unknown stage/);
  });

  it('refuses a model id that could not be one', () => {
    for (const model of ['claude opus 5', 'model"; drop', '../../etc/passwd'.repeat(20)]) {
      expect(validateModelSettings({ writer: { model } }).errors.length).toBeGreaterThan(0);
    }
  });

  it('reports every bad stage at once', () => {
    const { errors } = validateModelSettings({
      writer: { provider: 'nope' },
      editor: { model: 'a b c' },
      nonsense: {},
    });

    expect(errors.map(error => error.stage).sort()).toEqual(['editor', 'nonsense', 'writer']);
  });

  it('treats null, empty and absent alike: the newsroom keeps its own configuration', () => {
    for (const value of [{}, { provider: null, model: null }, { provider: '', model: '   ' }]) {
      const { settings, errors } = validateModelSettings({ writer: value });
      expect(errors).toEqual([]);
      expect(settings.writer).toEqual({ provider: null, model: null });
    }
  });

  it('covers every stage the newsroom has, including image generation', () => {
    expect(MODEL_STAGES).toEqual(
      expect.arrayContaining(['research', 'writer', 'editor', 'factcheck', 'quality', 'image', 'imagePrompt'])
    );
    expect(Object.keys(emptyModelSettings())).toEqual([...MODEL_STAGES]);
  });
});

describe('reading a stored value back', () => {
  it('survives a row written before a stage existed', () => {
    const settings = readModelSettings({ writer: { provider: 'nvidia', model: 'x' } });

    expect(settings.writer).toEqual({ provider: 'nvidia', model: 'x' });
    expect(settings.image).toEqual({ provider: null, model: null });
  });

  it('reads a missing or damaged row as "everything inherits"', () => {
    for (const stored of [null, undefined, 'nonsense', 42, { writer: 'gemini' }]) {
      expect(readModelSettings(stored)).toEqual(emptyModelSettings());
    }
  });
});

/* ---------------------------------------------------------------- saving -- */

describe('saving the routing', () => {
  it('writes one setting and nothing else', async () => {
    const { service, settings } = build();

    await service.setModels({ writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } }, ADMIN);

    expect([...settings.keys()]).toEqual([KEY]);
    expect((settings.get(KEY) as Record<string, unknown>).writer).toEqual({
      provider: 'google-gemini',
      model: 'gemini-flash-latest',
    });
  });

  it('records who changed it and what it was before', async () => {
    const { service, audits } = build({ [KEY]: { writer: { provider: 'anthropic', model: 'claude-opus-5' } } });

    await service.setModels({ writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } }, ADMIN);

    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ action: 'SETTINGS_CHANGE', entityId: KEY });
    expect(audits[0]!.summary).toMatch(/writer: google-gemini \/ gemini-flash-latest/);
    expect(audits[0]!.metadata).toMatchObject({
      before: { writer: { provider: 'anthropic', model: 'claude-opus-5' } },
      actor: { email: 'owner@example.com' },
    });
  });

  it('rejects the whole save when any stage is invalid, leaving the old routing in place', async () => {
    const stored = { writer: { provider: 'anthropic', model: 'claude-opus-5' } };
    const { service, settings } = build({ [KEY]: stored });

    await expect(
      service.setModels({ writer: { provider: 'google-gemini' }, editor: { provider: 'nope' } }, ADMIN)
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(settings.get(KEY)).toEqual(stored);
  });

  it('clears an override back to the newsroom configuration', async () => {
    const { service, settings } = build({ [KEY]: { writer: { provider: 'anthropic', model: 'claude-opus-5' } } });

    await service.setModels({ writer: { provider: null, model: null } }, ADMIN);

    expect((settings.get(KEY) as Record<string, unknown>).writer).toEqual({ provider: null, model: null });
  });

  it('never writes to an agent', async () => {
    const { service, agentWrites } = build();

    await service.setModels({ writer: { provider: 'google-gemini' } }, ADMIN);

    expect(agentWrites).toEqual([]);
  });

  it('does not change the publish mode or the global switch', async () => {
    const { service, settings } = build({ 'ai.automation.publishMode': 'DRAFT_ONLY', 'ai.automation.enabled': false });

    await service.setModels({ writer: { provider: 'google-gemini' } }, ADMIN);

    expect(settings.get('ai.automation.publishMode')).toBe('DRAFT_ONLY');
    expect(settings.get('ai.automation.enabled')).toBe(false);
  });
});

/* ------------------------------------------------------------- the newsroom -- */

describe('what the newsroom is told', () => {
  it('receives the routing with the automation settings it already polls', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } } });

    const projection = await service.forAgent();

    expect(projection.models.writer).toEqual({ provider: 'google-gemini', model: 'gemini-flash-latest' });
    // Unset stages travel as null: the CMS never states what the newsroom's
    // own configuration is, only where it is overridden.
    expect(projection.models.research).toEqual({ provider: null, model: null });
  });

  it('sends nothing but the routing — no keys, no endpoints, no credentials', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } } });

    const serialised = JSON.stringify((await service.forAgent()).models);

    expect(serialised).not.toMatch(/key|secret|token|password/i);
  });

  it('shows the screen which providers each stage may use', async () => {
    const { service } = build();

    const status = await service.status();

    expect(status.modelProviders.writer).toContain('google-gemini');
    expect(status.modelProviders.writer).not.toContain('mock');
    expect(status.modelProviders.image).toEqual(['gemini', 'openai', 'nvidia']);
  });
});

/* -------------------------------------------------------------- the route -- */

describe('who may change it', () => {
  const guard = new PermissionsGuard(new Reflector());

  function context(permissions: string[]): ExecutionContext {
    return {
      getHandler: () => AiNewsroomController.prototype.setModels,
      getClass: () => AiNewsroomController,
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
    } as unknown as ExecutionContext;
  }

  it('requires the same super-admin permission as the publish mode', () => {
    const required = Reflect.getMetadata(REQUIRED_PERMISSIONS, AiNewsroomController.prototype.setModels);

    expect(required).toEqual(['ai.automation.manage']);
  });

  it('is not a public route, so an agent credential cannot reach it', () => {
    expect(Reflect.getMetadata(IS_PUBLIC, AiNewsroomController.prototype.setModels)).toBeFalsy();
    expect(Reflect.getMetadata(IS_PUBLIC, AiNewsroomController)).toBeFalsy();
  });

  it('refuses an admin who only holds the read permission', () => {
    expect(() => guard.canActivate(context(['ai.automation.read']))).toThrow();
    expect(guard.canActivate(context(['ai.automation.manage']))).toBe(true);
  });
});
