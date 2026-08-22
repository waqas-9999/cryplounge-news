import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { NewsroomDiscoveryService, type DiscoveryFilters, type Freshness } from './newsroom-discovery.service';

/**
 * What the newsroom discovered, for admins.
 *
 * Two endpoints rather than one with a flag, mirroring the two pages they
 * serve. They answer different questions and are used at different moments:
 *
 *   /qualified  "what is worth my attention right now?"   score >= 50
 *   /all        "is the discovery system behaving?"       everything
 *
 * Folding the first into a filter on the second would make the everyday view
 * a special case of the diagnostic one, and the everyday view is the one an
 * editor opens twenty times a day.
 *
 * ## Authorization
 *
 * Both require `ai.automation.read` — SUPER_ADMIN and ADMIN. This is internal
 * newsroom data: scores, rejection reasons, source URLs and the timings of our
 * own pipeline. None of it is served by any public endpoint, and it is not
 * merely hidden in the UI: without this permission the request is refused
 * before the service is reached.
 */
@ApiTags('AI Newsroom')
@Controller('admin/ai/news')
export class NewsroomDiscoveryController {
  constructor(private readonly discovery: NewsroomDiscoveryService) {}

  /**
   * Qualified news: score 50 and above, inclusive.
   *
   * The threshold is fixed here rather than accepted from the caller, so the
   * page cannot be turned into the all-news page by editing a query string.
   * `minScore` narrows it further (60, 70, 80, 90) but can never widen it.
   */
  @Get('qualified')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.read')
  @ResponseMessage('Qualified news')
  @ApiOperation({ summary: 'Discovered stories scoring 50 or above' })
  qualified(@Query() query: Record<string, string>) {
    const requested = Number(query.minScore);
    const minScore = Number.isFinite(requested) ? Math.max(50, requested) : 50;

    return this.discovery.list({ ...this.parse(query), minScore });
  }

  /**
   * Everything discovered, whatever it scored.
   *
   * Nothing disappears for being weak: a story scored 32 and skipped is
   * evidence about the filter, and the filter is the thing most likely to be
   * quietly wrong.
   */
  @Get('all')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.read')
  @ResponseMessage('All discovered news')
  @ApiOperation({ summary: 'Every discovered story, including low-scoring and rejected ones' })
  all(@Query() query: Record<string, string>) {
    const filters = this.parse(query);
    const requested = Number(query.minScore);

    return this.discovery.list({
      ...filters,
      minScore: Number.isFinite(requested) ? requested : undefined,
    });
  }

  @Get('facets')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.read')
  @ResponseMessage('Discovery filters')
  @ApiOperation({ summary: 'Source domains and categories present in recent discoveries' })
  facets() {
    return this.discovery.facets();
  }

  /** Query-string parsing shared by both views. */
  private parse(query: Record<string, string>): DiscoveryFilters {
    const list = (value?: string) =>
      value
        ? value
            .split(',')
            .map(part => part.trim())
            .filter(Boolean)
        : undefined;

    const page = Number(query.page);
    const perPage = Number(query.perPage);
    const withinMinutes = Number(query.withinMinutes);

    return {
      freshness: list(query.freshness) as Freshness[] | undefined,
      category: query.category || undefined,
      status: list(query.status),
      sourceDomain: query.source || undefined,
      withinMinutes: Number.isFinite(withinMinutes) ? withinMinutes : undefined,
      sort: (query.sort as DiscoveryFilters['sort']) || 'newsroom',
      page: Number.isFinite(page) ? page : 1,
      perPage: Number.isFinite(perPage) ? perPage : 25,
    };
  }
}
