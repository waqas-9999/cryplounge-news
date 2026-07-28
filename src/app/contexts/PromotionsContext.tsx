import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PromotionArticle,
  fetchFeaturedArticles,
  fetchTrendingArticles,
  fetchPopularArticles,
  fetchBestWeekArticles,
  fetchBestMonthArticles,
  fetchLatestArticles
} from '../utils/promotions';

interface PromotionsContextType {
  featured: PromotionArticle[];
  trending: PromotionArticle[];
  popular: PromotionArticle[];
  bestWeek: PromotionArticle[];
  bestMonth: PromotionArticle[];
  latest: PromotionArticle[];
  loading: boolean;
  error: string | null;
  refreshPromotions: () => Promise<void>;
  loadMoreLatest: () => Promise<void>;
  hasMoreLatest: boolean;
}

const PromotionsContext = createContext<PromotionsContextType | undefined>(undefined);

export function PromotionsProvider({ children }: { children: ReactNode }) {
  const [featured, setFeatured] = useState<PromotionArticle[]>([]);
  const [trending, setTrending] = useState<PromotionArticle[]>([]);
  const [popular, setPopular] = useState<PromotionArticle[]>([]);
  const [bestWeek, setBestWeek] = useState<PromotionArticle[]>([]);
  const [bestMonth, setBestMonth] = useState<PromotionArticle[]>([]);
  const [latest, setLatest] = useState<PromotionArticle[]>([]);
  const [latestPage, setLatestPage] = useState(1);
  const [hasMoreLatest, setHasMoreLatest] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPromotions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all promotion types in parallel
      const [
        featuredData,
        trendingData,
        popularData,
        bestWeekData,
        bestMonthData,
        latestData
      ] = await Promise.all([
        fetchFeaturedArticles(4),
        fetchTrendingArticles(6),
        fetchPopularArticles(6),
        fetchBestWeekArticles(5),
        fetchBestMonthArticles(5),
        fetchLatestArticles(1, 20)
      ]);

      setFeatured(featuredData);
      setTrending(trendingData);
      setPopular(popularData);
      setBestWeek(bestWeekData);
      setBestMonth(bestMonthData);
      setLatest(latestData);
      setLatestPage(1);
      setHasMoreLatest(latestData.length === 20);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
      console.error('Error refreshing promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreLatest = async () => {
    if (!hasMoreLatest || loading) return;

    try {
      const nextPage = latestPage + 1;
      const moreLatest = await fetchLatestArticles(nextPage, 20);
      
      if (moreLatest.length < 20) {
        setHasMoreLatest(false);
      }
      
      setLatest(prev => [...prev, ...moreLatest]);
      setLatestPage(nextPage);
    } catch (err) {
      console.error('Error loading more latest articles:', err);
    }
  };

  // Initial load
  useEffect(() => {
    refreshPromotions();
  }, []);

  const value: PromotionsContextType = {
    featured,
    trending,
    popular,
    bestWeek,
    bestMonth,
    latest,
    loading,
    error,
    refreshPromotions,
    loadMoreLatest,
    hasMoreLatest
  };

  return (
    <PromotionsContext.Provider value={value}>
      {children}
    </PromotionsContext.Provider>
  );
}

export function usePromotions() {
  const context = useContext(PromotionsContext);
  if (context === undefined) {
    throw new Error('usePromotions must be used within a PromotionsProvider');
  }
  return context;
}
