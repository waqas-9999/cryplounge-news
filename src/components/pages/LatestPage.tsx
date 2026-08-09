'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';
import type { Article } from '@/types/article';

interface LatestPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
  /** Page 1, fetched on the server so the listing is crawlable without JS. */
  initialArticles?: Article[];
  initialTotalPages?: number;
}

export function LatestPage({ images, onNavigate, initialArticles, initialTotalPages }: LatestPageProps) {
  return (
    <CategoryNewsPage
      displayTitle="Latest"
      images={images}
      onNavigate={onNavigate}
      initialArticles={initialArticles}
      initialTotalPages={initialTotalPages}
    />
  );
}
