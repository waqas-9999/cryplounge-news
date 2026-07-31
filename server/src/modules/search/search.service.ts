import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';

export type SearchType = 'article' | 'project' | 'research' | 'regulation' | 'event' | 'founder';

export interface SearchHit {
  type: SearchType;
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Postgres ts_rank; higher is a better match. */
  rank: number;
  publishedAt: Date | null;
}

/**
 * Global search across all six content types.
 *
 * Uses Postgres full-text search as specified — no Elasticsearch, no
 * Meilisearch. `to_tsvector` at query time is fine at this corpus size; when
 * it stops being fine, the fix is a generated tsvector column plus a GIN
 * index, which changes this file only. Callers see the same interface either
 * way, which is the point of keeping search behind a service.
 *
 * `websearch_to_tsquery` is used rather than `plainto_tsquery` because it
 * understands quoted phrases and OR, and never throws on odd punctuation —
 * important when the input is a raw query string from the public site.
 */
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    term: string;
    types?: SearchType[];
    limit?: number;
  }): Promise<{ hits: SearchHit[]; total: number }> {
    const term = params.term.trim();
    if (!term) return { hits: [], total: 0 };

    const limit = Math.min(params.limit ?? 20, 100);
    const types = params.types?.length ? params.types : undefined;
    const wants = (type: SearchType) => !types || types.includes(type);

    // One UNION rather than six round trips, so ranking is comparable across
    // types and pagination is meaningful.
    const fragments: Prisma.Sql[] = [];

    if (wants('article')) {
      fragments.push(Prisma.sql`
        SELECT 'article' AS type, id, slug, title,
               LEFT(summary, 200) AS excerpt,
               ts_rank(to_tsvector('english', title || ' ' || summary), query) AS rank,
               "publishedAt"
        FROM "Article", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL AND status = 'PUBLISHED'
          AND to_tsvector('english', title || ' ' || summary) @@ query
      `);
    }

    if (wants('project')) {
      fragments.push(Prisma.sql`
        SELECT 'project' AS type, id, slug, name AS title,
               LEFT(tagline, 200) AS excerpt,
               ts_rank(to_tsvector('english', name || ' ' || tagline || ' ' || about), query) AS rank,
               "createdAt" AS "publishedAt"
        FROM "Project", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL
          AND to_tsvector('english', name || ' ' || tagline || ' ' || about) @@ query
      `);
    }

    if (wants('research')) {
      fragments.push(Prisma.sql`
        SELECT 'research' AS type, id, slug, title,
               LEFT(summary, 200) AS excerpt,
               ts_rank(to_tsvector('english', title || ' ' || summary), query) AS rank,
               "publishedAt"
        FROM "Research", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL AND status = 'PUBLISHED'
          AND to_tsvector('english', title || ' ' || summary) @@ query
      `);
    }

    if (wants('regulation')) {
      fragments.push(Prisma.sql`
        SELECT 'regulation' AS type, id, slug, title,
               LEFT(summary, 200) AS excerpt,
               ts_rank(to_tsvector('english', title || ' ' || summary), query) AS rank,
               "publishedAt"
        FROM "Regulation", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL AND status = 'PUBLISHED'
          AND to_tsvector('english', title || ' ' || summary) @@ query
      `);
    }

    if (wants('event')) {
      fragments.push(Prisma.sql`
        SELECT 'event' AS type, id, slug, name AS title,
               LEFT(summary, 200) AS excerpt,
               ts_rank(to_tsvector('english', name || ' ' || summary), query) AS rank,
               "startsAt" AS "publishedAt"
        FROM "Event", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL AND status = 'PUBLISHED'
          AND to_tsvector('english', name || ' ' || summary) @@ query
      `);
    }

    if (wants('founder')) {
      fragments.push(Prisma.sql`
        SELECT 'founder' AS type, id, slug, name AS title,
               LEFT(excerpt, 200) AS excerpt,
               ts_rank(to_tsvector('english', name || ' ' || role || ' ' || excerpt), query) AS rank,
               "publishedAt"
        FROM "Founder", websearch_to_tsquery('english', ${term}) query
        WHERE "deletedAt" IS NULL AND status = 'PUBLISHED'
          AND to_tsvector('english', name || ' ' || role || ' ' || excerpt) @@ query
      `);
    }

    if (fragments.length === 0) return { hits: [], total: 0 };

    const union = Prisma.join(fragments, ' UNION ALL ');

    const hits = await this.prisma.$queryRaw<SearchHit[]>`
      SELECT * FROM (${union}) results
      ORDER BY rank DESC, "publishedAt" DESC NULLS LAST
      LIMIT ${limit}
    `;

    // Recorded for the search analytics report, including zero-result terms —
    // those are the most useful signal an editor gets about content gaps.
    await this.recordQuery(term, hits.length);

    return { hits, total: hits.length };
  }

  private async recordQuery(term: string, resultCount: number): Promise<void> {
    try {
      await this.prisma.searchQuery.create({ data: { term, resultCount } });
    } catch {
      // Analytics must never break search.
    }
  }
}
