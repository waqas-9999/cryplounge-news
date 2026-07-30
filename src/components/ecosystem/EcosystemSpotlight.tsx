import Link from 'next/link';
import { ArrowRight, BadgeCheck } from 'lucide-react';
import type { Project } from '@/types/project';
import { labelForSlug } from '@/lib/taxonomy';
import { ProjectLogo } from './ProjectLogo';

/**
 * Project spotlight for the news pages.
 *
 * Replaces a hardcoded Geopolitics carousel: rather than another row of
 * articles, this points readers from the newsroom into the project directory.
 *
 * Data is fetched on the server and passed in, so this component stays free of
 * data-layer imports and works in both server and client trees.
 */
export function EcosystemSpotlight({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="ecosystem-spotlight">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="inline-block px-3 md:px-4 py-1.5 md:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg">
          <h2
            id="ecosystem-spotlight"
            className="text-black dark:text-[#EFB81A] text-xs md:text-sm font-medium tracking-wide"
          >
            ECOSYSTEM SPOTLIGHT
          </h2>
        </div>
        <Link
          href="/ecosystem"
          className="text-xs md:text-sm text-gray-800 dark:text-gray-200 hover:text-[#EFB81A] transition-colors flex items-center gap-1"
        >
          Browse directory <ArrowRight className="w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {projects.map(project => (
          <li key={project.id}>
            <Link
              href={`/ecosystem/${project.slug}`}
              className="group flex h-full flex-col bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-[#EFB81A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <ProjectLogo project={project} />
                <div className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#EFB81A] transition-colors">
                    <span className="truncate">{project.name}</span>
                    {project.verified && (
                      <BadgeCheck
                        className="w-3.5 h-3.5 shrink-0 text-[#EFB81A]"
                        aria-label="Verified"
                      />
                    )}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                    {labelForSlug(project.category)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {project.tagline}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
