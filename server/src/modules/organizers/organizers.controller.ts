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
import { CreateOrganizerDto, OrganizerQueryDto, UpdateOrganizerDto } from './dto/organizer.dto';
import { OrganizersService } from './organizers.service';

@ApiTags('Organizers')
@Controller('organizers')
export class OrganizersController {
  constructor(private readonly organizers: OrganizersService) {}

  @Public()
  @Get()
  @ResponseMessage('Organizers')
  @ApiOperation({ summary: 'List event organizers' })
  list(@Query() query: OrganizerQueryDto) {
    return this.organizers.list(query);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Organizer')
  byId(@Param('id') id: string) {
    return this.organizers.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('organizers.create')
  @ResponseMessage('Organizer created')
  create(
    @Body() dto: CreateOrganizerDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.organizers.create(dto, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('organizers.update')
  @ResponseMessage('Organizer updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizerDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.organizers.update(id, dto, auditContext(user, request));
  }

  @Post(':id/verify')
  @ApiBearerAuth()
  @RequirePermissions('organizers.update')
  @ResponseMessage('Organizer verified')
  verify(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.organizers.update(id, { verified: true }, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('organizers.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.organizers.remove(id, user, auditContext(user, request));
  }
}
