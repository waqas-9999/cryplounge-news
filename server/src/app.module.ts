import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configNamespaces } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { HealthModule } from './modules/health/health.module';
import { ContentCoreModule } from './modules/content-core/content-core.module';
import { TaxonomyModule } from './modules/taxonomy/taxonomy.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ResearchModule } from './modules/research/research.module';
import { RegulationsModule } from './modules/regulations/regulations.module';
import { EventsModule } from './modules/events/events.module';
import { FoundersModule } from './modules/founders/founders.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { MediaModule } from './modules/media/media.module';
import { SiteModule } from './modules/site/site.module';
import { AuditModule } from './modules/audit/audit.module';
import { SearchModule } from './modules/search/search.module';
import { DiscoveryModule } from './modules/discovery/discovery.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AgentsModule } from './modules/agents/agents.module';

/**
 * Application root.
 *
 * The global providers here establish the invariants everything else relies
 * on: one error shape, one response shape, authentication closed by default,
 * and a rate limit on every route.
 *
 * Guard order matters — throttling runs before authentication so that
 * unauthenticated floods are rejected before any database work.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: configNamespaces,
      envFilePath: ['.env.local', '.env'],
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('throttle.ttlSeconds')) * 1000,
          limit: Number(config.get('throttle.limit')),
        },
      ],
    }),

    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    HealthModule,

    // Shared editorial capability, then the content modules that reuse it.
    ContentCoreModule,
    TaxonomyModule,
    ArticlesModule,
    ProjectsModule,
    ResearchModule,
    RegulationsModule,
    EventsModule,
    FoundersModule,
    UsersModule,
    RolesModule,
    AuthorsModule,
    MediaModule,
    SiteModule,
    AuditModule,
    SearchModule,
    DiscoveryModule,
    AnalyticsModule,
    WebhooksModule,
    AgentsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
