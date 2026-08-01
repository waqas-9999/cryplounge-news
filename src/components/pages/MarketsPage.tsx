'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';

interface MarketsPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
}

export function MarketsPage({ images, onNavigate }: MarketsPageProps) {
  return <CategoryNewsPage category="market" displayTitle="Markets" images={images} onNavigate={onNavigate} />;
}
