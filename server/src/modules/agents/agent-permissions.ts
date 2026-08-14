/**
 * Which permissions an AI agent may hold.
 *
 * `assertKnownPermissions` already checks that a key *exists*. That is not
 * enough: `users.manage` and `roles.manage` are perfectly real keys, so an
 * agent could be granted them and would pass validation. This file adds the
 * missing question — is this key appropriate for a non-human caller?
 *
 * Deliberately an **allow-list, not a deny-list**. A deny-list fails open: any
 * permission added to the catalogue later would be grantable to agents until
 * somebody remembered to forbid it. This fails closed instead — a new key is
 * refused for agents until it is explicitly opted in here.
 */

/**
 * The only keys an AI agent may hold.
 *
 * Note what is *absent* and why:
 *
 *  - `taxonomy.manage` — agents must file stories into categories that already
 *    exist. Granting this would let one create its own category, which is the
 *    exact behaviour the category-sync design exists to prevent.
 *  - `news.delete` — an agent that can create content must not be able to
 *    remove an editor's.
 *  - every `users.*`, `roles.*`, `settings.*`, `ai.automation.*` key — an
 *    agent must never be able to alter accounts, permissions, site
 *    configuration, or its own kill switch.
 */
export const AGENT_ALLOWED_PERMISSIONS = [
  'news.read',
  'news.create',
  'news.update',
  /**
   * Permitted, but it is not sufficient on its own: `defaultPublishMode` also
   * has to be a publishing mode, and the global/category automation switches
   * must both be on. Three independent controls, any one of which stops it.
   */
  'news.publish',
  'media.read',
  'media.upload',
] as const;

export type AgentPermission = (typeof AGENT_ALLOWED_PERMISSIONS)[number];

const ALLOWED = new Set<string>(AGENT_ALLOWED_PERMISSIONS);

/**
 * Keys that are not merely disallowed but dangerous, listed so a refusal can
 * explain *why* rather than just saying "not allowed". Anything not in the
 * allow-list is refused regardless of whether it appears here.
 */
const EXPLICITLY_DANGEROUS: Record<string, string> = {
  'users.manage': 'would let an agent create or disable staff accounts',
  'users.read': 'would expose staff account data to an automated caller',
  'roles.manage': 'would let an agent grant itself any permission',
  'settings.manage': 'would let an agent change site configuration',
  'ai.automation.manage': 'would let an agent switch on its own automatic publishing',
  'taxonomy.manage': 'would let an agent create categories instead of using existing ones',
  'news.delete': 'would let an agent delete editorial content',
  'media.delete': 'would let an agent delete media used by published articles',
  'agents.manage': 'would let an agent create further agents or escalate its own grants',
  'webhooks.manage': 'would let an agent redirect delivery of internal events',
  'audit.read': 'would expose the audit trail that records the agent’s own actions',
};

export interface PermissionCheck {
  allowed: boolean;
  /** Keys refused, with the reason where one is known. */
  rejected: Array<{ key: string; reason: string }>;
}

/**
 * Checks a requested permission set against the allow-list.
 *
 * Returns a result rather than throwing so the caller decides the response
 * shape, and so this stays usable from tests and from a future admin UI that
 * wants to grey out the forbidden options.
 */
export function checkAgentPermissions(keys: readonly string[]): PermissionCheck {
  const rejected = keys
    .filter(key => !ALLOWED.has(key))
    .map(key => ({
      key,
      reason:
        EXPLICITLY_DANGEROUS[key] ??
        'is not on the list of permissions an AI agent may hold',
    }));

  return { allowed: rejected.length === 0, rejected };
}

/** Human-readable summary for an error message or an audit entry. */
export function describeRejections(check: PermissionCheck): string {
  return check.rejected.map(item => `"${item.key}" ${item.reason}`).join('; ');
}

/**
 * Whether a permission set can publish without a human.
 *
 * Used to decide when a grant deserves a warning in the audit log — creating
 * drafts is routine, publishing straight to the public site is not.
 */
export function grantsAutonomousPublishing(keys: readonly string[]): boolean {
  return keys.includes('news.publish');
}
