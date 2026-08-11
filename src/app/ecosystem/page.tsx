import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { SectionHeader } from '@/components/section/SectionHeader';
import { PageHeader } from '@/components/section/PageHeader';
import { ProjectGrid } from '@/components/ecosystem/ProjectGrid';
import { FacetPills } from '@/components/ecosystem/FacetPills';
import { LatestEcosystemNews } from '@/components/ecosystem/LatestEcosystemNews';
import { EcosystemHero } from '@/components/ecosystem/EcosystemHero';
import { EcosystemStats, type EcosystemStat } from '@/components/ecosystem/EcosystemStats';
import { TrendingRail } from '@/components/ecosystem/TrendingRail';
import { Reveal } from '@/components/ecosystem/Reveal';
import { EmptyDirectoryState } from '@/components/ecosystem/EmptyDirectoryState';
import { PROJECT_TECHNOLOGIES, PROJECT_USE_CASES, labelForSlug } from '@/lib/taxonomy';
import {
  getCategorySummaries,
  getCollections,
  getEditorsPicks,
  getFeaturedProjects,
  getNetworkSummaries,
  getProjectsBySlugs,
  getRecentProjects,
  getTagSummaries,
  getTrendingProjects,
  listProjects,
} from '@/services/projects';
import { listArticles } from '@/services/news';

export const metadata: Metadata = {
  title: 'Ecosystem — Crypto Project Directory',
  description:
    'Discover blockchain projects by category, chain, technology and use case: layer 1s and rollups, DeFi, wallets, exchanges, infrastructure, AI, gaming and more.',
  alternates: { canonical: '/ecosystem' },
};

/**
 * Ecosystem homepage — a project directory, not a news feed.
 *
 * Discovery comes first; news appears once, at the end, purely as a
 * cross-navigation aid. Search results (`?q=`) replace the browse layout
 * entirely rather than filtering it in place, keeping this a server
 * component with no client-side data fetching.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  if (query) {
    const results = await listProjects({ search: query, perPage: 30 });
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        <PageHeader
          eyebrow="Search"
          title={`Results for "${query}"`}
          breadcrumbs={[{ label: 'Ecosystem', href: '/ecosystem' }, { label: 'Search' }]}
        />
        {results.items.length === 0 ? (
          <EmptyDirectoryState
            icon={Search}
            title="No ecosystems found"
            description="Try a different name, chain or keyword — or browse the full directory instead."
          />
        ) : (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {results.total} {results.total === 1 ? 'result' : 'results'}
            </p>
            <ProjectGrid projects={results.items} columns={3} />
          </>
        )}
      </main>
    );
  }

  const [
    featured,
    trending,
    recent,
    editorsPicks,
    categories,
    networks,
    technologies,
    useCases,
    collections,
    totalProjects,
    articleStats,
  ] = await Promise.all([
    getFeaturedProjects(4),
    getTrendingProjects(6),
    getRecentProjects(6),
    getEditorsPicks(4),
    getCategorySummaries(),
    getNetworkSummaries(),
    getTagSummaries(PROJECT_TECHNOLOGIES),
    getTagSummaries(PROJECT_USE_CASES),
    getCollections(),
    listProjects({ perPage: 1 }),
    listArticles({ perPage: 1 }),
  ]);

  const collectionsWithProjects = await Promise.all(
    collections.map(async collection => ({
      ...collection,
      projects: await getProjectsBySlugs(collection.projectSlugs),
    }))
  );

  const stats: EcosystemStat[] = [
    { label: 'Ecosystems Tracked', value: totalProjects.total, icon: 'projects' },
    { label: 'Blockchain Networks', value: networks.length, icon: 'networks' },
    { label: 'Featured Projects', value: featured.length, icon: 'featured' },
    { label: 'Latest Stories', value: articleStats.total, icon: 'stories' },
  ];

  return (
    <main className="space-y-16 md:space-y-20 pb-6 md:pb-10">
      <EcosystemHero />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-16 md:space-y-20">
        <Reveal>
          <EcosystemStats stats={stats} />
        </Reveal>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Building something in crypto? Get it listed in the directory.
          </p>
          <Link
            href="/ecosystem/submit"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 dark:bg-[#FFD200] text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            Submit Your Project
          </Link>
        </div>

        <Reveal>
          <section aria-labelledby="featured-projects">
            <h2 id="featured-projects" className="sr-only">
              Featured Projects
            </h2>
            <SectionHeader
              title="Featured Projects"
              description="Where the most consequential building is happening right now."
              as="h3"
            />
            <ProjectGrid projects={featured} columns={4} />
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="browse-category">
            <h2 id="browse-category" className="sr-only">
              Browse by Category
            </h2>
            <SectionHeader
              title="Browse by Category"
              description="Every project belongs to exactly one category."
              as="h3"
            />
            <FacetPills
              label="Project categories"
              facets={categories.map(c => ({ value: c.slug, count: c.count }))}
              hrefFor={value => `/ecosystem/category/${value}`}
            />
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="trending-projects">
            <h2 id="trending-projects" className="sr-only">
              Trending Projects
            </h2>
            <SectionHeader
              title="Trending Now"
              description="Selected by the newsroom, not by a popularity metric."
              as="h3"
            />
            <TrendingRail projects={trending} />
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="browse-facets" className="space-y-8">
            <h2
              id="browse-facets"
              className="text-lg md:text-xl font-medium text-gray-900 dark:text-white"
            >
              Browse the directory
            </h2>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                By blockchain ecosystem
              </h3>
              <FacetPills
                label="Blockchain ecosystems"
                facets={networks}
                hrefFor={value => `/ecosystem/network/${value}`}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                By technology
              </h3>
              <FacetPills
                label="Technologies"
                facets={technologies}
                hrefFor={value => `/ecosystem/tag/${value}`}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">By use case</h3>
              <FacetPills
                label="Use cases"
                facets={useCases}
                hrefFor={value => `/ecosystem/tag/${value}`}
              />
            </div>
          </section>
        </Reveal>

        {collectionsWithProjects.length > 0 && (
          <Reveal>
            <section aria-labelledby="collections" className="space-y-8">
              <h2
                id="collections"
                className="text-lg md:text-xl font-medium text-gray-900 dark:text-white"
              >
                Featured Collections
              </h2>
              {collectionsWithProjects.map(collection => (
                <div key={collection.slug}>
                  <SectionHeader as="h3" title={collection.title} description={collection.description} />
                  <ProjectGrid projects={collection.projects} columns={4} compact />
                </div>
              ))}
            </section>
          </Reveal>
        )}

        <Reveal>
          <section aria-labelledby="editors-picks">
            <h2 id="editors-picks" className="sr-only">
              Editor's Picks
            </h2>
            <SectionHeader
              title="Editor's Picks"
              description="Projects our editors think are worth understanding, whatever the market is doing."
              as="h3"
            />
            <ProjectGrid projects={editorsPicks} columns={4} compact />
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="new-listings">
            <h2 id="new-listings" className="sr-only">
              New Listings
            </h2>
            <SectionHeader title="New Listings" description="Recently added to the directory." as="h3" />
            <ul className="divide-y divide-gray-100 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm">
              {recent.map(project => (
                <li key={project.id}>
                  <Link
                    href={`/ecosystem/${project.slug}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                        {project.name}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                        {project.tagline}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {labelForSlug(project.category)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* News last, and only as a pointer back into the newsroom. */}
        <Reveal>
          <LatestEcosystemNews />
        </Reveal>
      </div>
    </main>
  );
}
