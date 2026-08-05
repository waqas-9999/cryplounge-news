/**
 * First-party analytics tracking.
 *
 * Events are posted to the backend's `POST /analytics/track`, which enriches
 * them server-side with geography (from edge headers) and device/browser/OS
 * (from the User-Agent) before storing them — see
 * `server/src/modules/analytics/request-context.ts`. The client therefore
 * sends only what the server cannot determine for itself.
 *
 * Privacy: no personal data is collected. The session and visitor ids are
 * random, contain nothing derived from the user, and never leave first-party
 * storage. No IP address is transmitted or stored.
 */

import { apiClient } from '@/lib/api-client';

const SESSION_KEY = 'cryplounge_session_id';
const VISITOR_KEY = 'cryplounge_visitor_id';

/**
 * Event types the backend accepts. Kept in sync with `EVENT_TYPES` in
 * `server/src/modules/analytics/dto/analytics.dto.ts` — the backend rejects
 * anything outside this set, so an unmapped name would be silently dropped.
 */
export type BackendEventType =
  | 'page_view'
  | 'article_view'
  | 'article_scroll'
  | 'article_complete'
  | 'search'
  | 'category_view'
  | 'author_view'
  | 'event_view'
  | 'share'
  | 'bookmark'
  | 'comment'
  | 'newsletter_signup'
  | 'external_link_click';

function randomId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Anonymous session id, one per tab session (sessionStorage). */
function getSessionId(): string {
  if (typeof window === 'undefined') return randomId();
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = randomId();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Anonymous visitor id, persists across sessions (localStorage). No PII. */
function getVisitorId(): string {
  if (typeof window === 'undefined') return randomId();
  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = randomId();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

/** Extra fields an event can carry beyond the automatic session context. */
export interface EventContext {
  entity?: string;
  entityId?: string;
  categoryId?: string;
  authorId?: string;
  /** 0–100, for `article_scroll` milestones. */
  scrollDepth?: number;
  meta?: Record<string, unknown>;
}

/**
 * Posts one event. Fire-and-forget by design: a failed analytics call must
 * never surface to the reader or block rendering.
 */
export function track(type: BackendEventType, context: EventContext = {}): void {
  if (typeof window === 'undefined') return;

  apiClient
    .post('analytics/track', {
      events: [
        {
          type,
          sessionId: getSessionId(),
          visitorId: getVisitorId(),
          path: window.location.pathname,
          referrer: document.referrer || undefined,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timestamp: new Date().toISOString(),
          ...context,
        },
      ],
    })
    .catch(() => {
      // Analytics must never break the page.
    });
}

/**
 * Records one view of a piece of content, bumping the daily rollup that powers
 * the top-content reports. The session ids travel with it so the view joins the
 * rest of the session rather than looking like a one-event bounce.
 */
export function recordContentView(entity: string, entityId: string): void {
  if (typeof window === 'undefined') return;
  apiClient
    .post('analytics/view', {
      entity,
      entityId,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
    })
    .catch(() => {});
}

/* ------------------------------------------------------- named trackers --- */

export function trackPageView(context: EventContext = {}): void {
  track('page_view', context);
}

export function trackShare(platform: string, context: EventContext = {}): void {
  track('share', { ...context, meta: { ...context.meta, platform } });
}

export function trackBookmark(context: EventContext = {}): void {
  track('bookmark', context);
}

export function trackSearch(term: string, resultCount: number): void {
  track('search', { meta: { term, resultCount } });
}

export function trackNewsletterSignup(): void {
  track('newsletter_signup');
}

export function trackOutboundLink(href: string): void {
  track('external_link_click', { meta: { href } });
}

/**
 * The engagement actions the event and founder analytics count.
 *
 * A closed set rather than free text: these become chart categories, and one
 * typo at a call site would silently split a metric into two.
 */
export type EngagementAction =
  | 'register'
  | 'website'
  | 'telegram'
  | 'x'
  | 'linkedin'
  | 'github'
  | 'online_url'
  | 'organizer'
  | 'copy_link'
  | 'related_project'
  | 'related_event'
  | 'related_article'
  | 'related_research';

/**
 * Records a meaningful click on an event or founder page — the actions that
 * indicate real interest, as opposed to a page view.
 *
 * Stored as `external_link_click` with the action in `meta` so no new event
 * type is needed; the reports group on `meta.action`.
 */
export function trackEngagement(
  action: EngagementAction,
  entity: 'Event' | 'Founder',
  entityId: string
): void {
  track('external_link_click', { entity, entityId, meta: { action } });
}

/**
 * App-level event names mapped onto the backend's vocabulary.
 *
 * Call sites use domain language ("article_share"); the backend stores a small
 * fixed set of types so the reports can aggregate them. Anything unmapped is
 * dropped rather than mislabelled — a wrong type corrupts every report that
 * counts it.
 */
const EVENT_NAME_MAP: Record<string, BackendEventType> = {
  article_view: 'article_view',
  article_share: 'share',
  article_save: 'bookmark',
  article_bookmark: 'bookmark',
  article_copy_link: 'share',
  article_comment: 'comment',
  category_view: 'category_view',
  author_view: 'author_view',
  event_view: 'event_view',
  newsletter_signup: 'newsletter_signup',
  related_article_click: 'external_link_click',
  search: 'search',
};

/** Generic escape hatch for call sites that already use domain event names. */
export function trackEvent(eventName: string, eventData?: Record<string, unknown>): void {
  const type = EVENT_NAME_MAP[eventName];
  if (!type) return;
  track(type, { meta: eventData });
}

/* ----------------------------------------------------- scroll / reading --- */

/** Milestones the reading-depth funnel is built from. */
const DEPTH_MILESTONES = [25, 50, 75, 90, 100];

/**
 * Reading-depth tracking for a single article.
 *
 * Emits an `article_scroll` event carrying `scrollDepth` the first time each
 * milestone is crossed, plus one `article_complete` at 100%. Each milestone
 * fires at most once per mount, so the funnel counts readers rather than
 * scroll oscillations.
 *
 * Returns a cleanup function; call it on unmount.
 */
export function trackReadingDepth(entity: string, entityId: string): () => void {
  if (typeof window === 'undefined') return () => {};

  const reached = new Set<number>();
  let ticking = false;

  const measure = () => {
    ticking = false;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    // A page shorter than the viewport is fully read the moment it renders.
    const percentage = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);

    for (const milestone of DEPTH_MILESTONES) {
      if (percentage < milestone || reached.has(milestone)) continue;
      reached.add(milestone);
      track('article_scroll', { entity, entityId, scrollDepth: milestone });
      if (milestone === 100) track('article_complete', { entity, entityId });
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(measure);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Fire once immediately so short articles register at all.
  measure();

  return () => window.removeEventListener('scroll', onScroll);
}

/* ------------------------------------------------------------- outbound --- */

/**
 * Tracks clicks on links leaving the site. Attached once at the app shell.
 * Returns a cleanup function.
 */
export function setupOutboundLinkTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest('a');
    if (!link?.href) return;
    try {
      if (new URL(link.href).hostname !== window.location.hostname) {
        trackOutboundLink(link.href);
      }
    } catch {
      // Not an absolute URL — nothing to attribute.
    }
  };

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
