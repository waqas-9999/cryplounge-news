'use client';

/**
 * Recharts wrappers for the analytics workspace.
 *
 * Recharts needs literal colour values rather than Tailwind classes, so the
 * palette is resolved from the active theme here and passed down. Every chart
 * is wrapped in `ResponsiveContainer` with a fixed pixel height: the width
 * flexes with the panel, the height does not, which is what keeps charts from
 * overflowing on mobile.
 */

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCompact, formatNumber } from '@/services/analytics';

/** Brand yellow first — it is the primary series everywhere. */
export const SERIES_COLORS = [
  '#EFB81A',
  '#3B82F6',
  '#10B981',
  '#A855F7',
  '#F97316',
  '#EC4899',
  '#14B8A6',
  '#6366F1',
];

function usePalette() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return useMemo(
    () => ({
      dark,
      grid: dark ? '#27272A' : '#F1F1F3',
      axis: dark ? '#8A8A90' : '#9A9AA0',
      tooltipBg: dark ? '#1A1A1C' : '#FFFFFF',
      tooltipBorder: dark ? '#3F3F46' : '#E5E7EB',
      tooltipText: dark ? '#F3F3F5' : '#111827',
    }),
    [dark]
  );
}

/** One tooltip style for every chart, so hovering feels consistent. */
function useTooltipProps() {
  const palette = usePalette();
  return {
    contentStyle: {
      background: palette.tooltipBg,
      border: `1px solid ${palette.tooltipBorder}`,
      borderRadius: 10,
      fontSize: 12,
      color: palette.tooltipText,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    },
    labelStyle: { color: palette.tooltipText, marginBottom: 4 },
    itemStyle: { color: palette.tooltipText },
    cursor: { fill: palette.grid, opacity: 0.4 },
  };
}

const AXIS = { fontSize: 11, tickLine: false, axisLine: false } as const;

/**
 * Recharts hands the tooltip a loosely-typed value, so it is coerced before
 * formatting. Shared by every chart to keep number formatting identical.
 */
const tooltipValue = (value: unknown): string => formatNumber(Number(value ?? 0));

/* ------------------------------------------------------------ area chart -- */

export interface SeriesDef {
  key: string;
  label: string;
  color?: string;
}

/** Traffic over time. One filled area per selected metric. */
export function TrendAreaChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 300,
}: {
  data: T[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
}) {
  const palette = usePalette();
  const tooltip = useTooltipProps();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color ?? SERIES_COLORS[i % SERIES_COLORS.length];
            return (
              <linearGradient key={s.key} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={palette.axis} {...AXIS} minTickGap={24} />
        <YAxis stroke={palette.axis} {...AXIS} tickFormatter={formatCompact} width={48} />
        <Tooltip {...tooltip} formatter={tooltipValue} />
        {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => {
          const color = s.color ?? SERIES_COLORS[i % SERIES_COLORS.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#fill-${s.key})`}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------ line chart -- */

export function MultiLineChart<T extends Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 260,
}: {
  data: T[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
}) {
  const palette = usePalette();
  const tooltip = useTooltipProps();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={palette.axis} {...AXIS} minTickGap={24} />
        <YAxis stroke={palette.axis} {...AXIS} tickFormatter={formatCompact} width={48} />
        <Tooltip {...tooltip} formatter={tooltipValue} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ----------------------------------------------------------- donut chart -- */

/** Composition of a single dimension — devices, browsers, operating systems. */
export function DonutChart({
  data,
  height = 240,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
}) {
  const tooltip = useTooltipProps();
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="85%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltip} formatter={tooltipValue} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* A legend beside the ring, since slice labels become unreadable fast. */}
      <ul className="w-full sm:w-1/2 space-y-2">
        {data.map((entry, i) => (
          <li key={entry.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="text-gray-700 dark:text-gray-300 truncate">{entry.label}</span>
            </span>
            <span className="text-gray-500 dark:text-gray-400 tabular-nums shrink-0">
              {total > 0 ? `${((entry.value / total) * 100).toFixed(1)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- bar chart -- */

export function SimpleBarChart({
  data,
  xKey,
  barKey,
  label,
  height = 260,
  color = SERIES_COLORS[0],
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  barKey: string;
  label: string;
  height?: number;
  color?: string;
}) {
  const palette = usePalette();
  const tooltip = useTooltipProps();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={palette.grid} vertical={false} />
        <XAxis dataKey={xKey} stroke={palette.axis} {...AXIS} minTickGap={8} />
        <YAxis stroke={palette.axis} {...AXIS} tickFormatter={formatCompact} width={48} />
        <Tooltip {...tooltip} formatter={tooltipValue} />
        <Bar dataKey={barKey} name={label} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ----------------------------------------------------------------- funnel -- */

/**
 * Reading-depth funnel.
 *
 * Rendered as nested proportional bars rather than a classic tapering funnel:
 * the width *is* the retention rate, so the drop-off between milestones is
 * read directly rather than inferred from a trapezoid's slope.
 */
export function FunnelBars({
  steps,
}: {
  steps: Array<{ label: string; value: number; rate: number }>;
}) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="flex items-center justify-between mb-1 text-sm">
            <span className="text-gray-700 dark:text-gray-300">{step.label}</span>
            <span className="text-gray-900 dark:text-gray-100 tabular-nums">
              {step.rate.toFixed(1)}%
              <span className="text-gray-400 dark:text-gray-500 ml-2 text-xs">
                {formatNumber(step.value)}
              </span>
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max(step.rate, 0.5)}%`,
                background: SERIES_COLORS[i % SERIES_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- heatmap -- */

/**
 * Publishing heatmap: rows are weekdays, columns are hours (UTC).
 *
 * Intensity is scaled against the busiest cell, so the pattern is visible
 * regardless of absolute volume.
 */
export function PublishingHeatmap({
  cells,
}: {
  cells: Array<{ day: string; hour: number; value: number }>;
}) {
  const max = Math.max(...cells.map(c => c.value), 1);
  const days = [...new Set(cells.map(c => c.day))];
  const hours = Array.from({ length: 24 }, (_, h) => h);

  const lookup = new Map(cells.map(c => [`${c.day}-${c.hour}`, c.value]));

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <div className="min-w-[640px]">
        <div className="flex">
          <div className="w-10 shrink-0" />
          {hours.map(hour => (
            <div
              key={hour}
              className="flex-1 text-center text-[10px] text-gray-400 dark:text-gray-500 pb-1"
            >
              {hour % 3 === 0 ? hour : ''}
            </div>
          ))}
        </div>

        {days.map(day => (
          <div key={day} className="flex items-center mb-1">
            <div className="w-10 shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
              {day.slice(0, 3)}
            </div>
            {hours.map(hour => {
              const value = lookup.get(`${day}-${hour}`) ?? 0;
              const intensity = value / max;
              return (
                <div key={hour} className="flex-1 px-[1px]">
                  <div
                    className="h-6 rounded-[3px] transition-colors"
                    title={`${day} ${String(hour).padStart(2, '0')}:00 UTC — ${formatNumber(value)} views`}
                    style={{
                      // A floor keeps empty cells visible as cells rather than gaps.
                      background:
                        value === 0
                          ? 'color-mix(in srgb, currentColor 6%, transparent)'
                          : `color-mix(in srgb, ${SERIES_COLORS[0]} ${Math.max(intensity * 100, 12)}%, transparent)`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
