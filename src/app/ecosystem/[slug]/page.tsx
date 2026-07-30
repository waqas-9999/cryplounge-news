import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/section/PageHeader';
import { SectionHeader } from '@/components/section/SectionHeader';
import { ProjectLogo } from '@/components/ecosystem/ProjectLogo';
import { StatusBadge } from '@/components/ecosystem/StatusBadge';
import { ProjectSocialLinks } from '@/components/ecosystem/ProjectSocialLinks';
import { ProjectGrid } from '@/components/ecosystem/ProjectGrid';
import { labelForSlug } from '@/lib/taxonomy';
import { siteConfig } from '@/config/site';
import {
  getAllProjectSlugs,
  getProjectBySlug,
  getSimilarProjects,
} from '@/services/projects';
import { getArticlesForProject, articleHref } from '@/services/news';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Project Not Found' };

  const title = project.seo?.title ?? `${project.name} — ${labelForSlug(project.category)}`;
  const description = project.seo?.description ?? project.tagline;

  return {
    title,
    description,
    alternates: { canonical: `/ecosystem/${project.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/ecosystem/${project.slug}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Definition-list row for the quick information panel. */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-white text-right">{children}</dd>
    </div>
  );
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [similar, articles] = await Promise.all([
    getSimilarProjects(project, 4),
    getArticlesForProject(project, 4),
  ]);

  // Organization is the closest schema.org type for a crypto project: it
  // carries name, description, logo and sameAs links that crawlers use.
  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: project.name,
    description: project.tagline,
    url: project.links.website ?? `${siteConfig.url}/ecosystem/${project.slug}`,
    ...(project.launchYear ? { foundingDate: String(project.launchYear) } : {}),
    sameAs: Object.values(project.links).filter(Boolean),
  };

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10 md:space-y-14">
      <PageHeader
        title={project.name}
        breadcrumbs={[
          { label: 'Ecosystem', href: '/ecosystem' },
          { label: labelForSlug(project.category), href: `/ecosystem/category/${project.category}` },
          { label: project.name },
        ]}
      />

      {/* Hero */}
      <section
        aria-label="Project summary"
        className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <ProjectLogo project={project} size="lg" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
                {project.name}
              </h2>
              {project.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-[#EFB81A]">
                  <BadgeCheck className="w-4 h-4" aria-hidden="true" />
                  Verified
                </span>
              )}
              <StatusBadge status={project.status} />
            </div>

            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
              {project.tagline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <Link
                href={`/ecosystem/category/${project.category}`}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-[#EFB81A] transition-colors"
              >
                {labelForSlug(project.category)}
              </Link>
              <Link
                href={`/ecosystem/network/${project.blockchain}`}
                className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:text-[#EFB81A] transition-colors"
              >
                {labelForSlug(project.blockchain)}
              </Link>
            </div>
          </div>

          {project.links.website && (
            <a
              href={project.links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EFB81A] text-black text-sm font-medium hover:bg-[#F9D96A] transition-colors"
            >
              Official Website
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-10">
          <section aria-labelledby="about">
            <h2
              id="about"
              className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-4"
            >
              About {project.name}
            </h2>
            <p className="text-sm md:text-base leading-relaxed text-gray-700 dark:text-gray-300">
              {project.about}
            </p>

            {project.keyFeatures.length > 0 && (
              <>
                <h3 className="mt-6 mb-3 text-sm font-medium text-gray-900 dark:text-white">
                  Key features
                </h3>
                <ul className="space-y-2">
                  {project.keyFeatures.map(feature => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span aria-hidden="true" className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#EFB81A] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section aria-labelledby="networks">
            <h2
              id="networks"
              className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-4"
            >
              Supported Networks
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.supportedNetworks.map(network => (
                <li key={network}>
                  <Link
                    href={`/ecosystem/network/${network}`}
                    className="inline-block px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors"
                  >
                    {labelForSlug(network)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tags">
            <h2
              id="tags"
              className="text-lg md:text-xl font-medium text-gray-900 dark:text-white mb-4"
            >
              Tags
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <li key={tag}>
                  <Link
                    href={`/ecosystem/tag/${tag}`}
                    className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs text-gray-700 dark:text-gray-300 hover:text-[#EFB81A] transition-colors"
                  >
                    {labelForSlug(tag)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <section
            aria-labelledby="quick-info"
            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-5"
          >
            <h2
              id="quick-info"
              className="text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              Quick Information
            </h2>
            <dl>
              <InfoRow label="Category">{labelForSlug(project.category)}</InfoRow>
              <InfoRow label="Blockchain">{labelForSlug(project.blockchain)}</InfoRow>
              {project.nativeToken && <InfoRow label="Native token">{project.nativeToken}</InfoRow>}
              {project.launchYear && <InfoRow label="Launched">{project.launchYear}</InfoRow>}
              <InfoRow label="Status">{labelForSlug(project.status)}</InfoRow>
              <InfoRow label="Open source">{project.openSource ? 'Yes' : 'No'}</InfoRow>
            </dl>
          </section>

          <section
            aria-labelledby="official-links"
            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-5"
          >
            <h2
              id="official-links"
              className="text-sm font-medium text-gray-900 dark:text-white mb-3"
            >
              Official Links
            </h2>
            <ProjectSocialLinks links={project.links} showLabels />
          </section>
        </aside>
      </div>

      {/* Cross-navigation: never end on a dead end. */}
      {articles.length > 0 && (
        <section aria-labelledby="project-news">
          <h2 id="project-news" className="sr-only">
            Latest news about {project.name}
          </h2>
          <SectionHeader as="h3" title="Latest News" href="/news" linkLabel="All news" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map(article => (
              <li key={article.id}>
                <Link
                  href={articleHref(article)}
                  className="group block h-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-[#EFB81A] transition-colors"
                >
                  <span className="block text-xs text-[#EFB81A] mb-2">{article.category}</span>
                  <span className="block text-sm text-gray-900 dark:text-white line-clamp-3 group-hover:text-[#EFB81A] transition-colors">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="similar-projects">
          <h2 id="similar-projects" className="sr-only">
            Similar projects
          </h2>
          <SectionHeader
            as="h3"
            title="Similar Projects"
            description={`Other projects in ${labelForSlug(project.category)} and adjacent categories.`}
            href="/ecosystem"
            linkLabel="Browse directory"
          />
          <ProjectGrid projects={similar} columns={4} compact />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
      />
    </main>
  );
}
