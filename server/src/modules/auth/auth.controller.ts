import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ApiErrorResponse } from '@/common/dto/api-response.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto, LoginDto, RefreshDto, TokenPairDto } from './dto/auth.dto';
import type { AuthenticatedUser } from './jwt.strategy';

/**
 * Controllers stay thin: read the request, delegate, return. All logic lives
 * in AuthService.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Signed in')
  @ApiOperation({ summary: 'Exchange credentials for an access and refresh token' })
  @ApiResponse({ status: 200, type: TokenPairDto })
  @ApiResponse({ status: 401, type: ApiErrorResponse, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto, @Req() request: Request): Promise<TokenPairDto> {
    return this.auth.login(dto.email, dto.password, context(request));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Token refreshed')
  @ApiOperation({ summary: 'Rotate a refresh token for a new pair' })
  @ApiResponse({ status: 200, type: TokenPairDto })
  @ApiResponse({ status: 403, type: ApiErrorResponse, description: 'Token reuse detected' })
  refresh(@Body() dto: RefreshDto, @Req() request: Request): Promise<TokenPairDto> {
    return this.auth.refresh(dto.refreshToken, context(request));
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a refresh token' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ResponseMessage('Current user')
  @ApiOperation({ summary: 'The authenticated user and their permissions' })
  me(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Post('password/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password; revokes all existing sessions' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto
  ): Promise<void> {
    await this.auth.changePassword(userId, dto.currentPassword, dto.newPassword);
  }
}

function context(request: Request) {
  return {
    ipAddress: (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip,
    userAgent: request.headers['user-agent'],
  };
}
