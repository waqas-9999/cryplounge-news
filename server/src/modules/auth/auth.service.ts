import { createHash, randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { authConfig } from '@/config/configuration';
import { PrismaService } from '@/prisma/prisma.service';
import type { JwtPayload } from './jwt.strategy';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Authentication.
 *
 * Argon2id for passwords, per the brief's preference. Refresh tokens are
 * opaque random strings stored only as SHA-256 hashes and rotated on every
 * use: presenting an already-rotated token means it leaked, so the entire
 * chain for that user is revoked rather than just rejecting the request.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>
  ) {}

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async hashPassword(plaintext: string): Promise<string> {
    return argon2.hash(plaintext, { type: argon2.argon2id });
  }

  async verifyPassword(hash: string, plaintext: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plaintext);
    } catch {
      // A malformed stored hash must read as "wrong password", never as an error.
      return false;
    }
  }

  /**
   * Verify credentials and issue a token pair.
   *
   * Failures are indistinguishable to the caller — unknown email and wrong
   * password return the same error after comparable work, so the endpoint
   * cannot be used to discover which accounts exist.
   */
  async login(email: string, password: string, context: RequestContext = {}): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      await this.burnTime();
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await this.verifyPassword(user.passwordHash, password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user.id, user.email, user.role, context);
  }

  /**
   * Exchange a refresh token for a new pair.
   *
   * Reuse detection: if the presented token was already rotated or revoked,
   * every refresh token for that user is revoked immediately.
   */
  async refresh(refreshToken: string, context: RequestContext = {}): Promise<TokenPair> {
    const tokenHash = AuthService.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt || stored.replacedById) {
      this.logger.warn(
        `Refresh token reuse detected for user ${stored.userId}; revoking all sessions`
      );
      await this.revokeAllForUser(stored.userId);
      throw new ForbiddenException('Refresh token has already been used');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const pair = await this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      context
    );

    const replacement = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: AuthService.hashToken(pair.refreshToken) },
      select: { id: true },
    });

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedById: replacement?.id },
    });

    return pair;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: AuthService.hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async changePassword(userId: string, current: string, next: string): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (!(await this.verifyPassword(user.passwordHash, current))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.hashPassword(next) },
    });

    // A password change invalidates every existing session.
    await this.revokeAllForUser(userId);
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    context: RequestContext
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, role };

    // jsonwebtoken types `expiresIn` as a template-literal union ("15m", "7d",
    // ...). Our value comes from validated config, so the object is widened
    // here rather than duplicating that union in the env schema.
    const signOptions = {
      secret: this.config.accessSecret,
      expiresIn: this.config.accessTtl,
    } as JwtSignOptions;

    const accessToken = await this.jwt.signAsync(payload, signOptions);

    const refreshToken = randomBytes(48).toString('base64url');

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: AuthService.hashToken(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + this.ttlToMs(this.config.refreshTtl)),
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
    });

    return { accessToken, refreshToken, expiresIn: this.config.accessTtl };
  }

  /** Converts "15m" / "7d" / "3600" into milliseconds. */
  private ttlToMs(ttl: string): number {
    const match = /^(\d+)([smhd])?$/.exec(ttl.trim());
    if (!match) throw new Error(`Unrecognised TTL format: ${ttl}`);

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multipliers: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return amount * multipliers[unit];
  }

  /** Equalises response time when the account does not exist. */
  private async burnTime(): Promise<void> {
    await argon2.hash(randomBytes(16).toString('hex'), { type: argon2.argon2id });
  }
}
