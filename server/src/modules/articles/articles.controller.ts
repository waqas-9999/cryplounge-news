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
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { ArticlesService } from './articles.service';
import { ArticleQueryDto, CreateArticleDto, UpdateArticleDto } from './dto/article.dto';

@ApiTags('News')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Public()
  @Get()
  @ResponseMessage('Articles')
  @ApiOperation({ summary: 'List published articles' })
  list(@Query() query: ArticleQueryDto) {
    return this.articles.list(query, false);
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('news.read')
  @ResponseMessage('Articles')
  @ApiOperation({ summary: 'List articles in any status, including drafts' })
  listForAdmin(@Query() query: ArticleQueryDto) {
    return this.articles.list(query, true);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Article')
  @ApiOperation({ summary: 'Fetch a published article by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.articles.findBySlug(slug, false);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('news.read')
  @ResponseMessage('Article')
  byId(@Param('id') id: string) {
    return this.articles.findById(id);
  }

  @Get(':id/versions')
  @ApiBearerAuth()
  @RequirePermissions('news.read')
  @ResponseMessage('Version history')
  versions(@Param('id') id: string) {
    return this.articles.versions(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('news.create')
  @ResponseMessage('Article created')
  create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.articles.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('news.update')
  @ResponseMessage('Article updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.articles.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('news.delete')
  @ApiOperation({ summary: 'Soft delete; the row is retained and restorable' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.articles.remove(id, user, auditContext(user, request));
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @RequirePermissions('news.delete')
  @ResponseMessage('Article restored')
  restoreArticle(@Param('id') id: string) {
    return this.articles.restore(id);
  }
}

/** Shared shape for audit entries written from a controller. */
export function auditContext(user: AuthenticatedUser, request: Request) {
  return {
    user: { id: user.id, email: user.email },
    ipAddress:
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? request.ip,
  };
}
