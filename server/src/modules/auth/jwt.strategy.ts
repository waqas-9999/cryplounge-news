import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { authConfig } from '@/config/configuration';
import { PrismaService } from '@/prisma/prisma.service';

export interface JwtPayload {
  /** User id. */
  sub: string;
  email: string;
  role: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

/**
 * Validates the access token and loads the caller.
 *
 * The user is re-read on every request rather than trusted from the token, so
 * a disabled account or a role change takes effect immediately instead of
 * lingering until the token expires.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(authConfig.KEY) config: ConfigType<typeof authConfig>,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    const role = await this.prisma.roleDefinition.findUnique({
      where: { key: user.role },
      include: { permissions: { include: { permission: true } } },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: role?.permissions.map(rp => rp.permission.key) ?? [],
    };
  }
}
