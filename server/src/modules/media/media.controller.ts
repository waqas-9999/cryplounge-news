import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
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
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { MediaQueryDto, UpdateMediaDto, UploadMediaDto } from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  @RequirePermissions('media.read')
  @ResponseMessage('Media')
  list(@Query() query: MediaQueryDto) {
    return this.media.list(query);
  }

  @Get('folders')
  @RequirePermissions('media.read')
  @ResponseMessage('Folders')
  folders() {
    return this.media.folders();
  }

  @Get('stats')
  @RequirePermissions('media.read')
  @ResponseMessage('Storage statistics')
  stats() {
    return this.media.storageStats();
  }

  @Get(':id')
  @RequirePermissions('media.read')
  @ResponseMessage('File')
  @ApiOperation({ summary: 'File metadata plus everywhere it is referenced' })
  byId(@Param('id') id: string) {
    return this.media.findById(id);
  }

  @Post()
  @RequirePermissions('media.upload')
  @ResponseMessage('File uploaded')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload an image',
    description:
      'Raster images only. The declared content type is verified against the ' +
      'file\u2019s magic bytes, so a mislabelled upload is rejected.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        altText: { type: 'string' },
        title: { type: 'string' },
      },
    },
  })
  // Memory storage: the file must be inspected before anything touches disk.
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.media.upload(file, dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @RequirePermissions('media.upload')
  @ResponseMessage('File updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.media.update(id, dto, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('media.delete')
  @ApiOperation({
    summary: 'Delete a file',
    description:
      'Refused while the file is still referenced unless force=true, because ' +
      'deleting an in-use image breaks published pages.',
  })
  remove(
    @Param('id') id: string,
    @Query('force', new ParseBoolPipe({ optional: true })) force: boolean | undefined,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.media.remove(id, { force: force ?? false }, user, auditContext(user, request));
  }
}
