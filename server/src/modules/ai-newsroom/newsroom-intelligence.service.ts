import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { NewsroomDiscoveryService } from './newsroom-discovery.service';
import { buildSnapshot, INTEL_WINDOWS, type IntelSnapshot, type IntelWindowKey } from './newsroom-intelligence.derive';

/** Upper bound on telemetry rows read per snapshot. ~24h at normal volume. */
const MAX_EVENTS = 20_000;

/**
 * Discovery records are read over at least a day, then narrowed by the
 * derivation. A story recorded an hour ago whose research event arrived a
 * minute ago belongs in a five-minute view, and needs its title.
 */
const MIN_DISCOVERY_LOOKBACK_MINUTES = 1440;

/**
 * Reads the newsroom intelligence snapshot for the admin globe.
 *
 * Read-only. Telemetry comes from `NewsroomEvent`, which the newsroom already
 * writes; story detail comes from the newsroom's discovery records through the
 * existing read-only connection. Nothing is copied or cached.
 */
@Injectable()
export class NewsroomIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discovery: NewsroomDiscoveryService
  ) {}

  async snapshot(windowKey: IntelWindowKey): Promise<IntelSnapshot> {
    const now = new Date();
    const minutes = INTEL_WINDOWS[windowKey];
    const since = new Date(now.getTime() - minutes * 60_000);

    const [events, discovery] = await Promise.all([
      // `createdAt` is indexed; `occurredAt` is not. Arrival and observation
      // differ by seconds in normal delivery, which is noise at these windows.
      this.prisma.newsroomEvent.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: MAX_EVENTS,
      }),
      this.discovery.storiesWithin(Math.max(minutes, MIN_DISCOVERY_LOOKBACK_MINUTES)),
    ]);

    // Narrow discovery records to the window unless telemetry references them.
    const referenced = new Set(events.map(event => event.clusterId).filter(Boolean));
    const stories = discovery.stories.filter(
      story => referenced.has(story.clusterId) || new Date(story.recordedAt) >= since
    );

    return buildSnapshot({ now, windowKey, events, discovery: { ...discovery, stories } });
  }
}
