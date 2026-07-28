'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { mockEvents, Event } from '../data/mockEvents';

interface EventsContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  getEventBySlug: (slug: string) => Event | undefined;
  getPublishedEvents: () => Event[];
  getFeaturedEvents: () => Event[];
  getUpcomingEvents: () => Event[];
  getOngoingEvents: () => Event[];
  getEndedEvents: () => Event[];
  getEventsByCategory: (category: string) => Event[];
  getEventsByLocationType: (type: string) => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(mockEvents);

  const addEvent = (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      stats: {
        views: 0,
        registrations: 0,
        shares: 0,
        interested: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      )
    );
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEventById = (id: string) => {
    return events.find(event => event.id === id);
  };

  const getEventBySlug = (slug: string) => {
    return events.find(event => event.slug === slug);
  };

  const getPublishedEvents = () => {
    return events
      .filter(event => event.status === 'published')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getFeaturedEvents = () => {
    return events
      .filter(event => event.status === 'published' && event.featured)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getUpcomingEvents = () => {
    return events
      .filter(event => event.status === 'published' && event.eventStatus === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getOngoingEvents = () => {
    return events
      .filter(event => event.status === 'published' && event.eventStatus === 'ongoing')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getEndedEvents = () => {
    return events
      .filter(event => event.status === 'published' && event.eventStatus === 'ended')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getEventsByCategory = (category: string) => {
    return events
      .filter(event => event.status === 'published' && event.category === category)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getEventsByLocationType = (type: string) => {
    return events
      .filter(event => event.status === 'published' && event.locationType === type)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        getEventBySlug,
        getPublishedEvents,
        getFeaturedEvents,
        getUpcomingEvents,
        getOngoingEvents,
        getEndedEvents,
        getEventsByCategory,
        getEventsByLocationType
      }}
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
