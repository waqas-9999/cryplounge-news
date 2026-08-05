'use client';

/**
 * The shared workspace behind the Events and Founders analytics modules.
 *
 * Each module gets its own route, sidebar entry, filters and export, as
 * required — but they render through one component because the reports are
 * structurally identical. What differs is passed in: the overview tiles and
 * the two grouping dimensions.
 *
 * As everywhere in analytics, a dimension with no data renders an explicit
 * "tracking not available" state rather than a zero.
 */

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Download } from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import {
  formatDuration,
  formatNumber,
  formatPercent,
  RANGE_LABELS,
  resolveRange,
  type AnalyticsFilters,
  type DimensionRow,
  type RangePreset,
} from '@/services/analytics';
import {
  ENGAGEMENT_LABELS,
  entityAnalyticsApi,
  moduleExportUrl,
  type EntityModule,
  type GroupedRow,
  type PerformanceRow,
} from '@/services/entity-analytics';
import {
  Card,
  DataTable,
  KpiCard,
  Panel,
  RankingBar,
  useAnalyticsQuery,
  type Column,
} from '@/components/admin/analytics/primitives';
import { DonutChart, FunnelBars, MultiLineChart } from '@/components/admin/analytics/charts';
import { WorldMap } from '@/components/admin/analytics/WorldMap';

/** One tile in the module's status overview. */
export interface OverviewTile {
  label: string;
  value: number;
}

export interface GroupingDef {
  /** Endpoint segment, e.g. "organizers" or "industries". */
  path: string;
  title: string;
  description?: string;
  /** Column header for the group name. */
  header: string;
  /** Column header for the item count, e.g. "Events" or "Founders". */
  itemsHeader: string;
}

const PRESETS: RangePreset[] = ['today', 'yesterday', 'last7', 'last30', 'last90', 'thisYear'];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 mt-10 first:mt-0">
      <h2 className="text-base text-gray-900 dark:text-gray-100">{title}</h2>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
    </div>
  );
}

const dimensionColumns = (nameHeader: string): Column<DimensionRow>[] => [
  { key: 'label', header: nameHeader, render: r => r.label },
  { key: 'visitors', header: 'Visitors', align: 'right', render: r => formatNumber(r.visitors) },
  { key: 'sessions', header: 'Sessions', align: 'right', render: r => formatNumber(r.sessions) },
  {
    key: 'engagementRate',
    header: 'Engagement',
    align: 'right',
    render: r => formatPercent(r.engagementRate),
  },
  {
    key: 'avgSessionDuration',
    header: 'Avg. Time',
    align: 'right',
    render: r => formatDuration(r.avgSessionDuration),
  },
];

export function ModuleAnalyticsPage({
  module,
  title,
  subtitle,
  itemNoun,
  overviewTiles,
  groupings,
  currentPage,
  onNavigate,
  onLogout,
}: {
  module: EntityModule;
  title: string;
  subtitle: string;
  /** Plural noun for this module's records, e.g. "events". */
  itemNoun: string;
  /** Renders the module-specific status tiles from its own overview endpoint. */
  overviewTiles: (loading: boolean) => ReactNode;
  groupings: GroupingDef[];
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [preset, setPreset] = useState<RangePreset>('last30');
  const [compare, setCompare] = useState(true);
  const [country, setCountry] = useState<string | null>(null);

  const filters = useMemo<AnalyticsFilters>(() => {
    const range = resolveRange(preset);
    return country ? { ...range, country } : range;
  }, [preset, country]);

  const key = useMemo(() => JSON.stringify(filters), [filters]);

  const audience = useAnalyticsQuery(s => entityAnalyticsApi.audience(module, filters, s), [key, module]);
  const geography = useAnalyticsQuery(s => entityAnalyticsApi.geography(module, filters, s), [key, module]);
  const continents = useAnalyticsQuery(s => entityAnalyticsApi.continents(module, filters, s), [key, module]);
  const devices = useAnalyticsQuery(s => entityAnalyticsApi.devices(module, filters, s), [key, module]);
  const sources = useAnalyticsQuery(s => entityAnalyticsApi.sources(module, filters, s), [key, module]);
  const engagement = useAnalyticsQuery(s => entityAnalyticsApi.engagement(module, filters, s), [key, module]);
  const readingDepth = useAnalyticsQuery(s => entityAnalyticsApi.readingDepth(module, filters, s), [key, module]);
  const performance = useAnalyticsQuery(s => entityAnalyticsApi.performance(module, filters, s), [key, module]);
  const seo = useAnalyticsQuery(s => entityAnalyticsApi.seo(module, filters, s), [key, module]);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    try {
      const blob = await apiClient.download(moduleExportUrl(module, filters));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${module}-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(errorMessage(err, 'Export failed.'));
    } finally {
      setExporting(false);
    }
  }, [module, filters]);

  const performanceColumns: Column<PerformanceRow>[] = [
    { key: 'title', header: title.replace(' Analytics', ''), render: r => r.title },
    { key: 'group', header: module === 'events' ? 'Organizer' : 'Company', render: r => r.group ?? '—' },
    { key: 'views', header: 'Views', align: 'right', render: r => formatNumber(r.views) },
    { key: 'clicks', header: 'Clicks', align: 'right', render: r => formatNumber(r.totalClicks) },
    {
      key: 'ctr',
      header: 'CTR',
      align: 'right',
      // Null means no views, where a rate is undefined rather than 0%.
      render: r => (r.ctr === null ? '—' : formatPercent(r.ctr)),
    },
  ];

  const groupColumns = (g: GroupingDef): Column<GroupedRow>[] => [
    { key: 'label', header: g.header, render: r => r.label },
    { key: 'items', header: g.itemsHeader, align: 'right', render: r => formatNumber(r.items) },
    { key: 'views', header: 'Views', align: 'right', render: r => formatNumber(r.views) },
    { key: 'avgViews', header: 'Avg. Views', align: 'right', render: r => formatNumber(r.avgViews) },
  ];

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
        <AdminHeader title={title} onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>

          {/* ----------------------------------------------------- controls -- */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  preset === p
                    ? 'bg-yellow-400 text-gray-900'
                    : 'bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {RANGE_LABELS[p]}
              </button>
            ))}
            <button
              onClick={() => setCompare(c => !c)}
              aria-pressed={compare}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                compare
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300'
              }`}
            >
              Compare
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            {country && (
              <button
                onClick={() => setCountry(null)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                Country: {country} ✕
              </button>
            )}
          </div>
          {exportError && <p className="-mt-6 mb-6 text-sm text-red-600 dark:text-red-400">{exportError}</p>}

          {/* ----------------------------------------------------- overview -- */}
          <SectionHeading title="Overview" description={`Current ${itemNoun} by status.`} />
          {overviewTiles(false)}

          {/* ------------------------------------------------------ traffic -- */}
          <SectionHeading title="Traffic" description={`Visitors to your ${itemNoun} pages.`} />

          <Panel
            title="New vs Returning Visitors"
            query={audience}
            unavailable={d =>
              !d.available
                ? { what: 'Visitor recognition', requires: `recorded visits to ${itemNoun} pages` }
                : null
            }
          >
            {data => (
              <>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <KpiCard label="New Visitors" value={formatNumber(data.new)} />
                  <KpiCard label="Returning Visitors" value={formatNumber(data.returning)} />
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

          {/* -------------------------------------------------- acquisition -- */}
          <SectionHeading title="Traffic Sources" description="How readers reach these pages." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Channels"
              query={sources}
              unavailable={d =>
                d.channels.length === 0 ? { what: 'Source attribution', requires: 'recorded visits' } : null
              }
            >
              {d => <DonutChart data={d.channels.map(c => ({ label: c.label, value: c.visitors }))} />}
            </Panel>

            <Panel
              title="Social Platforms"
              query={sources}
              unavailable={d =>
                d.social.length === 0
                  ? { what: 'Social traffic', requires: 'visits arriving from a social platform' }
                  : null
              }
            >
              {d => (
                <div className="space-y-3">
                  {d.social.map(row => (
                    <RankingBar key={row.key} label={row.label} value={row.visitors} max={d.social[0].visitors} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Referring Domains"
              query={sources}
              className="lg:col-span-2"
              unavailable={d =>
                d.referrers.length === 0
                  ? { what: 'Referrer data', requires: 'visits arriving from an external site' }
                  : null
              }
            >
              {d => (
                <DataTable columns={dimensionColumns('Source')} rows={d.referrers.slice(0, 20)} rowKey={r => r.key} />
              )}
            </Panel>
          </div>

          {/* ---------------------------------------------------- geography -- */}
          <SectionHeading title="Geography" description="Where these readers are. Click a country to filter." />

          <div className="space-y-4">
            <Panel
              title="Traffic by Country"
              query={geography}
              unavailable={d =>
                !d.available
                  ? { what: 'Geographic analytics', requires: 'country resolution from edge request headers' }
                  : null
              }
              loadingHeight="h-96"
            >
              {d => (
                <WorldMap
                  rows={d.countries}
                  selected={country}
                  onSelect={row => setCountry(country === row.key ? null : row.key)}
                />
              )}
            </Panel>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <Panel
                title="Countries"
                query={geography}
                unavailable={d => (d.countries.length === 0 ? { what: 'Country data', requires: 'edge geo headers' } : null)}
              >
                {d => (
                  <DataTable
                    columns={dimensionColumns('Country')}
                    rows={d.countries.slice(0, 15)}
                    rowKey={r => r.key}
                    onRowClick={row => setCountry(row.key)}
                  />
                )}
              </Panel>

              <Panel
                title="Regions & Cities"
                query={geography}
                unavailable={d =>
                  d.regions.length === 0 && d.cities.length === 0
                    ? { what: 'Region and city data', requires: 'region resolution at the edge' }
                    : null
                }
              >
                {d => (
                  <DataTable
                    columns={dimensionColumns('Region / City')}
                    rows={[...d.regions, ...d.cities].slice(0, 15)}
                    rowKey={r => r.key}
                  />
                )}
              </Panel>

              <Panel
                title="Continents"
                query={continents}
                unavailable={d => (d.length === 0 ? { what: 'Continent data', requires: 'country data' } : null)}
              >
                {rows => (
                  <div className="space-y-3">
                    {rows.map(row => (
                      <RankingBar key={row.key} label={row.label} value={row.count} max={rows[0].count} />
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </div>

          {/* ------------------------------------------------------ devices -- */}
          <SectionHeading title="Devices" description="What readers use to browse." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Device Type"
              query={devices}
              unavailable={d =>
                d.devices.length === 0
                  ? { what: 'Device analytics', requires: 'user-agent parsing on incoming events' }
                  : null
              }
            >
              {d => <DonutChart data={d.devices.map(r => ({ label: r.label, value: r.visitors }))} />}
            </Panel>

            <Panel
              title="Operating System"
              query={devices}
              unavailable={d =>
                d.operatingSystems.length === 0
                  ? { what: 'OS analytics', requires: 'user-agent parsing on incoming events' }
                  : null
              }
            >
              {d => <DonutChart data={d.operatingSystems.map(r => ({ label: r.label, value: r.visitors }))} />}
            </Panel>

            <Panel
              title="Browser"
              query={devices}
              unavailable={d =>
                d.browsers.length === 0
                  ? { what: 'Browser analytics', requires: 'user-agent parsing on incoming events' }
                  : null
              }
            >
              {d => (
                <div className="space-y-3">
                  {d.browsers.map(row => (
                    <RankingBar key={row.key} label={row.label} value={row.visitors} max={d.browsers[0].visitors} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Language"
              query={devices}
              unavailable={d =>
                d.languages.length === 0
                  ? { what: 'Language analytics', requires: 'a browser language on incoming events' }
                  : null
              }
            >
              {d => (
                <div className="space-y-3">
                  {d.languages.slice(0, 10).map(row => (
                    <RankingBar key={row.key} label={row.label} value={row.visitors} max={d.languages[0].visitors} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Screen Resolution"
              query={devices}
              className="lg:col-span-2"
              unavailable={d =>
                d.screenResolutions.length === 0
                  ? { what: 'Screen resolution', requires: 'resolution captured on page-view events' }
                  : null
              }
            >
              {d => (
                <div className="space-y-3">
                  {d.screenResolutions.slice(0, 10).map(row => (
                    <RankingBar
                      key={row.key}
                      label={row.label}
                      value={row.count}
                      max={d.screenResolutions[0].count}
                    />
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* --------------------------------------------------- engagement -- */}
          <SectionHeading title="Engagement" description="Clicks that show real interest, not just a view." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Link Clicks"
              query={engagement}
              unavailable={d =>
                !d.available
                  ? {
                      what: 'Engagement click tracking',
                      requires: 'readers clicking an instrumented link on these pages',
                    }
                  : null
              }
            >
              {d => (
                <div className="space-y-3">
                  {d.actions.map(action => (
                    <RankingBar
                      key={action.key}
                      label={ENGAGEMENT_LABELS[action.key] ?? action.label}
                      value={action.count}
                      max={d.actions[0].count}
                    />
                  ))}
                </div>
              )}
            </Panel>

            <Panel
              title="Scroll Depth"
              description="How far readers get down the page"
              query={readingDepth}
              unavailable={d =>
                !d.available ? { what: 'Scroll depth', requires: 'scroll-milestone tracking on these pages' } : null
              }
            >
              {d => (
                <FunnelBars
                  steps={d.milestones.map(m => ({ label: `${m.depth}%`, value: m.sessions, rate: m.rate }))}
                />
              )}
            </Panel>
          </div>

          {/* -------------------------------------------------- performance -- */}
          <SectionHeading title="Performance" description={`Which ${itemNoun} are working.`} />

          <Panel
            title="Most Viewed"
            query={performance}
            isEmpty={rows => rows.length === 0}
            emptyMessage={`No view data for ${itemNoun} in this period.`}
          >
            {rows => (
              <DataTable columns={performanceColumns} rows={rows.slice(0, 25)} rowKey={r => r.id} />
            )}
          </Panel>

          {/* ---------------------------------------------------- groupings -- */}
          <SectionHeading title="Breakdowns" description={`Performance grouped across your ${itemNoun}.`} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groupings.map(grouping => (
              <GroupingPanel
                key={grouping.path}
                module={module}
                grouping={grouping}
                filters={filters}
                filterKey={key}
                columns={groupColumns(grouping)}
              />
            ))}
          </div>

          {/* ---------------------------------------------------------- SEO -- */}
          <SectionHeading title="SEO" description="Organic reach and metadata health." />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-10">
            <Panel title="Organic Traffic" query={seo}>
              {d => (
                <div className="grid grid-cols-2 gap-4">
                  <KpiCard label="Organic Visitors" value={formatNumber(d.organicVisitors)} />
                  <KpiCard label="Organic Sessions" value={formatNumber(d.organicSessions)} />
                </div>
              )}
            </Panel>

            <Panel
              title="Metadata Issues"
              description="Published pages missing SEO fields"
              query={seo}
              isEmpty={d => d.missingMetadata.length === 0}
              emptyMessage="Every published page has complete SEO metadata."
            >
              {d => (
                <ul className="space-y-3">
                  {d.missingMetadata.slice(0, 15).map(record => (
                    <li key={record.id}>
                      <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{record.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{record.issues.join(' · ')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {/* Stated plainly rather than rendered as healthy zeros. */}
            <Card className="lg:col-span-2 p-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Not yet available</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Indexed page counts require a Google Search Console integration. Broken-link detection and
                structured-data validation require a crawler job. Neither exists yet, so they are not reported
                here rather than shown as zero.
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Split out so each grouping owns its own request and state machine. */
function GroupingPanel({
  module,
  grouping,
  filters,
  filterKey,
  columns,
}: {
  module: EntityModule;
  grouping: GroupingDef;
  filters: AnalyticsFilters;
  filterKey: string;
  columns: Column<GroupedRow>[];
}) {
  const query = useAnalyticsQuery(
    s => entityAnalyticsApi.grouped(module, grouping.path, filters, s),
    [filterKey, module, grouping.path]
  );

  return (
    <Panel
      title={grouping.title}
      description={grouping.description}
      query={query}
      unavailable={rows =>
        rows.length === 0
          ? { what: grouping.title, requires: `this field to be set on your ${module}` }
          : null
      }
    >
      {rows => <DataTable columns={columns} rows={rows.slice(0, 15)} rowKey={r => r.key} />}
    </Panel>
  );
}
