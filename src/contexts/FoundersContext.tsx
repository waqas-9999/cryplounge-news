'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, mediaUrl } from '@/lib/api-client';

/**
 * Public-facing founder story shape, projected from the real `founders` API.
 * The Founder model has no `category`/`ecosystem` columns, so those are
 * derived from tags and company for display purposes.
 */
export interface FounderStory {
  id: string;
  slug: string;
  name: string;
  role: string;
  project: string;
  category: string;
  excerpt: string;
  image: string;
  region: string;
  ecosystem: string;
  tags: string[];
  readTime: string;
  featured: boolean;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
  };
}

interface BackendFounder {
  id: string;
  slug: string;
  name: string;
  role: string;
  company: string | null;
  excerpt: string;
  region: string | null;
  featured: boolean;
  website: string | null;
  x: string | null;
  linkedin: string | null;
  photo: { path: string; altText: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
}

const FALLBACK_IMAGE = '/images/founder-placeholder.jpg';

function toFounderStory(founder: BackendFounder): FounderStory {
  return {
    id: founder.id,
    slug: founder.slug,
    name: founder.name,
    role: founder.role,
    project: founder.company ?? '',
    category: founder.tags[0]?.name ?? 'Founder',
    excerpt: founder.excerpt,
    image: mediaUrl(founder.photo?.path) ?? FALLBACK_IMAGE,
    region: founder.region ?? 'Global',
    ecosystem: founder.company ?? founder.tags[0]?.name ?? 'Global',
    tags: founder.tags.map(tag => tag.name),
    readTime: '5 min read',
    featured: founder.featured,
    socialLinks: {
      twitter: founder.x ?? undefined,
      linkedin: founder.linkedin ?? undefined,
      website: founder.website ?? undefined,
    },
  };
}

interface FoundersContextType {
  founderStories: FounderStory[];
  loading: boolean;
  error: boolean;
  getPublishedStories: () => FounderStory[];
  getFeaturedStories: () => FounderStory[];
  getFounderStoryBySlug: (slug: string) => FounderStory | undefined;
  getStoriesByCategory: (category: string) => FounderStory[];
  getStoriesByEcosystem: (ecosystem: string) => FounderStory[];
  getStoriesByRegion: (region: string) => FounderStory[];
}

const FoundersContext = createContext<FoundersContextType | undefined>(undefined);

export function FoundersProvider({ children }: { children: ReactNode }) {
  const [founderStories, setFounderStories] = useState<FounderStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient
      .getPaginated<BackendFounder>('founders', { query: { perPage: 100 }, auth: false })
      .then(({ items }) => {
        setFounderStories(items.map(toFounderStory));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // The public list endpoint only ever returns PUBLISHED founders, so no
  // client-side status filtering is needed here.
  const getPublishedStories = () => founderStories;
  const getFeaturedStories = () => founderStories.filter(story => story.featured);
  const getFounderStoryBySlug = (slug: string) => founderStories.find(story => story.slug === slug);
  const getStoriesByCategory = (category: string) =>
    founderStories.filter(story => story.category === category);
  const getStoriesByEcosystem = (ecosystem: string) =>
    founderStories.filter(story => story.ecosystem.toLowerCase() === ecosystem.toLowerCase());
  const getStoriesByRegion = (region: string) =>
    founderStories.filter(story => story.region === region);

  return (
    <FoundersContext.Provider
      value={{
        founderStories,
        loading,
        error,
        getPublishedStories,
        getFeaturedStories,
        getFounderStoryBySlug,
        getStoriesByCategory,
        getStoriesByEcosystem,
        getStoriesByRegion,
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
