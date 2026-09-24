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
  providersFor,
  readModelSettings,
  validateModelSettings,
} from './model-settings';
import {
  MODEL_CATALOG,
  catalogForStages,
  findModel,
  providersForStage,
  type CatalogProvider,
} from './model-catalog';

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

interface RoutingEvent {
  stage: string;
  model: string | null;
  metadata: unknown;
  occurredAt: Date;
}

function build(initial: Record<string, unknown> = {}, events: RoutingEvent[] = []) {
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
    newsroomEvent: { findMany: jest.fn(async () => events) },
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

  it('accepts the text model ids this project actually uses', () => {
    const ids = ['claude-opus-5', 'nvidia/nemotron-3-super-120b-a12b', 'upstage/solar-pro4:free'];

    for (const model of ids) {
      expect(validateModelSettings({ writer: { model } }).errors).toEqual([]);
    }
  });

  it('accepts the image model ids for the image stage', () => {
    for (const model of ['gemini-2.5-flash-image', 'gpt-image-1', 'black-forest-labs/flux.2-klein-4b']) {
      expect(validateModelSettings({ image: { model } }).errors).toEqual([]);
    }
  });

  it('refuses an image model on a text stage', () => {
    // Shape alone used to be enough here, which let an image model be routed
    // to the writer and fail every call it made.
    const { errors } = validateModelSettings({ writer: { model: 'gemini-2.5-flash-image' } });

    expect(errors).toHaveLength(1);
    expect(errors[0]!.message).toMatch(/not a model this stage can use/);
  });

  it('refuses a model that belongs to a different provider, and says which', () => {
    const { errors } = validateModelSettings({
      writer: { provider: 'google-gemini', model: 'claude-opus-5' },
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]!.message).toMatch(/belongs to Anthropic, not google-gemini/);
  });

  it('refuses a model no provider serves', () => {
    expect(validateModelSettings({ writer: { model: 'gpt-9-ultra' } }).errors).toHaveLength(1);
  });

  it('settles the provider when a model is chosen without one', () => {
    // Older saved settings could name a model alone. Storing the pair means
    // the newsroom never has to work out which endpoint serves it.
    const { settings } = validateModelSettings({ writer: { model: 'upstage/solar-pro4:free' } });

    expect(settings.writer).toEqual({ provider: 'openai-compatible', model: 'upstage/solar-pro4:free' });
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

  it('shows the screen which providers and models each stage may use', async () => {
    const { service } = build();

    const status = await service.status();

    expect(status.modelCatalog.writer.map(provider => provider.id)).toContain('google-gemini');
    expect(status.modelCatalog.writer.map(provider => provider.id)).not.toContain('mock');
    // Image generation offers image providers, never the text ones.
    expect(status.modelCatalog.image.every(provider => provider.kind === 'image')).toBe(true);
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

/* --------------------------------------------------------------- catalog -- */

describe('the catalogue of what may be chosen', () => {
  it('offers a free model for every stage, so cost can always be cut', () => {
    for (const stage of MODEL_STAGES) {
      const free = providersForStage(stage).flatMap(provider =>
        provider.models.filter(model => model.pricing === 'free')
      );
      expect(free.length).toBeGreaterThan(0);
    }
  });

  it('marks the free models this project has actually tested', () => {
    const proxy = MODEL_CATALOG.find(provider => provider.id === 'openai-compatible' && provider.kind === 'text')!;
    const free = proxy.models.filter(model => model.pricing === 'free').map(model => model.id);

    expect(free).toContain('upstage/solar-pro4:free');
    // The reasoning model that returns empty content at the sizes the
    // newsroom asks for is deliberately not offered.
    expect(free).not.toContain('tencent/hy3:free');
  });

  it('never offers an image model for a text stage, or the reverse', () => {
    const textModels = providersForStage('writer').flatMap(provider => provider.models.map(model => model.id));
    const imageModels = providersForStage('image').flatMap(provider => provider.models.map(model => model.id));

    expect(textModels).not.toContain('gemini-2.5-flash-image');
    expect(imageModels).not.toContain('claude-opus-5');
  });

  it('covers all nine stages', () => {
    const catalog = catalogForStages();

    expect(Object.keys(catalog)).toEqual([...MODEL_STAGES]);
    for (const stage of MODEL_STAGES) expect(catalog[stage]!.length).toBeGreaterThan(0);
  });

  it('is the only list of providers: the validator reads it too', () => {
    for (const stage of MODEL_STAGES) {
      expect([...providersFor(stage)]).toEqual(providersForStage(stage).map(provider => provider.id));
    }
  });

  it('offers only models the validator will then accept', () => {
    for (const stage of MODEL_STAGES) {
      for (const provider of providersForStage(stage)) {
        for (const model of provider.models) {
          const { errors } = validateModelSettings({ [stage]: { provider: provider.id, model: model.id } });
          expect(errors).toEqual([]);
        }
      }
    }
  });

  it('carries no credentials, endpoints or environment values', () => {
    const serialised = JSON.stringify(catalogForStages());

    // Credential shapes, not the word "token": the descriptions talk about
    // per-token pricing, which is the point of them.
    expect(serialised).not.toMatch(/sk-[A-Za-z0-9]|AIza[A-Za-z0-9]|Bearer |password|secret|https?:\/\//i);
  });

  it('finds a model by provider, or across providers when none is named', () => {
    expect(findModel('writer', 'anthropic', 'claude-opus-5')?.provider.id).toBe('anthropic');
    expect(findModel('writer', null, 'claude-opus-5')?.provider.id).toBe('anthropic');
    expect(findModel('writer', 'google-gemini', 'claude-opus-5')).toBeUndefined();
  });
});

/* ------------------------------------------------------ effective routing -- */

describe('configured beside what is actually running', () => {
  const event = (stage: string, model: string, provider: string, minutesAgo = 5, error?: string) => ({
    stage,
    model,
    metadata: { provider, ...(error ? { error } : {}) },
    occurredAt: new Date(Date.now() - minutesAgo * 60_000),
  });

  const stageOf = (report: { stages: Array<{ stage: string }> }, stage: string) =>
    report.stages.find(entry => entry.stage === stage)! as never as {
      stage: string;
      label: string;
      kind: string;
      status: string;
      error: string | null;
      reportedAt: string | null;
      configured: {
        providerId: string | null;
        providerName: string | null;
        modelId: string | null;
        modelName: string | null;
        pricing: string | null;
        unknown: boolean;
      };
      runtime: {
        providerId: string | null;
        providerName: string | null;
        modelId: string | null;
        modelName: string | null;
        pricing: string | null;
        unknown: boolean;
      };
    };

  it('reports the configured model and the running model as separate facts', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } } }, [
      event('writer', 'gemini-flash-latest', 'google-gemini'),
    ]);

    const writer = stageOf(await service.modelRouting(), 'writer');

    expect(writer.configured).toMatchObject({ modelId: 'gemini-flash-latest', providerId: 'google-gemini' });
    expect(writer.runtime).toMatchObject({ modelId: 'gemini-flash-latest', providerId: 'google-gemini' });
    expect(writer.status).toBe('ROUTED');
  });

  it('names providers and models the way the catalogue names them, with pricing', async () => {
    const { service } = build({}, [event('editor', 'upstage/solar-pro4:free', 'openai-compatible')]);

    const editor = stageOf(await service.modelRouting(), 'editor');

    expect(editor.runtime.modelName).toBe('Solar Pro 4');
    expect(editor.runtime.providerName).toBe('OpenAI-compatible endpoint');
    expect(editor.runtime.pricing).toBe('free');
    // The raw ids stay available for the technical details panel.
    expect(editor.runtime.modelId).toBe('upstage/solar-pro4:free');
  });

  it('calls a stage with no override an environment default, and does not invent its model', async () => {
    const { service } = build({}, [event('research', 'gemini-flash-latest', 'google-gemini')]);

    const research = stageOf(await service.modelRouting(), 'research');

    expect(research.status).toBe('ENVIRONMENT_DEFAULT');
    expect(research.configured.modelId).toBeNull();
    expect(research.runtime.modelName).toBe('Gemini Flash (latest)');
  });

  it('says a stage is unreported rather than claiming the configured model is running', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } } });

    const writer = stageOf(await service.modelRouting(), 'writer');

    expect(writer.status).toBe('NOT_REPORTED');
    expect(writer.runtime.modelId).toBeNull();
    expect(writer.reportedAt).toBeNull();
  });

  it('flags a runtime that does not match the configuration', async () => {
    // Saved a free model; the newsroom is still on the old one because it has
    // not cycled since. Hiding this is how an operator concludes the setting
    // does not work.
    const { service } = build({ [KEY]: { writer: { provider: 'openai-compatible', model: 'upstage/solar-pro4:free' } } }, [
      event('writer', 'gemini-flash-latest', 'google-gemini'),
    ]);

    const writer = stageOf(await service.modelRouting(), 'writer');

    expect(writer.status).toBe('MISMATCH');
    expect(writer.configured.modelName).toBe('Solar Pro 4');
    expect(writer.runtime.modelName).toBe('Gemini Flash (latest)');
  });

  it('reports a stage the newsroom could not build as unavailable', async () => {
    const { service } = build({}, [
      { stage: 'writer', model: null, metadata: { provider: null, error: 'GEMINI_API_KEY is not set' }, occurredAt: new Date() },
    ]);

    const writer = stageOf(await service.modelRouting(), 'writer');

    expect(writer.status).toBe('UNAVAILABLE');
    expect(writer.error).toMatch(/GEMINI_API_KEY/);
  });

  it('passes through a model the catalogue does not list rather than hiding the stage', async () => {
    const { service } = build({}, [event('writer', 'some/model-from-env', 'openai-compatible')]);

    const writer = stageOf(await service.modelRouting(), 'writer');

    expect(writer.runtime.unknown).toBe(true);
    expect(writer.runtime.modelName).toBe('some/model-from-env');
    expect(writer.status).toBe('ENVIRONMENT_DEFAULT');
  });

  it('survives a malformed report without dropping the stage', async () => {
    const { service } = build({}, [
      { stage: 'writer', model: null, metadata: { provider: { nested: true } }, occurredAt: new Date() },
      { stage: 'quality', model: 'upstage/solar-pro4:free', metadata: null, occurredAt: new Date() },
    ]);

    const report = await service.modelRouting();

    expect(report.stages).toHaveLength(MODEL_STAGES.length);
    expect(stageOf(report, 'writer').status).toBe('NOT_REPORTED');
    expect(stageOf(report, 'quality').runtime.modelName).toBe('Solar Pro 4');
  });

  it('keeps the newest report per stage', async () => {
    const { service } = build({}, [
      event('writer', 'gemini-flash-latest', 'google-gemini', 1),
      event('writer', 'upstage/solar-pro4:free', 'openai-compatible', 90),
    ]);

    expect(stageOf(await service.modelRouting(), 'writer').runtime.modelId).toBe('gemini-flash-latest');
  });

  it('covers all nine stages, image generation included, with its own kind', async () => {
    const report = await build().service.modelRouting();

    expect(report.stages.map(stage => stage.stage)).toEqual([...MODEL_STAGES]);
    expect(stageOf(report, 'image').kind).toBe('image');
    expect(stageOf(report, 'writer').kind).toBe('text');
    // Labels travel with the payload so the screen keeps no stage list.
    expect(stageOf(report, 'factcheck').label).toBe('Fact check');
  });
});

describe('how fresh the runtime view is', () => {
  const recent = (minutesAgo: number) => [
    {
      stage: 'writer',
      model: 'gemini-flash-latest',
      metadata: { provider: 'google-gemini' },
      occurredAt: new Date(Date.now() - minutesAgo * 60_000),
    },
  ];

  it('is active while reports are arriving', async () => {
    const report = await build({}, recent(3)).service.modelRouting();

    expect(report.health).toBe('ACTIVE');
    expect(report.lastReportedAt).toBeTruthy();
  });

  it('is stale when the last report is old, which is not a claim the newsroom is down', async () => {
    const report = await build({}, recent(45)).service.modelRouting();

    expect(report.health).toBe('STALE');
  });

  it('is waiting when nothing has ever been reported', async () => {
    const report = await build().service.modelRouting();

    expect(report.health).toBe('WAITING');
    expect(report.lastReportedAt).toBeNull();
  });

  it('allows for a cycle running long before calling the view stale', async () => {
    // The newsroom cycles every ten minutes; a threshold at one cycle would
    // flash stale on any slow run and train an operator to ignore it.
    const report = await build({}, recent(12)).service.modelRouting();

    expect(report.staleAfterMinutes).toBeGreaterThanOrEqual(20);
    expect(report.health).toBe('ACTIVE');
  });
});

describe('the runtime endpoint', () => {
  const guard = new PermissionsGuard(new Reflector());

  function context(permissions: string[]): ExecutionContext {
    return {
      getHandler: () => AiNewsroomController.prototype.runtime,
      getClass: () => AiNewsroomController,
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
    } as unknown as ExecutionContext;
  }

  it('needs only the read permission, since it changes nothing', () => {
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS, AiNewsroomController.prototype.runtime)).toEqual([
      'ai.automation.read',
    ]);
    expect(guard.canActivate(context(['ai.automation.read']))).toBe(true);
  });

  it('is not reachable without an automation permission, or by an agent', () => {
    expect(() => guard.canActivate(context(['news.read']))).toThrow();
    expect(Reflect.getMetadata(IS_PUBLIC, AiNewsroomController.prototype.runtime)).toBeFalsy();
  });

  it('records no audit entry: a screen refreshing itself is not an administrative act', async () => {
    const { service, audits } = build({}, [
      { stage: 'writer', model: 'gemini-flash-latest', metadata: { provider: 'google-gemini' }, occurredAt: new Date() },
    ]);

    await service.modelRouting();

    expect(audits).toEqual([]);
  });

  it('returns no credentials', async () => {
    const { service } = build({}, [
      { stage: 'writer', model: 'gemini-flash-latest', metadata: { provider: 'google-gemini' }, occurredAt: new Date() },
    ]);

    const serialised = JSON.stringify(await service.modelRouting());

    expect(serialised).not.toMatch(/sk-[A-Za-z0-9]|AIza[A-Za-z0-9]|Bearer |password|secret/i);
  });
});

/* ------------------------------------------------- the catalogue endpoint -- */

describe('the catalogue endpoint', () => {
  const guard = new PermissionsGuard(new Reflector());

  function context(permissions: string[]): ExecutionContext {
    return {
      getHandler: () => AiNewsroomController.prototype.catalog,
      getClass: () => AiNewsroomController,
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
    } as unknown as ExecutionContext;
  }

  it('is readable by an admin, not only a super admin', () => {
    expect(Reflect.getMetadata(REQUIRED_PERMISSIONS, AiNewsroomController.prototype.catalog)).toEqual([
      'ai.automation.read',
    ]);
    expect(guard.canActivate(context(['ai.automation.read']))).toBe(true);
  });

  it('refuses an account with no automation permission at all', () => {
    expect(() => guard.canActivate(context(['news.read']))).toThrow();
  });

  it('returns the same catalogue the validator enforces', () => {
    const controller = new AiNewsroomController(null as never, null as never);

    const catalog = controller.catalog() as Record<string, CatalogProvider[]>;

    expect(Object.keys(catalog)).toEqual([...MODEL_STAGES]);
    expect(catalog.writer!.map(provider => provider.id)).toEqual([...providersFor('writer')]);
  });
});

/* ------------------------------------------------- reported routing source -- */

describe('who chose the model that ran', () => {
  const reported = (stage: string, model: string, provider: string, routingSource?: string) => ({
    stage,
    model,
    metadata: { provider, ...(routingSource ? { routingSource } : {}) },
    occurredAt: new Date(),
  });

  const find = (report: { stages: Array<{ stage: string }> }, stage: string) =>
    report.stages.find(entry => entry.stage === stage)! as never as { status: string };

  it('trusts the newsroom when it says the dashboard chose the model', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'openai-compatible', model: 'meituan/longcat-2.0:free' } } }, [
      reported('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE'),
    ]);

    expect(find(await service.modelRouting(), 'writer').status).toBe('ROUTED');
  });

  it('trusts the newsroom when it says the environment chose the model', async () => {
    const { service } = build({}, [
      reported('research', 'gemini-flash-latest', 'google-gemini', 'ENVIRONMENT_DEFAULT'),
    ]);

    expect(find(await service.modelRouting(), 'research').status).toBe('ENVIRONMENT_DEFAULT');
  });

  it('flags the window after an override is removed but before the newsroom refreshes', async () => {
    // Nothing configured now; the newsroom's last run still used an override.
    // That disagreement is real and temporary, and hiding it would make the
    // screen claim the environment is in charge while it is not.
    const { service } = build({}, [
      reported('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE'),
    ]);

    expect(find(await service.modelRouting(), 'writer').status).toBe('MISMATCH');
  });

  it('reads the spelling older newsroom builds send', async () => {
    const { service } = build({}, [reported('research', 'gemini-flash-latest', 'google-gemini', 'environment')]);

    expect(find(await service.modelRouting(), 'research').status).toBe('ENVIRONMENT_DEFAULT');
  });

  it('falls back to comparing configuration when the newsroom reported no source', async () => {
    const { service } = build({ [KEY]: { writer: { provider: 'google-gemini', model: 'gemini-flash-latest' } } }, [
      reported('writer', 'gemini-flash-latest', 'google-gemini'),
    ]);

    expect(find(await service.modelRouting(), 'writer').status).toBe('ROUTED');
  });
});

/* --------------------------------- the mismatch this feature was built for -- */

describe('the Writer case from the field', () => {
  /*
   * Reported symptom: the dashboard showed Writer running Gemini Flash while
   * the newsroom log showed LongCat. The dashboard was right about what it had
   * been told — the newsroom had published one observation, from a start where
   * its settings fetch had failed, and nothing republished afterwards. These
   * hold the CMS side to reading the latest observation and to never inventing
   * one.
   */
  const observation = (stage: string, model: string, provider: string, routingSource: string, minutesAgo = 1) => ({
    stage,
    model,
    metadata: { provider, routingSource },
    occurredAt: new Date(Date.now() - minutesAgo * 60_000),
  });

  const writer = async (service: { modelRouting: () => Promise<{ stages: Array<{ stage: string }> }> }) =>
    (await service.modelRouting()).stages.find(entry => entry.stage === 'writer')! as never as {
      status: string;
      configured: { modelName: string | null };
      runtime: { modelName: string | null; providerName: string | null; pricing: string | null };
    };

  const LONGCAT = { [KEY]: { writer: { provider: 'openai-compatible', model: 'meituan/longcat-2.0:free' } } };

  it('1: configured LongCat and running LongCat is a match', async () => {
    const { service } = build(LONGCAT, [
      observation('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE'),
    ]);

    const stage = await writer(service);
    expect(stage.status).toBe('ROUTED');
    expect(stage.runtime.modelName).toBe('LongCat 2.0');
    expect(stage.runtime.pricing).toBe('free');
  });

  it('2: configured LongCat and running Gemini is reported as a mismatch, not smoothed over', async () => {
    const { service } = build(LONGCAT, [
      observation('writer', 'gemini-flash-latest', 'google-gemini', 'ENVIRONMENT_DEFAULT'),
    ]);

    const stage = await writer(service);
    expect(stage.status).toBe('MISMATCH');
    expect(stage.configured.modelName).toBe('LongCat 2.0');
    expect(stage.runtime.modelName).toBe('Gemini Flash (latest)');
  });

  it('3: the newest observation wins, so a corrected run replaces a bad one', async () => {
    const { service } = build(LONGCAT, [
      observation('writer', 'gemini-flash-latest', 'google-gemini', 'ENVIRONMENT_DEFAULT', 30),
      observation('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE', 1),
    ]);

    expect((await writer(service)).status).toBe('ROUTED');
  });

  it('4: an old observation is still shown, with the report marked stale', async () => {
    const { service } = build(LONGCAT, [
      observation('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE', 120),
    ]);

    const report = await service.modelRouting();
    expect(report.health).toBe('STALE');
    expect((await writer(service)).runtime.modelName).toBe('LongCat 2.0');
  });

  it('9: with no observation the runtime is empty, never the configured model', async () => {
    const { service } = build(LONGCAT);

    const stage = await writer(service);
    expect(stage.status).toBe('NOT_REPORTED');
    expect(stage.configured.modelName).toBe('LongCat 2.0');
    expect(stage.runtime.modelName).toBeNull();
  });

  it('7, 8: Writer and Research are read independently', async () => {
    const { service } = build(LONGCAT, [
      observation('writer', 'meituan/longcat-2.0:free', 'openai-compatible', 'ADMIN_OVERRIDE'),
      observation('research', 'gemini-flash-latest', 'google-gemini', 'ENVIRONMENT_DEFAULT'),
    ]);

    const report = await service.modelRouting();
    const research = report.stages.find(entry => entry.stage === 'research')!;

    expect((await writer(service)).runtime.modelName).toBe('LongCat 2.0');
    expect(research.runtime.modelName).toBe('Gemini Flash (latest)');
    expect(research.status).toBe('ENVIRONMENT_DEFAULT');
  });
});
