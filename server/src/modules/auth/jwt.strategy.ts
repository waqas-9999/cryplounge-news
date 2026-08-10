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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        additionalRoles: { select: { key: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }

    // Permissions are the union of the primary role's grants and any
    // additional roles a super admin has granted on top of it.
    const roleKeys = [user.role, ...user.additionalRoles.map(r => r.key)];
    const roles = await this.prisma.roleDefinition.findMany({
      where: { key: { in: roleKeys } },
      include: { permissions: { include: { permission: true } } },
    });

    const permissions = new Set<string>();
    for (const role of roles) {
      for (const rp of role.permissions) permissions.add(rp.permission.key);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: [...permissions],
    };
  }
}
