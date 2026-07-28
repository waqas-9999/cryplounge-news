'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { mockFounderStories, FounderStory } from '../data/mockFounders';

interface FoundersContextType {
  founderStories: FounderStory[];
  addFounderStory: (story: Omit<FounderStory, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => void;
  updateFounderStory: (id: string, updates: Partial<FounderStory>) => void;
  deleteFounderStory: (id: string) => void;
  approveStory: (id: string) => void;
  rejectStory: (id: string, reason: string) => void;
  getPendingStories: () => FounderStory[];
  getFounderStoryById: (id: string) => FounderStory | undefined;
  getFounderStoryBySlug: (slug: string) => FounderStory | undefined;
  getPublishedStories: () => FounderStory[];
  getFeaturedStories: () => FounderStory[];
  getStoriesByCategory: (category: string) => FounderStory[];
  getStoriesByEcosystem: (ecosystem: string) => FounderStory[];
  getStoriesByRegion: (region: string) => FounderStory[];
}

const FoundersContext = createContext<FoundersContextType | undefined>(undefined);

export function FoundersProvider({ children }: { children: ReactNode }) {
  const [founderStories, setFounderStories] = useState<FounderStory[]>(mockFounderStories);

  const addFounderStory = (storyData: Omit<FounderStory, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => {
    const newStory: FounderStory = {
      ...storyData,
      id: Date.now().toString(),
      stats: {
        views: 0,
        shares: 0,
        saves: 0,
        comments: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFounderStories(prev => [...prev, newStory]);
  };

  const updateFounderStory = (id: string, updates: Partial<FounderStory>) => {
    setFounderStories(prev =>
      prev.map(story =>
        story.id === id
          ? { ...story, ...updates, updatedAt: new Date().toISOString() }
          : story
      )
    );
  };

  const deleteFounderStory = (id: string) => {
    setFounderStories(prev => prev.filter(story => story.id !== id));
  };

  const getFounderStoryById = (id: string) => {
    return founderStories.find(story => story.id === id);
  };

  const getFounderStoryBySlug = (slug: string) => {
    return founderStories.find(story => story.slug === slug);
  };

  const getPublishedStories = () => {
    return founderStories
      .filter(story => story.status === 'published')
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  };

  const getFeaturedStories = () => {
    return founderStories
      .filter(story => story.status === 'published' && story.featured)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  };

  const getStoriesByCategory = (category: string) => {
    return founderStories
      .filter(story => story.status === 'published' && story.category === category)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  };

  const getStoriesByEcosystem = (ecosystem: string) => {
    return founderStories
      .filter(story => story.status === 'published' && story.ecosystem.toLowerCase() === ecosystem.toLowerCase())
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  };

  const getStoriesByRegion = (region: string) => {
    return founderStories
      .filter(story => story.status === 'published' && story.region === region)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  };

  const getPendingStories = () => {
    return founderStories
      .filter(story => story.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const approveStory = (id: string) => {
    updateFounderStory(id, { status: 'approved' });
  };

  const rejectStory = (id: string, reason: string) => {
    updateFounderStory(id, { 
      status: 'rejected', 
      rejectionReason: reason 
    });
  };

  return (
    <FoundersContext.Provider
      value={{
        founderStories,
        addFounderStory,
        updateFounderStory,
        deleteFounderStory,
        approveStory,
        rejectStory,
        getPendingStories,
        getFounderStoryById,
        getFounderStoryBySlug,
        getPublishedStories,
        getFeaturedStories,
        getStoriesByCategory,
        getStoriesByEcosystem,
        getStoriesByRegion
      }}
    >
      {children}
    </FoundersContext.Provider>
  );
}

export function useFounders() {
  const context = useContext(FoundersContext);
  if (context === undefined) {
    throw new Error('useFounders must be used within a FoundersProvider');
  }
  return context;
}
