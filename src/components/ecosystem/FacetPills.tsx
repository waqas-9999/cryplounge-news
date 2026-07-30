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
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {facets.map(facet => (
        <li key={facet.value}>
          <Link
            href={hrefFor(facet.value)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1A] text-sm text-gray-700 dark:text-gray-300 hover:border-[#EFB81A] hover:text-[#EFB81A] transition-colors"
          >
            {labelForSlug(facet.value)}
            <span className="text-xs text-gray-400 dark:text-gray-500">{facet.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
