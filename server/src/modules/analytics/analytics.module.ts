import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsReportsService } from './analytics-reports.service';
import { AnalyticsService } from './analytics.service';
import {
  EventAnalyticsController,
  FounderAnalyticsController,
} from './entity-analytics.controller';
import { EntityAnalyticsService } from './entity-analytics.service';

@Module({
  controllers: [AnalyticsController, EventAnalyticsController, FounderAnalyticsController],
  providers: [AnalyticsService, AnalyticsReportsService, EntityAnalyticsService],
  exports: [AnalyticsService, AnalyticsReportsService, EntityAnalyticsService],
})
export class AnalyticsModule {}
