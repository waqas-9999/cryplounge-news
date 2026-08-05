'use client';

/**
 * Analytics for one article, at `/admin/analytics/articles/[articleId]`.
 *
 * Reached by clicking a row in the article performance table. Every figure is
 * scoped to the same date range as the workspace it was opened from, defaulting
 * to the last 30 days.
 */

import { useMemo, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import {
  analyticsApi,
  exportUrl,
  formatDuration,
  formatNumber,
  formatPercent,
  RANGE_LABELS,
  resolveRange,
  type RangePreset,
} from '@/services/analytics';
import {
  Card,
  ErrorBlock,
  KpiCard,
  LoadingBlock,
  Panel,
  RankingBar,
  useAnalyticsQuery,
} from '@/components/admin/analytics/primitives';
import { FunnelBars, TrendAreaChart } from '@/components/admin/analytics/charts';

interface ArticleAnalyticsPageProps {
  articleId: string;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const PRESETS: RangePreset[] = ['last7', 'last30', 'last90', 'thisYear'];

export function ArticleAnalyticsPage({
  articleId,
  currentPage,
  onNavigate,
  onLogout,
}: ArticleAnalyticsPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preset, setPreset] = useState<RangePreset>('last30');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = useMemo(() => resolveRange(preset), [preset]);
  const detail = useAnalyticsQuery(
    signal => analyticsApi.articleDetail(articleId, filters, signal),
    [articleId, filters.from, filters.to]
  );

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await apiClient.download(exportUrl('article-detail', filters, articleId));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `article-${articleId}-analytics.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(errorMessage(err, 'Export failed.'));
    } finally {
      setExporting(false);
    }
  };

  const data = detail.data;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="Article Analytics" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <button
            onClick={() => onNavigate('admin/analytics')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analytics
          </button>

          {detail.loading ? (
            <LoadingBlock height="h-96" />
          ) : detail.error || !data ? (
            <Card>
              <ErrorBlock message={detail.error ?? 'Article not found.'} onRetry={detail.reload} />
            </Card>
          ) : (
            <>
              {/* -------------------------------------------------- header -- */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">
                    {data.article.title}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {[
                      data.article.author,
                      data.article.category,
                      data.article.publishedAt
                        ? new Date(data.article.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Unpublished',
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {PRESETS.map(key => (
                    <button
                      key={key}
                      onClick={() => setPreset(key)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        preset === key
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {RANGE_LABELS[key]}
                    </button>
                  ))}
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Exporting…' : 'Export'}
                  </button>
                </div>
              </div>
              {exportError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{exportError}</p>}

              {/* ---------------------------------------------------- KPIs -- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                <KpiCard label="Total Views" value={formatNumber(data.totals.views)} />
                <KpiCard label="Unique Readers" value={formatNumber(data.totals.uniqueReaders)} />
                <KpiCard label="Avg. Read Time" value={formatDuration(data.totals.avgReadTime)} />
                <KpiCard label="Engagement Rate" value={formatPercent(data.totals.engagementRate)} />
                <KpiCard label="Shares" value={formatNumber(data.totals.shares)} />
                <KpiCard label="Bookmarks" value={formatNumber(data.totals.bookmarks)} />
                <KpiCard label="Comments" value={formatNumber(data.totals.comments)} />
                <KpiCard label="Completed Reads" value={formatNumber(data.totals.completions)} />
              </div>

              {/* -------------------------------------------------- charts -- */}
              <div className="space-y-4">
                <Panel
                  title="Views Over Time"
                  query={detail}
                  isEmpty={d => d.viewsOverTime.length === 0}
                >
                  {d => (
                    <TrendAreaChart
                      data={d.viewsOverTime as unknown as Array<Record<string, unknown>>}
                      xKey="date"
                      series={[{ key: 'views', label: 'Views' }]}
                    />
                  )}
                </Panel>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Panel
                    title="Reading Depth"
                    description="How far readers got through this article"
                    query={detail}
                    unavailable={d =>
                      !d.readingDepth.available
                        ? { what: 'Reading depth', requires: 'scroll-milestone tracking on this article' }
                        : null
                    }
                  >
                    {d => (
                      <FunnelBars
                        steps={d.readingDepth.milestones.map(m => ({
                          label: `${m.depth}% read`,
                          value: m.sessions,
                          rate: m.rate,
                        }))}
                      />
                    )}
                  </Panel>

                  <Panel
                    title="Traffic Sources"
                    query={detail}
                    unavailable={d =>
                      d.trafficSources.length === 0
                        ? { what: 'Source attribution', requires: 'referrer data on this article’s views' }
                        : null
                    }
                  >
                    {d => (
                      <div className="space-y-3">
                        {d.trafficSources.slice(0, 10).map(source => (
                          <RankingBar
                            key={source.key}
                            label={source.label}
                            value={source.count}
                            max={d.trafficSources[0].count}
                          />
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel
                    title="Geographic Distribution"
                    query={detail}
                    unavailable={d =>
                      d.geography.length === 0
                        ? { what: 'Geographic data', requires: 'country resolution from edge headers' }
                        : null
                    }
                  >
                    {d => (
                      <div className="space-y-3">
                        {d.geography.slice(0, 10).map(row => (
                          <RankingBar
                            key={row.key}
                            label={row.label}
                            value={row.count}
                            max={d.geography[0].count}
                          />
                        ))}
                      </div>
                    )}
                  </Panel>

                  <Panel
                    title="Devices"
                    query={detail}
                    unavailable={d =>
                      d.devices.length === 0
                        ? { what: 'Device data', requires: 'user-agent parsing on incoming events' }
                        : null
                    }
                  >
                    {d => (
                      <div className="space-y-3">
                        {d.devices.map(row => (
                          <RankingBar
                            key={row.key}
                            label={row.label}
                            value={row.count}
                            max={d.devices[0].count}
                          />
                        ))}
                      </div>
                    )}
                  </Panel>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
