import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { auditContext } from '../articles/articles.controller';
import { AiNewsroomService } from './ai-newsroom.service';
import {
  SetAutomationDto,
  SetCategoryAutomationDto,
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
  constructor(private readonly newsroom: AiNewsroomService) {}

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
      'Super admin only. AUTO_PUBLISH is rejected until generation, fact ' +
      'checking and image production are implemented and verified.',
  })
  setPublishMode(
    @Body() dto: SetPublishModeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.newsroom.setPublishMode(dto.mode, auditContext(user, request));
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
