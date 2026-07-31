import {
  Body,
  Controller,
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
  AcceptInviteDto,
  ForgotPasswordDto,
  InviteUserDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /* --------------------------------------------------------- self-serve --- */

  @Get('me')
  @ApiBearerAuth()
  @ResponseMessage('Your profile')
  me(@CurrentUser('id') id: string) {
    return this.users.findById(id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ResponseMessage('Profile updated')
  @ApiOperation({ summary: 'Edit your own name and avatar; cannot change role' })
  updateMe(@CurrentUser('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateOwnProfile(id, dto);
  }

  /* -------------------------------------------------- unauthenticated ----- */

  @Public()
  @Post('invite/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Accept an invitation and set the first password' })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.users.acceptInvite(dto.token, dto.password);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Request a password reset',
    description:
      'Always returns 202, whether or not the address is registered, so the ' +
      'endpoint cannot be used to discover which emails have accounts.',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    // The token goes to the mail service, never into this response.
    await this.users.requestPasswordReset(dto.email);
    return { message: 'If that address has an account, a reset link has been sent' };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Set a new password using a reset token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.users.resetPassword(dto.token, dto.password);
  }

  /* ------------------------------------------------------ administration --- */

  @Get()
  @ApiBearerAuth()
  @RequirePermissions('users.read')
  @ResponseMessage('Users')
  list(@Query() query: UserQueryDto) {
    return this.users.list(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('users.read')
  @ResponseMessage('User')
  byId(@Param('id') id: string) {
    return this.users.findById(id);
  }

  @Get(':id/activity')
  @ApiBearerAuth()
  @RequirePermissions('audit.read')
  @ResponseMessage('Activity history')
  activity(@Param('id') id: string) {
    return this.users.activity(id);
  }

  @Post('invite')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @ResponseMessage('Invitation created')
  @ApiOperation({
    summary: 'Invite a colleague',
    description:
      'Returns the raw invite token once so the caller can build the link. ' +
      'Only its hash is stored.',
  })
  invite(
    @Body() dto: InviteUserDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.invite(dto, user, auditContext(user, request));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @ResponseMessage('User updated')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.update(id, dto, user, auditContext(user, request));
  }

  @Post(':id/deactivate')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @ResponseMessage('User deactivated')
  @ApiOperation({
    summary: 'Deactivate an account',
    description:
      'Accounts are never deleted: their name is attached to bylines and audit ' +
      'entries, and removing the row would orphan both.',
  })
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.deactivate(id, user, auditContext(user, request));
  }
}
