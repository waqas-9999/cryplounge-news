import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PublishingService } from './publishing.service';
import { RelationsService } from './relations.service';
import { SlugService } from './slug.service';

/**
 * Shared editorial capability: slugs, publishing workflow, relations, audit.
 *
 * Global because every content module needs all four, and re-importing the
 * same module six times is noise.
 */
@Global()
@Module({
  providers: [SlugService, PublishingService, RelationsService, AuditService],
  exports: [SlugService, PublishingService, RelationsService, AuditService],
})
export class ContentCoreModule {}
