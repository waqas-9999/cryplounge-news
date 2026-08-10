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

  @Post('me/avatar')
  @ApiBearerAuth()
  @ResponseMessage('Avatar updated')
  @ApiOperation({
    summary: 'Upload and set your own avatar',
    description:
      'Available to every staff account regardless of role — not gated behind ' +
      'the `media.upload` permission, since it only ever touches your own profile.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['file'], properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  updateMyAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.updateOwnAvatar(user.id, file, user, auditContext(user, request));
  }

  /* -------------------------------------------------- unauthenticated ----- */

  @Public()
  @Get('invite/:token')
  @ApiOperation({
    summary: 'Preview an invitation without consuming it',
    description:
      'Lets the accept-invite screen tell a brand-new signup ("set a password") ' +
      'apart from an additional-role grant on an already-active account ' +
      '("confirm the new role") before rendering the right form.',
  })
  previewInvite(@Param('token') token: string) {
    return this.users.previewInvite(token);
  }

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

  @Post(':id/roles/:key')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @ResponseMessage('Additional role granted')
  @ApiOperation({
    summary: 'Grant an additional role to an already-active account',
    description:
      'Super admin only, enforced in the service beyond the users.manage check ' +
      'here. Takes effect immediately — unlike `POST /users/invite`, there is ' +
      'no accept step.',
  })
  grantAdditionalRole(
    @Param('id') id: string,
    @Param('key') key: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.grantAdditionalRole(id, key, user, auditContext(user, request));
  }

  @Delete(':id/roles/:key')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @ResponseMessage('Additional role revoked')
  @ApiOperation({
    summary: 'Revoke a previously granted additional role',
    description: 'Super admin only, enforced in the service beyond the users.manage check here.',
  })
  revokeAdditionalRole(
    @Param('id') id: string,
    @Param('key') key: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.revokeAdditionalRole(id, key, user, auditContext(user, request));
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

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('users.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Permanently delete an account',
    description:
      'Super admin only, enforced in the service beyond the users.manage ' +
      'check here. Bylines live on a separate Author model and other rows ' +
      'reference the user with onDelete: SetNull, so this cannot orphan content.',
  })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.users.remove(id, user, auditContext(user, request));
  }
}
