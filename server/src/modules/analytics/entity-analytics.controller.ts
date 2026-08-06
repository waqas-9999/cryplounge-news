import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AnalyticsReportsService } from './analytics-reports.service';
import { EntityAnalyticsService, type ContentEntity } from './entity-analytics.service';
import { AnalyticsRangeQueryDto } from './dto/analytics.dto';

/**
 * Dedicated analytics surfaces for the Events and Founders admin modules.
 *
 * The routes are separate so each module owns its own reports, filters and
 * exports, but both delegate to the same services — the split is in the API
 * surface, not in the implementation.
 */
abstract class BaseEntityAnalyticsController {
  protected abstract readonly entity: ContentEntity;

  constructor(
    protected readonly entities: EntityAnalyticsService,
    protected readonly reports: AnalyticsReportsService
  ) {}

  /** Range query narrowed to this controller's content type. */
  protected scoped(query: AnalyticsRangeQueryDto): AnalyticsRangeQueryDto {
    return { ...query, entity: this.entity };
  }

  @Get('traffic')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Traffic')
  @ApiOperation({ summary: 'New vs returning visitors, with a daily trend' })
  traffic(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.audience(this.scoped(query));
  }

  @Get('geography')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Geography')
  @ApiOperation({ summary: 'Visitors by country, region and city' })
  geography(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.geography(this.scoped(query));
  }

  @Get('continents')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Continents')
  @ApiOperation({ summary: 'Visitors rolled up by continent' })
  continents(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.continents(this.entity, query);
  }

  @Get('devices')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Devices')
  @ApiOperation({ summary: 'Device, browser and OS breakdown' })
  async devices(@Query() query: AnalyticsRangeQueryDto) {
    const scoped = this.scoped(query);
    const [devices, browsers, operatingSystems, languages, screenResolutions] = await Promise.all([
      this.reports.devices(scoped),
      this.reports.browsers(scoped),
      this.reports.operatingSystems(scoped),
      this.reports.languages(scoped),
      this.entities.screenResolutions(this.entity, query),
    ]);
    return { devices, browsers, operatingSystems, languages, screenResolutions };
  }

  @Get('sources')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Traffic sources')
  @ApiOperation({ summary: 'Channels, referring domains and social platforms' })
  async sources(@Query() query: AnalyticsRangeQueryDto) {
    const scoped = this.scoped(query);
    const [channels, referrers, social] = await Promise.all([
      this.reports.acquisition(scoped),
      this.reports.referrers(scoped),
      this.reports.social(scoped),
    ]);
    return { channels, referrers, social };
  }

  @Get('engagement')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Engagement')
  @ApiOperation({ summary: 'Outbound link clicks and shares' })
  engagement(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.engagement(this.entity, query);
  }

  @Get('reading-depth')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Reading depth')
  @ApiOperation({ summary: 'Scroll-depth funnel' })
  readingDepth(@Query() query: AnalyticsRangeQueryDto) {
    return this.reports.readingDepth(this.scoped(query));
  }

  @Get('performance')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Performance')
  @ApiOperation({ summary: 'Per-item views, engagement clicks and CTR' })
  performance(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.performance(this.entity, query);
  }

  @Get('seo')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('SEO')
  @ApiOperation({ summary: 'Organic traffic and a metadata audit' })
  seo(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.seo(this.entity, query);
  }

  /** CSV of the performance table, honouring the active range and filters. */
  @Get('export')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ApiOperation({ summary: 'Export performance as CSV' })
  async export(@Query() query: AnalyticsRangeQueryDto, @Res() response: Response) {
    const rows = await this.entities.performance(this.entity, query);
    const flattened = rows.map(({ clicks, ...rest }) => ({ ...rest, ...clicks }));
    const filename = `cryplounge-${this.entity.toLowerCase()}-analytics-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    response.send(`﻿${this.reports.toCsv(flattened)}`);
  }
}

@ApiTags('Event Analytics')
@Controller('admin/events/analytics')
export class EventAnalyticsController extends BaseEntityAnalyticsController {
  protected readonly entity: ContentEntity = 'Event';

  constructor(entities: EntityAnalyticsService, reports: AnalyticsReportsService) {
    super(entities, reports);
  }

  @Get('overview')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Event overview')
  @ApiOperation({ summary: 'Event counts by lifecycle and workflow status' })
  overview() {
    return this.entities.eventOverview();
  }

  @Get('organizers')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Organizer analytics')
  @ApiOperation({ summary: 'Performance grouped by organizer' })
  organizers(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.grouped('Event', 'organizer', query);
  }

  @Get('categories')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Category analytics')
  @ApiOperation({ summary: 'Performance grouped by event category' })
  categories(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.grouped('Event', 'category', query);
  }

  @Get('chains')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Blockchain analytics')
  @ApiOperation({ summary: 'Performance grouped by blockchain ecosystem' })
  chains(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.grouped('Event', 'chains', query);
  }
}

@ApiTags('Founder Analytics')
@Controller('admin/founders/analytics')
export class FounderAnalyticsController extends BaseEntityAnalyticsController {
  protected readonly entity: ContentEntity = 'Founder';

  constructor(entities: EntityAnalyticsService, reports: AnalyticsReportsService) {
    super(entities, reports);
  }

  @Get('overview')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Founder overview')
  @ApiOperation({ summary: 'Founder profile counts by status' })
  overview() {
    return this.entities.founderOverview();
  }

  @Get('companies')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Company analytics')
  @ApiOperation({ summary: 'Performance grouped by company' })
  companies(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.grouped('Founder', 'company', query);
  }

  @Get('industries')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Industry analytics')
  @ApiOperation({ summary: 'Performance grouped by industry' })
  industries(@Query() query: AnalyticsRangeQueryDto) {
    return this.entities.grouped('Founder', 'industry', query);
  }
}
