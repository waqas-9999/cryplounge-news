import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRangeQueryDto, RecordViewDto, TopContentQueryDto } from './dto/analytics.dto';

@ApiTags('Analytics')
@Controller()
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Public()
  @Post('analytics/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record one view of a piece of content' })
  recordView(@Body() dto: RecordViewDto) {
    return this.analytics.recordView(dto);
  }

  @Get('admin/analytics/overview')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('Analytics overview')
  @ApiOperation({ summary: 'Total views in range, broken down by content type' })
  overview(@Query() query: AnalyticsRangeQueryDto) {
    return this.analytics.overview(query);
  }

  @Get('admin/analytics/trend')
  @ApiBearerAuth()
  @RequirePermissions('analytics.read')
  @ResponseMessage('View trend')
  @ApiOperation({ summary: 'Daily view totals across the range' })
  trend(@Query() query: AnalyticsRangeQueryDto) {
    return this.analytics.trend(query);
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
}
