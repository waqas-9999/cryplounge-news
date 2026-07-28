/**
 * Centralized Route Configuration for CrypLounge
 * AI-optimized routing structure with clear hierarchy and SEO-friendly URLs
 */

export interface RouteConfig {
  path: string;
  pattern?: RegExp;
  level: number;
  description: string;
  seoPath: string;
}

// Main navigation routes
export const MAIN_ROUTES = {
  HOME: 'home',
  NEWS: 'news',
  MARKET: 'market',
  LEARN: 'learn',
  FOUNDERS: 'founders',
  EVENTS: 'events',
} as const;

// News categories
export const NEWS_CATEGORIES = [
  'finance',
  'technology',
  'geopolitics',
  'business',
  'tech',
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

// Market ecosystems
export const MARKET_ECOSYSTEMS = [
  'ethereum',
  'polygon',
  'solana',
  'bnb-chain',
  'bitcoin',
  'avalanche',
] as const;

// Market categories
export const MARKET_CATEGORIES = [
  'all',
  'defi',
  'dex',
  'dexs',
  'protocol',
  'protocols',
  'nft',
  'nfts',
  'depin',
  'rwa',
  'gaming',
  'infrastructure',
  'wallet',
  'wallets',
  'bridge',
  'bridges',
  'lending',
  'staking',
  'dao',
  'daos',
  'metaverse',
  'ai',
  'storage',
  'launchpad',
  'launchpads',
  'stablecoin',
  'stablecoins',
  'layer-1',
  'layer-2',
  'layer1',
  'layer2',
] as const;

// Learn ecosystems (same as market ecosystems)
export const LEARN_ECOSYSTEMS = MARKET_ECOSYSTEMS;

// Learn categories (same as market categories)
export const LEARN_CATEGORIES = MARKET_CATEGORIES;

// Learn main sections
export const LEARN_SECTIONS = {
  CRYP_LEARN: 'crypto', // Global blockchain education
  ECOSYSTEM_LEARN: 'ecosystem', // Ecosystem-specific learning
} as const;

/**
 * Route matching utility
 */
export class RouteMatche {
  /**
   * Match news routes
   */
  static matchNewsRoute(path: string): { type: 'category' | 'article' | null; category?: string; slug?: string } {
    // Article detail: news/{category}/{article-slug}
    const articleMatch = path.match(/^news\/([^/]+)\/(.+)$/);
    if (articleMatch) {
      const [, category, slug] = articleMatch;
      if (NEWS_CATEGORIES.includes(category as any)) {
        return { type: 'article', category, slug };
      }
    }

    // Category listing: news/{category}
    const categoryMatch = path.match(/^news\/(.+)$/);
    if (categoryMatch) {
      const [, category] = categoryMatch;
      if (NEWS_CATEGORIES.includes(category as any)) {
        return { type: 'category', category };
      }
    }

    return { type: null };
  }

  /**
   * Match market routes
   */
  static matchMarketRoute(path: string): { 
    type: 'main' | 'ecosystem' | 'category' | 'token' | 'global-category' | 'special' | null; 
    ecosystem?: string; 
    category?: string; 
    tokenId?: string;
    special?: string;
  } {
    // Token detail: market/{ecosystem}/{category}/{tokenId}
    const tokenMatch = path.match(/^market\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (tokenMatch) {
      const [, ecosystem, category, tokenId] = tokenMatch;
      if (MARKET_ECOSYSTEMS.includes(ecosystem as any) && MARKET_CATEGORIES.includes(category as any)) {
        return { type: 'token', ecosystem, category, tokenId };
      }
    }

    // Category within ecosystem: market/{ecosystem}/{category}
    const categoryMatch = path.match(/^market\/([^/]+)\/([^/]+)$/);
    if (categoryMatch) {
      const [, ecosystem, category] = categoryMatch;
      if (MARKET_ECOSYSTEMS.includes(ecosystem as any) && MARKET_CATEGORIES.includes(category as any)) {
        return { type: 'category', ecosystem, category };
      }
    }

    // Special market pages OR Ecosystem page OR Global category: market/{param}
    const singleParamMatch = path.match(/^market\/([^/]+)$/);
    if (singleParamMatch) {
      const [, param] = singleParamMatch;
      
      // Check if it's a special page first
      if (['trending', 'gainers', 'losers', 'new-listings', 'high-volume'].includes(param)) {
        return { type: 'special', special: param };
      }
      
      // Check if it's an ecosystem
      if (MARKET_ECOSYSTEMS.includes(param as any)) {
        return { type: 'ecosystem', ecosystem: param };
      }
      
      // Check if it's a category (global category page)
      if (MARKET_CATEGORIES.includes(param as any)) {
        return { type: 'global-category', category: param };
      }
    }

    // Main market page
    if (path === 'market') {
      return { type: 'main' };
    }

    return { type: null };
  }

  /**
   * Match learn routes
   */
  static matchLearnRoute(path: string): {
    type: 'main' | 'cryp-learn' | 'ecosystem-hub' | 'ecosystem-main' | 'ecosystem-overview' | 'ecosystem-tutorials' | 'ecosystem-project' | 'ecosystem-category' | 'course' | null;
    ecosystem?: string;
    category?: string;
    courseId?: string;
    projectName?: string;
  } {
    // Course detail: learn/{ecosystem}/{category}/{courseId}
    const courseMatch = path.match(/^learn\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (courseMatch) {
      const [, ecosystem, category, courseId] = courseMatch;
      if (LEARN_ECOSYSTEMS.includes(ecosystem as any) && LEARN_CATEGORIES.includes(category as any)) {
        return { type: 'course', ecosystem, category, courseId };
      }
    }

    // Ecosystem project: learn/{ecosystem}/projects/{projectName}
    const projectMatch = path.match(/^learn\/([^/]+)\/projects\/(.+)$/);
    if (projectMatch) {
      const [, ecosystem, projectName] = projectMatch;
      if (LEARN_ECOSYSTEMS.includes(ecosystem as any)) {
        return { type: 'ecosystem-project', ecosystem, projectName };
      }
    }

    // Ecosystem category: learn/{ecosystem}/{category}
    const categoryMatch = path.match(/^learn\/([^/]+)\/([^/]+)$/);
    if (categoryMatch) {
      const [, ecosystem, category] = categoryMatch;
      
      // Check for special pages
      if (category === 'overview' && LEARN_ECOSYSTEMS.includes(ecosystem as any)) {
        return { type: 'ecosystem-overview', ecosystem };
      }
      if (category === 'tutorials' && LEARN_ECOSYSTEMS.includes(ecosystem as any)) {
        return { type: 'ecosystem-tutorials', ecosystem };
      }
      
      // Regular category
      if (LEARN_ECOSYSTEMS.includes(ecosystem as any) && LEARN_CATEGORIES.includes(category as any)) {
        return { type: 'ecosystem-category', ecosystem, category };
      }
    }

    // Ecosystem main page: learn/{ecosystem}
    const ecosystemMatch = path.match(/^learn\/([^/]+)$/);
    if (ecosystemMatch) {
      const [, ecosystem] = ecosystemMatch;
      
      // Check for main sections
      if (ecosystem === LEARN_SECTIONS.CRYP_LEARN) {
        return { type: 'cryp-learn' };
      }
      if (ecosystem === LEARN_SECTIONS.ECOSYSTEM_LEARN) {
        return { type: 'ecosystem-hub' };
      }
      
      // Ecosystem-specific page
      if (LEARN_ECOSYSTEMS.includes(ecosystem as any)) {
        return { type: 'ecosystem-main', ecosystem };
      }
    }

    // Main learn page
    if (path === 'learn') {
      return { type: 'main' };
    }

    return { type: null };
  }

  /**
   * Match founders routes
   */
  static matchFoundersRoute(path: string): {
    type: 'main' | 'founder-detail' | 'founder-project' | 'category' | null;
    founderId?: string;
    projectSlug?: string;
    category?: string;
  } {
    // Founder category: founders/category/{category}
    const categoryMatch = path.match(/^founders\/category\/([^/]+)$/);
    if (categoryMatch) {
      const [, category] = categoryMatch;
      return { type: 'category', category };
    }

    // Founder project: founders/{founderId}/projects/{projectSlug}
    const projectMatch = path.match(/^founders\/([^/]+)\/projects\/(.+)$/);
    if (projectMatch) {
      const [, founderId, projectSlug] = projectMatch;
      return { type: 'founder-project', founderId, projectSlug };
    }

    // Founder detail: founders/{founderId}
    const founderMatch = path.match(/^founders\/([^/]+)$/);
    if (founderMatch) {
      const [, founderId] = founderMatch;
      // Skip if it's 'submit'
      if (founderId !== 'submit') {
        return { type: 'founder-detail', founderId };
      }
    }

    // Main founders page
    if (path === 'founders') {
      return { type: 'main' };
    }

    return { type: null };
  }

  /**
   * Match events routes
   */
  static matchEventsRoute(path: string): {
    type: 'main' | 'event-detail' | 'event-type' | null;
    eventSlug?: string;
    eventType?: string;
  } {
    // Event type: events/type/{type}
    const typeMatch = path.match(/^events\/type\/([^/]+)$/);
    if (typeMatch) {
      const [, eventType] = typeMatch;
      return { type: 'event-type', eventType };
    }

    // Event detail: events/{eventSlug}
    const eventMatch = path.match(/^events\/([^/]+)$/);
    if (eventMatch) {
      const [, eventSlug] = eventMatch;
      // Skip if it's 'submit'
      if (eventSlug !== 'submit') {
        return { type: 'event-detail', eventSlug };
      }
    }

    // Main events page
    if (path === 'events') {
      return { type: 'main' };
    }

    return { type: null };
  }
}

/**
 * Generate SEO-friendly URL from route parameters
 */
export function generateURL(section: string, params: Record<string, string> = {}): string {
  const parts = [section];
  
  if (params.ecosystem) parts.push(params.ecosystem);
  if (params.category) parts.push(params.category);
  if (params.tokenId) parts.push(params.tokenId);
  if (params.courseId) parts.push(params.courseId);
  if (params.founderId) parts.push(params.founderId);
  if (params.projectSlug) parts.push('projects', params.projectSlug);
  if (params.eventSlug) parts.push(params.eventSlug);
  if (params.slug) parts.push(params.slug);
  
  return parts.join('/');
}

/**
 * Get human-readable title from route path
 */
export function getRouteTitle(path: string): string {
  const parts = path.split('/').filter(Boolean);
  
  return parts
    .map(part => {
      return part
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    })
    .join(' - ');
}

/**
 * Validate if a route path is valid
 */
export function isValidRoute(path: string): boolean {
  if (path === 'home' || path === '') return true;
  if (Object.values(MAIN_ROUTES).includes(path as any)) return true;
  
  // Check all route types
  const newsMatch = RouteMatche.matchNewsRoute(path);
  if (newsMatch.type) return true;
  
  // Market routes removed
  // const marketMatch = RouteMatche.matchMarketRoute(path);
  // if (marketMatch.type) return true;
  
  const learnMatch = RouteMatche.matchLearnRoute(path);
  if (learnMatch.type) return true;
  
  const foundersMatch = RouteMatche.matchFoundersRoute(path);
  if (foundersMatch.type) return true;
  
  const eventsMatch = RouteMatche.matchEventsRoute(path);
  if (eventsMatch.type) return true;
  
  return false;
}