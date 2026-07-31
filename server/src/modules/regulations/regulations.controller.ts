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
import {
  CreateRegulationDto,
  RegulationQueryDto,
  UpdateRegulationDto,
} from './dto/regulation.dto';
import { RegulationsService } from './regulations.service';

@ApiTags('Regulation')
@Controller('regulations')
export class RegulationsController {
  constructor(private readonly regulations: RegulationsService) {}

  @Public()
  @Get()
  @ResponseMessage('Regulations')
  @ApiOperation({ summary: 'List published regulations, filterable by country and region' })
  list(@Query() query: RegulationQueryDto) {
    return this.regulations.list(query, false);
  }

  @Public()
  @Get('jurisdictions')
  @ResponseMessage('Jurisdictions')
  @ApiOperation({ summary: 'Countries and regions that have published coverage' })
  jurisdictions() {
    return this.regulations.jurisdictions();
  }

  @Get('admin')
  @ApiBearerAuth()
  @RequirePermissions('regulations.read')
  @ResponseMessage('Regulations')
  listForAdmin(@Query() query: RegulationQueryDto) {
    return this.regulations.list(query, true);
  }

  @Public()
  @Get('slug/:slug')
  @ResponseMessage('Regulation')
  bySlug(@Param('slug') slug: string) {
    return this.regulations.findBySlug(slug, false);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('regulations.read')
  @ResponseMessage('Regulation')
  byId(@Param('id') id: string) {
    return this.regulations.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('regulations.create')
  @ResponseMessage('Regulation created')
  create(
    @Body() dto: CreateRegulationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.regulations.create(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('regulations.update')
  @ResponseMessage('Regulation updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRegulationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.regulations.update(id, dto, user, auditContext(user, request));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('regulations.delete')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.regulations.remove(id, user, auditContext(user, request));
  }
}
