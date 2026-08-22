'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { apiClient } from '@/lib/api-client';
import {
  DiscoveryStoryCard,
  type DiscoveryStory,
} from '@/components/pages/admin/discovery/DiscoveryStoryCard';

/**
 * Qualified News — everything the newsroom scored 50 or above.
 *
 * A working view, not a diagnostic one. The question it answers is "what is
 * worth my attention right now?", and it is deliberately a separate page from
 * All Discovered News rather than a filter inside it: this is the one an
 * editor opens repeatedly, and it should not be a special case of the page
 * used to debug the discovery system.
 *
 * The 50 threshold is enforced on the server. Widening it from the browser is
 * not possible — `admin/ai/news/qualified` clamps `minScore` upwards only.
 *
 * A story appears here whether or not it was ever written. This is not the
 * CMS Drafts page; it is the pool those drafts are chosen from.
 */

interface DiscoveryResponse {
  items: DiscoveryStory[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  available: boolean;
  reason?: string;
}

interface PageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const SCORE_FILTERS = [50, 60, 70, 80, 90];
const FRESHNESS_FILTERS = ['BREAKING', 'FRESH', 'RECENT', 'STALE', 'UNKNOWN'] as const;
const CATEGORY_FILTERS = [
  'market',
  'technology',
  'security',
  'policy',
  'business',
  'industry',
  'adoption',
];
const STATUS_FILTERS = [
  { value: 'DISCOVERED', label: 'Discovered' },
  { value: 'NOT_SELECTED', label: 'Not selected' },
  { value: 'RESEARCH_FAILED', label: 'Research failed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CMS_DRAFT_CREATED', label: 'CMS draft' },
];
const WINDOWS = [
  { label: 'Last 15 min', minutes: 15 },
  { label: 'Last hour', minutes: 60 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
];
const SORTS = [
  { value: 'newsroom', label: 'Newsroom (breaking first)' },
  { value: 'score', label: 'Highest score' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'freshness', label: 'Freshness' },
  { value: 'category', label: 'Category' },
  { value: 'source', label: 'Source' },
  { value: 'cms', label: 'CMS status' },
];

export function QualifiedNewsPage({ currentPage, onNavigate, onLogout }: PageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<DiscoveryResponse | null>(null);

  const [minScore, setMinScore] = useState(50);
  const [freshness, setFreshness] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [withinMinutes, setWithinMinutes] = useState(1440);
  const [sort, setSort] = useState('newsroom');
  const [page, setPage] = useState(1);
  const [sources, setSources] = useState<string[]>([]);

  const load = useCallback(() => {
    setState('loading');
    apiClient
      .get<DiscoveryResponse>('admin/ai/news/qualified', {
        query: {
          minScore,
          freshness: freshness || undefined,
          category: category || undefined,
          status: status || undefined,
          source: source || undefined,
          withinMinutes,
          sort,
          page,
          perPage: 25,
        },
      })
      .then(response => {
        setData(response);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [minScore, freshness, category, status, source, withinMinutes, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiClient
      .get<{ sources: string[] }>('admin/ai/news/facets')
      .then(response => setSources(response.sources))
      .catch(() => setSources([]));
  }, []);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [minScore, freshness, category, status, source, withinMinutes, sort]);

  const select =
    'px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="Qualified News" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Qualified News</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Discovered stories scoring 50 or above. These are candidates the newsroom considers
              worth covering — separate from what has actually been drafted.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className={select}>
              {SCORE_FILTERS.map(value => (
                <option key={value} value={value}>
                  Score {value}+
                </option>
              ))}
            </select>

            <select value={freshness} onChange={e => setFreshness(e.target.value)} className={select}>
              <option value="">All freshness</option>
              {FRESHNESS_FILTERS.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select value={category} onChange={e => setCategory(e.target.value)} className={select}>
              <option value="">All categories</option>
              {CATEGORY_FILTERS.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select value={status} onChange={e => setStatus(e.target.value)} className={select}>
              <option value="">All statuses</option>
              {STATUS_FILTERS.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select value={source} onChange={e => setSource(e.target.value)} className={select}>
              <option value="">All sources</option>
              {sources.map(domain => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>

            <select
              value={withinMinutes}
              onChange={e => setWithinMinutes(Number(e.target.value))}
              className={select}
            >
              {WINDOWS.map(window => (
                <option key={window.minutes} value={window.minutes}>
                  {window.label}
                </option>
              ))}
            </select>

            <select value={sort} onChange={e => setSort(e.target.value)} className={select}>
              {SORTS.map(item => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {state === 'loading' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>
          )}

          {state === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Could not load discovered news.
            </p>
          )}

          {state === 'ready' && data && !data.available && (
            <div className="p-4 border border-yellow-200 dark:border-yellow-900 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-sm text-yellow-800 dark:text-yellow-300">
              {data.reason ?? 'The newsroom database is unavailable.'}
            </div>
          )}

          {state === 'ready' && data?.available && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {data.total} qualified {data.total === 1 ? 'story' : 'stories'}
              </p>

              <div className="space-y-3">
                {data.items.map(story => (
                  <DiscoveryStoryCard key={story.clusterId} story={story} />
                ))}
              </div>

              {data.items.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nothing qualified in this window. Widen the time range, or check All Discovered
                  News to see what was found and why it scored lower.
                </p>
              )}

              {data.totalPages > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={data.page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page {data.page} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={data.page >= data.totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
