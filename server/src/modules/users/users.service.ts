import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, Role } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { Paginated } from '@/common/dto/api-response.dto';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { AuthService } from '../auth/auth.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type {
  InviteUserDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto/user.dto';

/**
 * Columns safe to return.
 *
 * Explicit rather than an exclusion, so adding a sensitive column to the
 * schema cannot leak it by default — passwordHash, invite and reset tokens are
 * never in a response.
 */
const PUBLIC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  additionalRoles: { select: { key: true, name: true } },
} satisfies Prisma.UserSelect;

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly audit: AuditService
  ) {}

  async list(query: UserQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: PUBLIC_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return Paginated.from(items, total, query.page, query.perPage);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
    if (!user) throw new NotFoundException({ message: 'User not found', code: 'NOT_FOUND' });
    return user;
  }

  /** The account's own audit trail, for the activity history panel. */
  async activity(id: string, limit = 50) {
    await this.findById(id);
    return this.prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    });
  }

  /**
   * Invite a colleague.
   *
   * Returns the raw token exactly once so the caller can build the link. Only
   * its hash is stored, so a database read cannot be turned into an account
   * takeover.
   */
  /**
   * Invite a colleague, or — if the email already belongs to an active
   * account — grant that account an *additional* role.
   *
   * The two paths share an endpoint deliberately: granting a second role is
   * only ever "invite this same person again for the other role", so a
   * super admin re-uses the same form instead of a separate role-editing UI
   * that could bypass the acceptance step.
   */
  async invite(dto: InviteUserDto, actor: AuthenticatedUser, context: AuditContext) {
    const email = dto.email.toLowerCase().trim();

    const roleDefinition = await this.prisma.roleDefinition.findUnique({ where: { key: dto.role } });
    if (!roleDefinition) {
      throw new BadRequestException({ message: `Unknown role: ${dto.role}`, code: 'UNKNOWN_ROLE' });
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
      include: { additionalRoles: { select: { key: true } } },
    });

    if (existing) {
      return this.inviteAdditionalRole(existing, roleDefinition.key, actor, context);
    }

    // A brand-new account's primary role is the fixed `Role` enum column —
    // custom roles can only be granted as an additional role above.
    if (!this.isPrimaryRole(dto.role)) {
      throw new BadRequestException({
        message: 'A new account must be created with one of the built-in roles; custom roles can only be granted as an additional role to an existing account',
        code: 'INVALID_PRIMARY_ROLE',
      });
    }
    this.assertMayAssignRole(dto.role, actor);

    const token = randomBytes(32).toString('base64url');

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name,
        role: dto.role,
        // Unusable placeholder: argon2.verify never matches it, so the account
        // cannot be signed into until the invite is accepted.
        passwordHash: 'invite-pending',
        isActive: false,
        inviteToken: this.hash(token),
        inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
      select: PUBLIC_SELECT,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: user.id,
      summary: `Invited ${user.email} as ${user.role}`,
      context,
    });

    return { user, inviteToken: token };
  }

  /** Grant an existing, active account an additional role — super admin only. */
  private async inviteAdditionalRole(
    existing: { id: string; email: string; role: Role; isActive: boolean; additionalRoles: { key: string }[] },
    roleKey: string,
    actor: AuthenticatedUser,
    context: AuditContext
  ) {
    if (actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Only a super admin can grant an additional role to an existing account',
        code: 'FORBIDDEN',
      });
    }
    if (!existing.isActive) {
      throw new BadRequestException({
        message: 'An account with this email already exists',
        code: 'DUPLICATE_ENTRY',
      });
    }
    if (existing.role === roleKey || existing.additionalRoles.some(r => r.key === roleKey)) {
      throw new BadRequestException({
        message: 'This account already holds that role',
        code: 'DUPLICATE_ROLE',
      });
    }

    const token = randomBytes(32).toString('base64url');
    const user = await this.prisma.user.update({
      where: { id: existing.id },
      data: {
        pendingRoleKey: roleKey,
        inviteToken: this.hash(token),
        inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
      select: PUBLIC_SELECT,
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'User',
      entityId: existing.id,
      summary: `Invited ${existing.email} to accept the additional role ${roleKey}`,
      context,
    });

    return { user, inviteToken: token };
  }

  private isPrimaryRole(key: string): key is Role {
    return (Object.values(Role) as string[]).includes(key);
  }

  /** Look up an invite by its raw token without consuming it, for the accept-invite screen. */
  async previewInvite(token: string) {
    const user = await this.prisma.user.findFirst({ where: { inviteToken: this.hash(token) } });

    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException({
        message: 'This invitation is invalid or has expired',
        code: 'INVALID_TOKEN',
      });
    }

    const roleDefinition = await this.prisma.roleDefinition.findUnique({
      where: { key: user.pendingRoleKey ?? user.role },
    });

    return {
      mode: user.pendingRoleKey ? ('grant' as const) : ('signup' as const),
      name: user.name,
      email: user.email,
      roleName: roleDefinition?.name ?? user.pendingRoleKey ?? user.role,
    };
  }

  /**
   * Accept an invitation.
   *
   * Two distinct outcomes share this one entry point: a brand-new account
   * sets its first password and activates, while an already-active account
   * accepting an additional-role grant only needs the token — `password` is
   * ignored for that path.
   */
  async acceptInvite(token: string, password?: string) {
    const user = await this.prisma.user.findFirst({
      where: { inviteToken: this.hash(token) },
    });

    if (!user || !user.inviteExpiresAt || user.inviteExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException({
        message: 'This invitation is invalid or has expired',
        code: 'INVALID_TOKEN',
      });
    }

    if (user.pendingRoleKey) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          additionalRoles: { connect: { key: user.pendingRoleKey } },
          pendingRoleKey: null,
          inviteToken: null,
          inviteExpiresAt: null,
        },
      });

      // The permission set just changed; force a clean re-read instead of
      // waiting for the current access token to expire.
      await this.auth.revokeAllForUser(user.id);

      await this.audit.record({
        action: AuditAction.ROLE_CHANGE,
        entity: 'User',
        entityId: user.id,
        summary: `${user.email} accepted the additional role ${user.pendingRoleKey}`,
        context: { actorLabel: user.email },
      });
      return;
    }

    if (!password) {
      throw new BadRequestException({
        message: 'A password is required to activate this account',
        code: 'PASSWORD_REQUIRED',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.auth.hashPassword(password),
        isActive: true,
        inviteToken: null,
        inviteExpiresAt: null,
      },
    });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user.id,
      summary: `${user.email} accepted their invitation`,
      context: { actorLabel: user.email },
    });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: AuthenticatedUser,
    context: AuditContext
  ) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ message: 'User not found', code: 'NOT_FOUND' });

    if (dto.role && dto.role !== existing.role) {
      this.assertMayAssignRole(dto.role, actor);
      await this.assertNotLastSuperAdmin(existing, dto.role);
    }

    if (dto.isActive === false) {
      if (existing.id === actor.id) {
        throw new BadRequestException({
          message: 'You cannot disable your own account',
          code: 'SELF_LOCKOUT',
        });
      }
      await this.assertNotLastSuperAdmin(existing, undefined, true);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
      select: PUBLIC_SELECT,
    });

    // A role change or a disable must take effect now, not when the current
    // access token happens to expire.
    if (dto.role !== undefined || dto.isActive === false) {
      await this.auth.revokeAllForUser(id);
    }

    if (dto.role && dto.role !== existing.role) {
      await this.audit.record({
        action: AuditAction.ROLE_CHANGE,
        entity: 'User',
        entityId: id,
        summary: `Changed ${user.email} from ${existing.role} to ${dto.role}`,
        context,
      });
    } else {
      await this.audit.record({
        action: AuditAction.UPDATE,
        entity: 'User',
        entityId: id,
        summary: `Updated ${user.email}`,
        context,
      });
    }

    return user;
  }

  /** Self-service profile edit; cannot change role or activation. */
  async updateOwnProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
      select: PUBLIC_SELECT,
    });
  }

  /**
   * Begin a password reset.
   *
   * Always resolves, whether or not the address is registered — a differing
   * response would confirm which emails have accounts.
   */
  async requestPasswordReset(email: string): Promise<{ token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      this.logger.log(`Password reset requested for unknown or inactive address`);
      return {};
    }

    const token = randomBytes(32).toString('base64url');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: this.hash(token),
        passwordResetAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    // Returned for the mail service to deliver. It is never sent to the
    // requester in the HTTP response.
    return { token };
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: this.hash(token) },
    });

    if (!user || !user.passwordResetAt || user.passwordResetAt.getTime() < Date.now()) {
      throw new BadRequestException({
        message: 'This reset link is invalid or has expired',
        code: 'INVALID_TOKEN',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await this.auth.hashPassword(password),
        passwordResetToken: null,
        passwordResetAt: null,
      },
    });

    await this.auth.revokeAllForUser(user.id);

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'User',
      entityId: user.id,
      summary: `${user.email} reset their password`,
      context: { actorLabel: user.email },
    });
  }

  /**
   * Accounts are usually deactivated, not deleted — see `remove` for the
   * exception. Deactivating keeps the row so bylines and audit entries that
   * reference it stay intact.
   */
  async deactivate(id: string, actor: AuthenticatedUser, context: AuditContext) {
    return this.update(id, { isActive: false }, actor, context);
  }

  /**
   * Hard-delete an account. Super admin only.
   *
   * Bylines live on the separate `Author` model and audit/content rows
   * reference the user with `onDelete: SetNull`, so removing the row doesn't
   * orphan anything — it just anonymizes past entries.
   */
  async remove(id: string, actor: AuthenticatedUser, context: AuditContext) {
    if (actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Only a super admin can delete an account',
        code: 'FORBIDDEN',
      });
    }

    if (id === actor.id) {
      throw new BadRequestException({
        message: 'You cannot delete your own account',
        code: 'SELF_LOCKOUT',
      });
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ message: 'User not found', code: 'NOT_FOUND' });

    await this.assertNotLastSuperAdmin(existing, undefined, true);

    await this.auth.revokeAllForUser(id);
    await this.prisma.user.delete({ where: { id } });

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'User',
      entityId: id,
      summary: `Deleted ${existing.email}`,
      context,
    });
  }

  /* ------------------------------------------------------------ guards --- */

  /**
   * Only a SUPER_ADMIN may grant SUPER_ADMIN.
   *
   * Without this an ADMIN holding users.manage could promote themselves and
   * escape every remaining restriction.
   */
  private assertMayAssignRole(role: Role, actor: AuthenticatedUser): void {
    if (role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Only a super admin can grant the super admin role',
        code: 'FORBIDDEN',
      });
    }
  }

  /** Refuses the change that would leave nobody able to administer the site. */
  private async assertNotLastSuperAdmin(
    user: { id: string; role: Role },
    newRole?: Role,
    deactivating = false
  ): Promise<void> {
    const losingSuperAdmin =
      user.role === Role.SUPER_ADMIN &&
      (deactivating || (newRole !== undefined && newRole !== Role.SUPER_ADMIN));

    if (!losingSuperAdmin) return;

    const remaining = await this.prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true, id: { not: user.id } },
    });

    if (remaining === 0) {
      throw new BadRequestException({
        message: 'This is the only active super admin; promote another account first',
        code: 'LAST_SUPER_ADMIN',
      });
    }
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
