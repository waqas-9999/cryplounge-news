import type { ProjectStatus } from '@/types/project';

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  live: {
    label: 'Live',
    className:
      'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  },
  beta: {
    label: 'Beta',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  testnet: {
    label: 'Testnet',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  },
  deprecated: {
    label: 'Deprecated',
    className:
      'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
  },
};

/** Project lifecycle status. Colour is never the only signal — the label carries it. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}
