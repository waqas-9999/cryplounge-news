/**
 * The stages that route to a model, and nothing else.
 *
 * A file of its own because the catalogue and the settings validator each need
 * the stage list and each need things from the other: the validator asks the
 * catalogue which providers a stage may use, and the catalogue types its
 * entries against the stage names. Holding the list in either one makes them
 * import each other, and a cycle between two modules that both build arrays at
 * load time resolves differently depending on which is required first — one
 * order works, the other leaves a module reading `undefined` from its
 * half-initialised partner and throwing at import.
 *
 * There is nothing to import here, so there is nothing to cycle.
 */

export const MODEL_STAGES = [
  'discovery',
  'scoring',
  'research',
  'writer',
  'editor',
  'factcheck',
  'quality',
  'imagePrompt',
  'image',
] as const;

export type ModelStage = (typeof MODEL_STAGES)[number];
