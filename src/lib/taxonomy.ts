/**
 * Canonical site taxonomy.
 *
 * The original `utils/routes.ts` NEWS_CATEGORIES list omitted the five
 * categories the header actually linked to (latest, markets, ecosystem,
 * regulation, research), so every top-level nav item fell through to the 404
 * page. Both the section categories and the topical ones live here now.
 */

/** Top-level news sections, each backed by a bespoke page component. */
export const NEWS_SECTIONS = [
  'latest',
  'markets',
  'ecosystem',
  'regulation',
  'research',
] as const;

/** Topical categories rendered by the generic CategoryPage. */
export const NEWS_TOPICS = [
  'business',
  'finance',
  'geopolitics',
  'technology',
  'policy',
  'investment',
  'blockchain',
  'defi',
  'nfts',
  'gaming',
  'exchanges',
  'startups',
  'web3-ai',
  'security-hacks',
] as const;

export const NEWS_CATEGORIES = [...NEWS_SECTIONS, ...NEWS_TOPICS] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
}

/** Ecosystems that have dedicated learn hubs. */
export const ECOSYSTEMS = [
  'ethereum',
  'polygon',
  'solana',
  'bnb-chain',
  'bitcoin',
  'avalanche',
] as const;

export type Ecosystem = (typeof ECOSYSTEMS)[number];

export function isEcosystem(value: string): value is Ecosystem {
  return (ECOSYSTEMS as readonly string[]).includes(value);
}

/** Human-readable label for a slug: "security-hacks" -> "Security Hacks". */
export function labelForSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
