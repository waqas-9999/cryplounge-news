import { Search } from 'lucide-react';
import { PageHeader, type Crumb } from '@/components/section/PageHeader';
import { EmptyDirectoryState } from './EmptyDirectoryState';
import { ProjectGrid } from './ProjectGrid';
import type { Project } from '@/types/project';

/**
 * Shared layout for every filtered directory view (category, network, tag).
 *
 * One component means the three facet routes cannot drift apart in spacing,
 * hierarchy or empty-state behaviour.
 */
export function DirectoryListing({
  eyebrow,
  title,
  description,
  breadcrumbs,
  projects,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  projects: Project[];
  emptyMessage: string;
}) {
  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
      />

      {projects.length === 0 ? (
        <EmptyDirectoryState
          icon={Search}
          title="Nothing here yet"
          description={emptyMessage}
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </p>
          <ProjectGrid projects={projects} columns={3} />
        </>
      )}
    </main>
  );
}
