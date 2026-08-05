'use client';

/**
 * Founders → Analytics & Reports. Independent of the events module; reports
 * only on founder profile performance.
 */

import { KpiCard, useAnalyticsQuery } from '@/components/admin/analytics/primitives';
import { entityAnalyticsApi } from '@/services/entity-analytics';
import { formatNumber } from '@/services/analytics';
import { ModuleAnalyticsPage, type GroupingDef } from './ModuleAnalyticsPage';

const GROUPINGS: GroupingDef[] = [
  {
    path: 'companies',
    title: 'Top Companies',
    description: 'Views earned per company',
    header: 'Company',
    itemsHeader: 'Founders',
  },
  {
    path: 'industries',
    title: 'Industries',
    description: 'Set the “industry” field on a founder to populate this',
    header: 'Industry',
    itemsHeader: 'Founders',
  },
];

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function FoundersAnalyticsPage(props: Props) {
  const overview = useAnalyticsQuery(s => entityAnalyticsApi.founderOverview(s), []);

  return (
    <ModuleAnalyticsPage
      {...props}
      module="founders"
      title="Founder Analytics"
      subtitle="Understand which founder stories resonate and where readers go next."
      itemNoun="founder profiles"
      groupings={GROUPINGS}
      overviewTiles={() => {
        const data = overview.data;
        const tile = (label: string, value: number | undefined) => (
          <KpiCard
            key={label}
            label={label}
            loading={overview.loading}
            value={formatNumber(value ?? 0)}
          />
        );
        return (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {tile('Total Profiles', data?.total)}
            {tile('Published', data?.published)}
            {tile('Draft', data?.draft)}
            {tile('Featured', data?.featured)}
            {tile('Verified', data?.verified)}
          </div>
        );
      }}
    />
  );
}
