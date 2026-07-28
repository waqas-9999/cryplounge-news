'use client';

import { Calendar, MapPin, Clock, Users, ExternalLink, Twitter, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/contexts/EventsContext';

interface EventDetailPageProps {
  eventSlug: string;
  onNavigate?: (page: string) => void;
}

export function EventDetailPage({ eventSlug, onNavigate }: EventDetailPageProps) {
  const { getEventBySlug, getEventsByCategory } = useEvents();
  const event = getEventBySlug(eventSlug);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-800 dark:text-gray-200 mb-2">Event not found</h2>
          <button
            onClick={() => onNavigate?.('events')}
            className="text-blue-600 dark:text-yellow-400 hover:underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Get related events from the same category, excluding the current event
  const relatedEvents = getEventsByCategory(event.category)
    .filter(e => e.id !== event.id)
    .slice(0, 3);

  const getCategoryColor = (category: string) => {
    const colors = {
      Conference: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
      Hackathon: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
      Webinar: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
      Meetup: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      Workshop: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400'
    };
    return colors[category as keyof typeof colors] || colors.Conference;
  };

  const getLocationTypeIcon = (type: string) => {
    if (type === 'online') return '🌐';
    if (type === 'offline') return '📍';
    return '🔄';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10] transition-colors">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#161618] border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => onNavigate?.('home')}
                  className="cursor-pointer hover:text-blue-600 dark:hover:text-yellow-400 transition-colors"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => onNavigate?.('events')}
                  className="cursor-pointer hover:text-blue-600 dark:hover:text-yellow-400 transition-colors"
                >
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{event.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img
          src={event.bannerImage}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-[1400px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`${getCategoryColor(event.category)} text-xs px-3 py-1`}>
                {event.category}
              </Badge>
              {event.eventStatus === 'ongoing' && (
                <Badge className="bg-red-500 text-white text-xs px-3 py-1 animate-pulse">
                  🔴 Live Now
                </Badge>
              )}
              {event.eventStatus === 'ended' && (
                <Badge className="bg-gray-500 text-white text-xs px-3 py-1">
                  Ended
                </Badge>
              )}
            </div>
            
            <h1 className="text-white text-4xl md:text-5xl max-w-4xl">
              {event.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm md:text-base">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm md:text-base">{event.time}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm md:text-base">
                  {getLocationTypeIcon(event.locationType)} {event.location}
                </span>
              </div>
            </div>
            
            {event.eventStatus !== 'ended' && (
              <a
                href={event.registerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {event.eventStatus === 'ongoing' ? 'Join Now' : 'Register Now'}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <button
              onClick={() => onNavigate?.('events')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Events</span>
            </button>

            {/* Description */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 transition-all duration-300">
              <h2 className="text-gray-800 dark:text-gray-200 mb-4">About This Event</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Agenda */}
            {event.agenda && event.agenda.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 transition-all duration-300">
                <h2 className="text-gray-800 dark:text-gray-200 mb-4">Agenda</h2>
                <div className="space-y-3">
                  {event.agenda.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 pt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            {event.speakers && event.speakers.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 transition-all duration-300">
                <h2 className="text-gray-800 dark:text-gray-200 mb-6">Featured Speakers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={speaker.photo}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-gray-800 dark:text-gray-200 text-sm">{speaker.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{speaker.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prize Pool */}
            {event.prizePool && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">🏆</div>
                  <h2 className="text-gray-800 dark:text-gray-200">Prize Pool</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-xl">{event.prizePool}</p>
              </div>
            )}

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 transition-all duration-300">
                <h2 className="text-gray-800 dark:text-gray-200 mb-4">Sponsors & Partners</h2>
                <div className="flex flex-wrap gap-3">
                  {event.sponsors.map((sponsor, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300 text-sm"
                    >
                      {sponsor}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Register Card */}
            {event.eventStatus !== 'ended' && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24 transition-all duration-300">
                <h3 className="text-gray-800 dark:text-gray-200 mb-4">
                  {event.eventStatus === 'ongoing' ? 'Join This Event' : 'Register Now'}
                </h3>
                <a
                  href={event.registerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  {event.eventStatus === 'ongoing' ? 'Join Live' : 'Get Tickets'}
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  You'll be redirected to the organizer's website
                </p>
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300">
              <h3 className="text-gray-800 dark:text-gray-200 mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {event.endDate && (
                        <>
                          <br />
                          to {new Date(event.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{event.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {getLocationTypeIcon(event.locationType)} {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organizer</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{event.organizer.name}</p>
                    {event.organizer.website && (
                      <a
                        href={event.organizer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-yellow-400 hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        Visit Website <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {event.socialLinks && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300">
                <h3 className="text-gray-800 dark:text-gray-200 mb-4">Connect</h3>
                <div className="space-y-2">
                  {event.socialLinks.twitter && (
                    <a
                      href={event.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Twitter</span>
                    </a>
                  )}
                  {event.socialLinks.discord && (
                    <a
                      href={event.socialLinks.discord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-indigo-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Discord</span>
                    </a>
                  )}
                  {event.socialLinks.telegram && (
                    <a
                      href={event.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Telegram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Related Events */}
            {relatedEvents.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300">
                <h3 className="text-gray-800 dark:text-gray-200 mb-4">Related Events</h3>
                <div className="space-y-3">
                  {relatedEvents.slice(0, 3).map((relatedEvent) => (
                    <button
                      key={relatedEvent.id}
                      onClick={() => onNavigate?.(`events/${relatedEvent.slug}`)}
                      className="w-full text-left p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                        {relatedEvent.name}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getCategoryColor(relatedEvent.category)} text-xs px-2 py-0.5`}>
                          {relatedEvent.category}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(relatedEvent.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
