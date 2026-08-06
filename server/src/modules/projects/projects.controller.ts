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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { MediaService } from '../media/media.service';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';
import { SubmitProjectDto } from './dto/submit-project.dto';
import { ProjectsService } from './projects.service';

@ApiTags('Ecosystem')
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projects: ProjectsService,
    private readonly media: MediaService
  ) {}

  @Public()
  @Post('submit/logo')
  @ResponseMessage('Logo uploaded')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a logo image for a public project submission' })
  @ApiBody({
    schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadSubmissionLogo(@UploadedFile() file: Express.Multer.File) {
    return this.media.uploadAnonymous(file, { folder: 'project-submissions' });
  }

  @Public()
  @Post('submit/cover')
  @ResponseMessage('Cover uploaded')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a cover image for a public project submission' })
  @ApiBody({
    schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadSubmissionCover(@UploadedFile() file: Express.Multer.File) {
    return this.media.uploadAnonymous(file, { folder: 'project-submissions' });
  }

  @Public()
  @Post('submit')
  @ResponseMessage('Project submitted for review')
  @ApiOperation({ summary: 'Public project submission; always lands in PENDING' })
  submit(@Body() dto: SubmitProjectDto) {
    return this.projects.submit(dto);
  }

  @Public()
  @Get()
  @ResponseMessage('Projects')
  @ApiOperation({ summary: 'List directory projects with filters' })
  list(@Query() query: ProjectQueryDto) {
    return this.projects.list(query);
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('projects.read')
  @ResponseMessage('Projects')
  @ApiOperation({ summary: 'List all projects for admin, including pending submissions' })
  listForAdmin(@Query() query: ProjectQueryDto) {
    return this.projects.list(query, true);
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

  @Public()
  @Get('collections')
  @ResponseMessage('Project collections')
  @ApiOperation({ summary: 'Curated project collections for the Ecosystem homepage' })
  collections() {
    return this.projects.collections();
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
