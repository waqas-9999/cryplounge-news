/**
 * Promotions API Service
 * Wrapper functions for promotion endpoints
 */

export interface PromotionArticle {
  id: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  categorySlug: string;
  slug: string;
  author: string;
  time: string;
  publishDate: string;
  badge?: 'FEATURED' | 'TRENDING' | 'POPULAR' | 'BEST WEEK' | 'BEST MONTH' | 'LATEST';
  score?: number;
  featuredStartDate?: string;
  featuredEndDate?: string;
  featuredPriority?: number;
}

export interface FeaturedPackage {
  id: string;
  article_id: string;
  buyer_id?: string;
  price_amount: number;
  currency: string;
  start_at: string;
  end_at: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'refunded';
  created_at: string;
}

export interface ForcePromotionRequest {
  set: boolean;
  expires_at?: string;
  reason?: string;
}

// ============== PUBLIC ENDPOINTS ==============

/**
 * Fetch featured articles
 */
export async function fetchFeaturedArticles(limit: number = 4): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/featured?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch featured articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}

/**
 * Fetch trending articles
 */
export async function fetchTrendingArticles(limit: number = 6): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/trending?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch trending articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending articles:', error);
    return [];
  }
}

/**
 * Fetch popular articles
 */
export async function fetchPopularArticles(limit: number = 6): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/popular?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch popular articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular articles:', error);
    return [];
  }
}

/**
 * Fetch best of week articles
 */
export async function fetchBestWeekArticles(limit: number = 5): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/best-week?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch best week articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching best week articles:', error);
    return [];
  }
}

/**
 * Fetch best of month articles
 */
export async function fetchBestMonthArticles(limit: number = 5): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/best-month?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch best month articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching best month articles:', error);
    return [];
  }
}

/**
 * Fetch latest articles with pagination
 */
export async function fetchLatestArticles(page: number = 1, limit: number = 20): Promise<PromotionArticle[]> {
  try {
    const response = await fetch(`/api/news/latest?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch latest articles');
    return await response.json();
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

// ============== ADMIN ENDPOINTS ==============

/**
 * Create a featured package
 */
export async function createFeaturedPackage(
  packageData: Partial<FeaturedPackage>,
  token: string
): Promise<FeaturedPackage | null> {
  try {
    const response = await fetch('/api/admin/featured/package', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(packageData)
    });
    if (!response.ok) throw new Error('Failed to create featured package');
    return await response.json();
  } catch (error) {
    console.error('Error creating featured package:', error);
    return null;
  }
}

/**
 * Activate a featured package
 */
export async function activateFeaturedPackage(
  packageId: string,
  activationData: { start_at: string; end_at: string; priority: number },
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/featured/${packageId}/activate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(activationData)
    });
    return response.ok;
  } catch (error) {
    console.error('Error activating featured package:', error);
    return false;
  }
}

/**
 * Cancel a featured package
 */
export async function cancelFeaturedPackage(
  packageId: string,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/featured/${packageId}/cancel`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Error cancelling featured package:', error);
    return false;
  }
}

/**
 * Fetch all promotions (admin)
 */
export async function fetchAllPromotions(token: string): Promise<any[]> {
  try {
    const response = await fetch('/api/admin/promotions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch promotions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
}

/**
 * Force trending status
 */
export async function forceTrending(
  articleId: string,
  data: ForcePromotionRequest,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/news/${articleId}/force-trending`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error forcing trending:', error);
    return false;
  }
}

/**
 * Force popular status
 */
export async function forcePopular(
  articleId: string,
  data: ForcePromotionRequest,
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/news/${articleId}/force-popular`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error forcing popular:', error);
    return false;
  }
}

/**
 * Force best of week status
 */
export async function forceBestWeek(
  articleId: string,
  data: { set: boolean },
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/news/${articleId}/force-week`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error forcing best week:', error);
    return false;
  }
}

/**
 * Force best of month status
 */
export async function forceBestMonth(
  articleId: string,
  data: { set: boolean },
  token: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/news/${articleId}/force-month`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.error('Error forcing best month:', error);
    return false;
  }
}
