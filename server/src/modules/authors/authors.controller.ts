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
import { PaginationQueryDto } from '@/common/dto/pagination.dto';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto, UpdateAuthorDto } from './dto/author.dto';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authors: AuthorsService) {}

  @Public()
  @Get()
  @ResponseMessage('Authors')
  list(@Query() query: PaginationQueryDto) {
    return this.authors.list(query);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Author')
  @ApiOperation({ summary: 'Author profile with their published work' })
  bySlug(@Param('slug') slug: string) {
    return this.authors.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('authors.manage')
  @ResponseMessage('Author created')
  create(
    @Body() dto: CreateAuthorDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.authors.create(dto, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('authors.manage')
  @ResponseMessage('Author updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.authors.update(id, dto, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('authors.manage')
  @ApiOperation({ summary: 'Delete an author; refused while they still have bylines' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.authors.remove(id, auditContext(user, request));
  }
}
