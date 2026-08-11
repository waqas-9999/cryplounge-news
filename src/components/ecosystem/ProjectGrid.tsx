'use client';

import { motion } from 'framer-motion';
import type { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';

/** Responsive project grid. One column on mobile, up to four on large screens. */
export function ProjectGrid({
  projects,
  columns = 3,
  compact = false,
}: {
  projects: Project[];
  columns?: 2 | 3 | 4;
  compact?: boolean;
}) {
  const columnClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <ul className={`grid grid-cols-1 ${columnClass} gap-4 md:gap-5`}>
      {projects.map((project, i) => (
        <motion.li
          key={project.id}
          className="flex"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, delay: (i % columns) * 0.06 }}
        >
          <div className="flex-1">
            <ProjectCard project={project} compact={compact} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
