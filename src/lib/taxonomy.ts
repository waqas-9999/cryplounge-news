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

/** Blockchain ecosystems used for project discovery. */
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
  'bnb-chain': 'BNB Chain',
};

/** Human-readable label for a slug: "market-analysis" -> "Market Analysis". */
export function labelForSlug(slug: string): string {
  if (LABEL_OVERRIDES[slug]) return LABEL_OVERRIDES[slug];
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
