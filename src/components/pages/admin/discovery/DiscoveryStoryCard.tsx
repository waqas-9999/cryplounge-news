'use client';

import { Clock, ExternalLink, Radio } from 'lucide-react';

/**
 * One discovered story, as an admin sees it.
 *
 * Shared by the Qualified News and All Discovered News pages. They are
 * separate pages serving separate questions, but a story looks the same on
 * both, and rendering it twice would guarantee the two drift apart.
 *
 * Everything here is internal newsroom data — scores, source URLs, our own
 * pipeline timings, why a story was skipped. It is served only by
 * `admin/ai/news/*`, which requires `ai.automation.read`. No public endpoint
 * returns any of it.
 */

export interface DiscoverySource {
  domain: string;
  url: string;
  title?: string;
  publishedAt?: string;
  isPrimary: boolean;
  discoveryOnly: boolean;
}

export interface DiscoveryStory {
  clusterId: string;
  title: string;
  score: number;
  scoreBand: string;
  scoreLabel: string;
  scoreReasons: string[];
  freshness: 'BREAKING' | 'FRESH' | 'RECENT' | 'STALE' | 'UNKNOWN';
  ageMinutes: number | null;
  ageBasis: string | null;
  category: string | null;
  evidenceGrade: string | null;
  sources: DiscoverySource[];
  sourceCount: number;
  publishedAt: string | null;
  detectedAt: string;
  detectionDelayMinutes: number | null;
  status: string;
  statusReasons: string[];
  cmsArticleId: string | null;
  recordedAt: string;
}

/** Clock time, which is what an editor compares against their own. */
function clockTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function describeAge(minutes: number | null): string {
  if (minutes === null) return 'unknown';
  if (minutes < 1) return 'under a minute';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr`;
  return `${Math.floor(hours / 24)} d`;
}

/**
 * Freshness styling.
 *
 * Each carries a word as well as a colour: colour alone is unreadable for a
 * good share of readers and invisible in a screenshot pasted into a ticket.
 */
const FRESHNESS_STYLE: Record<DiscoveryStory['freshness'], string> = {
  BREAKING: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  FRESH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  RECENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  STALE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  UNKNOWN: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const STATUS_STYLE: Record<string, string> = {
  CMS_DRAFT_CREATED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  RESEARCH_FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  CMS_SUBMISSION_FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  OFF_TOPIC: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  WEAK_EVIDENCE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  NOT_SELECTED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  DISCOVERED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

function scoreStyle(score: number): string {
  if (score >= 85) return 'text-green-700 dark:text-green-400';
  if (score >= 70) return 'text-blue-700 dark:text-blue-400';
  if (score >= 55) return 'text-yellow-700 dark:text-yellow-400';
  if (score >= 40) return 'text-orange-700 dark:text-orange-400';
  return 'text-red-700 dark:text-red-400';
}

export function DiscoveryStoryCard({
  story,
  showScoreReasons,
}: {
  story: DiscoveryStory;
  /** The all-news page explains weak scores; the qualified page does not. */
  showScoreReasons?: boolean;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 break-words">{story.title}</h3>

          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
            <span className={`font-semibold ${scoreStyle(story.score)}`}>
              {story.score}/100 — {story.scoreLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-full ${FRESHNESS_STYLE[story.freshness]}`}>
              {story.freshness === 'BREAKING' && <Radio className="inline w-3 h-3 mr-1" />}
              {story.freshness}
            </span>
            {story.category && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                {story.category}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full ${
                STATUS_STYLE[story.status] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {story.status.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {story.sourceCount} source{story.sourceCount === 1 ? '' : 's'}
            </span>
            {story.evidenceGrade && (
              <span className="text-gray-500 dark:text-gray-400">evidence {story.evidenceGrade}</span>
            )}
          </div>
        </div>
      </div>

      {/*
        Publication and detection, side by side and never merged.
        "Created 3 minutes ago" cannot tell an editor whether the newsroom
        found a story quickly or found an old story recently, and those are
        very different facts about the system.
      */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div>
          <div className="text-gray-500 dark:text-gray-400">Source published</div>
          <div className="text-gray-900 dark:text-gray-200">{clockTime(story.publishedAt)}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">CrypLounge detected</div>
          <div className="text-gray-900 dark:text-gray-200">{clockTime(story.detectedAt)}</div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400">Detection delay</div>
          <div className="text-gray-900 dark:text-gray-200">
            {story.detectionDelayMinutes === null ? '—' : describeAge(story.detectionDelayMinutes)}
          </div>
        </div>
        <div>
          <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Age
          </div>
          <div className="text-gray-900 dark:text-gray-200">
            {describeAge(story.ageMinutes)}
            {story.ageBasis === 'PUBLISHED' && (
              <span
                className="text-gray-400 ml-1"
                title="No event time was established, so this age is measured from publication and may overstate how new the event is."
              >
                (from publication)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Where did this news come from? Admin-only, and the point of the page. */}
      {story.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            {story.sources.length === 1 ? 'Source' : 'Sources'}
          </div>
          <ul className="space-y-1">
            {[...story.sources]
              .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
              .map((source, index) => (
                <li key={`${source.url}-${index}`} className="text-xs flex flex-wrap items-center gap-2">
                  <span className="text-gray-700 dark:text-gray-300">
                    {story.sources.length > 1 && `${index + 1}. `}
                    {source.domain}
                  </span>
                  <span className="text-gray-400">
                    {source.isPrimary ? 'primary' : source.discoveryOnly ? 'aggregator' : 'secondary'}
                  </span>
                  {source.publishedAt && (
                    <span className="text-gray-500 dark:text-gray-400">{clockTime(source.publishedAt)}</span>
                  )}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    open <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Why a story scored badly, on the page that exists to explain it. */}
      {showScoreReasons && story.scoreReasons.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Why this score</div>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
            {story.scoreReasons.slice(0, 6).map((reason, index) => (
              <li key={index}>· {reason}</li>
            ))}
          </ul>
        </div>
      )}

      {story.statusReasons.length > 0 && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="text-gray-500 dark:text-gray-400">Outcome: </span>
          {story.statusReasons.slice(0, 3).join('; ')}
        </div>
      )}

      {story.cmsArticleId && (
        <div className="mt-2 text-xs text-green-700 dark:text-green-400">
          CMS draft created · {story.cmsArticleId}
        </div>
      )}
    </div>
  );
}
