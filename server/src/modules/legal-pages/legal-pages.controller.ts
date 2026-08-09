import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateLegalPageDto, UpdateLegalPageDto } from './dto/legal-page.dto';
import { LegalPagesService } from './legal-pages.service';

/** Terms, Privacy and other legal/policy pages — authored entirely from the admin panel. */
@ApiTags('Legal Pages')
@Controller('pages')
export class LegalPagesController {
  constructor(private readonly pages: LegalPagesService) {}

  @Public()
  @Get()
  @ResponseMessage('Pages')
  @ApiOperation({ summary: 'List published legal pages' })
  list() {
    return this.pages.list();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('pages.read')
  @ResponseMessage('Pages')
  @ApiOperation({ summary: 'List legal pages in any status, including drafts' })
  listForAdmin() {
    return this.pages.listForAdmin();
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @RequirePermissions('pages.read')
  @ResponseMessage('Page')
  @ApiOperation({ summary: 'Fetch a legal page by id, whatever its status' })
  byId(@Param('id') id: string) {
    return this.pages.byId(id);
  }

  @Public()
  @Get(':slug')
  @ResponseMessage('Page')
  @ApiOperation({ summary: 'Fetch a published legal page by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.pages.bySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('pages.manage')
  @ResponseMessage('Page created')
  create(
    @Body() dto: CreateLegalPageDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.pages.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('pages.manage')
  @ResponseMessage('Page updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLegalPageDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.pages.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('pages.manage')
  @ApiOperation({ summary: 'Delete a legal page' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.pages.delete(id, auditContext(user, request));
  }
}
