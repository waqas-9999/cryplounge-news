import { MODEL_STAGES, type ModelStage } from './model-settings';

/**
 * Every provider and model an administrator may choose, in one place.
 *
 * The screen, the validator and the API documentation all read this file, so
 * adding a model is one entry and nothing else. Scattering ids across a React
 * component, a DTO and a service is how a dropdown comes to offer a model the
 * router cannot call.
 *
 * ## What may be listed here
 *
 * Only providers the newsroom's own factory can build, and only models those
 * providers actually serve. This catalogue is an offer: anything in it will be
 * selected, saved, and called for real on the next cycle. A plausible-looking
 * id that no provider serves produces a stage that fails every call until
 * someone notices.
 *
 * The free models are the ones this project has tested through its
 * OpenAI-compatible proxy — the notes come from `.env.example` in the newsroom
 * repository, which records what each one did with the pipeline's structured
 * output. `tencent/hy3:free` is deliberately absent: it spends its budget on a
 * reasoning trace and returns empty content at the sizes the newsroom asks
 * for.
 *
 * ## What "free" means here, and what it does not
 *
 * `pricing` is a statement about the provider's billing for that model, shown
 * so an operator can see what a choice costs before making it. It changes
 * nothing about how the model is called: credentials still come from the
 * newsroom's environment, and a free model on a provider with no key
 * configured fails exactly as a paid one would. Nothing in this file bypasses
 * authentication, and no key or secret appears in it.
 */

export type Pricing = 'free' | 'paid';

/** Text stages and image generation need different providers; they share no implementation. */
export type ProviderKind = 'text' | 'image';

export interface CatalogModel {
  id: string;
  /** Shown in the dropdown. The id is what is stored. */
  name: string;
  pricing: Pricing;
  /** One line on what it is good for, shown under the selection. */
  description?: string;
  /**
   * Stages this model may be chosen for. Absent means every stage its
   * provider serves — the normal case, since a text model that can write can
   * also score.
   */
  stages?: ModelStage[];
  /** Marks the model the newsroom falls back to for this provider. */
  isProviderDefault?: boolean;
}

export interface CatalogProvider {
  id: string;
  name: string;
  kind: ProviderKind;
  description?: string;
  models: CatalogModel[];
}

/**
 * The catalogue.
 *
 * Ordered by how this newsroom actually runs: the OpenAI-compatible proxy
 * first, because that is where the free models are and where an operator
 * looking to cut spend will go.
 */
export const MODEL_CATALOG: CatalogProvider[] = [
  {
    id: 'openai-compatible',
    name: 'OpenAI-compatible endpoint',
    kind: 'text',
    description:
      'The proxy the newsroom is pointed at, which carries the free models. No API key of its own.',
    models: [
      {
        id: 'upstage/solar-pro4:free',
        name: 'Solar Pro 4',
        pricing: 'free',
        description: 'Tested with this pipeline: clean structured output, no reasoning overhead.',
        isProviderDefault: true,
      },
      {
        id: 'meituan/longcat-2.0:free',
        name: 'LongCat 2.0',
        pricing: 'free',
        description: 'Tested: clean structured output, the most compact of the free models.',
      },
      {
        id: 'poolside/laguna-s-2.1:free',
        name: 'Laguna S 2.1',
        pricing: 'free',
        description: 'Tested: clean structured output.',
      },
      {
        id: 'stepfun/step-3.7-flash:free',
        name: 'Step 3.7 Flash',
        pricing: 'free',
        description: 'Works, but emits a reasoning trace, so it spends more tokens per answer.',
      },
      {
        id: 'inclusionai/ling-3.0-flash-fin:free',
        name: 'Ling 3.0 Flash Fin',
        pricing: 'free',
        description: 'Free, with structured output. Untested against this pipeline.',
      },
    ],
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    kind: 'text',
    description: 'Billed to the project Gemini key. Currently writes and researches.',
    models: [
      {
        id: 'gemini-flash-latest',
        name: 'Gemini Flash (latest)',
        pricing: 'paid',
        description: 'Fast and cheap for its class. What research and writing run on today.',
        isProviderDefault: true,
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        pricing: 'paid',
        description: 'A pinned version, for when "latest" moving underneath you is a problem.',
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        pricing: 'paid',
        description: 'Stronger and slower. Worth it for research on complex stories, costly everywhere else.',
      },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA',
    kind: 'text',
    description: 'Nemotron, through the NVIDIA endpoint. No per-token charge on this account.',
    models: [
      {
        id: 'nvidia/nemotron-3-super-120b-a12b',
        name: 'Nemotron 3 Super',
        pricing: 'free',
        description: 'A large model that costs nothing here. Fact checking runs on it.',
        isProviderDefault: true,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    kind: 'text',
    description: 'Claude, billed to the Anthropic key. Needs ANTHROPIC_API_KEY on the newsroom.',
    models: [
      {
        id: 'claude-opus-5',
        name: 'Claude Opus 5',
        pricing: 'paid',
        description: 'The strongest writer available here, and the most expensive.',
      },
      {
        id: 'claude-sonnet-5',
        name: 'Claude Sonnet 5',
        pricing: 'paid',
        description: 'The newsroom default when no other model is configured.',
        isProviderDefault: true,
      },
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        pricing: 'paid',
        description: 'Cheap and quick. Suits discovery and scoring, which run on everything.',
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    kind: 'text',
    description: 'Billed to the OpenAI key. Needs OPENAI_API_KEY on the newsroom.',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', pricing: 'paid', isProviderDefault: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', pricing: 'paid', description: 'The cheap tier, for the high-volume stages.' },
    ],
  },

  /* ------------------------------------------------------------- images -- */

  {
    id: 'gemini',
    name: 'Google Gemini (images)',
    kind: 'image',
    description: 'Draws the article image. Uses the same Gemini key as the text stages.',
    models: [
      {
        id: 'gemini-2.5-flash-image',
        name: 'Gemini 2.5 Flash Image',
        pricing: 'paid',
        description: 'What article images are drawn with today.',
        isProviderDefault: true,
      },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA (images)',
    kind: 'image',
    description: 'FLUX through the NVIDIA endpoint.',
    models: [
      {
        id: 'black-forest-labs/flux.2-klein-4b',
        name: 'FLUX.2 Klein 4B',
        pricing: 'free',
        isProviderDefault: true,
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI (images)',
    kind: 'image',
    description: 'Needs OPENAI_API_KEY on the newsroom.',
    models: [{ id: 'gpt-image-1', name: 'GPT Image 1', pricing: 'paid', isProviderDefault: true }],
  },
];

/** Which kind of provider a stage needs. Image generation is the only image stage. */
export function kindOf(stage: ModelStage): ProviderKind {
  return stage === 'image' ? 'image' : 'text';
}

/** The providers selectable for a stage, with only the models that stage may use. */
export function providersForStage(stage: ModelStage): CatalogProvider[] {
  const kind = kindOf(stage);

  return MODEL_CATALOG.filter(provider => provider.kind === kind)
    .map(provider => ({
      ...provider,
      models: provider.models.filter(model => !model.stages || model.stages.includes(stage)),
    }))
    .filter(provider => provider.models.length > 0);
}

/** Provider ids selectable for a stage. */
export function providerIdsForStage(stage: ModelStage): string[] {
  return providersForStage(stage).map(provider => provider.id);
}

/**
 * Looks a model up for a stage.
 *
 * When `providerId` is absent the model is searched for across every provider
 * that serves the stage. That is not a convenience: settings written before
 * this catalogue existed could set a model without a provider, and they have
 * to keep resolving.
 */
export function findModel(
  stage: ModelStage,
  providerId: string | null,
  modelId: string
): { provider: CatalogProvider; model: CatalogModel } | undefined {
  for (const provider of providersForStage(stage)) {
    if (providerId && provider.id !== providerId) continue;
    const model = provider.models.find(entry => entry.id === modelId);
    if (model) return { provider, model };
  }
  return undefined;
}

/**
 * The whole catalogue, keyed by stage, as the admin screen consumes it.
 *
 * Built per stage rather than sent once and filtered in the browser, so the
 * rule about which model may run where is stated in one place — here — and the
 * screen cannot offer a combination the validator will reject.
 */
export function catalogForStages(): Record<ModelStage, CatalogProvider[]> {
  return Object.fromEntries(MODEL_STAGES.map(stage => [stage, providersForStage(stage)])) as Record<
    ModelStage,
    CatalogProvider[]
  >;
}
