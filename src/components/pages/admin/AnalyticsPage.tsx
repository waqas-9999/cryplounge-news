'use client';

/**
 * The detailed analytics workspace at `/admin/analytics`.
 *
 * This is the *detail* view. The summary on the admin dashboard is unchanged
 * and continues to use its own endpoints — nothing here replaces it.
 *
 * Two rules shape the whole file:
 *  1. Every figure comes from the API. Nothing is estimated, interpolated or
 *     defaulted to a plausible number.
 *  2. A dimension the collection layer does not populate renders an explicit
 *     "tracking not available" state, which is distinct from "no visitors".
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Radio } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import {
  analyticsApi,
  exportUrl,
  formatDuration,
  formatNumber,
  formatPercent,
  resolveRange,
  type AnalyticsFilters,
  type ArticleRow,
  type ContentGroupRow,
  type DimensionRow,
  type RangePreset,
} from '@/services/analytics';
import {
  Card,
  DataTable,
  KpiCard,
  Panel,
  RankingBar,
  useAnalyticsQuery,
  type Column,
} from '@/components/admin/analytics/primitives';
import {
  DonutChart,
  FunnelBars,
  MultiLineChart,
  PublishingHeatmap,
  SimpleBarChart,
  TrendAreaChart,
} from '@/components/admin/analytics/charts';
import { WorldMap } from '@/components/admin/analytics/WorldMap';
import {
  AnalyticsToolbar,
  type FilterKey,
  type FilterOption,
} from '@/components/admin/analytics/AnalyticsToolbar';

interface AnalyticsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type TrafficMetric = 'visitors' | 'sessions' | 'pageViews' | 'articleViews';

const TRAFFIC_METRICS: Array<{ key: TrafficMetric; label: string }> = [
  { key: 'visitors', label: 'Visitors' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'pageViews', label: 'Page Views' },
  { key: 'articleViews', label: 'Article Views' },
];

/** Shared columns for the country / region / city tables. */
function dimensionColumns(nameHeader: string): Column<DimensionRow>[] {
  return [
    { key: 'label', header: nameHeader, render: r => r.label },
    { key: 'visitors', header: 'Visitors', align: 'right', render: r => formatNumber(r.visitors) },
    { key: 'sessions', header: 'Sessions', align: 'right', render: r => formatNumber(r.sessions) },
    {
      key: 'articleViews',
      header: 'Article Views',
      align: 'right',
      render: r => formatNumber(r.articleViews),
    },
    {
      key: 'engagementRate',
      header: 'Engagement',
      align: 'right',
      render: r => formatPercent(r.engagementRate),
    },
    {
      key: 'avgSessionDuration',
      header: 'Avg. Session',
      align: 'right',
      render: r => formatDuration(r.avgSessionDuration),
    },
  ];
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 mt-10 first:mt-0">
      <h2 className="text-base text-gray-900 dark:text-gray-100">{title}</h2>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

/** Panels that break down a single dimension all render identically. */
function DimensionPanel({
  title,
  description,
  query,
  unavailableWhat,
  requires,
  variant = 'bars',
}: {
  title: string;
  description?: string;
  query: ReturnType<typeof useAnalyticsQuery<DimensionRow[]>>;
  unavailableWhat: string;
  requires: string;
  variant?: 'bars' | 'donut';
}) {
  return (
    <Panel
      title={title}
      description={description}
      query={query}
      unavailable={data => (data.length === 0 ? { what: unavailableWhat, requires } : null)}
    >
      {rows =>
        variant === 'donut' ? (
          <DonutChart data={rows.slice(0, 8).map(r => ({ label: r.label, value: r.visitors }))} />
        ) : (
          <div className="space-y-3">
            {rows.slice(0, 10).map(row => (
              <RankingBar
                key={row.key}
                label={row.label}
                value={row.visitors}
                max={rows[0]?.visitors ?? 0}
              />
            ))}
          </div>
        )
      }
    </Panel>
  );
}

export function AnalyticsPage({ currentPage, onNavigate, onLogout }: AnalyticsPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ------------------------------------------------------------ controls -- */

  const [preset, setPreset] = useState<RangePreset>('last30');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [compare, setCompare] = useState(true);
  const [dimensionFilters, setDimensionFilters] = useState<AnalyticsFilters>({});

  const range = useMemo(() => resolveRange(preset, custom), [preset, custom]);

  /** The single filter object every request shares. */
  const filters = useMemo<AnalyticsFilters>(
    () => ({ ...dimensionFilters, from: range.from, to: range.to }),
    [dimensionFilters, range]
  );

  /*
   * When the overview last arrived.
   *
   * Tracked from the data rather than from a timer, so it reflects an actual
   * successful read — a failed refresh must not advance it and make stale
   * numbers look fresh.
   */
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Requests are keyed on the serialized filters so a panel refetches on any
  // change to range *or* filters, without each one listing them individually.
  const key = useMemo(() => JSON.stringify(filters), [filters]);

  const setFilter = useCallback((name: FilterKey, value: string | undefined) => {
    setDimensionFilters(prev => {
      const next = { ...prev };
      if (value) next[name] = value;
      else delete next[name];
      // Narrowing to a country invalidates any region/city chosen under a
      // different one, so the finer levels are cleared.
      if (name === 'country') {
        delete next.region;
        delete next.city;
      }
      if (name === 'region') delete next.city;
      return next;
    });
  }, []);

  /* -------------------------------------------------------------- queries -- */

  const overview = useAnalyticsQuery(s => analyticsApi.overview(filters, s), [key]);
  const traffic = useAnalyticsQuery(s => analyticsApi.traffic(filters, s), [key]);
  const geography = useAnalyticsQuery(s => analyticsApi.geography(filters, s), [key]);
  const audience = useAnalyticsQuery(s => analyticsApi.audience(filters, s), [key]);
  const devices = useAnalyticsQuery(s => analyticsApi.devices(filters, s), [key]);
  const browsers = useAnalyticsQuery(s => analyticsApi.browsers(filters, s), [key]);
  const operatingSystems = useAnalyticsQuery(s => analyticsApi.operatingSystems(filters, s), [key]);
  const languages = useAnalyticsQuery(s => analyticsApi.languages(filters, s), [key]);
  const acquisition = useAnalyticsQuery(s => analyticsApi.acquisition(filters, s), [key]);
  const referrers = useAnalyticsQuery(s => analyticsApi.referrers(filters, s), [key]);
  const social = useAnalyticsQuery(s => analyticsApi.social(filters, s), [key]);
  const categories = useAnalyticsQuery(s => analyticsApi.categories(filters, s), [key]);
  const authors = useAnalyticsQuery(s => analyticsApi.authors(filters, s), [key]);
  const trending = useAnalyticsQuery(s => analyticsApi.trending(filters, s), [key]);
  const publishing = useAnalyticsQuery(s => analyticsApi.publishing(filters, s), [key]);
  const readingDepth = useAnalyticsQuery(s => analyticsApi.readingDepth(filters, s), [key]);
  const search = useAnalyticsQuery(s => analyticsApi.search(filters, s), [key]);

  // Realtime deliberately ignores the date range — "right now" is not a range.
  const realtime = useAnalyticsQuery(s => analyticsApi.realtime(s), []);

  /* ------------------------------------------------------ article table --- */

  const [articleSearch, setArticleSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [articlePage, setArticlePage] = useState(1);
  const [sort, setSort] = useState<{ by: string; order: 'asc' | 'desc' }>({
    by: 'views',
    order: 'desc',
  });

  // Debounced so typing does not fire a request per keystroke. The timer is
  // reset on every change, so only the final pause triggers a fetch.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(articleSearch);
      setArticlePage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [articleSearch]);

  const articles = useAnalyticsQuery(
    s =>
      analyticsApi.articles(
        filters,
        { page: articlePage, perPage: 10, search: debouncedSearch, sortBy: sort.by, sortOrder: sort.order },
        s
      ),
    [key, articlePage, debouncedSearch, sort.by, sort.order]
  );

  const toggleSort = useCallback((column: string) => {
    setSort(prev =>
      prev.by === column ? { by: column, order: prev.order === 'asc' ? 'desc' : 'asc' } : { by: column, order: 'desc' }
    );
    setArticlePage(1);
  }, []);

  /* ---------------------------------------------------------- filter opts -- */

  /**
   * Options come from panels that have already loaded, so the filter menu only
   * ever offers values that actually exist in the current data.
   */
  const filterOptions = useMemo<Partial<Record<FilterKey, FilterOption[]>>>(() => {
    const toOptions = (rows: DimensionRow[] | null | undefined): FilterOption[] =>
      (rows ?? []).map(r => ({ key: r.key, label: r.label }));
    const fromGroups = (rows: ContentGroupRow[] | null | undefined): FilterOption[] =>
      (rows ?? []).map(r => ({ key: r.id, label: r.label }));

    return {
      country: toOptions(geography.data?.countries),
      region: toOptions(geography.data?.regions),
      city: toOptions(geography.data?.cities),
      categoryId: fromGroups(categories.data),
      authorId: fromGroups(authors.data),
      deviceType: toOptions(devices.data),
      browser: toOptions(browsers.data),
      os: toOptions(operatingSystems.data),
      language: toOptions(languages.data),
    };
  }, [geography.data, categories.data, authors.data, devices.data, browsers.data, operatingSystems.data, languages.data]);

  /* --------------------------------------------------------------- export -- */

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await apiClient.download(exportUrl('articles', filters));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cryplounge-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(errorMessage(err, 'Export failed.'));
    } finally {
      setExporting(false);
    }
  }, [filters]);

  /* --------------------------------------------------------------- render -- */

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const kpis = overview.data;

  // Stamped only when a read actually succeeds, so a failed refresh cannot
  // make stale numbers look fresh.
  useEffect(() => {
    if (overview.data && !overview.error) setLastUpdated(new Date());
  }, [overview.data, overview.error]);

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '—';
  const [trafficMetric, setTrafficMetric] = useState<TrafficMetric>('visitors');

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
        <AdminHeader title="Analytics" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* ------------------------------------------------------ header -- */}
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Understand your audience, content performance, traffic, and reader behavior.
            </p>
          </div>

          <div className="mb-8">
            <AnalyticsToolbar
              preset={preset}
              onPresetChange={setPreset}
              custom={custom}
              onCustomChange={setCustom}
              compare={compare}
              onCompareChange={setCompare}
              filters={dimensionFilters}
              onFilterChange={setFilter}
              filterOptions={filterOptions}
              onExport={handleExport}
              exporting={exporting}
            />
            {exportError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{exportError}</p>}
          </div>

          {/* ---------------------------------------------------- overview -- */}
          <SectionHeading
            title="Overview"
            description={
              compare ? 'Compared against the immediately preceding period.' : 'Totals for the selected period.'
            }
          />

          {/*
            When these figures were last read from Google Analytics.
            Reports are cached for five minutes and GA itself processes with a
            lag, so "now" is never quite now — showing the read time is what
            stops an editor treating a stale panel as a live one.
          */}
          {overview.data && !overview.error && (
            <p className="-mt-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
              Last updated {lastUpdatedLabel}
            </p>
          )}

          {overview.error ? (
            <Card className="p-6">
              <p className="text-sm text-red-600 dark:text-red-400 mb-3">{overview.error}</p>
              <button
                onClick={overview.reload}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Retry
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <KpiCard
                label="Visitors"
                loading={overview.loading}
                value={formatNumber(kpis?.current.visitors ?? 0)}
                previous={compare ? formatNumber(kpis?.previous.visitors ?? 0) : undefined}
                delta={compare ? kpis?.deltas.visitors : undefined}
              />
              <KpiCard
                label="Unique Visitors"
                loading={overview.loading}
                value={formatNumber(kpis?.current.uniqueVisitors ?? 0)}
                previous={compare ? formatNumber(kpis?.previous.uniqueVisitors ?? 0) : undefined}
                delta={compare ? kpis?.deltas.uniqueVisitors : undefined}
              />
              <KpiCard
                label="Sessions"
                loading={overview.loading}
                value={formatNumber(kpis?.current.sessions ?? 0)}
                previous={compare ? formatNumber(kpis?.previous.sessions ?? 0) : undefined}
                delta={compare ? kpis?.deltas.sessions : undefined}
              />
              <KpiCard
                label="Page Views"
                loading={overview.loading}
                value={formatNumber(kpis?.current.pageViews ?? 0)}
                previous={compare ? formatNumber(kpis?.previous.pageViews ?? 0) : undefined}
                delta={compare ? kpis?.deltas.pageViews : undefined}
              />
              <KpiCard
                label="Article Views"
                loading={overview.loading}
                value={formatNumber(kpis?.totalViews ?? 0)}
                previous={compare ? formatNumber(kpis?.previous.articleViews ?? 0) : undefined}
                delta={compare ? kpis?.deltas.articleViews : undefined}
              />
              <KpiCard
                label="Engagement Rate"
                loading={overview.loading}
                value={formatPercent(kpis?.current.engagementRate ?? 0)}
                previous={compare ? formatPercent(kpis?.previous.engagementRate ?? 0) : undefined}
                delta={compare ? kpis?.deltas.engagementRate : undefined}
              />
              <KpiCard
                label="Avg. Session Duration"
                loading={overview.loading}
                value={formatDuration(kpis?.current.avgSessionDuration ?? 0)}
                previous={compare ? formatDuration(kpis?.previous.avgSessionDuration ?? 0) : undefined}
                delta={compare ? kpis?.deltas.avgSessionDuration : undefined}
              />
              <KpiCard
                label="Bounce Rate"
                loading={overview.loading}
                value={formatPercent(kpis?.current.bounceRate ?? 0)}
                previous={compare ? formatPercent(kpis?.previous.bounceRate ?? 0) : undefined}
                delta={compare ? kpis?.deltas.bounceRate : undefined}
                invert
              />
            </div>
          )}

          {/* --------------------------------------------------- real-time -- */}
          <SectionHeading title="Real-Time" description="Activity in the last 30 minutes." />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel
              title="Active Visitors"
              query={realtime}
              actions={
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Live
                </span>
              }
              loadingHeight="h-40"
            >
              {data => (
                <div>
                  <p className="text-4xl text-gray-900 dark:text-gray-100 tabular-nums">
                    {formatNumber(data.activeNow)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">active right now</p>
                  <dl className="mt-5 space-y-2">
                    {data.windows.map(w => (
                      <div key={w.minutes} className="flex items-center justify-between text-sm">
                        <dt className="text-gray-500 dark:text-gray-400">Last {w.minutes} min</dt>
                        <dd className="text-gray-900 dark:text-gray-100 tabular-nums">
                          {formatNumber(w.users)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </Panel>

            <Panel
              title="Currently Viewed Pages"
              query={realtime}
              className="lg:col-span-2"
              isEmpty={data => data.activePages.length === 0}
              emptyMessage="No pages are being viewed right now."
              loadingHeight="h-40"
            >
              {data => (
                <div className="space-y-3">
                  {data.activePages.map(page => (
                    <RankingBar
                      key={page.path}
                      label={page.path}
                      value={page.viewers}
                      max={data.activePages[0]?.viewers ?? 0}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* ----------------------------------------------------- traffic -- */}
          <SectionHeading title="Traffic" description="Visitors and views over the selected period." />

          <Panel
            title="Traffic Trend"
            query={traffic}
            isEmpty={data => data.points.length === 0}
            actions={
              <div className="flex flex-wrap gap-1">
                {TRAFFIC_METRICS.map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setTrafficMetric(metric.key)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      trafficMetric === metric.key
                        ? 'bg-yellow-400 text-gray-900'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            }
          >
            {data => (
              <>
                <TrendAreaChart
                  data={data.points as unknown as Array<Record<string, unknown>>}
                  xKey="label"
                  series={[
                    {
                      key: trafficMetric,
                      label: TRAFFIC_METRICS.find(m => m.key === trafficMetric)?.label ?? '',
                    },
                  ]}
                />
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Showing {data.granularity} granularity for this range.
                </p>
              </>
            )}
          </Panel>

          {/* ------------------------------------------------- acquisition -- */}
          <SectionHeading title="Acquisition" description="Where your readers come from." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Traffic Sources"
              description="Grouped into marketing channels"
              query={acquisition}
              isEmpty={data => data.length === 0}
            >
              {rows => <DonutChart data={rows.map(r => ({ label: r.label, value: r.visitors }))} />}
            </Panel>

            <Panel
              title="Social Traffic"
              query={social}
              unavailable={data =>
                data.length === 0
                  ? { what: 'Social traffic', requires: 'visits arriving from a social platform' }
                  : null
              }
            >
              {rows => (
                <div className="space-y-3">
                  {rows.map(row => (
                    <RankingBar key={row.key} label={row.label} value={row.visitors} max={rows[0].visitors} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Referrers"
              description="Individual referring domains"
              query={referrers}
              className="lg:col-span-2"
              unavailable={data =>
                data.length === 0
                  ? { what: 'Referrer data', requires: 'visits arriving from an external site' }
                  : null
              }
            >
              {rows => (
                <DataTable
                  columns={dimensionColumns('Source')}
                  rows={rows.slice(0, 25)}
                  rowKey={r => r.key}
                />
              )}
            </Panel>
          </div>

          {/* ---------------------------------------------------- audience -- */}
          <SectionHeading title="Audience" description="Who your readers are and what they use." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="New vs Returning"
              query={audience}
              unavailable={data =>
                !data.available
                  ? { what: 'Visitor recognition', requires: 'returning visits from a recognised visitor id' }
                  : null
              }
              className="lg:col-span-2"
            >
              {data => (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-2xl text-gray-900 dark:text-gray-100 tabular-nums">
                        {formatNumber(data.new)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        New visitors · {formatPercent(data.newRate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl text-gray-900 dark:text-gray-100 tabular-nums">
                        {formatNumber(data.returning)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Returning visitors · {formatPercent(data.returningRate)}
                      </p>
                    </div>
                  </div>
                  {data.trend.length > 0 && (
                    <MultiLineChart
                      data={data.trend as unknown as Array<Record<string, unknown>>}
                      xKey="date"
                      series={[
                        { key: 'new', label: 'New' },
                        { key: 'returning', label: 'Returning' },
                      ]}
                    />
                  )}
                </>
              )}
            </Panel>

            <DimensionPanel
              title="Devices"
              query={devices}
              variant="donut"
              unavailableWhat="Device analytics"
              requires="user-agent parsing on incoming events"
            />
            <DimensionPanel
              title="Browsers"
              query={browsers}
              unavailableWhat="Browser analytics"
              requires="user-agent parsing on incoming events"
            />
            <DimensionPanel
              title="Operating Systems"
              query={operatingSystems}
              variant="donut"
              unavailableWhat="Operating system analytics"
              requires="user-agent parsing on incoming events"
            />
            <DimensionPanel
              title="Languages"
              description="From the reader’s browser settings"
              query={languages}
              unavailableWhat="Language analytics"
              requires="a browser language on incoming events"
            />
          </div>

          {/* --------------------------------------------------- geography -- */}
          <SectionHeading
            title="Geography"
            description="Where in the world your readers are. Click a country to drill down."
          />

          <div className="space-y-4">
            <Panel
              title="Traffic by Country"
              query={geography}
              unavailable={data =>
                !data.available
                  ? {
                      what: 'Geographic analytics',
                      requires: 'country resolution from edge request headers',
                    }
                  : null
              }
              loadingHeight="h-96"
            >
              {data => (
                <WorldMap
                  rows={data.countries}
                  selected={selectedCountry}
                  onSelect={row => {
                    const next = selectedCountry === row.key ? null : row.key;
                    setSelectedCountry(next);
                    setFilter('country', next ?? undefined);
                  }}
                />
              )}
            </Panel>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel
                title="Countries"
                query={geography}
                unavailable={d => (d.countries.length === 0 ? { what: 'Country data', requires: 'edge geo headers' } : null)}
              >
                {data => (
                  <DataTable
                    columns={dimensionColumns('Country')}
                    rows={data.countries.slice(0, 15)}
                    rowKey={r => r.key}
                    onRowClick={row => setFilter('country', row.key)}
                  />
                )}
              </Panel>

              <Panel
                title="Regions"
                query={geography}
                unavailable={d =>
                  d.regions.length === 0 ? { what: 'Region data', requires: 'region resolution at the edge' } : null
                }
              >
                {data => (
                  <DataTable
                    columns={dimensionColumns('Region')}
                    rows={data.regions.slice(0, 15)}
                    rowKey={r => r.key}
                    onRowClick={row => setFilter('region', row.key)}
                  />
                )}
              </Panel>

              <Panel
                title="Cities"
                query={geography}
                unavailable={d =>
                  d.cities.length === 0 ? { what: 'City data', requires: 'city resolution at the edge' } : null
                }
              >
                {data => (
                  <DataTable
                    columns={dimensionColumns('City')}
                    rows={data.cities.slice(0, 15)}
                    rowKey={r => r.key}
                    onRowClick={row => setFilter('city', row.key)}
                  />
                )}
              </Panel>
            </div>
          </div>

          {/* ----------------------------------------------------- content -- */}
          <SectionHeading title="Content" description="How your articles are performing." />

          <div className="space-y-4">
            <Panel
              title="Article Performance"
              query={articles}
              isEmpty={data => data.items.length === 0}
              actions={
                <input
                  type="search"
                  value={articleSearch}
                  onChange={e => setArticleSearch(e.target.value)}
                  placeholder="Search articles…"
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 w-40 sm:w-56"
                />
              }
            >
              {data => (
                <>
                  <DataTable
                    columns={articleColumns}
                    rows={data.items}
                    rowKey={r => r.id}
                    sort={sort}
                    onSortChange={toggleSort}
                    onRowClick={row => onNavigate(`admin/analytics/articles/${row.id}`)}
                  />
                  <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Page {data.pagination.page} of {data.pagination.totalPages} ·{' '}
                      {formatNumber(data.pagination.total)} articles
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={!data.pagination.hasPrevious}
                        onClick={() => setArticlePage(p => Math.max(1, p - 1))}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        disabled={!data.pagination.hasNext}
                        onClick={() => setArticlePage(p => p + 1)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </Panel>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel
                title="Trending Now"
                description="Strongest growth in the last 24 hours"
                query={trending}
                unavailable={data =>
                  data.length === 0
                    ? { what: 'Trending detection', requires: 'article views within the last 48 hours' }
                    : null
                }
              >
                {rows => (
                  <div className="space-y-3">
                    {rows.map(row => (
                      <button
                        key={row.id}
                        onClick={() => onNavigate(`admin/analytics/articles/${row.id}`)}
                        className="w-full text-left p-3 -m-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                            {row.title}
                          </span>
                          <span className="text-xs shrink-0 tabular-nums text-gray-500 dark:text-gray-400">
                            {row.growth === null ? 'New' : `${row.growth > 0 ? '+' : ''}${row.growth}%`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatNumber(row.views)} views · {row.viewsPerHour}/hr
                          {row.category ? ` · ${row.category}` : ''}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </Panel>

              <Panel
                title="Categories"
                query={categories}
                isEmpty={data => data.length === 0}
              >
                {rows => (
                  <DataTable
                    columns={groupColumns('Category')}
                    rows={rows}
                    rowKey={r => r.id}
                    onRowClick={row => setFilter('categoryId', row.id)}
                  />
                )}
              </Panel>

              <Panel title="Authors" query={authors} isEmpty={data => data.length === 0} className="lg:col-span-2">
                {rows => (
                  <DataTable
                    columns={[
                      ...groupColumns('Author'),
                      {
                        key: 'topArticle',
                        header: 'Top Article',
                        render: r => (
                          <span className="text-gray-500 dark:text-gray-400 line-clamp-1">
                            {r.topArticle?.title ?? '—'}
                          </span>
                        ),
                      },
                    ]}
                    rows={rows}
                    rowKey={r => r.id}
                    onRowClick={row => setFilter('authorId', row.id)}
                  />
                )}
              </Panel>
            </div>
          </div>

          {/* -------------------------------------------------- engagement -- */}
          <SectionHeading
            title="Article Engagement"
            description="How far readers actually get through your articles."
          />

          <Panel
            title="Reading Depth"
            description="Share of readers reaching each scroll milestone"
            query={readingDepth}
            unavailable={data =>
              !data.available
                ? { what: 'Reading depth', requires: 'scroll-milestone tracking on article pages' }
                : null
            }
          >
            {data => (
              <>
                <FunnelBars
                  steps={data.milestones.map(m => ({
                    label: `${m.depth}% read`,
                    value: m.sessions,
                    rate: m.rate,
                  }))}
                />
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Based on {formatNumber(data.base)} reading sessions in this period.
                </p>
              </>
            )}
          </Panel>

          {/* ------------------------------------------ publishing insights -- */}
          <SectionHeading
            title="Publishing Insights"
            description="When to publish, and how long an article keeps earning traffic."
          />

          <div className="space-y-4">
            <Panel
              title="Best Publishing Times"
              description="Views earned by publish hour and weekday (UTC)"
              query={publishing}
              unavailable={data =>
                !data.available
                  ? {
                      what: 'Publishing insights',
                      requires: 'article view events recorded against published articles',
                    }
                  : null
              }
            >
              {data => (
                <PublishingHeatmap
                  cells={data.byDay.flatMap(day =>
                    data.byHour.map(hour => ({
                      day: day.day,
                      hour: hour.hour,
                      // The heatmap needs a per-cell figure; the API reports the
                      // two axes independently, so a cell shows the weaker of
                      // the two signals rather than their product.
                      value: Math.min(day.viewsPerArticle, hour.viewsPerArticle),
                    }))
                  )}
                />
              )}
            </Panel>

            <Panel
              title="Article Lifecycle"
              description="When views arrive, relative to publication"
              query={publishing}
              unavailable={data =>
                !data.available
                  ? { what: 'Lifecycle analysis', requires: 'timestamped article view events' }
                  : null
              }
            >
              {data => (
                <SimpleBarChart
                  data={data.lifecycle as unknown as Array<Record<string, unknown>>}
                  xKey="bucket"
                  barKey="views"
                  label="Views"
                />
              )}
            </Panel>
          </div>

          {/* ------------------------------------------------------ search -- */}
          <SectionHeading title="Search" description="What readers are looking for on the site." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
            <Panel
              title="Top Searches"
              query={search}
              actions={
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(search.data?.totalSearches ?? 0)} total
                </span>
              }
              unavailable={data =>
                data.topTerms.length === 0 && data.totalSearches === 0
                  ? { what: 'Search analytics', requires: 'searches performed on the public site' }
                  : null
              }
            >
              {data => (
                <div className="space-y-3">
                  {data.topTerms.map(term => (
                    <RankingBar
                      key={term.term}
                      label={term.term}
                      value={term.count}
                      max={data.topTerms[0]?.count ?? 0}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Zero-Result Searches"
              description="Content your readers wanted but could not find"
              query={search}
              unavailable={data =>
                data.zeroResultTerms.length === 0
                  ? { what: 'Zero-result searches', requires: 'searches that returned no matches' }
                  : null
              }
            >
              {data => (
                <div className="space-y-3">
                  {data.zeroResultTerms.map(term => (
                    <RankingBar
                      key={term.term}
                      label={term.term}
                      value={term.count}
                      max={data.zeroResultTerms[0]?.count ?? 0}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- columns --- */

const articleColumns: Column<ArticleRow>[] = [
  {
    key: 'title',
    header: 'Article',
    sortable: true,
    render: r => (
      <span className="inline-flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
        <span className="line-clamp-1 max-w-[22rem]">{r.title}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </span>
    ),
  },
  { key: 'category', header: 'Category', render: r => r.category ?? '—' },
  { key: 'author', header: 'Author', render: r => r.author ?? '—' },
  { key: 'views', header: 'Views', align: 'right', sortable: true, render: r => formatNumber(r.views) },
  {
    key: 'uniqueReaders',
    header: 'Readers',
    align: 'right',
    sortable: true,
    render: r => formatNumber(r.uniqueReaders),
  },
  {
    key: 'avgReadTime',
    header: 'Avg. Read',
    align: 'right',
    sortable: true,
    render: r => formatDuration(r.avgReadTime),
  },
  {
    key: 'engagementRate',
    header: 'Engagement',
    align: 'right',
    sortable: true,
    render: r => formatPercent(r.engagementRate),
  },
  { key: 'shares', header: 'Shares', align: 'right', sortable: true, render: r => formatNumber(r.shares) },
];

function groupColumns(nameHeader: string): Column<ContentGroupRow>[] {
  return [
    { key: 'label', header: nameHeader, render: r => r.label },
    { key: 'articles', header: 'Articles', align: 'right', render: r => formatNumber(r.articles) },
    { key: 'views', header: 'Views', align: 'right', render: r => formatNumber(r.views) },
    {
      key: 'engagementRate',
      header: 'Engagement',
      align: 'right',
      render: r => formatPercent(r.engagementRate),
    },
  ];
}
