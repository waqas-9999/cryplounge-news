import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ServiceUnavailableException,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsReportsService } from './analytics-reports.service';
import { Ga4AnalyticsService } from './ga4-analytics.service';
import { Ga4Client } from './ga4.client';
import {
  AnalyticsRangeQueryDto,
  ArticleAnalyticsQueryDto,
  ExportQueryDto,
  RecordViewDto,
  TopContentQueryDto,
  TrackBatchDto,
  TrafficQueryDto,
} from './dto/analytics.dto';
import { contextFrom, isBot, userAgentOf, type HeaderCarrier } from './request-context';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly reports: AnalyticsReportsService,
    private readonly ga4: Ga4AnalyticsService,
    private readonly gaClient: Ga4Client
  ) {}

  /**
   * A visitor metric, from Google Analytics.
   *
   * ## Why there is no fallback
   *
   * There used to be one: a GA failure quietly served the internal counters
   * instead. That was wrong, and it is the single most dangerous kind of
   * wrong a dashboard can be — the numbers were real, they were just from a
   * different system, and nothing on screen said so. An editor comparing the
   * dashboard against GA would see a discrepancy and have no way to tell
   * whether traffic had changed or the integration had broken.
   *
   * So a broken integration now *looks* broken. GA unconfigured or refusing
   * raises 503, the dashboard renders the error state it already has, and the
   * problem gets fixed instead of being averaged into the reporting.
   *
   * The internal counters are not deleted — they still power the per-article
   * CMS metrics that GA cannot know (shares, bookmarks, comments). They are
   * simply no longer allowed to impersonate visitor analytics.
   */
  private async fromGa<T>(report: string, run: () => Promise<T>): Promise<T> {
    if (!this.ga4.available) {
      throw new ServiceUnavailableException({
        message:
          'Google Analytics is not configured. Set GA_PROPERTY_ID and GOOGLE_SERVICE_ACCOUNT_JSON.',
        code: 'ANALYTICS_NOT_CONFIGURED',
      });
    }

    try {
      return await run();
    } catch (error) {
      // Logged with the credential stripped; the client never sees Google's
      // raw message, which can echo request URLs and account identifiers.
      this.gaClient.logFailure(report, error);
      throw new ServiceUnavailableException({
        message: `Google Analytics could not return the ${report} report. Check the service account has Viewer access to the property.`,
        code: 'ANALYTICS_UPSTREAM_ERROR',
      });
    }
  }

  @Public()
  @Post('analytics/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record one view of a piece of content' })
  recordView(@Body() dto: RecordViewDto, @Req() request: Request) {
    const carrier = request as unknown as HeaderCarrier;
    if (isBot(userAgentOf(carrier))) return;
    return this.analytics.recordView(dto, contextFrom(carrier));
  }

  @Public()
  @Post('analytics/track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record a batch of raw interaction events' })
  track(@Body() dto: TrackBatchDto, @Req() request: Request) {
    const carrier = request as unknown as HeaderCarrier;
    // Crawlers would otherwise count as visitors and sessions in every report.
    if (isBot(userAgentOf(carrier))) return;
    return this.analytics.track(dto, contextFrom(carrier));
  }

  /**
   * Is the Google Analytics integration actually working?
   *
   * Exists because "configured" and "working" fail identically from the
   * outside — a service account that was never granted Viewer access on the
   * property returns 403 on every report, which without this looks exactly
   * like a quiet week. Returns which credential form is in use, never the
   * credential.
   */
  @Get('admin/analytics/health')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Analytics integration health')
  @ApiOperation({ summary: 'Whether Google Analytics is configured and answering' })
  health() {
    return this.gaClient.healthy();
  }

  @Get('admin/analytics/overview')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Analytics overview')
  @ApiOperation({ summary: 'Total views in range, broken down by content type' })
  overview(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('overview', () => this.ga4.overview(query));
  }

  @Get('admin/analytics/trend')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('View trend')
  @ApiOperation({ summary: 'Daily view totals across the range' })
  trend(@Query() query: AnalyticsRangeQueryDto) {
    return this.analytics.trend(query);
  }

  @Get('admin/analytics/traffic')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Traffic time series')
  @ApiOperation({ summary: 'Visitor/session/page-view time series across the range' })
  traffic(@Query() query: TrafficQueryDto) {
    return this.analytics.traffic(query);
  }

  @Get('admin/analytics/realtime')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Realtime activity')
  @ApiOperation({ summary: 'Active visitors right now, plus the pages they are on' })
  realtime() {
    return this.fromGa('realtime', () => this.ga4.realtime());
  }

  @Get('admin/analytics/content')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Top content')
  @ApiOperation({ summary: 'Best-viewed content of one type in range' })
  topContent(@Query() query: TopContentQueryDto) {
    return this.analytics.topContent(query);
  }

  @Get('admin/analytics/search')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Search analytics')
  @ApiOperation({ summary: 'Top and zero-result search terms in range' })
  search(@Query() query: AnalyticsRangeQueryDto) {
    return this.analytics.search(query);
  }

  /* --------------------------------------------------- detailed reports -- */

  @Get('admin/analytics/geography')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Geographic analytics')
  @ApiOperation({ summary: 'Visitors by country, region and city' })
  geography(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('geography', () => this.ga4.geography(query));
  }

  @Get('admin/analytics/devices')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Device analytics')
  @ApiOperation({ summary: 'Desktop / mobile / tablet breakdown' })
  devices(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('devices', () => this.ga4.devices(query));
  }

  @Get('admin/analytics/browsers')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Browser analytics')
  @ApiOperation({ summary: 'Visitors by browser family' })
  browsers(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('browsers', () => this.ga4.browsers(query));
  }

  @Get('admin/analytics/operating-systems')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Operating system analytics')
  @ApiOperation({ summary: 'Visitors by operating system' })
  operatingSystems(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('operatingSystems', () => this.ga4.operatingSystems(query));
  }

  @Get('admin/analytics/languages')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Language analytics')
  @ApiOperation({ summary: 'Visitors by browser language' })
  languages(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('languages', () => this.ga4.languages(query));
  }

  @Get('admin/analytics/audience')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Audience analytics')
  @ApiOperation({ summary: 'New vs returning visitors, with a daily trend' })
  audience(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.audience(query);
  }

  @Get('admin/analytics/acquisition')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Acquisition analytics')
  @ApiOperation({ summary: 'Traffic grouped into marketing channels' })
  acquisition(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('acquisition', () => this.ga4.sources(query));
  }

  @Get('admin/analytics/referrers')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Referrer analytics')
  @ApiOperation({ summary: 'Individual referring domains' })
  referrers(@Query() query: AnalyticsRangeQueryDto) {
    return this.fromGa('referrers', () => this.ga4.referrers(query));
  }

  @Get('admin/analytics/social')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Social analytics')
  @ApiOperation({ summary: 'Traffic from known social platforms' })
  social(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.social(query);
  }

  @Get('admin/analytics/articles')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Article performance')
  @ApiOperation({ summary: 'Paginated, sortable article performance table' })
  articles(@Query() query: ArticleAnalyticsQueryDto) {
    return this.reports.articles(query);
  }

  @Get('admin/analytics/articles/:id')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Article analytics')
  @ApiOperation({ summary: 'Full analytics for one article' })
  async articleDetail(@Param('id') id: string, @Query() query: AnalyticsRangeQueryDto) {
    const detail = await this.reports.articleDetail(id, query);
    if (!detail) throw new NotFoundException({ message: 'Article not found', code: 'NOT_FOUND' });
    return detail;
  }

  @Get('admin/analytics/reading-depth')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Reading depth')
  @ApiOperation({ summary: 'Scroll-depth funnel across all content in range' })
  readingDepth(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.readingDepth(query);
  }

  @Get('admin/analytics/categories')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Category analytics')
  @ApiOperation({ summary: 'Performance by category' })
  categories(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.categories(query);
  }

  @Get('admin/analytics/authors')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Author analytics')
  @ApiOperation({ summary: 'Performance by author, with each author’s top article' })
  authors(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.authors(query);
  }

  @Get('admin/analytics/trending')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Trending articles')
  @ApiOperation({ summary: 'Articles with the strongest 24h growth' })
  trending(@Query() query: TopContentQueryDto) {
    return this.reports.trending(query);
  }

  @Get('admin/analytics/publishing')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Publishing insights')
  @ApiOperation({ summary: 'Best publishing hours and days, plus article lifecycle' })
  publishing(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.publishing(query);
  }

  /**
   * CSV export. Returns a file rather than the usual JSON envelope, so the
   * response interceptor is bypassed via `@Res()`.
   */
  @Get('admin/analytics/export')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ApiOperation({ summary: 'Export any report as CSV, honouring the current filters' })
  async export(@Query() query: ExportQueryDto, @Res() response: Response) {
    const rows = await this.rowsFor(query);
    const csv = this.reports.toCsv(rows);
    const filename = `cryplounge-${query.type}-${new Date().toISOString().slice(0, 10)}.csv`;

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Excel only honours UTF-8 in a CSV when it is preceded by a BOM.
    response.send(`﻿${csv}`);
  }

  /** Maps an export type onto the report that produces it. */
  private async rowsFor(query: ExportQueryDto): Promise<readonly object[]> {
    switch (query.type) {
      case 'overview':
        return [await this.analytics.overview(query)].map(o => ({ ...o.current, from: o.from, to: o.to }));
      case 'traffic':
        return (await this.analytics.traffic(query)).points;
      case 'articles':
        return (await this.reports.articles(query as ArticleAnalyticsQueryDto)).items;
      case 'article-detail': {
        if (!query.entityId) return [];
        const detail = await this.reports.articleDetail(query.entityId, query);
        return detail ? [{ ...detail.article, ...detail.totals }] : [];
      }
      case 'categories':
        return this.reports.categories(query);
      case 'authors':
        return this.reports.authors(query);
      case 'countries':
        return (await this.reports.geography(query)).countries;
      case 'regions':
        return (await this.reports.geography(query)).regions;
      case 'cities':
        return (await this.reports.geography(query)).cities;
      case 'acquisition':
        return this.reports.acquisition(query);
      case 'referrers':
        return this.reports.referrers(query);
      case 'social':
        return this.reports.social(query);
      case 'devices':
        return this.reports.devices(query);
      case 'browsers':
        return this.reports.browsers(query);
      case 'operating-systems':
        return this.reports.operatingSystems(query);
      case 'languages':
        return this.reports.languages(query);
      case 'behavior':
        return (await this.reports.readingDepth(query)).milestones;
      case 'searches': {
        const search = await this.analytics.search(query);
        return search.topTerms.map(t => ({ ...t, kind: 'top' }))
          .concat(search.zeroResultTerms.map(t => ({ ...t, kind: 'zero-result' })));
      }
      default:
        return [];
    }
  }
}
