'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';
import type { Article } from '@/types/article';

interface MarketsPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
  /** Page 1, fetched on the server so the listing is crawlable without JS. */
  initialArticles?: Article[];
  initialTotalPages?: number;
}

export function MarketsPage({ images, onNavigate, initialArticles, initialTotalPages }: MarketsPageProps) {
  return (
    <CategoryNewsPage
      category="market"
      displayTitle="Markets"
      images={images}
      onNavigate={onNavigate}
      initialArticles={initialArticles}
      initialTotalPages={initialTotalPages}
    />
  );
}
