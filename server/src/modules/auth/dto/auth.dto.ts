import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'editor@cryplounge.com' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @MaxLength(200)
  email!: string;

  @ApiProperty({ example: 'a strong password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'The refresh token issued at login' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty({ minLength: 12, description: 'At least 12 characters' })
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(200)
  newPassword!: string;
}

export class TokenPairDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: '15m' })
  expiresIn!: string;
}
