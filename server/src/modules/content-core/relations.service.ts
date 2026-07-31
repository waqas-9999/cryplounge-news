import { Injectable } from '@nestjs/common';

/** Content types that can be linked to one another. */
export type RelatableType =
  | 'articles'
  | 'projects'
  | 'research'
  | 'regulations'
  | 'events'
  | 'founders';

export type RelationIds = Partial<Record<RelatableType, string[]>>;

/**
 * Cross-content linking.
 *
 * The product rule is that no page is a dead end, which makes relations a
 * first-class concern rather than an afterthought. Every content module links
 * the same way through here, so the semantics cannot drift between them.
 */
@Injectable()
export class RelationsService {
  /**
   * Builds the nested write for a create.
   *
   * `connect` rather than `create`: relations always point at content that
   * already exists.
   */
  buildConnect(relations: RelationIds): Record<string, unknown> {
    const data: Record<string, { connect: { id: string }[] }> = {};

    for (const [key, ids] of Object.entries(relations)) {
      if (ids?.length) {
        data[key] = { connect: ids.map(id => ({ id })) };
      }
    }
    return data;
  }

  /**
   * Builds the nested write for an update.
   *
   * `set` replaces the whole list, which matches how the admin edits them: the
   * form submits the complete set of related items, not a delta. An undefined
   * key is left untouched so a PATCH that omits relations does not clear them.
   */
  buildSet(relations: RelationIds): Record<string, unknown> {
    const data: Record<string, { set: { id: string }[] }> = {};

    for (const [key, ids] of Object.entries(relations)) {
      if (ids !== undefined) {
        data[key] = { set: ids.map(id => ({ id })) };
      }
    }
    return data;
  }

  /** The include shape used when returning a full content record. */
  static readonly RELATION_INCLUDE = {
    articles: { select: { id: true, slug: true, title: true }, take: 12 },
    projects: { select: { id: true, slug: true, name: true, logo: true }, take: 12 },
    research: { select: { id: true, slug: true, title: true }, take: 12 },
    regulations: { select: { id: true, slug: true, title: true }, take: 12 },
    events: { select: { id: true, slug: true, name: true, startsAt: true }, take: 12 },
    founders: { select: { id: true, slug: true, name: true, role: true }, take: 12 },
  } as const;
}
