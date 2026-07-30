import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * The one section heading used across the site, so every band of content has
 * the same rhythm and hierarchy. Renders an <h2> by default; pass `as="h3"`
 * when nesting inside a section that already owns the h2.
 */
export function SectionHeader({
  title,
  description,
  href,
  linkLabel = 'View all',
  as: Heading = 'h2',
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 md:mb-6">
      <div className="min-w-0">
        <Heading className="text-lg md:text-xl font-medium text-gray-900 dark:text-white">
          {title}
        </Heading>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 inline-flex items-center gap-1 text-sm text-[#EFB81A] hover:underline"
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
