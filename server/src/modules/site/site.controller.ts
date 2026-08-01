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
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import {
  CreateNavigationItemDto,
  ReorderDto,
  UpdateHomepageSectionDto,
  UpdateNavigationItemDto,
  UpsertSettingDto,
} from './dto/site.dto';
import { SiteService } from './site.service';

@ApiTags('Site Configuration')
@Controller()
export class SiteController {
  constructor(private readonly site: SiteService) {}

  /* -------------------------------------------------------------- settings --- */

  @Public()
  @Get('settings')
  @ResponseMessage('Settings')
  @ApiOperation({
    summary: 'All site settings',
    description:
      'Public because the frontend needs brand, navigation defaults and SEO ' +
      'values to render. Never store a secret here — this response is world ' +
      'readable.',
  })
  settings() {
    return this.site.settings();
  }

  @Put('settings')
  @ApiBearerAuth()
  @RequirePermissions('settings.manage')
  @ResponseMessage('Settings saved')
  @ApiOperation({ summary: 'Upsert one or more settings' })
  setSettings(
    @Body() body: { settings: UpsertSettingDto[] },
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.setSettings(body.settings ?? [], auditContext(user, request));
  }

  /* ----------------------------------------------------- homepage sections --- */

  @Public()
  @Get('homepage-sections')
  @ResponseMessage('Homepage sections')
  homepageSections() {
    return this.site.homepageSections();
  }

  @Patch('homepage-sections/:key')
  @ApiBearerAuth()
  @RequirePermissions('homepage.manage')
  @ResponseMessage('Section updated')
  updateSection(
    @Param('key') key: string,
    @Body() dto: UpdateHomepageSectionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.updateHomepageSection(key, dto, auditContext(user, request));
  }

  @Put('homepage-sections/reorder')
  @ApiBearerAuth()
  @RequirePermissions('homepage.manage')
  @ResponseMessage('Sections reordered')
  reorderSections(
    @Body() dto: ReorderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.reorderHomepageSections(dto, auditContext(user, request));
  }

  /* ------------------------------------------------------------ navigation --- */

  @Public()
  @Get('navigation')
  @ResponseMessage('Navigation')
  @ApiQuery({ name: 'location', required: false, enum: ['header', 'footer'] })
  navigation(@Query('location') location?: string) {
    return this.site.navigation(location);
  }

  @Post('navigation')
  @ApiBearerAuth()
  @RequirePermissions('navigation.manage')
  @ResponseMessage('Menu item created')
  createNavItem(
    @Body() dto: CreateNavigationItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.createNavigationItem(dto, auditContext(user, request));
  }

  @Put('navigation/reorder')
  @ApiBearerAuth()
  @RequirePermissions('navigation.manage')
  @ResponseMessage('Menu reordered')
  reorderNav(
    @Body() dto: ReorderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.reorderNavigation(dto, auditContext(user, request));
  }

  @Patch('navigation/:id')
  @ApiBearerAuth()
  @RequirePermissions('navigation.manage')
  @ResponseMessage('Menu item updated')
  updateNavItem(
    @Param('id') id: string,
    @Body() dto: UpdateNavigationItemDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.updateNavigationItem(id, dto, auditContext(user, request));
  }

  @Delete('navigation/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('navigation.manage')
  @ApiOperation({ summary: 'Delete a menu item; child items are removed with it' })
  deleteNavItem(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.site.deleteNavigationItem(id, auditContext(user, request));
  }
}
