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
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { NewsletterCampaignService } from './campaigns.service';
import {
  CampaignQueryDto,
  CreateNewsletterCampaignDto,
  TestCampaignDto,
  UpdateNewsletterCampaignDto,
} from './dto/newsletter-campaign.dto';

/**
 * Admin campaign management. Every route requires `newsletter.read` or
 * `newsletter.manage`; there are no public campaign routes — even the send
 * only starts a background batch job rather than exposing SMTP state.
 *
 * Route order matters: the static `recipients` route is declared before `:id`
 * so it is not captured as an identifier.
 */
@ApiTags('Newsletter')
@Controller('admin/newsletter/campaigns')
export class NewsletterCampaignController {
  constructor(private readonly campaigns: NewsletterCampaignService) {}

  @Get()
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Newsletter campaigns')
  @ApiOperation({ summary: 'List newsletter campaigns (paginated, filterable)' })
  list(@Query() query: CampaignQueryDto) {
    return this.campaigns.list(query);
  }

  @Get('recipients')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Active newsletter recipients')
  @ApiOperation({ summary: 'All active subscribers, for the recipient picker' })
  recipients() {
    return this.campaigns.recipients();
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Newsletter campaign')
  @ApiOperation({ summary: 'Get a single newsletter campaign' })
  findOne(@Param('id') id: string) {
    return this.campaigns.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ResponseMessage('Campaign draft created')
  @ApiOperation({ summary: 'Create a newsletter campaign (saved as a draft)' })
  create(@Body() dto: CreateNewsletterCampaignDto, @CurrentUser() user: AuthenticatedUser) {
    return this.campaigns.create(dto, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ResponseMessage('Campaign updated')
  @ApiOperation({ summary: 'Update a draft newsletter campaign' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNewsletterCampaignDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.campaigns.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ApiOperation({ summary: 'Delete a newsletter campaign' })
  remove(@Param('id') id: string) {
    return this.campaigns.remove(id);
  }

  @Post(':id/preview')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.read')
  @ResponseMessage('Campaign preview')
  @ApiOperation({ summary: 'Render the campaign through the real email template' })
  preview(@Param('id') id: string) {
    return this.campaigns.preview(id);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ResponseMessage('Test email sent')
  @ApiOperation({ summary: 'Send a single test copy of the campaign to a given address' })
  test(@Param('id') id: string, @Body() dto: TestCampaignDto) {
    return this.campaigns.test(id, dto);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions('newsletter.manage')
  @ResponseMessage('Campaign sending')
  @ApiOperation({ summary: 'Start a batched send of the campaign to active subscribers' })
  send(@Param('id') id: string) {
    return this.campaigns.send(id);
  }
}
