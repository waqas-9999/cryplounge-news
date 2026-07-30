'use client';

import { ArrowRight, Users, TrendingUp, Globe, Rocket } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { FilterBar, FilterState } from '@/components/FilterBar';
import { useState } from 'react';
import { useFounders } from '@/contexts/FoundersContext';
import { founderCategories } from '@/data/mockFounders';
import type { Project } from '@/types/project';
import type { Article } from '@/data/mockArticles';
import type { EventSummary } from '@/services/events';
import { FounderRelatedContent } from '@/components/founders/FounderRelatedContent';

interface FoundersPageProps {
  /** All fetched on the server in app/founders/page.tsx. */
  relatedProjects: Project[];
  relatedArticles: Article[];
  relatedEvents: EventSummary[];
  images: any;
  onNavigate: (page: string) => void;
  initialCategory?: string;
}

export function FoundersPage({
  images,
  onNavigate,
  initialCategory,
  relatedProjects,
  relatedArticles,
  relatedEvents,
}: FoundersPageProps) {
  const { businessmanImage, asianBusinessmanImage, solanaImage, phoneImage } = images;
  const { getPublishedStories, getFeaturedStories } = useFounders();
  
  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory || 'all',
    tags: [],
    dateRange: 'all',
    sortBy: 'latest'
  });

  const categories = founderCategories;
  const tags = ['Innovation', 'Leadership', 'Vision', 'Success', 'Challenge'];
  
  // Get published stories
  // Get published and featured stories from context
  const allStories = getPublishedStories();
  const featuredStoriesData = getFeaturedStories().slice(0, 3);
  
  // Apply filters to stories
  const filteredStories = allStories.filter(story => {
    const categoryMatch = filters.category === 'all' || story.category === filters.category;
    const tagsMatch = filters.tags.length === 0 || filters.tags.some(tag => story.tags.includes(tag));
    return categoryMatch && tagsMatch;
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Yellow Page</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <div className="inline-block px-4 py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-3 md:mb-4">
          <span className="text-black dark:text-[#EFB81A] text-sm">YELLOW PAGE STORIES</span>
        </div>
        <h1 className="text-gray-800 dark:text-gray-100 mb-3 md:mb-4">Stories Behind Innovation</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Meet the visionaries, innovators, and leaders building the future of blockchain and Web3
        </p>
      </div>

      {/* Featured Profile - Hero Section */}
      <div className="bg-[#F9D96A] dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl overflow-hidden border-2 border-[#EFB81A] dark:border-[#EFB81A]/40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="p-6 md:p-12 flex flex-col justify-center">
            <div className="inline-block px-3 py-1.5 bg-[#EFB81A] dark:bg-[#EFB81A]/20 rounded-lg mb-4 w-fit">
              <span className="text-black dark:text-[#EFB81A] text-xs">FEATURED PROFILE</span>
            </div>
            
            {/* Filter */}
            <div className="mb-4">
              <FilterBar 
                categories={categories}
                tags={tags}
                onFilterChange={handleFilterChange}
                showDateFilter={false}
                showSortBy={true}
              />
            </div>
            
            <h2 className="text-black dark:text-white mb-3">{featuredStoriesData[0]?.name || 'Featured Profile'}</h2>
            <div className="text-gray-700 dark:text-[#F9D96A] mb-4">{featuredStoriesData[0]?.role || 'Founder & CEO'}</div>
            <p className="text-gray-800 dark:text-gray-300 mb-6 max-w-lg">{featuredStoriesData[0]?.excerpt || 'Discover the journey of building innovative blockchain solutions.'}</p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-white dark:bg-[#EFB81A]/20 text-gray-800 dark:text-[#EFB81A] rounded-lg text-xs">{featuredStoriesData[0]?.category || 'DeFi'}</span>
              <span className="px-3 py-1 bg-white dark:bg-[#EFB81A]/20 text-gray-800 dark:text-[#EFB81A] rounded-lg text-xs">{featuredStoriesData[0]?.region || 'Global'}</span>
              <span className="px-3 py-1 bg-white dark:bg-[#EFB81A]/20 text-gray-800 dark:text-[#EFB81A] rounded-lg text-xs">{featuredStoriesData[0]?.ecosystem || 'Ethereum'}</span>
            </div>
            {featuredStoriesData[0]?.socialLinks?.website && (
              <a
                href={featuredStoriesData[0].socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/80 transition-colors flex items-center gap-2 w-fit"
                aria-label={`Visit the website of ${featuredStoriesData[0]?.name ?? 'this founder'}`}
            >
              Visit Website <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
          </div>
          <div className="aspect-[4/3] lg:aspect-auto">
            <img 
              src={featuredStoriesData[0]?.image || businessmanImage} 
              alt={`${featuredStoriesData[0]?.name || 'Featured profile'} - ${featuredStoriesData[0]?.role || 'Blockchain innovator'}`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Featured Stories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg">
            <span className="text-black dark:text-[#EFB81A] text-xs md:text-sm">MORE FEATURED STORIES</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {featuredStoriesData.slice(1).map((story) => (
            <article
              key={story.id}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all text-left group"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-[4/3] sm:aspect-auto overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={`${story.name} - ${story.role}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <span className="px-3 py-1 bg-[#F9D96A] dark:bg-[#EFB81A]/20 text-black dark:text-[#EFB81A] rounded-lg text-xs w-fit mb-3">{story.category}</span>
                  <h3 className="text-gray-800 dark:text-gray-100 mb-1">{story.name}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{story.role}</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{story.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{story.readTime}</span>
                    <span className="text-[#EFB81A] text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Story <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* All Stories */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg">
            <span className="text-black dark:text-[#EFB81A] text-xs md:text-sm">ALL YELLOW PAGES</span>
          </div>
          <button 
            className="text-xs md:text-sm text-gray-800 dark:text-gray-200 flex items-center gap-1 hover:text-[#EFB81A] transition-colors"
            aria-label="View all Yellow Page profiles"
          >
            View all <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all text-left group"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={story.image} 
                  alt={`${story.name} - ${story.role}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-[#F4F4F4] dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs">{story.category}</span>
                  <span className="px-2.5 py-1 bg-[#F9D96A] dark:bg-[#EFB81A]/20 text-black dark:text-[#EFB81A] rounded-lg text-xs">{story.ecosystem}</span>
                </div>
                <h3 className="text-gray-800 dark:text-gray-100 mb-1 text-base">{story.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{story.role}</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{story.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{story.readTime}</span>
                  <span className="text-[#EFB81A] text-sm flex items-center gap-1">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
          <Users className="w-5 h-5 text-[#EFB81A] mb-2" aria-hidden="true" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">{allStories.length}+</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Featured Profiles</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
          <TrendingUp className="w-5 h-5 text-[#EFB81A] mb-2" aria-hidden="true" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">$2.5T+</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Combined Market Cap</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
          <Globe className="w-5 h-5 text-[#EFB81A] mb-2" aria-hidden="true" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">50+</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Countries</div>
        </div>
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800">
          <Rocket className="w-5 h-5 text-[#EFB81A] mb-2" aria-hidden="true" />
          <div className="text-gray-800 dark:text-gray-100 text-xl md:text-2xl mb-1">25+</div>
          <div className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Unicorns</div>
        </div>
      </div>

      {/* Onward content instead of a decorative call to action. */}
      <FounderRelatedContent
        projects={relatedProjects}
        articles={relatedArticles}
        events={relatedEvents}
      />

    </main>
  );
}
