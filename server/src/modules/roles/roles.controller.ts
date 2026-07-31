import { Body, Controller, Get, Param, Patch, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UpdateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles & Permissions')
@Controller()
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get('roles')
  @ApiBearerAuth()
  @RequirePermissions('users.read')
  @ResponseMessage('Roles')
  @ApiOperation({ summary: 'Roles with their grants and how many accounts hold each' })
  list() {
    return this.roles.list();
  }

  @Get('permissions')
  @ApiBearerAuth()
  @RequirePermissions('users.read')
  @ResponseMessage('Permissions')
  @ApiOperation({ summary: 'The permission catalogue, grouped by module' })
  listPermissions() {
    return this.roles.listPermissions();
  }

  @Patch('roles/:key')
  @ApiBearerAuth()
  @RequirePermissions('roles.manage')
  @ResponseMessage('Role updated')
  update(
    @Param('key') key: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.roles.update(key, dto, auditContext(user, request));
  }

  @Put('roles/:key/permissions')
  @ApiBearerAuth()
  @RequirePermissions('roles.manage')
  @ResponseMessage('Permissions updated')
  @ApiOperation({
    summary: 'Replace a role\u2019s permission grants',
    description:
      'PUT because the body is the complete set, not a delta. Super admin ' +
      'cannot be edited: the guards short-circuit on it, so narrowing its ' +
      'stored grants would misrepresent its actual power.',
  })
  setPermissions(
    @Param('key') key: string,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.roles.setPermissions(key, dto, user, auditContext(user, request));
  }
}
