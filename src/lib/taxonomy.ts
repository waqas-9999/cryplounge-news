/**
 * Canonical site taxonomy.
 *
 * CrypLounge is an editorial platform. `Market` here means *market news* only —
 * there are deliberately no coin rankings, prices, charts or dashboards.
 */

/** News desks, in navigation order. Each is a real URL under /news. */
export const NEWS_CATEGORIES = [
  'industry',
  'business',
  'technology',
  'security',
  'policy',
  'adoption',
  'market',
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
}

/** Research desks. */
export const RESEARCH_CATEGORIES = [
  'market-analysis',
  'project-analysis',
  'ecosystem-analysis',
  'industry-reports',
  'educational-guides',
] as const;

export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];

export function isResearchCategory(value: string): value is ResearchCategory {
  return (RESEARCH_CATEGORIES as readonly string[]).includes(value);
}

/** Regulation desks. */
export const REGULATION_CATEGORIES = [
  'laws',
  'taxation',
  'compliance',
  'licensing',
  'enforcement',
] as const;

export type RegulationCategory = (typeof REGULATION_CATEGORIES)[number];

export function isRegulationCategory(value: string): value is RegulationCategory {
  return (REGULATION_CATEGORIES as readonly string[]).includes(value);
}

/* ------------------------------------------- ecosystem project directory --- */

/**
 * Project categories for the Ecosystem directory.
 *
 * Ordering is editorial, not alphabetical: the categories readers browse most
 * come first. The list is designed to grow — adding a slug here is all that a
 * new category requires.
 */
export const PROJECT_CATEGORIES = [
  'layer-1',
  'layer-2',
  'defi',
  'wallets',
  'exchanges',
  'stablecoins',
  'infrastructure',
  'ai',
  'gaming',
  'nft',
  'depin',
  'identity',
  'rwa',
  'social',
  'data',
  'analytics',
  'security',
  'payments',
  'oracles',
  'launchpads',
  'developer-tools',
  'cross-chain',
  'dao',
  'privacy',
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export function isProjectCategory(value: string): value is ProjectCategory {
  return (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

/** Chains a project can be identified with or deployed on. */
export const NETWORKS = [
  'ethereum',
  'bitcoin',
  'solana',
  'base',
  'arbitrum',
  'optimism',
  'polygon',
  'bnb-chain',
  'avalanche',
  'cosmos',
  'near',
  'starknet',
  'multi-chain',
] as const;

export type Network = (typeof NETWORKS)[number];

export function isNetwork(value: string): value is Network {
  return (NETWORKS as readonly string[]).includes(value);
}

/**
 * Curated browse dimensions. These filter on project `tags` rather than adding
 * more required model fields, so a project joins a facet simply by being
 * tagged.
 */
export const PROJECT_TECHNOLOGIES = [
  'zero-knowledge',
  'rollup',
  'evm',
  'smart-contracts',
  'account-abstraction',
  'mpc',
  'restaking',
  'modular',
] as const;

export const PROJECT_USE_CASES = [
  'trading',
  'lending',
  'staking',
  'payments',
  'storage',
  'gaming',
  'identity',
  'governance',
] as const;

/** Legacy learn-era ecosystem list, still used by the ecosystem banners. */
export const ECOSYSTEMS = [
  'ethereum',
  'bitcoin',
  'solana',
  'polygon',
  'bnb-chain',
  'avalanche',
] as const;

export type Ecosystem = (typeof ECOSYSTEMS)[number];

export function isEcosystem(value: string): value is Ecosystem {
  return (ECOSYSTEMS as readonly string[]).includes(value);
}

/** Labels where the slug alone reads poorly or has specific casing. */
const LABEL_OVERRIDES: Record<string, string> = {
  defi: 'DeFi',
  nft: 'NFT',
  dao: 'DAO',
  rwa: 'RWA',
  depin: 'DePIN',
  seo: 'SEO',
  ai: 'AI',
  evm: 'EVM',
  mpc: 'MPC',
  'bnb-chain': 'BNB Chain',
  'layer-1': 'Layer 1',
  'layer-2': 'Layer 2',
  'cross-chain': 'Cross-chain',
  'zero-knowledge': 'Zero-Knowledge',
  'multi-chain': 'Multi-chain',
};

/** Human-readable label for a slug: "market-analysis" -> "Market Analysis". */
export function labelForSlug(slug: string): string {
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
