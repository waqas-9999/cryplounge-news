import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditService, type AuditContext } from '../content-core/audit.service';
import type {
  CreateNavigationItemDto,
  ReorderDto,
  UpdateHomepageSectionDto,
  UpdateNavigationItemDto,
} from './dto/site.dto';

/**
 * Site configuration: settings, navigation and homepage sections.
 *
 * These three sit together because they are what an administrator changes to
 * alter the site without touching content — the surface the frontend reads at
 * render time.
 */
@Injectable()
export class SiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  /* -------------------------------------------------------------- settings --- */

  /**
   * All settings as a flat key/value object.
   *
   * Returned in one call because the frontend needs the whole set to render a
   * page, and a request per key would be absurd.
   */
  async settings(): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany();
    return Object.fromEntries(rows.map(row => [row.key, row.value]));
  }

  async setSetting(key: string, value: unknown, context: AuditContext) {
    const previous = await this.prisma.setting.findUnique({ where: { key } });

    const setting = await this.prisma.setting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    });

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'Setting',
      entityId: key,
      summary: `Changed setting "${key}"`,
      context,
      metadata: { before: previous?.value ?? null, after: value } as Prisma.InputJsonValue,
    });

    return setting;
  }

  async setSettings(entries: { key: string; value: unknown }[], context: AuditContext) {
    for (const entry of entries) {
      await this.setSetting(entry.key, entry.value, context);
    }
    return this.settings();
  }

  /* ----------------------------------------------------- homepage sections --- */

  async homepageSections() {
    return this.prisma.homepageSection.findMany({ orderBy: { position: 'asc' } });
  }

  async updateHomepageSection(key: string, dto: UpdateHomepageSectionDto, context: AuditContext) {
    const existing = await this.prisma.homepageSection.findUnique({ where: { key } });
    if (!existing) {
      throw new NotFoundException({ message: `Section ${key} not found`, code: 'NOT_FOUND' });
    }

    const section = await this.prisma.homepageSection.update({
      where: { key },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
        ...(dto.config !== undefined ? { config: dto.config as Prisma.InputJsonValue } : {}),
      },
    });

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'HomepageSection',
      entityId: section.id,
      summary: `Updated homepage section "${section.title}"`,
      context,
    });

    return section;
  }

  /**
   * Reorder in a single transaction.
   *
   * A partially applied reorder would leave two sections claiming the same
   * position and the homepage in an arbitrary order.
   */
  async reorderHomepageSections(dto: ReorderDto, context: AuditContext) {
    await this.prisma.$transaction(
      dto.items.map(item =>
        this.prisma.homepageSection.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'HomepageSection',
      summary: `Reordered ${dto.items.length} homepage sections`,
      context,
    });

    return this.homepageSections();
  }

  /* ------------------------------------------------------------ navigation --- */

  /** Menu as a tree, which is how both the header and the editor render it. */
  async navigation(location?: string) {
    const items = await this.prisma.navigationItem.findMany({
      where: {
        ...(location ? { location } : {}),
        parentId: null,
      },
      orderBy: [{ location: 'asc' }, { position: 'asc' }],
      include: {
        children: { orderBy: { position: 'asc' } },
      },
    });
    return items;
  }

  async createNavigationItem(dto: CreateNavigationItemDto, context: AuditContext) {
    const item = await this.prisma.navigationItem.create({
      data: { ...dto, position: dto.position ?? 0 },
    });

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'NavigationItem',
      entityId: item.id,
      summary: `Added "${item.label}" to the ${item.location} menu`,
      context,
    });

    return item;
  }

  async updateNavigationItem(id: string, dto: UpdateNavigationItemDto, context: AuditContext) {
    const item = await this.prisma.navigationItem.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label } : {}),
        ...(dto.href !== undefined ? { href: dto.href } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
      },
    });

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'NavigationItem',
      entityId: id,
      summary: `Updated menu item "${item.label}"`,
      context,
    });

    return item;
  }

  /** Deleting a parent cascades to its children, per the schema. */
  async deleteNavigationItem(id: string, context: AuditContext) {
    const item = await this.prisma.navigationItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException({ message: 'Menu item not found', code: 'NOT_FOUND' });
    }

    await this.prisma.navigationItem.delete({ where: { id } });

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'NavigationItem',
      entityId: id,
      summary: `Removed "${item.label}" from the ${item.location} menu`,
      context,
    });
  }

  async reorderNavigation(dto: ReorderDto, context: AuditContext) {
    await this.prisma.$transaction(
      dto.items.map(item =>
        this.prisma.navigationItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    await this.audit.record({
      action: AuditAction.SETTINGS_CHANGE,
      entity: 'NavigationItem',
      summary: `Reordered ${dto.items.length} menu items`,
      context,
    });

    return this.navigation();
  }
}
