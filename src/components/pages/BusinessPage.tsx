'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';
import type { Article } from '@/types/article';

interface BusinessPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
  /** Page 1, fetched on the server so the listing is crawlable without JS. */
  initialArticles?: Article[];
  initialTotalPages?: number;
}

export function BusinessPage({ images, onNavigate, initialArticles, initialTotalPages }: BusinessPageProps) {
  return (
    <CategoryNewsPage
      category="business"
      displayTitle="Business"
      images={images}
      onNavigate={onNavigate}
      initialArticles={initialArticles}
      initialTotalPages={initialTotalPages}
    />
  );
}
