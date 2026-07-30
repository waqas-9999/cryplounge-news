import { mockEvents } from '@/data/mockEvents';
import type { Project } from '@/types/project';

/**
 * Data access for events.
 *
 * Components receive `EventSummary` rather than the full record: cross-content
 * blocks only need enough to render a card and a link, and a narrow projection
 * keeps the serialized payload small when it crosses to the client.
 */
export interface EventSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  date: string;
  location: string;
  summary: string;
  registerLink: string;
}

function toSummary(event: (typeof mockEvents)[number]): EventSummary {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    category: event.category,
    date: event.date,
    location: event.location,
    summary: event.summary,
    registerLink: event.registerLink,
  };
}

function byDateAscending(a: { date: string }, b: { date: string }) {
  return new Date(a.date).getTime() - new Date(b.date).getTime();
}

export async function getUpcomingEventSummaries(limit = 3): Promise<EventSummary[]> {
  const now = Date.now();
  return mockEvents
    .filter(e => e.status === 'published' && new Date(e.date).getTime() >= now)
    .sort(byDateAscending)
    .slice(0, limit)
    .map(toSummary);
}

/**
 * Events plausibly relevant to a project, matched on tags and name mentions.
 * Falls back to upcoming events so the block is never empty on a live site.
 */
export async function getEventsForProject(project: Project, limit = 3): Promise<EventSummary[]> {
  const needles = [project.name.toLowerCase(), ...project.tags.map(t => t.toLowerCase())];

  const matched = mockEvents
    .filter(event => {
      const haystack = [event.name, event.summary, ...(event.tags ?? [])].join(' ').toLowerCase();
      return needles.some(needle => haystack.includes(needle));
    })
    .sort(byDateAscending)
    .slice(0, limit)
    .map(toSummary);

  if (matched.length > 0) return matched;
  return getUpcomingEventSummaries(limit);
}
