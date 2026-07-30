import Link from 'next/link';
import { BadgeCheck } from 'lucide-react';
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
    <article className="group relative flex flex-col bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-colors hover:border-[#EFB81A] focus-within:border-[#EFB81A]">
      <div className="flex items-start gap-4">
        <ProjectLogo project={project} />

        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-base font-medium text-gray-900 dark:text-white">
            {/* Overlay link: makes the whole card clickable while keeping the
                nested social anchors independently focusable. */}
            <Link href={`/ecosystem/${project.slug}`} className="focus:outline-none">
              <span className="absolute inset-0 rounded-xl" aria-hidden="true" />
              <span className="group-hover:text-[#EFB81A] transition-colors">{project.name}</span>
            </Link>
            {project.verified && (
              <BadgeCheck
                className="w-4 h-4 shrink-0 text-[#EFB81A]"
                aria-label="Verified project"
              />
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
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          {/* relative + z-10 keeps these above the overlay link */}
          <div className="relative z-10">
            <ProjectSocialLinks links={project.links} max={4} />
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-[#EFB81A] transition-colors">
            View profile
          </span>
        </div>
      )}
    </article>
  );
}
