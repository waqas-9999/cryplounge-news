import { createContext, useContext, useState, ReactNode } from 'react';
import { defaultLearnCategories, LearnCategory } from '../data/mockLearnCategories';

interface LearnCategoriesContextType {
  categories: LearnCategory[];
  addCategory: (category: Omit<LearnCategory, 'id' | 'createdAt' | 'updatedAt' | 'tutorialCount'>) => void;
  updateCategory: (id: string, updates: Partial<LearnCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => LearnCategory | undefined;
  getCategoryBySlug: (slug: string) => LearnCategory | undefined;
  getActiveCategories: () => LearnCategory[];
}

const LearnCategoriesContext = createContext<LearnCategoriesContextType | undefined>(undefined);

export function LearnCategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<LearnCategory[]>(defaultLearnCategories);

  const addCategory = (categoryData: Omit<LearnCategory, 'id' | 'createdAt' | 'updatedAt' | 'tutorialCount'>) => {
    const newCategory: LearnCategory = {
      ...categoryData,
      id: Date.now().toString(),
      tutorialCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<LearnCategory>) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id
          ? { ...cat, ...updates, updatedAt: new Date().toISOString() }
          : cat
      )
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug);
  };

  const getActiveCategories = () => {
    return categories.filter(cat => cat.isActive);
  };

  return (
    <LearnCategoriesContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
        getCategoryBySlug,
        getActiveCategories
      }}
    >
      {children}
    </LearnCategoriesContext.Provider>
  );
}

export function useLearnCategories() {
  const context = useContext(LearnCategoriesContext);
  if (context === undefined) {
    throw new Error('useLearnCategories must be used within a LearnCategoriesProvider');
  }
  return context;
}
