'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';

interface BusinessPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
}

export function BusinessPage({ images, onNavigate }: BusinessPageProps) {
  return <CategoryNewsPage category="business" displayTitle="Business" images={images} onNavigate={onNavigate} />;
}
