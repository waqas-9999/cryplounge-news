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
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Ecosystem')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Public()
  @Get()
  @ResponseMessage('Projects')
  @ApiOperation({ summary: 'List directory projects with filters' })
  list(@Query() query: ProjectQueryDto) {
    return this.projects.list(query);
  }

  @Public()
  @Get('facets')
  @ResponseMessage('Directory facets')
  @ApiOperation({ summary: 'Category and network counts for the browse sections' })
  facets() {
    return this.projects.facets();
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Project')
  @ApiOperation({ summary: 'Full project profile with related content' })
  bySlug(@Param('slug') slug: string) {
    return this.projects.findBySlug(slug);
  }

  @Public()
  @Get('slug/:slug/similar')
  @ResponseMessage('Similar projects')
  similar(@Param('slug') slug: string) {
    return this.projects.similar(slug);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('projects.read')
  @ResponseMessage('Project')
  byId(@Param('id') id: string) {
    return this.projects.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('projects.create')
  @ResponseMessage('Project created')
  create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.projects.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('projects.update')
  @ResponseMessage('Project updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.projects.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('projects.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.projects.remove(id, user, auditContext(user, request));
  }
}
