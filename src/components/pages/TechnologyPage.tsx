'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';
import type { Article } from '@/types/article';

interface TechnologyPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
  /** Page 1, fetched on the server so the listing is crawlable without JS. */
  initialArticles?: Article[];
  initialTotalPages?: number;
}

export function TechnologyPage({ images, onNavigate, initialArticles, initialTotalPages }: TechnologyPageProps) {
  return (
    <CategoryNewsPage
      category="technology"
      displayTitle="Technology"
      images={images}
      onNavigate={onNavigate}
      initialArticles={initialArticles}
      initialTotalPages={initialTotalPages}
    />
  );
}
