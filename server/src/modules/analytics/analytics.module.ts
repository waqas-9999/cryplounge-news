import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsReportsService } from './analytics-reports.service';
import { AnalyticsService } from './analytics.service';
import { Ga4AnalyticsService } from './ga4-analytics.service';
import { Ga4Client } from './ga4.client';
import {
  EventAnalyticsController,
  FounderAnalyticsController,
} from './entity-analytics.controller';
import { EntityAnalyticsService } from './entity-analytics.service';

@Module({
  controllers: [AnalyticsController, EventAnalyticsController, FounderAnalyticsController],
  providers: [AnalyticsService, AnalyticsReportsService, EntityAnalyticsService, Ga4Client, Ga4AnalyticsService],
  exports: [AnalyticsService, AnalyticsReportsService, EntityAnalyticsService, Ga4AnalyticsService],
})
export class AnalyticsModule {}
