import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import type { Paginated } from '@/common/dto/api-response.dto';
import { BaseCrudService } from '../content-core/base-crud.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import type { CreateOrganizerDto, OrganizerQueryDto, UpdateOrganizerDto } from './dto/organizer.dto';

const SELECT = {
  id: true,
  name: true,
  description: true,
  contactPerson: true,
  contactEmail: true,
  telegramUsername: true,
  telegramChannel: true,
  website: true,
  x: true,
  linkedin: true,
  verified: true,
  logo: { select: { id: true, path: true, altText: true } },
  createdAt: true,
} satisfies Prisma.OrganizerSelect;

/** Event organizers, referenced by one or more events. */
@Injectable()
export class OrganizersService extends BaseCrudService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {
    super(prisma.organizer, 'Organizer');
  }

  async list(query: OrganizerQueryDto): Promise<Paginated<unknown>> {
    const where: Prisma.OrganizerWhereInput = {
      ...(query.verified !== undefined ? { verified: query.verified } : {}),
    };

    return this.listPaginated(query, {
      where: where as Record<string, unknown>,
      select: SELECT as Record<string, unknown>,
      searchFields: ['name', 'contactEmail'],
      sortableFields: ['name', 'createdAt'],
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    return this.findByIdOrFail(id, { include: { logo: true } });
  }

  async create(dto: CreateOrganizerDto, context: AuditContext) {
    const organizer = await this.prisma.organizer.create({
      data: {
        name: dto.name,
        description: dto.description,
        logoId: dto.logoId,
        contactPerson: dto.contactPerson,
        contactEmail: dto.contactEmail,
        telegramUsername: dto.telegramUsername,
        telegramChannel: dto.telegramChannel,
        website: dto.website,
        x: dto.x,
        linkedin: dto.linkedin,
        verified: dto.verified ?? false,
      },
      include: { logo: true },
    });

    await this.audit.record({
      action: AuditAction.CREATE,
      entity: 'Organizer',
      entityId: organizer.id,
      summary: `Created organizer "${organizer.name}"`,
      context,
    });

    return organizer;
  }

  async update(id: string, dto: UpdateOrganizerDto, context: AuditContext) {
    await this.findByIdOrFail(id);

    const organizer = await this.prisma.organizer.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.logoId !== undefined ? { logoId: dto.logoId } : {}),
        ...(dto.contactPerson !== undefined ? { contactPerson: dto.contactPerson } : {}),
        ...(dto.contactEmail !== undefined ? { contactEmail: dto.contactEmail } : {}),
        ...(dto.telegramUsername !== undefined ? { telegramUsername: dto.telegramUsername } : {}),
        ...(dto.telegramChannel !== undefined ? { telegramChannel: dto.telegramChannel } : {}),
        ...(dto.website !== undefined ? { website: dto.website } : {}),
        ...(dto.x !== undefined ? { x: dto.x } : {}),
        ...(dto.linkedin !== undefined ? { linkedin: dto.linkedin } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
      },
      include: { logo: true },
    });

    await this.audit.record({
      action: AuditAction.UPDATE,
      entity: 'Organizer',
      entityId: organizer.id,
      summary: `Updated organizer "${organizer.name}"`,
      context,
    });

    return organizer;
  }

  async remove(id: string, _user: AuthenticatedUser, context: AuditContext) {
    const organizer = await this.findByIdOrFail<{ id: string; name: string }>(id);
    await this.softDelete(id);

    await this.audit.record({
      action: AuditAction.DELETE,
      entity: 'Organizer',
      entityId: id,
      summary: `Deleted organizer "${organizer.name}"`,
      context,
    });
  }
}
