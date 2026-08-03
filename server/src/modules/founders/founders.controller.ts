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
import { CreateFounderDto, FounderQueryDto, UpdateFounderDto } from './dto/founder.dto';
import { SubmitFounderDto } from './dto/submit-founder.dto';
import { FoundersService } from './founders.service';

@ApiTags('Founders')
@Controller('founders')
export class FoundersController {
  constructor(
    private readonly founders: FoundersService,
    private readonly media: MediaService
  ) {}

  @Public()
  @Post('submit/photo')
  @ResponseMessage('Photo uploaded')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile photo for a public story submission' })
  @ApiBody({
    schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadSubmissionPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.media.uploadAnonymous(file, { folder: 'founder-submissions' });
  }

  @Public()
  @Get()
  @ResponseMessage('Founders')
  @ApiOperation({ summary: 'List published founder profiles' })
  list(@Query() query: FounderQueryDto) {
    return this.founders.list(query, false);
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('founders.read')
  @ResponseMessage('Founders')
  listForAdmin(@Query() query: FounderQueryDto) {
    return this.founders.list(query, true);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Founder')
  bySlug(@Param('slug') slug: string) {
    return this.founders.findBySlug(slug, false);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('founders.read')
  @ResponseMessage('Founder')
  byId(@Param('id') id: string) {
    return this.founders.findById(id);
  }

  @Public()
  @Post('submit')
  @ResponseMessage('Story submitted for review')
  @ApiOperation({ summary: 'Public founder story submission; always lands in REVIEW' })
  submit(@Body() dto: SubmitFounderDto) {
    return this.founders.submit(dto);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('founders.create')
  @ResponseMessage('Founder created')
  create(
    @Body() dto: CreateFounderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.founders.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('founders.update')
  @ResponseMessage('Founder updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFounderDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.founders.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('founders.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.founders.remove(id, user, auditContext(user, request));
  }
}
