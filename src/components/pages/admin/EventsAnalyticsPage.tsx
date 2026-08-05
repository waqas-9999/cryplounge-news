'use client';

/**
 * Events → Analytics & Reports. A dedicated module, deliberately separate from
 * the global analytics dashboard: it reports only on event performance.
 */

import { KpiCard, useAnalyticsQuery } from '@/components/admin/analytics/primitives';
import { entityAnalyticsApi } from '@/services/entity-analytics';
import { formatNumber } from '@/services/analytics';
import { ModuleAnalyticsPage, type GroupingDef } from './ModuleAnalyticsPage';

const GROUPINGS: GroupingDef[] = [
  {
    path: 'organizers',
    title: 'Top Organizers',
    description: 'Views earned per organizer',
    header: 'Organizer',
    itemsHeader: 'Events',
  },
  {
    path: 'categories',
    title: 'Event Categories',
    description: 'Conference, meetup, workshop, hackathon…',
    header: 'Category',
    itemsHeader: 'Events',
  },
  {
    path: 'chains',
    title: 'Blockchain Ecosystems',
    description: 'Set the “chains” field on an event to populate this',
    header: 'Ecosystem',
    itemsHeader: 'Events',
  },
];

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function EventsAnalyticsPage(props: Props) {
  const overview = useAnalyticsQuery(s => entityAnalyticsApi.eventOverview(s), []);

  return (
    <ModuleAnalyticsPage
      {...props}
      module="events"
      title="Events Analytics"
      subtitle="Understand event reach, audience and registration interest."
      itemNoun="events"
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
            {tile('Total Events', data?.total)}
            {tile('Upcoming', data?.upcoming)}
            {tile('Live Now', data?.live)}
            {tile('Completed', data?.completed)}
            {tile('Featured', data?.featured)}
            {tile('Published', data?.published)}
            {tile('Draft', data?.draft)}
            {tile('Pending Review', data?.pendingReview)}
            {tile('Cancelled', data?.cancelled)}
            {tile('Postponed', data?.postponed)}
          </div>
        );
      }}
    />
  );
}
