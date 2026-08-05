'use client';

/**
 * Choropleth world map for the geography panel.
 *
 * Built directly on `d3-geo` + `topojson-client` rather than a React map
 * component: the available React wrappers do not support React 19, and this
 * page only needs projected paths and a hover state. The atlas ships with
 * `world-atlas` and is bundled, so the map never fetches from a CDN at
 * runtime.
 */

import { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';
import { formatNumber, formatPercent, type DimensionRow } from '@/services/analytics';

const WIDTH = 900;
const HEIGHT = 420;

interface CountryProperties {
  name: string;
}

/**
 * Natural Earth's country names differ from the CLDR names `Intl.DisplayNames`
 * produces. Only the divergences are listed; everything else matches directly.
 * Mapping by name (rather than by ISO numeric code) avoids shipping a 250-row
 * code table, and an unmatched country simply stays unshaded — it is still
 * present, with exact figures, in the tables beneath the map.
 */
const NAME_ALIASES: Record<string, string> = {
  'united states': 'united states of america',
  'united kingdom': 'united kingdom',
  russia: 'russia',
  'south korea': 'south korea',
  'north korea': 'north korea',
  'czechia': 'czechia',
  'myanmar (burma)': 'myanmar',
  'côte d’ivoire': "côte d'ivoire",
  'bosnia & herzegovina': 'bosnia and herz.',
  'dominican republic': 'dominican rep.',
  'central african republic': 'central african rep.',
  'congo - kinshasa': 'dem. rep. congo',
  'congo - brazzaville': 'congo',
  'equatorial guinea': 'eq. guinea',
  'south sudan': 's. sudan',
  'solomon islands': 'solomon is.',
  'north macedonia': 'macedonia',
  'eswatini': 'eswatini',
  'timor-leste': 'timor-leste',
  'united arab emirates': 'united arab emirates',
  'falkland islands': 'falkland is.',
  'french southern territories': 'fr. s. antarctic lands',
  'w. sahara': 'w. sahara',
  'western sahara': 'w. sahara',
};

function normalise(name: string): string {
  const lower = name.trim().toLowerCase();
  return NAME_ALIASES[lower] ?? lower;
}

export function WorldMap({
  rows,
  onSelect,
  selected,
}: {
  rows: DimensionRow[];
  onSelect?: (row: DimensionRow) => void;
  selected?: string | null;
}) {
  const [hovered, setHovered] = useState<{ row: DimensionRow; x: number; y: number } | null>(null);

  const { paths, byName, max } = useMemo(() => {
    const collection = feature(
      worldAtlas as unknown as Topology,
      (worldAtlas as unknown as Topology).objects.countries
    ) as unknown as FeatureCollection<Geometry, CountryProperties>;

    const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], collection);
    const path = geoPath(projection);

    return {
      paths: collection.features.map(f => ({
        id: String(f.id),
        name: f.properties.name,
        d: path(f) ?? '',
      })),
      byName: new Map(rows.map(row => [normalise(row.label), row])),
      max: Math.max(...rows.map(r => r.visitors), 1),
    };
  }, [rows]);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Visitors by country"
      >
        {paths.map(country => {
          const row = byName.get(normalise(country.name));
          // Square-root scaling: linear shading lets one dominant market wash
          // out every other country on the map.
          const intensity = row ? Math.sqrt(row.visitors / max) : 0;
          const isSelected = row && selected === row.key;

          return (
            <path
              key={country.id}
              d={country.d}
              className={row ? 'cursor-pointer' : ''}
              fill={
                row
                  ? `color-mix(in srgb, #EFB81A ${Math.max(intensity * 100, 14)}%, transparent)`
                  : 'currentColor'
              }
              fillOpacity={row ? 1 : 0.06}
              stroke={isSelected ? '#EFB81A' : 'currentColor'}
              strokeOpacity={isSelected ? 1 : 0.18}
              strokeWidth={isSelected ? 1.4 : 0.5}
              onMouseEnter={event =>
                row &&
                setHovered({
                  row,
                  x: event.nativeEvent.offsetX,
                  y: event.nativeEvent.offsetY,
                })
              }
              onMouseLeave={() => setHovered(null)}
              onClick={() => row && onSelect?.(row)}
            />
          );
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1C] px-3 py-2 shadow-lg text-xs"
          // Nudged up and left so the cursor never sits on top of the tooltip.
          style={{ left: hovered.x + 12, top: hovered.y - 8 }}
        >
          <p className="text-gray-900 dark:text-gray-100 mb-1">{hovered.row.label}</p>
          <dl className="space-y-0.5 text-gray-500 dark:text-gray-400">
            <div className="flex justify-between gap-4">
              <dt>Visitors</dt>
              <dd className="tabular-nums text-gray-700 dark:text-gray-300">
                {formatNumber(hovered.row.visitors)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Sessions</dt>
              <dd className="tabular-nums text-gray-700 dark:text-gray-300">
                {formatNumber(hovered.row.sessions)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Article views</dt>
              <dd className="tabular-nums text-gray-700 dark:text-gray-300">
                {formatNumber(hovered.row.articleViews)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Engagement</dt>
              <dd className="tabular-nums text-gray-700 dark:text-gray-300">
                {formatPercent(hovered.row.engagementRate)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Shading is relative to the busiest country. Click a country to filter the tables below.
      </p>
    </div>
  );
}
