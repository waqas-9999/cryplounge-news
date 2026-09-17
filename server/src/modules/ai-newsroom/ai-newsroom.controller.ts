import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { auditContext } from '../articles/articles.controller';
import { AiNewsroomService } from './ai-newsroom.service';
import { AutoPublishService } from './auto-publish.service';
import {
  SetAutoPublishLimitsDto,
  SetAutomationDto,
  SetCategoryAutomationDto,
  SetEmergencyPauseDto,
  SetPublishModeDto,
} from './dto/ai-automation.dto';

/**
 * Admin controls for AI news automation.
 *
 * The permission split is the point of this controller:
 *  - `ai.automation.read`   — SUPER_ADMIN and ADMIN. See the state.
 *  - `ai.automation.manage` — SUPER_ADMIN only. Change it.
 *
 * Deliberately *not* served through `PUT /settings`, which `settings.manage`
 * unlocks and ADMIN holds. Routing these keys through the generic settings
 * endpoint would let any admin enable automatic publishing.
 */
@ApiTags('AI Newsroom')
@Controller('admin/ai/automation')
export class AiNewsroomController {
  constructor(
    private readonly newsroom: AiNewsroomService,
    private readonly autoPublish: AutoPublishService
  ) {}

  @Get()
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.read')
  @ResponseMessage('AI automation status')
  @ApiOperation({
    summary: 'Global and per-category automation state, plus last run details',
  })
  status() {
    return this.newsroom.status();
  }

  @Put()
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('AI automation updated')
  @ApiOperation({
    summary: 'Set the global automation switch',
    description:
      'Super admin only. While this is false no article may be published ' +
      'automatically, regardless of per-category settings.',
  })
  setEnabled(
    @Body() dto: SetAutomationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setEnabled(dto.enabled, auditContext(user, request));
  }

  @Put('publish-mode')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('Publishing mode updated')
  @ApiOperation({
    summary: 'Set how far automation may take a story',
    description:
      'Super admin only. AUTO_PUBLISH lets articles that clear every gate publish ' +
      'without a human. It remains subject to the emergency pause, the daily limit ' +
      'and the per-article checks in AutoPublishService.',
  })
  setPublishMode(
    @Body() dto: SetPublishModeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setPublishMode(dto.mode, auditContext(user, request));
  }

  /**
   * The emergency stop.
   *
   * A separate endpoint from the publish mode so it can be hit without knowing
   * or caring what the mode currently is — which is the state an operator is
   * in when they need it. The mode is preserved and restored by releasing.
   */
  @Put('emergency-pause')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('Emergency pause updated')
  @ApiOperation({ summary: 'Engage or release the emergency publishing stop' })
  setEmergencyPause(
    @Body() dto: SetEmergencyPauseDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setEmergencyPause(dto.paused, auditContext(user, request));
  }

  @Put('auto-publish-limits')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('Auto-publish limits updated')
  @ApiOperation({
    summary: 'Set the daily automatic publication ceiling and the minimum score',
  })
  setAutoPublishLimits(
    @Body() dto: SetAutoPublishLimitsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setAutoPublishLimits(dto, auditContext(user, request));
  }

  /**
   * Publishes the drafts already waiting, subject to every ordinary gate.
   *
   * Separate from the mode switch because turning auto publishing on is a
   * decision about *future* stories; clearing a backlog of forty is a
   * different decision, and one an operator should make deliberately.
   */
  @Post('publish-pending')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('Pending drafts considered')
  @ApiOperation({ summary: 'Reconsider drafts already in the CMS for automatic publication' })
  publishPending() {
    return this.autoPublish.sweepPendingDrafts({ kind: 'ADMIN' });
  }

  @Put('category')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.manage')
  @ResponseMessage('Category automation updated')
  @ApiOperation({
    summary: 'Enable or disable automation for one existing NEWS category',
    description: 'Super admin only. The slug must be a category that already exists.',
  })
  setCategory(
    @Body() dto: SetCategoryAutomationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setCategoryEnabled(dto.slug, dto.enabled, auditContext(user, request));
  }
}
