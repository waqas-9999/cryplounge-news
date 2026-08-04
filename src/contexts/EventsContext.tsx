'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, mediaUrl } from '@/lib/api-client';

/**
 * Public-facing event shape, projected from the real `events` API.
 * Consumers (EventsPage, SearchPage) only need enough to render cards and
 * link out — full agenda/speaker detail lives on the (future) detail page.
 */
export interface Event {
  id: string;
  name: string;
  slug: string;
  category: string;
  date: string;
  endDate?: string | null;
  time: string;
  location: string;
  locationType: 'online' | 'offline' | 'hybrid';
  eventStatus: 'upcoming' | 'ongoing' | 'ended';
  featured: boolean;
  summary: string;
  description: string;
  bannerImage: string;
  registerLink: string;
  organizer: { id: string; name: string } | null;
}

interface BackendEvent {
  id: string;
  slug: string;
  name: string;
  summary: string;
  startsAt: string;
  endsAt: string | null;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  venue?: string | null;
  city?: string | null;
  country?: string | null;
  registerUrl?: string | null;
  featured: boolean;
  category: { id: string; slug: string; name: string } | null;
  bannerImage: { path: string; altText: string | null } | null;
  organizer?: { id: string; name: string; verified?: boolean } | null;
}

const FALLBACK_BANNER = '/images/event-placeholder.jpg';

function locationOf(event: BackendEvent): string {
  if (event.mode === 'ONLINE') return 'Online';
  return event.venue || [event.city, event.country].filter(Boolean).join(', ') || 'TBA';
}

function eventStatusOf(event: BackendEvent): Event['eventStatus'] {
  const now = Date.now();
  const starts = new Date(event.startsAt).getTime();
  const ends = event.endsAt ? new Date(event.endsAt).getTime() : starts;
  if (now < starts) return 'upcoming';
  if (now > ends) return 'ended';
  return 'ongoing';
}

function timeOf(event: BackendEvent): string {
  return new Date(event.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function toEvent(event: BackendEvent): Event {
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    category: event.category?.name ?? 'Event',
    date: event.startsAt,
    endDate: event.endsAt,
    time: timeOf(event),
    location: locationOf(event),
    locationType: event.mode.toLowerCase() as Event['locationType'],
    eventStatus: eventStatusOf(event),
    featured: event.featured,
    summary: event.summary,
    description: event.summary,
    bannerImage: mediaUrl(event.bannerImage?.path) ?? FALLBACK_BANNER,
    registerLink: event.registerUrl ?? '',
    organizer: event.organizer ? { id: event.organizer.id, name: event.organizer.name } : null,
  };
}

interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: boolean;
  getFeaturedEvents: () => Event[];
  getUpcomingEvents: () => Event[];
  getOngoingEvents: () => Event[];
  getEndedEvents: () => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiClient
      .getPaginated<BackendEvent>('events', { query: { when: 'all', perPage: 100 }, auth: false })
      .then(({ items }) => {
        setEvents(items.map(toEvent));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const byDateAsc = (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime();
  const byDateDesc = (a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime();

  const getFeaturedEvents = () => events.filter(e => e.featured).sort(byDateAsc);
  const getUpcomingEvents = () => events.filter(e => e.eventStatus === 'upcoming').sort(byDateAsc);
  const getOngoingEvents = () => events.filter(e => e.eventStatus === 'ongoing').sort(byDateAsc);
  const getEndedEvents = () => events.filter(e => e.eventStatus === 'ended').sort(byDateDesc);

  return (
    <EventsContext.Provider
      value={{ events, loading, error, getFeaturedEvents, getUpcomingEvents, getOngoingEvents, getEndedEvents }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
