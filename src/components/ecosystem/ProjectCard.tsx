import Link from 'next/link';
import { ArrowUpRight, BadgeCheck, Flame } from 'lucide-react';
import type { Project } from '@/types/project';
import { labelForSlug } from '@/lib/taxonomy';
import { ProjectLogo } from './ProjectLogo';
import { StatusBadge } from './StatusBadge';
import { ProjectSocialLinks } from './ProjectSocialLinks';

/**
 * The single card used for every project across the site.
 *
 * A server component: the whole card is a link, so it ships no JavaScript.
 * The social icons are real anchors nested inside, which is why the card uses
 * an overlay link rather than wrapping its children in an <a>.
 */
export function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className="group relative flex flex-col h-full bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-5 transition-all duration-200 hover:border-[#FFD200] dark:hover:border-[#FFD200] hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 focus-within:border-[#FFD200]">
      {/* Accent strip, tinted from the project's own brand colour */}
      <span
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-70"
        style={{ backgroundColor: project.accent }}
        aria-hidden="true"
      />

      <div className="flex items-start gap-4">
        <ProjectLogo project={project} />

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-base font-medium text-gray-900 dark:text-white">
            {/* Overlay link: makes the whole card clickable while keeping the
                nested social anchors independently focusable. */}
            <Link href={`/ecosystem/${project.slug}`} className="focus:outline-none">
              <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
              <span className="group-hover:text-[#FFD200] transition-colors">{project.name}</span>
            </Link>
            {project.verified && (
              <BadgeCheck
                className="w-4 h-4 shrink-0 text-[#FFD200]"
                aria-label="Verified project"
              />
            )}
            {project.trending && (
              <Flame className="w-3.5 h-3.5 shrink-0 text-orange-500" aria-label="Trending" />
            )}
          </h3>

          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {labelForSlug(project.category)} · {labelForSlug(project.blockchain)}
          </p>
        </div>

        <StatusBadge status={project.status} />
      </div>

      <p
        className={`mt-3 text-sm text-gray-600 dark:text-gray-400 ${
          compact ? 'line-clamp-2' : 'line-clamp-3'
        }`}
      >
        {project.tagline}
      </p>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          {/* relative + z-10 keeps these above the overlay link */}
          <div className="relative z-10">
            <ProjectSocialLinks links={project.links} max={4} />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-[#FFD200] transition-colors">
            Explore
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      )}
    </article>
  );
}
