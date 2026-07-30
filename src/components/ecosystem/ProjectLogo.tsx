import type { Project } from '@/types/project';

/**
 * Logo tile. Uses the project's emoji mark on a tinted brand-colour square
 * until real logo assets are available; swapping in an <Image> later only
 * changes this file.
 */
export function ProjectLogo({
  project,
  size = 'md',
}: {
  project: Pick<Project, 'name' | 'logo' | 'accent'>;
  size?: 'md' | 'lg';
}) {
  const dimensions = size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-11 h-11 text-xl';

  return (
    <div
      className={`${dimensions} shrink-0 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/10`}
      // Tint derived from the project's own brand colour.
      style={{ backgroundColor: `${project.accent}1A` }}
      aria-hidden="true"
    >
      <span>{project.logo}</span>
    </div>
  );
}
