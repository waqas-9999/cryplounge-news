import type { Project } from '@/types/project';
import { apiClient, mediaUrl } from '@/lib/api-client';

/**
 * Data access for events.
 *
 * Backed by the real NestJS `events` endpoints. Components receive
 * `EventSummary` rather than the full record: cross-content blocks only need
 * enough to render a card and a link, and a narrow projection keeps the
 * serialized payload small when it crosses to the client.
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

interface BackendEvent {
  id: string;
  slug: string;
  name: string;
  summary: string;
  startsAt: string;
  mode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  city?: string | null;
  country?: string | null;
  registrationUrl?: string | null;
  category: { id: string; slug: string; name: string } | null;
}

function locationOf(event: BackendEvent): string {
  if (event.mode === 'ONLINE') return 'Online';
  return [event.city, event.country].filter(Boolean).join(', ') || 'TBA';
}

function toSummary(event: BackendEvent): EventSummary {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    category: event.category?.name ?? 'Event',
    date: event.startsAt,
    location: locationOf(event),
    summary: event.summary,
    registerLink: event.registrationUrl ?? '',
  };
}

export interface EventDetail {
  id: string;
  slug: string;
  name: string;
  summary: string;
  content: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  venue: string | null;
  city: string | null;
  country: string | null;
  onlineUrl: string | null;
  registerUrl: string | null;
  telegramChannel: string | null;
  isFree: boolean;
  ticketPrice: string | null;
  language: string | null;
  status: string;
  featured: boolean;
  cancelledAt: string | null;
  postponedAt: string | null;
  sponsors: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; slug: string; name: string } | null;
  bannerImage: string | undefined;
  tags: { id: string; slug: string; name: string }[];
  organizer: { id: string; name: string; verified: boolean; logo: string | undefined } | null;
  speakers: { id: string; name: string; title: string | null; bio: string | null; photoUrl: string | null; founder: { id: string; slug: string; name: string } | null }[];
  articles: { id: string; slug: string; title: string }[];
  projects: { id: string; slug: string; name: string; logo: unknown }[];
  founders: { id: string; slug: string; name: string; role: string }[];
  research: { id: string; slug: string; title: string }[];
  regulations: { id: string; slug: string; title: string }[];
}

interface BackendEventDetail {
  id: string;
  slug: string;
  name: string;
  summary: string;
  content: string;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  venue: string | null;
  city: string | null;
  country: string | null;
  onlineUrl: string | null;
  registerUrl: string | null;
  telegramChannel: string | null;
  isFree: boolean;
  ticketPrice: string | null;
  language: string | null;
  status: string;
  featured: boolean;
  cancelledAt: string | null;
  postponedAt: string | null;
  sponsors: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  noindex: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; slug: string; name: string } | null;
  bannerImage: { path: string; altText: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
  organizer: { id: string; name: string; verified: boolean; logo: { path: string } | null } | null;
  speakers: { id: string; name: string; title: string | null; bio: string | null; photoUrl: string | null; founder: { id: string; slug: string; name: string } | null }[];
  articles: { id: string; slug: string; title: string }[];
  projects: { id: string; slug: string; name: string; logo: unknown }[];
  founders: { id: string; slug: string; name: string; role: string }[];
  research: { id: string; slug: string; title: string }[];
  regulations: { id: string; slug: string; title: string }[];
}

function toDetail(event: BackendEventDetail): EventDetail {
  return {
    ...event,
    bannerImage: mediaUrl(event.bannerImage?.path),
    organizer: event.organizer
      ? { ...event.organizer, logo: mediaUrl(event.organizer.logo?.path) }
      : null,
  };
}

/** Full event record for the `/events/[slug]` detail page. */
export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  try {
    const event = await apiClient.get<BackendEventDetail>(`events/slug/${slug}`, { auth: false });
    return toDetail(event);
  } catch {
    return null;
  }
}

export async function getUpcomingEventSummaries(limit = 3): Promise<EventSummary[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendEvent>('events', {
      query: { when: 'upcoming', page: 1, perPage: limit },
      auth: false,
    });
    return items.map(toSummary);
  } catch {
    return [];
  }
}

/**
 * Events plausibly relevant to a project, matched via the article/event
 * search on name. Falls back to upcoming events so the block is never empty.
 */
export async function getEventsForProject(project: Project, limit = 3): Promise<EventSummary[]> {
  try {
    const { items } = await apiClient.getPaginated<BackendEvent>('events', {
      query: { search: project.name, when: 'all', page: 1, perPage: limit },
      auth: false,
    });

    if (items.length > 0) return items.map(toSummary);
  } catch {
    // fall through to upcoming events
  }
  return getUpcomingEventSummaries(limit);
}
