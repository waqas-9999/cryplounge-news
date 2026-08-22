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
 * All Discovered News — everything, whatever it scored.
 *
 * A diagnostic view. Its question is "is the discovery system behaving?", and
 * the answer lives mostly in the stories that did *not* make it: a cycle that
 * finds 176 clusters and drafts three makes 173 decisions nobody can see
 * otherwise, and a filter that is quietly too aggressive looks exactly like a
 * quiet news day from any other page.
 *
 * So nothing is hidden for scoring badly, every story shows why it scored what
 * it did, and the score bands across the top say at a glance whether the
 * newsroom is finding weak material or finding good material and rejecting it.
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

/** Bands, widest first. `min` is inclusive, `max` exclusive. */
const BANDS = [
  { label: 'All', min: undefined as number | undefined, max: undefined as number | undefined },
  { label: '90-100', min: 90, max: undefined },
  { label: '80-89', min: 80, max: 90 },
  { label: '70-79', min: 70, max: 80 },
  { label: '60-69', min: 60, max: 70 },
  { label: '50-59', min: 50, max: 60 },
  { label: 'Below 50', min: undefined, max: 50 },
];

const FRESHNESS_FILTERS = ['BREAKING', 'FRESH', 'RECENT', 'STALE', 'UNKNOWN'] as const;
const STATUS_FILTERS = [
  'DISCOVERED',
  'NOT_SELECTED',
  'DUPLICATE',
  'OFF_TOPIC',
  'WEAK_EVIDENCE',
  'RESEARCH_FAILED',
  'REJECTED',
  'CMS_DRAFT_CREATED',
  'CMS_SUBMISSION_FAILED',
];
const WINDOWS = [
  { label: 'Last hour', minutes: 60 },
  { label: 'Last 6 hours', minutes: 360 },
  { label: 'Last 24 hours', minutes: 1440 },
  { label: 'Last 7 days', minutes: 10080 },
];

export function AllDiscoveredNewsPage({ currentPage, onNavigate, onLogout }: PageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [data, setData] = useState<DiscoveryResponse | null>(null);

  const [band, setBand] = useState(0);
  const [freshness, setFreshness] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [withinMinutes, setWithinMinutes] = useState(1440);
  const [page, setPage] = useState(1);
  const [sources, setSources] = useState<string[]>([]);

  const load = useCallback(() => {
    setState('loading');
    const selected = BANDS[band]!;

    apiClient
      .get<DiscoveryResponse>('admin/ai/news/all', {
        query: {
          minScore: selected.min,
          freshness: freshness || undefined,
          status: status || undefined,
          source: source || undefined,
          withinMinutes,
          sort: 'newest',
          page,
          perPage: 25,
        },
      })
      .then(response => {
        // The upper bound is applied here rather than in the query: the
        // endpoint deliberately exposes only a lower bound, so that no query
        // string can turn the qualified endpoint into this one.
        const items = selected.max === undefined
          ? response.items
          : response.items.filter(story => story.score < selected.max!);

        setData({ ...response, items });
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [band, freshness, status, source, withinMinutes, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiClient
      .get<{ sources: string[] }>('admin/ai/news/facets')
      .then(response => setSources(response.sources))
      .catch(() => setSources([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [band, freshness, status, source, withinMinutes]);

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
        <AdminHeader title="All Discovered News" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              All Discovered News
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Every story the newsroom found, including low-scoring, duplicate, off-topic and
              rejected ones. Nothing disappears for scoring badly — this is where you check whether
              the discovery filters are behaving.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {BANDS.map((item, index) => (
              <button
                key={item.label}
                onClick={() => setBand(index)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  band === index
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <select value={freshness} onChange={e => setFreshness(e.target.value)} className={select}>
              <option value="">All freshness</option>
              {FRESHNESS_FILTERS.map(value => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <select value={status} onChange={e => setStatus(e.target.value)} className={select}>
              <option value="">All statuses</option>
              {STATUS_FILTERS.map(value => (
                <option key={value} value={value}>
                  {value.replace(/_/g, ' ')}
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
          </div>

          {state === 'loading' && <p className="text-sm text-gray-600 dark:text-gray-400">Loading…</p>}

          {state === 'error' && (
            <p className="text-sm text-red-600 dark:text-red-400">Could not load discovered news.</p>
          )}

          {state === 'ready' && data && !data.available && (
            <div className="p-4 border border-yellow-200 dark:border-yellow-900 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-sm text-yellow-800 dark:text-yellow-300">
              {data.reason ?? 'The newsroom database is unavailable.'}
            </div>
          )}

          {state === 'ready' && data?.available && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Showing {data.items.length} of {data.total} discovered{' '}
                {data.total === 1 ? 'story' : 'stories'}
              </p>

              <div className="space-y-3">
                {data.items.map(story => (
                  <DiscoveryStoryCard key={story.clusterId} story={story} showScoreReasons />
                ))}
              </div>

              {data.items.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Nothing matches these filters in this window.
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
