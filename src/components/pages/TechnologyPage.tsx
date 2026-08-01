'use client';

import { CategoryNewsPage, type CategoryNewsPageImages } from './CategoryNewsPage';

interface TechnologyPageProps {
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
}

export function TechnologyPage({ images, onNavigate }: TechnologyPageProps) {
  return <CategoryNewsPage category="technology" displayTitle="Technology" images={images} onNavigate={onNavigate} />;
}
