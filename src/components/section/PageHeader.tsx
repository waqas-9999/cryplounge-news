import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  /** Omit on the current page — the last crumb is never a link. */
  href?: string;
}

/**
 * The one page header used across every section, so hierarchy and spacing are
 * identical everywhere. Renders the page's single <h1> plus breadcrumbs, and
 * emits BreadcrumbList structured data for search and AI crawlers.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }, ...breadcrumbs];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: crumb.href } : {}),
    })),
  };

  return (
    <header>
      {trail.length > 1 && (
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="hover:text-[#EFB81A] transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-gray-700 dark:text-gray-300">
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {eyebrow && (
        <p className="inline-block px-3 py-1.5 mb-3 rounded-lg bg-[#F9D96A] dark:bg-[#EFB81A]/20 text-black dark:text-[#EFB81A] text-xs font-medium uppercase tracking-wide">
          {eyebrow}
        </p>
      )}

      <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white">
        {title}
      </h1>

      {description && (
        <p className="mt-3 max-w-3xl text-sm md:text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}

      <script
        type="application/ld+json"
        // Schema is built from trusted internal props, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </header>
  );
}
