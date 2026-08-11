'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import type { Project } from '@/types/project';
import { labelForSlug } from '@/lib/taxonomy';
import { ProjectLogo } from './ProjectLogo';

/** Compact ranked list for the "Trending Now" rail — a research-desk feel, not another card grid. */
export function TrendingRail({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <ol className="divide-y divide-gray-100 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm">
      {projects.map((project, i) => (
        <motion.li
          key={project.id}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
        >
          <Link
            href={`/ecosystem/${project.slug}`}
            className="group flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <span className="w-5 shrink-0 text-sm text-gray-400 dark:text-gray-600 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>

            <ProjectLogo project={project} />

            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#FFD200] transition-colors">
                <span className="truncate">{project.name}</span>
                {project.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 shrink-0 text-[#FFD200]" aria-label="Verified" />
                )}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
                {labelForSlug(project.category)}
              </span>
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Trending
            </span>
          </Link>
        </motion.li>
      ))}
    </ol>
  );
}
