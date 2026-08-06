import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { NewsletterService } from './newsletter.service';
import { NewsletterCampaignService } from './campaigns.service';
import {
  NewsletterQueryDto,
  SubscribeNewsletterDto,
  UpdateNewsletterDto,
} from './dto/newsletter.dto';
import { UnsubscribeNewsletterDto } from './dto/newsletter-campaign.dto';

/**
 * Newsletter subscriptions.
 *
 * The subscribe route is deliberately public (`@Public()`) — anyone on the
 * site must be able to sign up — while every management route lives under
 * `admin/newsletter` and is gated by `newsletter.read` / `newsletter.manage`.
 * Route order matters: `stats` is declared before `:id` so it is not captured
 * as an identifier.
 */
@ApiTags('Newsletter')
@Controller()
export class NewsletterController {
  constructor(
    private readonly newsletter: NewsletterService,
    private readonly campaigns: NewsletterCampaignService
  ) {}

  @Public()
  @Post('newsletter/subscribe')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Subscription successful')
  @ApiOperation({ summary: 'Subscribe an email address to the newsletter' })
  subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.newsletter.subscribe(dto);
  }

  /**
   * Public unsubscribe. The token is HMAC-signed (never the row id), so the
   * link is unforgeable and cannot be used to unsubscribe someone else.
   */
  @Public()
  @Post('newsletter/unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Unsubscribed')
  @ApiOperation({ summary: 'Unsubscribe an address using its signed token' })
  unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.campaigns.unsubscribe(dto);
  }

  @Get('admin/newsletter/stats')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Newsletter statistics')
  @ApiOperation({ summary: 'Total, active and unsubscribed subscriber counts' })
  stats() {
    return this.newsletter.stats();
  }

  @Get('admin/newsletter')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Newsletter subscribers')
  @ApiOperation({ summary: 'List newsletter subscribers (paginated, filterable)' })
  list(@Query() query: NewsletterQueryDto) {
    return this.newsletter.list(query);
  }

  @Get('admin/newsletter/:id')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Newsletter subscriber')
  @ApiOperation({ summary: 'Get a single newsletter subscriber' })
  findOne(@Param('id') id: string) {
    return this.newsletter.findOne(id);
  }

  @Patch('admin/newsletter/:id')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ResponseMessage('Subscriber updated')
  @ApiOperation({ summary: 'Activate or unsubscribe a newsletter subscriber' })
  update(@Param('id') id: string, @Body() dto: UpdateNewsletterDto) {
    return this.newsletter.update(id, dto);
  }

  @Delete('admin/newsletter/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ApiOperation({ summary: 'Delete a newsletter subscriber' })
  remove(@Param('id') id: string) {
    return this.newsletter.remove(id);
  }
}
