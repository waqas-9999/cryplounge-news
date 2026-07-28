'use client';

import { Filter, X, Calendar, Tag } from 'lucide-react';
import { useState } from 'react';
import { useCategories } from '../contexts/CategoriesContext';

interface FilterBarProps {
  categories?: string[];
  tags?: string[];
  onFilterChange?: (filters: FilterState) => void;
  showDateFilter?: boolean;
  showSortBy?: boolean;
}

export interface FilterState {
  category: string;
  tags: string[];
  dateRange: string;
  sortBy: string;
}

export function FilterBar({ 
  categories: propCategories = [],
  tags = [],
  onFilterChange,
  showDateFilter = true,
  showSortBy = true
}: FilterBarProps) {
  const { getActiveCategories } = useCategories();
  const activeCategories = getActiveCategories();
  
  // Use dynamic categories if no prop categories provided
  const categories = propCategories.length > 0 
    ? propCategories 
    : activeCategories.map(cat => cat.name);
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    category: 'all',
    tags: [],
    dateRange: 'all',
    sortBy: 'latest'
  });

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ];

  const handleCategoryChange = (category: string) => {
    const newFilters = { ...activeFilters, category };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = activeFilters.tags.includes(tag)
      ? activeFilters.tags.filter(t => t !== tag)
      : [...activeFilters.tags, tag];
    const newFilters = { ...activeFilters, tags: newTags };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleDateChange = (dateRange: string) => {
    const newFilters = { ...activeFilters, dateRange };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newFilters = { ...activeFilters, sortBy };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      category: 'all',
      tags: [],
      dateRange: 'all',
      sortBy: 'latest'
    };
    setActiveFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  const hasActiveFilters = activeFilters.category !== 'all' || 
                          activeFilters.tags.length > 0 || 
                          activeFilters.dateRange !== 'all' ||
                          activeFilters.sortBy !== 'latest';

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-all duration-300">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-yellow-400 transition-all duration-200"
          aria-label={showFilters ? "Hide filters" : "Show filters"}
          aria-expanded={showFilters}
        >
          <Filter className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          <span className="text-sm">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs animate-in fade-in zoom-in duration-200">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 animate-in fade-in slide-in-from-right"
            aria-label="Clear all filters"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-sm">Clear all</span>
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top duration-300">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 ${
                    activeFilters.category === 'all'
                      ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Show all categories"
                  aria-pressed={activeFilters.category === 'all'}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 ${
                      activeFilters.category === category
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`Filter by ${category}`}
                    aria-pressed={activeFilters.category === category}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top duration-300 delay-75">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 ${
                      activeFilters.tags.includes(tag)
                        ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30 shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`Toggle ${tag} tag`}
                    aria-pressed={activeFilters.tags.includes(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          {showDateFilter && (
            <div className="animate-in fade-in slide-in-from-top duration-300 delay-100">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleDateChange(range.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 ${
                      activeFilters.dateRange === range.value
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`Filter by ${range.label}`}
                    aria-pressed={activeFilters.dateRange === range.value}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sort By */}
          {showSortBy && (
            <div className="animate-in fade-in slide-in-from-top duration-300 delay-150">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Sort By</label>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 transform hover:scale-105 ${
                      activeFilters.sortBy === option.value
                        ? 'bg-gray-800 dark:bg-gradient-to-r dark:from-yellow-500 dark:to-yellow-600 text-white dark:text-gray-900 shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-label={`Sort by ${option.label}`}
                    aria-pressed={activeFilters.sortBy === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
