/**
 * Content Promotion Scoring Utilities
 * Implements scoring algorithms for Trending, Popular, Best of Week, and Best of Month
 */

export interface ArticleMetrics {
  views_last_48h?: number;
  likes_last_48h?: number;
  shares_last_48h?: number;
  comments_last_48h?: number;
  views_7d?: number;
  likes_7d?: number;
  shares_7d?: number;
  comments_7d?: number;
  views_30d?: number;
  likes_30d?: number;
  shares_30d?: number;
  comments_30d?: number;
}

export interface ScoringWeights {
  views: number;
  likes: number;
  shares: number;
  comments: number;
}

/**
 * Calculate trending score based on last 48 hours of activity
 * Formula: views * 1 + likes * 5 + shares * 10 + comments * 8
 */
export function calculateTrendingScore(metrics: ArticleMetrics): number {
  const weights: ScoringWeights = {
    views: 1,
    likes: 5,
    shares: 10,
    comments: 8
  };

  return (
    (metrics.views_last_48h || 0) * weights.views +
    (metrics.likes_last_48h || 0) * weights.likes +
    (metrics.shares_last_48h || 0) * weights.shares +
    (metrics.comments_last_48h || 0) * weights.comments
  );
}

/**
 * Calculate popular score based on last 7 days of activity
 * Formula: views * 1 + likes * 2 + shares * 3
 */
export function calculatePopularScore(metrics: ArticleMetrics): number {
  const weights: ScoringWeights = {
    views: 1,
    likes: 2,
    shares: 3,
    comments: 0
  };

  return (
    (metrics.views_7d || 0) * weights.views +
    (metrics.likes_7d || 0) * weights.likes +
    (metrics.shares_7d || 0) * weights.shares
  );
}

/**
 * Calculate best of week score (7-day aggregate)
 */
export function calculateBestWeekScore(metrics: ArticleMetrics): number {
  const weights: ScoringWeights = {
    views: 1,
    likes: 3,
    shares: 5,
    comments: 4
  };

  return (
    (metrics.views_7d || 0) * weights.views +
    (metrics.likes_7d || 0) * weights.likes +
    (metrics.shares_7d || 0) * weights.shares +
    (metrics.comments_7d || 0) * weights.comments
  );
}

/**
 * Calculate best of month score (30-day aggregate)
 */
export function calculateBestMonthScore(metrics: ArticleMetrics): number {
  const weights: ScoringWeights = {
    views: 1,
    likes: 3,
    shares: 5,
    comments: 4
  };

  return (
    (metrics.views_30d || 0) * weights.views +
    (metrics.likes_30d || 0) * weights.likes +
    (metrics.shares_30d || 0) * weights.shares +
    (metrics.comments_30d || 0) * weights.comments
  );
}

/**
 * Sort articles by score and return top N
 */
export function getTopScoredArticles<T extends { score?: number }>(
  articles: T[],
  limit: number
): T[] {
  return [...articles]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}

/**
 * Check if an article should be marked as trending
 * Based on threshold or top N logic
 */
export function shouldMarkAsTrending(
  score: number,
  allScores: number[],
  topN: number = 10
): boolean {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  const threshold = sortedScores[topN - 1] || 0;
  return score >= threshold && score > 0;
}

/**
 * Check if an article should be marked as popular
 */
export function shouldMarkAsPopular(
  score: number,
  allScores: number[],
  topN: number = 10
): boolean {
  return shouldMarkAsTrending(score, allScores, topN);
}
