/**
 * Analytics & Performance Tracking Utility
 * AI-optimized user behavior tracking and performance monitoring
 */

export interface PageViewEvent {
  page: string;
  title: string;
  path: string;
  timestamp: number;
  referrer?: string;
  userAgent?: string;
}

export interface UserInteractionEvent {
  type: 'click' | 'scroll' | 'hover' | 'search' | 'filter' | 'navigation';
  target: string;
  value?: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
}

class Analytics {
  private events: Array<PageViewEvent | UserInteractionEvent> = [];
  private sessionStart: number;

  constructor() {
    this.sessionStart = Date.now();
    this.initPerformanceObserver();
  }

  /**
   * Initialize Performance Observer for Web Vitals
   */
  private initPerformanceObserver() {
    if (typeof window === 'undefined') return;

    // First Contentful Paint (FCP)
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            console.log('[Analytics] FCP:', entry.startTime, 'ms');
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Performance Observer not supported
    }

    // Largest Contentful Paint (LCP)
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('[Analytics] LCP:', lastEntry.startTime, 'ms');
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay (FID)
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = (entry as any).processingStart - entry.startTime;
          console.log('[Analytics] FID:', fid, 'ms');
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title: string, path: string) {
    const event: PageViewEvent = {
      page,
      title,
      path,
      timestamp: Date.now(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    console.log('[Analytics] Page View:', event);

    // Send to analytics service (Google Analytics, Mixpanel, etc.)
    this.sendToAnalytics('pageview', event);
  }

  /**
   * Track user interaction
   */
  trackInteraction(type: UserInteractionEvent['type'], target: string, value?: string) {
    const event: UserInteractionEvent = {
      type,
      target,
      value,
      timestamp: Date.now(),
    };

    this.events.push(event);
    console.log('[Analytics] Interaction:', event);

    this.sendToAnalytics('interaction', event);
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultsCount: number) {
    this.trackInteraction('search', 'search-bar', `${query} (${resultsCount} results)`);
  }

  /**
   * Track filter usage
   */
  trackFilter(filterType: string, filterValue: string) {
    this.trackInteraction('filter', filterType, filterValue);
  }

  /**
   * Track navigation
   */
  trackNavigation(from: string, to: string) {
    this.trackInteraction('navigation', `${from} -> ${to}`);
  }

  /**
   * Track scroll depth
   */
  trackScrollDepth(depth: number) {
    this.trackInteraction('scroll', 'page-scroll', `${depth}%`);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const perfData = window.performance.timing;
    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;

    return {
      loadTime,
      domContentLoaded,
    };
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  /**
   * Get all events
   */
  getEvents() {
    return this.events;
  }

  /**
   * Clear events
   */
  clearEvents() {
    this.events = [];
  }

  /**
   * Send data to analytics service
   * Replace with actual analytics service integration (Google Analytics, etc.)
   */
  private sendToAnalytics(eventType: string, data: any) {
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventType, data);
    }

    // Example: Custom analytics endpoint
    // fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ eventType, data }),
    // });
  }

  /**
   * Track conversion event
   */
  trackConversion(conversionType: string, value?: number) {
    console.log('[Analytics] Conversion:', conversionType, value);
    this.sendToAnalytics('conversion', { type: conversionType, value });
  }

  /**
   * Track XP earned (for gamification)
   */
  trackXPEarned(action: string, xpAmount: number) {
    console.log('[Analytics] XP Earned:', action, xpAmount);
    this.sendToAnalytics('xp_earned', { action, amount: xpAmount });
  }

  /**
   * Track course enrollment
   */
  trackCourseEnrollment(courseId: string, courseName: string) {
    console.log('[Analytics] Course Enrollment:', courseName);
    this.sendToAnalytics('course_enrollment', { courseId, courseName });
  }

  /**
   * Track course completion
   */
  trackCourseCompletion(courseId: string, courseName: string, duration: number) {
    console.log('[Analytics] Course Completion:', courseName, duration);
    this.sendToAnalytics('course_completion', { courseId, courseName, duration });
  }
}

// Export singleton instance
export const analytics = new Analytics();

/**
 * Simplified trackEvent function for convenience
 * Tracks custom events with event name and optional data
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  console.log('[Analytics] Custom Event:', eventName, eventData);
  analytics.trackInteraction('click', eventName, eventData ? JSON.stringify(eventData) : undefined);
}

/**
 * Setup scroll depth tracking
 */
export function setupScrollTracking() {
  if (typeof window === 'undefined') return;

  let ticking = false;
  const milestones = [25, 50, 75, 100];
  const reached: Set<number> = new Set();

  const trackScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const percentage = Math.round((scrolled / scrollHeight) * 100);

    milestones.forEach(milestone => {
      if (percentage >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        analytics.trackScrollDepth(milestone);
      }
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(trackScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', onScroll);
  };
}

/**
 * Setup click tracking
 */
export function setupClickTracking() {
  if (typeof window === 'undefined') return;

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Track button clicks
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.tagName === 'BUTTON' ? target : target.closest('button');
      analytics.trackInteraction('click', `button: ${button?.textContent?.trim() || 'unknown'}`);
    }
    
    // Track link clicks
    if (target.tagName === 'A' || target.closest('a')) {
      const link = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement;
      analytics.trackInteraction('click', `link: ${link?.href || 'unknown'}`);
    }
  };

  document.addEventListener('click', onClick);

  // Return cleanup function
  return () => {
    document.removeEventListener('click', onClick);
  };
}
