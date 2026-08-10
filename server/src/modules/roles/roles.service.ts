import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Role } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import { AuthService } from '../auth/auth.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto';

/**
 * Roles and their permission grants.
 *
 * Grants live in the database precisely so they can change without a deploy.
 * The safeguards below exist because that flexibility is also how an
 * administrator can accidentally lock everyone out.
 */
@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
    private readonly audit: AuditService
  ) {}

  async list() {
    const roles = await this.prisma.roleDefinition.findMany({
      orderBy: { key: 'asc' },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    // Count holders so the admin can see the blast radius before editing.
    const counts = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });
    const holders = new Map(counts.map(row => [row.role as string, row._count._all]));

    return roles.map(role => ({
      id: role.id,
      key: role.key,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      userCount: holders.get(role.key) ?? 0,
      permissions: role.permissions.map(rp => rp.permission.key).sort(),
    }));
  }

  /** The full catalogue, grouped for the permission matrix UI. */
  async listPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    const grouped = new Map<string, typeof permissions>();
    for (const permission of permissions) {
      const bucket = grouped.get(permission.module) ?? [];
      bucket.push(permission);
      grouped.set(permission.module, bucket);
    }

    return [...grouped.entries()].map(([module, items]) => ({ module, permissions: items }));
  }

  /**
   * Create a custom role — super admin only. New roles can be granted to
   * existing accounts as an *additional* role (see `UsersService.invite`);
   * they cannot be a brand-new account's primary role, which stays fixed to
   * the `Role` enum.
   */
  async create(dto: CreateRoleDto, actor: AuthenticatedUser, context: AuditContext) {
    if (actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Only a super admin can create a role',
        code: 'FORBIDDEN',
      });
    }

    const existing = await this.prisma.roleDefinition.findUnique({ where: { key: dto.key } });
    if (existing) {
      throw new BadRequestException({
        message: `Role ${dto.key} already exists`,
        code: 'DUPLICATE_ENTRY',
      });
    }

    let permissions: { id: string; key: string }[] = [];
    if (dto.permissionKeys?.length) {
      permissions = await this.prisma.permission.findMany({
        where: { key: { in: dto.permissionKeys } },
      });
      const known = new Set(permissions.map(p => p.key));
      const unknown = dto.permissionKeys.filter(k => !known.has(k));
      if (unknown.length > 0) {
        throw new BadRequestException({
          message: `Unknown permission keys: ${unknown.join(', ')}`,
          code: 'UNKNOWN_PERMISSION',
        });
      }
    }

    const role = await this.prisma.roleDefinition.create({
      data: {
        key: dto.key,
        name: dto.name,
        description: dto.description,
        isSystem: false,
        permissions: {
          create: permissions.map(permission => ({ permissionId: permission.id })),
        },
      },
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'RoleDefinition',
      entityId: role.id,
      summary: `Created role ${role.key}`,
      context,
    });

    return this.list();
  }

  async update(key: string, dto: UpdateRoleDto, context: AuditContext) {
    const role = await this.requireRole(key);

    if (role.isSystem && dto.name) {
      throw new BadRequestException({
        message: 'System roles cannot be renamed',
        code: 'SYSTEM_ROLE',
      });
    }

    const updated = await this.prisma.roleDefinition.update({
      where: { key },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
    });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'RoleDefinition',
      entityId: updated.id,
      summary: `Updated role ${updated.key}`,
      context,
    });

    return updated;
  }

  /**
   * Replace a role's grants.
   *
   * SUPER_ADMIN is not editable: it is the break-glass role the guards short-
   * circuit on, so narrowing it here would create a role whose stored grants
   * disagree with its actual power.
   */
  async setPermissions(
    key: string,
    dto: UpdateRolePermissionsDto,
    actor: AuthenticatedUser,
    context: AuditContext
  ) {
    if (actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({
        message: 'Only a super admin can change permission grants',
        code: 'FORBIDDEN',
      });
    }

    if (key === Role.SUPER_ADMIN) {
      throw new BadRequestException({
        message: 'The super admin role always holds every permission and cannot be edited',
        code: 'SYSTEM_ROLE',
      });
    }

    const role = await this.requireRole(key);

    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: dto.permissionKeys } },
    });

    // Reject unknown keys rather than silently dropping them — a typo that
    // quietly removes access is worse than an error.
    const known = new Set(permissions.map(permission => permission.key));
    const unknown = dto.permissionKeys.filter(k => !known.has(k));
    if (unknown.length > 0) {
      throw new BadRequestException({
        message: `Unknown permission keys: ${unknown.join(', ')}`,
        code: 'UNKNOWN_PERMISSION',
      });
    }

    const before = await this.prisma.rolePermission.findMany({
      where: { roleId: role.id },
      include: { permission: true },
    });

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map(permission => ({
          roleId: role.id,
          permissionId: permission.id,
        })),
        skipDuplicates: true,
      }),
    ]);

    // Permissions are resolved per request from the database, but revoking
    // sessions makes the change unambiguous and forces a clean re-read.
    const affected = await this.prisma.user.findMany({
      where: { role: key as Role },
      select: { id: true },
    });
    await Promise.all(affected.map(user => this.auth.revokeAllForUser(user.id)));

    await this.audit.record({
      action: AuditAction.PERMISSION_CHANGE,
      entity: 'RoleDefinition',
      entityId: role.id,
      summary: `Changed permissions for role ${key} (${affected.length} account(s) affected)`,
      context,
      metadata: {
        before: before.map(rp => rp.permission.key).sort(),
        after: [...known].sort(),
      },
    });

    return this.list();
  }

  private async requireRole(key: string) {
    const role = await this.prisma.roleDefinition.findUnique({ where: { key } });
    if (!role) {
      throw new NotFoundException({ message: `Role ${key} not found`, code: 'NOT_FOUND' });
    }
    return role;
  }
}
