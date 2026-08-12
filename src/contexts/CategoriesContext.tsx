'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { listNewsCategories, type NewsCategorySummary } from '@/services/taxonomy';

/**
 * The news desks, loaded once from the API.
 *
 * Read-only by design: desks are seeded from the canonical taxonomy and
 * managed in the CMS, so nothing in the reader UI creates or edits them. This
 * previously served a hardcoded list that disagreed with both the header nav
 * and the database.
 */
export type Category = NewsCategorySummary;

interface CategoriesContextType {
  categories: Category[];
  /** False until the first load resolves. */
  isLoading: boolean;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getActiveCategories: () => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listNewsCategories()
      .then(items => {
        if (active) setCategories(items);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const getCategoryBySlug = (slug: string) => categories.find(cat => cat.slug === slug);

  const getActiveCategories = () => categories;

  return (
    <CategoriesContext.Provider
      value={{ categories, isLoading, getCategoryBySlug, getActiveCategories }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
