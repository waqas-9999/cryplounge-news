import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * Empty state for directory views.
 *
 * Always offers a way onward — an empty result should never be a dead end.
 * (The existing EmptyState component takes an onClick callback, which would
 * force this into a client component for no reason.)
 */
export function EmptyDirectoryState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
      <Icon className="w-10 h-10 mx-auto mb-4 text-gray-300 dark:text-gray-700" aria-hidden="true" />
      <h2 className="text-base font-medium text-gray-900 dark:text-white mb-2">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">{description}</p>
      <Link
        href="/ecosystem"
        className="inline-block px-5 py-2.5 rounded-lg bg-[#EFB81A] text-black text-sm font-medium hover:bg-[#F9D96A] transition-colors"
      >
        Browse the full directory
      </Link>
    </div>
  );
}
