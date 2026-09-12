'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient, errorMessage } from '@/lib/api-client';
import { mockSnapshot, MOCK_ENABLED } from './mock';
import type { IntelEvent, IntelSnapshot, IntelWindowKey } from './model';

/**
 * The page's only data source: the server's intelligence snapshot, polled.
 *
 * ## Why polling
 *
 * The CMS has no realtime transport, and the admin authenticates with a bearer
 * token that `EventSource` cannot send. The newsroom delivers telemetry in
 * batches, so a short poll is as current as a stream would be. The page says
 * "polled every 5s" rather than implying a socket.
 *
 * ## Never fake liveness
 *
 * A failed poll does not clear the last snapshot, but the connection state
 * changes immediately and the page says when it last synchronised. Nothing is
 * interpolated or invented between polls.
 */

export const POLL_INTERVAL_MS = 5_000;
const MAX_BACKOFF_MS = 30_000;

export type FeedConnection = 'connecting' | 'live' | 'reconnecting' | 'unavailable' | 'paused' | 'snapshot';

export interface FeedState {
  snapshot: IntelSnapshot | null;
  connection: FeedConnection;
  lastSyncedAt: string | null;
  error: string | null;
  /** Event ids that arrived in the latest poll and were not in the previous one. */
  freshEventIds: ReadonlySet<string>;
  mock: boolean;
  refresh: () => void;
}

export function useIntelligenceFeed(windowKey: IntelWindowKey, paused: boolean): FeedState {
  const [snapshot, setSnapshot] = useState<IntelSnapshot | null>(null);
  const [connection, setConnection] = useState<FeedConnection>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freshEventIds, setFresh] = useState<ReadonlySet<string>>(new Set());
  const [nonce, setNonce] = useState(0);

  const seen = useRef<Set<string>>(new Set());
  const hasData = useRef(false);

  const refresh = useCallback(() => setNonce(n => n + 1), []);

  // A different window is a different question: forget what was "new".
  useEffect(() => {
    seen.current = new Set();
    hasData.current = false;
    setSnapshot(null);
    setConnection('connecting');
  }, [windowKey]);

  useEffect(() => {
    if (paused) {
      setConnection('paused');
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let failures = 0;
    const controller = new AbortController();

    const apply = (next: IntelSnapshot) => {
      const fresh = new Set<string>();
      // The first load is history, not arrivals: nothing animates in.
      if (hasData.current) {
        for (const event of next.events) if (!seen.current.has(event.id)) fresh.add(event.id);
      }
      next.events.forEach((event: IntelEvent) => seen.current.add(event.id));
      hasData.current = true;

      setSnapshot(next);
      setFresh(fresh);
      setLastSyncedAt(new Date().toISOString());
      setError(null);
      setConnection(windowKey === 'live' ? 'live' : 'snapshot');
    };

    const tick = async () => {
      try {
        const next = MOCK_ENABLED
          ? mockSnapshot(windowKey)
          : await apiClient.get<IntelSnapshot>('admin/ai/newsroom/intelligence', {
              query: { window: windowKey },
              signal: controller.signal,
            });
        if (cancelled) return;
        failures = 0;
        apply(next);
      } catch (err) {
        if (cancelled || controller.signal.aborted) return;
        failures += 1;
        setError(errorMessage(err, 'The newsroom intelligence service could not be reached.'));
        setConnection(hasData.current ? 'reconnecting' : 'unavailable');
      }

      if (cancelled || windowKey !== 'live') return;
      const delay = failures === 0 ? POLL_INTERVAL_MS : Math.min(POLL_INTERVAL_MS * 2 ** failures, MAX_BACKOFF_MS);
      timer = setTimeout(tick, delay);
    };

    void tick();

    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [windowKey, paused, nonce]);

  return { snapshot, connection, lastSyncedAt, error, freshEventIds, mock: MOCK_ENABLED, refresh };
}
