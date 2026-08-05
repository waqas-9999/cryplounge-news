'use client';

/**
 * The analytics page's control bar: date range, period comparison, global
 * filters and CSV export.
 *
 * Filter *options* are derived from the data already loaded for the geography
 * and audience panels rather than fetched separately — a filter that offers a
 * value with no data behind it is worse than no filter at all.
 */

import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, Download, Filter, GitCompareArrows, X } from 'lucide-react';
import {
  RANGE_LABELS,
  type AnalyticsFilters,
  type RangePreset,
} from '@/services/analytics';

export interface FilterOption {
  key: string;
  label: string;
}

/** The filter dimensions the toolbar can offer, in display order. */
export type FilterKey =
  | 'country'
  | 'region'
  | 'city'
  | 'categoryId'
  | 'authorId'
  | 'deviceType'
  | 'browser'
  | 'os'
  | 'language';

export const FILTER_LABELS: Record<FilterKey, string> = {
  country: 'Country',
  region: 'Region',
  city: 'City',
  categoryId: 'Category',
  authorId: 'Author',
  deviceType: 'Device',
  browser: 'Browser',
  os: 'Operating System',
  language: 'Language',
};

function Dropdown({
  label,
  icon,
  active,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on any click outside, so several dropdowns can't sit open at once.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
          active
            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400'
            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-40 w-72 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] shadow-xl p-2">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsToolbar({
  preset,
  onPresetChange,
  custom,
  onCustomChange,
  compare,
  onCompareChange,
  filters,
  onFilterChange,
  filterOptions,
  onExport,
  exporting,
}: {
  preset: RangePreset;
  onPresetChange: (preset: RangePreset) => void;
  custom: { from: string; to: string };
  onCustomChange: (custom: { from: string; to: string }) => void;
  compare: boolean;
  onCompareChange: (compare: boolean) => void;
  filters: AnalyticsFilters;
  onFilterChange: (key: FilterKey, value: string | undefined) => void;
  filterOptions: Partial<Record<FilterKey, FilterOption[]>>;
  onExport: () => void;
  exporting: boolean;
}) {
  const activeFilters = (Object.keys(FILTER_LABELS) as FilterKey[]).filter(key => filters[key]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Date range */}
        <Dropdown label={RANGE_LABELS[preset]} icon={<CalendarDays className="w-4 h-4" />} active>
          {close => (
            <>
              {(Object.keys(RANGE_LABELS) as RangePreset[])
                .filter(key => key !== 'custom')
                .map(key => (
                  <button
                    key={key}
                    onClick={() => {
                      onPresetChange(key);
                      close();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {RANGE_LABELS[key]}
                    {preset === key && <Check className="w-4 h-4 text-yellow-500" />}
                  </button>
                ))}

              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 px-3 pb-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Custom range</p>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={custom.from}
                    max={custom.to || undefined}
                    onChange={e => onCustomChange({ ...custom, from: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="date"
                    value={custom.to}
                    min={custom.from || undefined}
                    onChange={e => onCustomChange({ ...custom, to: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100"
                  />
                  <button
                    disabled={!custom.from || !custom.to}
                    onClick={() => {
                      onPresetChange('custom');
                      close();
                    }}
                    className="w-full px-3 py-1.5 text-sm rounded-lg bg-yellow-400 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </Dropdown>

        {/* Compare */}
        <button
          onClick={() => onCompareChange(!compare)}
          aria-pressed={compare}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
            compare
              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-400'
              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <GitCompareArrows className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        {/* Filters */}
        <Dropdown
          label={activeFilters.length ? `Filters (${activeFilters.length})` : 'Filters'}
          icon={<Filter className="w-4 h-4" />}
          active={activeFilters.length > 0}
        >
          {() => (
            <div className="space-y-3 p-1">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map(key => {
                const options = filterOptions[key] ?? [];
                return (
                  <div key={key}>
                    <label
                      htmlFor={`filter-${key}`}
                      className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >
                      {FILTER_LABELS[key]}
                    </label>
                    <select
                      id={`filter-${key}`}
                      value={filters[key] ?? ''}
                      disabled={options.length === 0}
                      onChange={e => onFilterChange(key, e.target.value || undefined)}
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 disabled:opacity-40"
                    >
                      <option value="">
                        {options.length ? `All ${FILTER_LABELS[key].toLowerCase()}s` : 'No data'}
                      </option>
                      {options.map(option => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </Dropdown>

        {/* Export */}
        <button
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A1C] text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">{exporting ? 'Exporting…' : 'Export'}</span>
        </button>
      </div>

      {/* Active filter chips — always visible, so a filtered view is never mistaken for the whole picture. */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(key => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300"
            >
              {FILTER_LABELS[key]}:{' '}
              {filterOptions[key]?.find(o => o.key === filters[key])?.label ?? filters[key]}
              <button
                onClick={() => onFilterChange(key, undefined)}
                aria-label={`Remove ${FILTER_LABELS[key]} filter`}
                className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
