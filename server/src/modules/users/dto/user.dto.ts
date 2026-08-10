import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * Invite rather than create-with-password.
 *
 * An administrator never chooses someone else's password: the invitee sets it
 * from a single-use token, so the credential is never known to a third party
 * or transmitted through a side channel.
 */
export class InviteUserDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Must be a valid email address' })
  @MaxLength(200)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description:
      'RoleDefinition key. A brand-new account must use one of the built-in ' +
      'Role enum values. Any role (including custom ones) may be granted as ' +
      'an *additional* role when the email already belongs to an active ' +
      'account — that path is super-admin only.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  role!: string;
}

export class AcceptInviteDto {
  @ApiProperty({ description: 'Token from the invitation link' })
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiPropertyOptional({
    minLength: 12,
    description:
      'Required to activate a brand-new account. Omitted when accepting an ' +
      'additional-role grant on an already-active account.',
  })
  @IsOptional()
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(200)
  password?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Requires roles.manage' })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: 'Disabling revokes the account\u2019s sessions' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

/** Self-service profile edit. Deliberately cannot touch role or isActive. */
export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(200)
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty({ minLength: 12 })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(200)
  password!: string;
}

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
