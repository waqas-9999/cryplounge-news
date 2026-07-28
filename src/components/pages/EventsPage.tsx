'use client';

import { Calendar, MapPin, Clock, ExternalLink, TrendingUp } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/contexts/EventsContext';
import { useState } from 'react';

interface EventsPageProps {
  onNavigate?: (page: string) => void;
  initialType?: string;
}

export function EventsPage({ onNavigate, initialType }: EventsPageProps) {
  const { getFeaturedEvents, getUpcomingEvents, getOngoingEvents, getEndedEvents } = useEvents();
  
  // Map initialType to filter state
  const getInitialFilter = () => {
    if (initialType === 'upcoming') return 'upcoming';
    if (initialType === 'ongoing') return 'ongoing';
    if (initialType === 'ended') return 'ended';
    return 'all';
  };
  
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'ended'>(getInitialFilter());
  
  const featuredEventsData = getFeaturedEvents();
  const featuredEvent = featuredEventsData[0];
  const upcomingEvents = getUpcomingEvents();
  const ongoingEvents = getOngoingEvents();
  const endedEvents = getEndedEvents();

  const getCategoryColor = (category: string) => {
    const colors = {
      Conference: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
      Hackathon: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
      Webinar: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30',
      Meetup: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
      Workshop: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30'
    };
    return colors[category as keyof typeof colors] || colors.Conference;
  };

  const getLocationTypeIcon = (type: string) => {
    if (type === 'online') return '🌐';
    if (type === 'offline') return '📍';
    return '🔄';
  };

  // Filter logic
  const showOngoing = selectedFilter === 'all' || selectedFilter === 'ongoing';
  const showUpcoming = selectedFilter === 'all' || selectedFilter === 'upcoming';
  const showEnded = selectedFilter === 'all' || selectedFilter === 'ended';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10] transition-colors">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#161618] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3">
        <div className="max-w-[1400px] mx-auto">
          <Breadcrumb>
            <BreadcrumbList className="text-xs sm:text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => onNavigate?.('home')}
                  className="cursor-pointer hover:text-[#EFB81A] transition-colors"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Events</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8 md:space-y-12">
        {/* Header */}
        <div>
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-2 sm:mb-3 md:mb-4">
            <span className="text-black dark:text-[#EFB81A] text-xs sm:text-sm">CRYPTO EVENTS</span>
          </div>
          <h1 className="text-gray-800 dark:text-gray-200 mb-2 sm:mb-3 md:mb-4 text-xl sm:text-2xl md:text-3xl">Blockchain Events & Conferences</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl text-sm sm:text-base">
            Discover and join the most important blockchain, crypto, and Web3 events worldwide. Network with industry leaders, learn from experts, and shape the future of decentralized technology.
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
              selectedFilter === 'all'
                ? 'bg-[#EFB81A] text-black font-medium'
                : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-[#F4F4F4] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            All Events
            <span className="ml-1 sm:ml-2 opacity-60">
              ({ongoingEvents.length + upcomingEvents.length + endedEvents.length})
            </span>
          </button>
          
          <button
            onClick={() => setSelectedFilter('ongoing')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
              selectedFilter === 'ongoing'
                ? 'bg-red-600 dark:bg-red-500 text-white font-medium'
                : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-[#F4F4F4] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            {selectedFilter === 'ongoing' && <span className="animate-pulse">🔴</span>}
            <span className="hidden sm:inline">Happening Now</span>
            <span className="sm:hidden">Live</span>
            <span className="ml-1 sm:ml-2 opacity-60">({ongoingEvents.length})</span>
          </button>
          
          <button
            onClick={() => setSelectedFilter('upcoming')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
              selectedFilter === 'upcoming'
                ? 'bg-[#EFB81A] text-black font-medium'
                : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-[#F4F4F4] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Upcoming
            <span className="ml-1 sm:ml-2 opacity-60">({upcomingEvents.length})</span>
          </button>
          
          <button
            onClick={() => setSelectedFilter('ended')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
              selectedFilter === 'ended'
                ? 'bg-gray-600 dark:bg-gray-700 text-white font-medium'
                : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:bg-[#F4F4F4] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
            }`}
          >
            <span className="hidden sm:inline">Past Events</span>
            <span className="sm:hidden">Past</span>
            <span className="ml-1 sm:ml-2 opacity-60">({endedEvents.length})</span>
          </button>
        </div>

        {/* Featured Event Hero */}
        {featuredEvent && selectedFilter === 'all' && (
          <div className="relative h-[320px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden group">
            <img
              src={featuredEvent.bannerImage}
              alt={featuredEvent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-12">
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Badge className="bg-yellow-500 text-gray-900 text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 border-0">
                    ⭐ Featured Event
                  </Badge>
                  <Badge className={`${getCategoryColor(featuredEvent.category)} text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 border`}>
                    {featuredEvent.category}
                  </Badge>
                </div>
                
                <h2 className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl max-w-3xl leading-tight">
                  {featuredEvent.name}
                </h2>
                
                <p className="text-white/90 text-xs sm:text-sm md:text-base max-w-2xl line-clamp-2 sm:line-clamp-3">
                  {featuredEvent.summary}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-white/90">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-xs sm:text-sm md:text-base">
                      {new Date(featuredEvent.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-xs sm:text-sm md:text-base">{featuredEvent.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    <span className="text-xs sm:text-sm md:text-base">
                      {getLocationTypeIcon(featuredEvent.locationType)} {featuredEvent.location}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => onNavigate?.(`events/${featuredEvent.slug}`)}
                  className="inline-flex items-center gap-2 bg-[#EFB81A] hover:bg-[#F9D96A] text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm md:text-base transition-colors font-medium"
                >
                  View Details
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ongoing Events - Compact Version */}
        {ongoingEvents.length > 0 && showOngoing && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-red-100 dark:bg-red-500/20 rounded-lg border border-red-200 dark:border-red-500/30">
                <span className="text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2">
                  <span className="animate-pulse">🔴</span> HAPPENING NOW
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {ongoingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all duration-300 group cursor-pointer"
                  onClick={() => onNavigate?.(`events/${event.slug}`)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <Badge className="bg-red-500 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 animate-pulse">
                        🔴 Live
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(event.category)} text-[10px] sm:text-xs px-2 py-0.5 border`}>
                        {event.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-gray-800 dark:text-gray-200 text-sm sm:text-base mb-2 group-hover:text-[#EFB81A] transition-colors line-clamp-2">
                      {event.name}
                    </h3>
                    
                    <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {getLocationTypeIcon(event.locationType)} {event.location}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full px-3 py-1.5 sm:py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-200 text-[10px] sm:text-xs flex items-center justify-center gap-1.5 font-medium">
                      Join Live
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && showUpcoming && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg border border-blue-200 dark:border-blue-500/30">
                <span className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> UPCOMING EVENTS
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {upcomingEvents.length} events
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all duration-300 group cursor-pointer"
                  onClick={() => onNavigate?.(`events/${event.slug}`)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getCategoryColor(event.category)} text-[10px] px-2 py-0.5 border`}>
                        {event.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#EFB81A] transition-colors text-sm">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
                      {event.summary}
                    </p>
                    
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {getLocationTypeIcon(event.locationType)} {event.location}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full px-3 py-2 bg-[#EFB81A] text-black rounded-lg hover:bg-[#F9D96A] transition-colors text-xs font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ended Events */}
        {endedEvents.length > 0 && showEnded && (
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-400 text-xs sm:text-sm">PAST EVENTS</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                {endedEvents.length} events
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {endedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer opacity-90 hover:opacity-100"
                  onClick={() => onNavigate?.(`events/${event.slug}`)}
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                      <Badge className="bg-gray-500 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1">
                        Ended
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <Badge className={`${getCategoryColor(event.category)} text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 border`}>
                        {event.category}
                      </Badge>
                    </div>
                    
                    <h3 className="text-gray-800 dark:text-gray-200 mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors text-sm sm:text-base">
                      {event.name}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {event.summary}
                    </p>
                    
                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {getLocationTypeIcon(event.locationType)} {event.location}
                        </span>
                      </div>
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 text-xs sm:text-sm font-medium">
                      View Event Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[#F9D96A] dark:bg-[#1A1A1A] border-2 border-[#EFB81A] dark:border-[#EFB81A]/40 rounded-xl md:rounded-2xl p-6 sm:p-8 md:p-12 text-center">
          <Calendar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-3 sm:mb-4 text-[#EFB81A]" aria-hidden="true" />
          <h2 className="mb-2 sm:mb-3 md:mb-4 text-xl sm:text-2xl md:text-3xl text-black dark:text-white">Host Your Own Event?</h2>
          <p className="mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto text-sm sm:text-base text-gray-800 dark:text-gray-300">
            List your blockchain or crypto event on CrypLounge and reach thousands of potential attendees from around the world
          </p>
          <button 
            onClick={() => onNavigate?.('events/submit')}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] dark:hover:bg-white dark:hover:text-black transition-colors text-sm sm:text-base font-medium"
            aria-label="Submit your event to CrypLounge"
          >
            Submit Your Event
          </button>
        </div>
      </main>
    </div>
  );
}
