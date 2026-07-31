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
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateResearchDto, ResearchQueryDto, UpdateResearchDto } from './dto/research.dto';
import { ResearchService } from './research.service';

@ApiTags('Research')
@Controller('research')
export class ResearchController {
  constructor(private readonly research: ResearchService) {}

  @Public()
  @Get()
  @ResponseMessage('Research')
  @ApiOperation({ summary: 'List published research reports' })
  list(@Query() query: ResearchQueryDto) {
    return this.research.list(query, false);
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('research.read')
  @ResponseMessage('Research')
  listForAdmin(@Query() query: ResearchQueryDto) {
    return this.research.list(query, true);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Research report')
  bySlug(@Param('slug') slug: string) {
    return this.research.findBySlug(slug, false);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('research.read')
  @ResponseMessage('Research report')
  byId(@Param('id') id: string) {
    return this.research.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('research.create')
  @ResponseMessage('Research created')
  create(
    @Body() dto: CreateResearchDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.research.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('research.update')
  @ResponseMessage('Research updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateResearchDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.research.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('research.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.research.remove(id, user, auditContext(user, request));
  }
}
