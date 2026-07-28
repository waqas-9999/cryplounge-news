/**
 * AI Optimization Utilities for CrypLounge
 * Intelligent content recommendations, user behavior prediction, and smart caching
 */

import { memoryCache, storageCache } from './performance';
import { analytics } from './analytics';

/**
 * Content relevance scoring based on user behavior
 */
export interface ContentScore {
  id: string;
  score: number;
  factors: {
    recency: number;
    popularity: number;
    userInterest: number;
    trendingScore: number;
  };
}

/**
 * User interest profile
 */
export interface UserInterestProfile {
  categories: Map<string, number>; // category -> interest score (0-1)
  ecosystems: Map<string, number>; // ecosystem -> interest score (0-1)
  topics: Map<string, number>; // topic -> interest score (0-1)
  lastUpdated: number;
}

/**
 * AI-powered content recommendation engine
 */
export class ContentRecommendationEngine {
  private userProfile: UserInterestProfile;
  private readonly DECAY_RATE = 0.95; // Interest decay over time
  private readonly MIN_INTERACTIONS = 3; // Minimum interactions before making recommendations

  constructor() {
    this.userProfile = this.loadUserProfile();
  }

  /**
   * Load user profile from storage
   */
  private loadUserProfile(): UserInterestProfile {
    const cached = storageCache.get<UserInterestProfile>('user_profile');
    
    if (cached) {
      return {
        ...cached,
        categories: new Map(Object.entries(cached.categories || {})),
        ecosystems: new Map(Object.entries(cached.ecosystems || {})),
        topics: new Map(Object.entries(cached.topics || {})),
      };
    }

    return {
      categories: new Map(),
      ecosystems: new Map(),
      topics: new Map(),
      lastUpdated: Date.now(),
    };
  }

  /**
   * Save user profile to storage
   */
  private saveUserProfile() {
    const profileToSave = {
      categories: Object.fromEntries(this.userProfile.categories),
      ecosystems: Object.fromEntries(this.userProfile.ecosystems),
      topics: Object.fromEntries(this.userProfile.topics),
      lastUpdated: this.userProfile.lastUpdated,
    };

    storageCache.set('user_profile', profileToSave, 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  /**
   * Update user interest based on interaction
   */
  updateInterest(type: 'category' | 'ecosystem' | 'topic', value: string, weight: number = 0.1) {
    // Map type to correct plural form in UserInterestProfile
    const typeMap: Record<string, keyof UserInterestProfile> = {
      'category': 'categories',
      'ecosystem': 'ecosystems',
      'topic': 'topics'
    };
    
    const key = typeMap[type];
    if (!key) return;
    
    const map = this.userProfile[key] as Map<string, number>;
    if (!map) return;
    
    const currentScore = map.get(value) || 0;
    const newScore = Math.min(1, currentScore + weight);
    
    map.set(value, newScore);
    this.userProfile.lastUpdated = Date.now();
    this.saveUserProfile();
  }

  /**
   * Apply time decay to user interests
   */
  applyDecay() {
    const timeSinceUpdate = Date.now() - this.userProfile.lastUpdated;
    const daysSinceUpdate = timeSinceUpdate / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate < 1) return; // Don't decay if less than a day

    const decayFactor = Math.pow(this.DECAY_RATE, daysSinceUpdate);

    // Apply decay to all interest maps
    ['categories', 'ecosystems', 'topics'].forEach(key => {
      const map = this.userProfile[key as keyof UserInterestProfile] as Map<string, number>;
      if (!map) return;
      
      map.forEach((value, k) => {
        map.set(k, value * decayFactor);
      });
    });

    this.userProfile.lastUpdated = Date.now();
    this.saveUserProfile();
  }

  /**
   * Get content recommendations based on user profile
   */
  getRecommendations<T extends { id: string; category?: string; ecosystem?: string; topics?: string[] }>(
    items: T[],
    limit: number = 10
  ): T[] {
    this.applyDecay();

    // Calculate scores for each item
    const scoredItems = items.map(item => {
      let score = 0;
      let factorCount = 0;

      // Category score
      if (item.category) {
        const categoryScore = this.userProfile.categories.get(item.category) || 0;
        score += categoryScore;
        factorCount++;
      }

      // Ecosystem score
      if (item.ecosystem) {
        const ecosystemScore = this.userProfile.ecosystems.get(item.ecosystem) || 0;
        score += ecosystemScore;
        factorCount++;
      }

      // Topics score
      if (item.topics && item.topics.length > 0) {
        const topicsScore = item.topics.reduce((sum, topic) => {
          return sum + (this.userProfile.topics.get(topic) || 0);
        }, 0) / item.topics.length;
        score += topicsScore;
        factorCount++;
      }

      const finalScore = factorCount > 0 ? score / factorCount : 0;

      return {
        item,
        score: finalScore,
      };
    });

    // Sort by score and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ item }) => item);
  }

  /**
   * Get user interest summary
   */
  getInterestSummary() {
    return {
      topCategories: Array.from(this.userProfile.categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topEcosystems: Array.from(this.userProfile.ecosystems.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topTopics: Array.from(this.userProfile.topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }

  /**
   * Reset user profile
   */
  resetProfile() {
    this.userProfile = {
      categories: new Map(),
      ecosystems: new Map(),
      topics: new Map(),
      lastUpdated: Date.now(),
    };
    this.saveUserProfile();
  }
}

/**
 * Smart prefetching based on user behavior prediction
 */
export class SmartPrefetcher {
  private navigationPatterns: Map<string, Map<string, number>> = new Map();
  private readonly PATTERN_THRESHOLD = 0.3; // 30% probability threshold for prefetching

  constructor() {
    this.loadPatterns();
  }

  /**
   * Load navigation patterns from storage
   */
  private loadPatterns() {
    const cached = storageCache.get<any>('navigation_patterns');
    if (cached) {
      this.navigationPatterns = new Map(
        Object.entries(cached).map(([from, transitions]) => [
          from,
          new Map(Object.entries(transitions as any)),
        ])
      );
    }
  }

  /**
   * Save navigation patterns to storage
   */
  private savePatterns() {
    const patternsToSave = Object.fromEntries(
      Array.from(this.navigationPatterns.entries()).map(([from, transitions]) => [
        from,
        Object.fromEntries(transitions),
      ])
    );
    storageCache.set('navigation_patterns', patternsToSave);
  }

  /**
   * Record a navigation event
   */
  recordNavigation(from: string, to: string) {
    if (!this.navigationPatterns.has(from)) {
      this.navigationPatterns.set(from, new Map());
    }

    const transitions = this.navigationPatterns.get(from)!;
    const currentCount = transitions.get(to) || 0;
    transitions.set(to, currentCount + 1);

    this.savePatterns();
  }

  /**
   * Get predicted next pages
   */
  getPredictedPages(currentPage: string, threshold: number = this.PATTERN_THRESHOLD): string[] {
    const transitions = this.navigationPatterns.get(currentPage);
    if (!transitions || transitions.size === 0) return [];

    // Calculate total transitions
    const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);

    // Filter pages by probability threshold
    return Array.from(transitions.entries())
      .map(([page, count]) => ({
        page,
        probability: count / total,
      }))
      .filter(({ probability }) => probability >= threshold)
      .sort((a, b) => b.probability - a.probability)
      .map(({ page }) => page);
  }

  /**
   * Prefetch predicted pages
   */
  prefetchPredictedPages(currentPage: string) {
    const predictedPages = this.getPredictedPages(currentPage);
    
    predictedPages.forEach(page => {
      // Create prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/${page}`;
      document.head.appendChild(link);
    });

    if (predictedPages.length > 0) {
      console.log('[AI] Prefetching predicted pages:', predictedPages);
    }
  }
}

/**
 * Content similarity scoring for "Related Content"
 */
export class ContentSimilarityEngine {
  /**
   * Calculate similarity between two items based on shared attributes
   */
  calculateSimilarity<T extends Record<string, any>>(
    item1: T,
    item2: T,
    weights: Partial<Record<keyof T, number>> = {}
  ): number {
    const attributes = Object.keys(weights) as Array<keyof T>;
    let totalScore = 0;
    let totalWeight = 0;

    attributes.forEach(attr => {
      const weight = weights[attr] || 1;
      const value1 = item1[attr];
      const value2 = item2[attr];

      if (value1 === undefined || value2 === undefined) return;

      // Calculate similarity based on type
      let similarity = 0;

      if (typeof value1 === 'string' && typeof value2 === 'string') {
        similarity = value1 === value2 ? 1 : 0;
      } else if (Array.isArray(value1) && Array.isArray(value2)) {
        const intersection = value1.filter((v: unknown) => value2.includes(v));
        const union = [...new Set([...value1, ...value2])];
        similarity = union.length > 0 ? intersection.length / union.length : 0;
      } else if (typeof value1 === 'number' && typeof value2 === 'number') {
        const diff = Math.abs(value1 - value2);
        const max = Math.max(Math.abs(value1), Math.abs(value2));
        similarity = max > 0 ? 1 - (diff / max) : 1;
      }

      totalScore += similarity * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Find similar items
   */
  findSimilar<T extends Record<string, any>>(
    targetItem: T,
    items: T[],
    weights: Partial<Record<keyof T, number>> = {},
    limit: number = 5
  ): T[] {
    const scoredItems = items
      .filter(item => item !== targetItem)
      .map(item => ({
        item,
        score: this.calculateSimilarity(targetItem, item, weights),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scoredItems.map(({ item }) => item);
  }
}

/**
 * Trending content detection
 */
export class TrendingDetector {
  private viewCounts: Map<string, number[]> = new Map(); // id -> [timestamps]
  private readonly TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
  private readonly TRENDING_THRESHOLD = 10; // Minimum views to be trending

  /**
   * Record a view
   */
  recordView(contentId: string) {
    const views = this.viewCounts.get(contentId) || [];
    views.push(Date.now());
    this.viewCounts.set(contentId, views);

    // Clean up old views
    this.cleanupOldViews();
  }

  /**
   * Remove views outside the time window
   */
  private cleanupOldViews() {
    const cutoff = Date.now() - this.TIME_WINDOW;
    
    this.viewCounts.forEach((views, id) => {
      const recentViews = views.filter(timestamp => timestamp > cutoff);
      if (recentViews.length === 0) {
        this.viewCounts.delete(id);
      } else {
        this.viewCounts.set(id, recentViews);
      }
    });
  }

  /**
   * Get trending content IDs
   */
  getTrendingContent(minViews: number = this.TRENDING_THRESHOLD): Array<{ id: string; views: number; velocity: number }> {
    this.cleanupOldViews();

    const trending = Array.from(this.viewCounts.entries())
      .map(([id, views]) => {
        const viewCount = views.length;
        
        // Calculate velocity (views per hour)
        const oldestView = Math.min(...views);
        const timeSpan = Date.now() - oldestView;
        const hoursSpan = timeSpan / (1000 * 60 * 60);
        const velocity = hoursSpan > 0 ? viewCount / hoursSpan : 0;

        return { id, views: viewCount, velocity };
      })
      .filter(({ views }) => views >= minViews)
      .sort((a, b) => b.velocity - a.velocity);

    return trending;
  }

  /**
   * Check if content is trending
   */
  isTrending(contentId: string): boolean {
    const trending = this.getTrendingContent();
    return trending.some(item => item.id === contentId);
  }
}

// Export singleton instances
export const recommendationEngine = new ContentRecommendationEngine();
export const smartPrefetcher = new SmartPrefetcher();
export const similarityEngine = new ContentSimilarityEngine();
export const trendingDetector = new TrendingDetector();

/**
 * Initialize AI optimizations
 */
export function initializeAIOptimizations() {
  // Track page views for trending detection
  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    const result = originalPushState.apply(this, args);
    const currentPage = window.location.pathname;
    
    // Record for trending
    trendingDetector.recordView(currentPage);
    
    return result;
  };

  console.log('[AI] AI optimizations initialized');
}
