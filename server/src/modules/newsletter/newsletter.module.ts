import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterCampaignController } from './campaigns.controller';
import { NewsletterCampaignService } from './campaigns.service';

/**
 * The campaign controller is registered before the subscriber controller so
 * its static routes (`admin/newsletter/campaigns`, `.../campaigns/recipients`)
 * win over the subscriber controller's catch-all `admin/newsletter/:id`.
 */
@Module({
  controllers: [NewsletterCampaignController, NewsletterController],
  providers: [NewsletterService, NewsletterCampaignService],
})
export class NewsletterModule {}