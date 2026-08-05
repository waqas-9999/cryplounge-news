'use client';

/**
 * Shared building blocks for the analytics workspace.
 *
 * Every panel on the page has the same four states — loading, error, empty,
 * ready — so they are implemented once here. `useAnalyticsQuery` + `Panel`
 * together guarantee no panel can render a chart over absent data, which is
 * the failure mode this page most needs to avoid.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, BarChart3, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { errorMessage } from '@/lib/api-client';
import { formatNumber } from '@/services/analytics';

/* ------------------------------------------------------------------ data -- */

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Runs an analytics fetch, re-running whenever `deps` change.
 *
 * The in-flight request is aborted on change so a slow response for an old
 * date range can never overwrite a newer one — with this many independent
 * panels, that race is otherwise routine.
 */
export function useAnalyticsQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then(result => {
        if (!active) return;
        setData(result);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active || controller.signal.aborted) return;
        setError(errorMessage(err, 'Could not load this report.'));
        setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // `fetcher` is intentionally excluded: it is redefined on every render,
    // and `deps` already describes precisely what the request depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { data, loading, error, reload };
}

/* ----------------------------------------------------------------- chrome -- */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 ${className}`}
    >
      {children}
    </div>
  );
}

export function LoadingBlock({ height = 'h-64' }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`} role="status" aria-label="Loading">
      <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="py-12 px-6 text-center">
      <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({ message = 'No analytics data available for this period.' }: { message?: string }) {
  return (
    <div className="py-12 px-6 text-center">
      <BarChart3 className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

/**
 * Distinct from `EmptyBlock`: this means the *collection layer* never captured
 * the dimension, not that nobody visited. Conflating the two would let an
 * editor read "0 visitors from Germany" when the truth is "we don't know".
 */
export function TrackingUnavailable({ what, requires }: { what: string; requires: string }) {
  return (
    <div className="py-12 px-6 text-center">
      <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Tracking not available</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        {what} requires {requires}. Data will appear here once visitors are recorded with tracking enabled.
      </p>
    </div>
  );
}

interface PanelProps<T> {
  title: string;
  description?: string;
  query: QueryState<T>;
  /** Treats a successful-but-empty response as the empty state. */
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  /** Rendered instead of the empty state when the dimension is untracked. */
  unavailable?: (data: T) => { what: string; requires: string } | null;
  actions?: ReactNode;
  className?: string;
  loadingHeight?: string;
  children: (data: T) => ReactNode;
}

/**
 * A titled panel that resolves its own state machine. Children only ever run
 * with real, non-empty data.
 */
export function Panel<T>({
  title,
  description,
  query,
  isEmpty,
  emptyMessage,
  unavailable,
  actions,
  className = '',
  loadingHeight,
  children,
}: PanelProps<T>) {
  const untracked = query.data && unavailable ? unavailable(query.data) : null;

  return (
    <Card className={className}>
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>

      {query.loading ? (
        <LoadingBlock height={loadingHeight} />
      ) : query.error ? (
        <ErrorBlock message={query.error} onRetry={query.reload} />
      ) : !query.data ? (
        <EmptyBlock message={emptyMessage} />
      ) : untracked ? (
        <TrackingUnavailable {...untracked} />
      ) : isEmpty?.(query.data) ? (
        <EmptyBlock message={emptyMessage} />
      ) : (
        <div className="p-5">{children(query.data)}</div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------- KPI -- */

/**
 * Period-over-period change.
 *
 * `null` means the previous period was zero, where a percentage is undefined
 * rather than infinite — shown as "No prior data" instead of a made-up figure.
 */
export function DeltaBadge({ delta, invert = false }: { delta: number | null; invert?: boolean }) {
  if (delta === null || !Number.isFinite(delta)) {
    return <span className="text-xs text-gray-400 dark:text-gray-500">No prior data</span>;
  }

  const percent = delta * 100;
  const flat = Math.abs(percent) < 0.05;
  // For bounce rate and similar, a decrease is the good outcome.
  const positive = invert ? percent < 0 : percent > 0;

  const tone = flat
    ? 'text-gray-500 dark:text-gray-400'
    : positive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';

  const Icon = percent >= 0 ? TrendingUp : TrendingDown;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${tone}`}>
      {!flat && <Icon className="w-3 h-3" aria-hidden />}
      {percent > 0 ? '+' : ''}
      {percent.toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  previous,
  delta,
  invert,
  loading,
}: {
  label: string;
  value: string;
  previous?: string;
  delta?: number | null;
  invert?: boolean;
  loading?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
      {loading ? (
        <div className="h-7 w-24 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ) : (
        <p className="text-2xl text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      )}
      {!loading && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {delta !== undefined && <DeltaBadge delta={delta} invert={invert} />}
          {previous && (
            <span className="text-xs text-gray-400 dark:text-gray-500">vs {previous}</span>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ table -- */

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Enables click-to-sort on this column. */
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

/**
 * Table with a horizontal scroll container.
 *
 * The scroll lives on the wrapper, not the page, so a wide table never makes
 * the whole workspace scroll sideways on mobile.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  sort,
  onSortChange,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sort?: { by: string; order: 'asc' | 'desc' };
  onSortChange?: (by: string) => void;
}) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className={`pb-2 text-xs text-gray-500 dark:text-gray-400 ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {column.sortable && onSortChange ? (
                  <button
                    onClick={() => onSortChange(column.key)}
                    className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1"
                  >
                    {column.header}
                    {sort?.by === column.key && <span>{sort.order === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-gray-100 dark:border-gray-800/60 last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors' : ''
              }`}
            >
              {columns.map(column => (
                <td
                  key={column.key}
                  className={`py-2.5 text-sm text-gray-700 dark:text-gray-300 ${
                    column.align === 'right' ? 'text-right tabular-nums' : 'text-left'
                  }`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Horizontal ranking bar — a label, a proportional bar, and a value.
 *
 * Used wherever a donut would be harder to read: bars stay legible past five
 * categories and support long labels like referrer domains.
 */
export function RankingBar({
  label,
  value,
  max,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const width = max > 0 ? Math.max((value / max) * 100, 1.5) : 0;

  return (
    <div className="group">
      <div className="flex items-center justify-between gap-3 mb-1">
        <span className="text-sm text-gray-700 dark:text-gray-300 truncate" title={label}>
          {label}
        </span>
        <span className="text-sm text-gray-900 dark:text-gray-100 tabular-nums shrink-0">
          {formatNumber(value)}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400 dark:bg-[#EFB81A] transition-[width] duration-500"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
