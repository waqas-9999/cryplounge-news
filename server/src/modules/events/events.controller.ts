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
import { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto/event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Public()
  @Get()
  @ResponseMessage('Events')
  @ApiOperation({ summary: 'List published events; defaults to upcoming' })
  list(@Query() query: EventQueryDto) {
    return this.events.list(query, false);
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('events.read')
  @ResponseMessage('Events')
  listForAdmin(@Query() query: EventQueryDto) {
    return this.events.list(query, true);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Event')
  bySlug(@Param('slug') slug: string) {
    return this.events.findBySlug(slug, false);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('events.read')
  @ResponseMessage('Event')
  byId(@Param('id') id: string) {
    return this.events.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('events.create')
  @ResponseMessage('Event created')
  create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.events.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('events.update')
  @ResponseMessage('Event updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.events.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('events.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.events.remove(id, user, auditContext(user, request));
  }
}
