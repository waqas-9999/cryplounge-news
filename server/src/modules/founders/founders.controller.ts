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
import { CreateFounderDto, FounderQueryDto, UpdateFounderDto } from './dto/founder.dto';
import { FoundersService } from './founders.service';

@ApiTags('Founders')
@Controller('founders')
export class FoundersController {
  constructor(private readonly founders: FoundersService) {}

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
