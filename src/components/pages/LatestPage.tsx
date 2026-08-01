'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';

interface LatestPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
}

export function LatestPage({ images, onNavigate }: LatestPageProps) {
  return <CategoryNewsPage displayTitle="Latest" images={images} onNavigate={onNavigate} />;
}
