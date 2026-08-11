import Link from 'next/link';
import { labelForSlug } from '@/lib/taxonomy';

export interface FacetPill {
  /** Slug or tag value. */
  value: string;
  count: number;
}

/**
 * "Browse by …" pill list. Each pill is a real link to a filtered directory
 * URL, so every facet is crawlable and shareable rather than client-only state.
 */
export function FacetPills({
  facets,
  hrefFor,
  label,
}: {
  facets: FacetPill[];
  hrefFor: (value: string) => string;
  label: string;
}) {
  if (facets.length === 0) return null;

  return (
    <ul
      aria-label={label}
      className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 sm:pb-0"
    >
      {facets.map(facet => (
        <li key={facet.value} className="shrink-0">
          <Link
            href={hrefFor(facet.value)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm text-sm text-gray-700 dark:text-gray-300 hover:border-[#FFD200] hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {labelForSlug(facet.value)}
            <span className="text-xs text-gray-400 dark:text-gray-500">{facet.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
