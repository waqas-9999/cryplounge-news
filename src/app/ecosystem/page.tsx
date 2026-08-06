import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/section/PageHeader';
import { SectionHeader } from '@/components/section/SectionHeader';
import { ProjectGrid } from '@/components/ecosystem/ProjectGrid';
import { FacetPills } from '@/components/ecosystem/FacetPills';
import { LatestEcosystemNews } from '@/components/ecosystem/LatestEcosystemNews';
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
} from '@/services/projects';

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
 * cross-navigation aid. A server component throughout: everything here is
 * links and text, so the page ships no interaction JavaScript.
 */
export default async function Page() {
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
  ]);

  const collectionsWithProjects = await Promise.all(
    collections.map(async collection => ({
      ...collection,
      projects: await getProjectsBySlugs(collection.projectSlugs),
    }))
  );

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12 md:space-y-16">
      <PageHeader
        eyebrow="Project Directory"
        title="Explore the crypto ecosystem"
        description="A curated directory of the protocols, applications and infrastructure being built across crypto — what each one does, which chains it runs on, and the reporting around it."
        breadcrumbs={[{ label: 'Ecosystem' }]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#F9D96A] dark:bg-[#EFB81A]/10 border border-[#EFB81A]/30 rounded-xl px-5 py-4">
        <p className="text-sm text-black dark:text-gray-200">
          Building something in crypto? Get it listed in the directory.
        </p>
        <Link
          href="/ecosystem/submit"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-black text-[#EFB81A] dark:bg-[#EFB81A] dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          Submit Your Project
        </Link>
      </div>

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

      <section aria-labelledby="trending-projects">
        <h2 id="trending-projects" className="sr-only">
          Trending Projects
        </h2>
        <SectionHeader
          title="Trending Projects"
          description="Selected by the newsroom, not by a popularity metric."
          as="h3"
        />
        <ProjectGrid projects={trending} columns={3} compact />
      </section>

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

      {collectionsWithProjects.length > 0 && (
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
      )}

      <section aria-labelledby="editors-picks">
        <h2 id="editors-picks" className="sr-only">
          Editor’s Picks
        </h2>
        <SectionHeader
          title="Editor’s Picks"
          description="Projects our editors think are worth understanding, whatever the market is doing."
          as="h3"
        />
        <ProjectGrid projects={editorsPicks} columns={4} compact />
      </section>

      <section aria-labelledby="new-listings">
        <h2 id="new-listings" className="sr-only">
          New Listings
        </h2>
        <SectionHeader title="New Listings" description="Recently added to the directory." as="h3" />
        <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A]">
          {recent.map(project => (
            <li key={project.id}>
              <Link
                href={`/ecosystem/${project.slug}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
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

      {/* News last, and only as a pointer back into the newsroom. */}
      <LatestEcosystemNews />
    </main>
  );
}
