import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/** Prisma models that carry a unique `slug`. */
export type SluggableModel =
  | 'article'
  | 'project'
  | 'research'
  | 'regulation'
  | 'event'
  | 'founder'
  | 'author';

/**
 * Slug generation and uniqueness.
 *
 * Slugs are public URLs, so they must be stable, readable and unique. This is
 * the only place that decides their shape — no module builds one by hand.
 */
@Injectable()
export class SlugService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * "Bitcoin ETFs Surge 40%" -> "bitcoin-etfs-surge-40"
   *
   * Diacritics are folded rather than stripped so "Café" becomes "cafe" and
   * not "caf".
   */
  slugify(input: string): string {
    return input
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/['’,]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 160)
      .replace(/-+$/, '');
  }

  /**
   * A slug guaranteed unique for the model, suffixing -2, -3 … on collision.
   *
   * `excludeId` lets an update keep its own slug without colliding with itself.
   */
  async unique(model: SluggableModel, desired: string, excludeId?: string): Promise<string> {
    const base = this.slugify(desired) || 'untitled';

    // One query for the whole family rather than a loop of existence checks.
    const delegate = this.prisma[model] as {
      findMany(args: unknown): Promise<{ slug: string }[]>;
    };

    const taken = await delegate.findMany({
      where: {
        slug: { startsWith: base },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { slug: true },
    });

    const used = new Set(taken.map(row => row.slug));
    if (!used.has(base)) return base;

    for (let suffix = 2; suffix < 1000; suffix += 1) {
      const candidate = `${base}-${suffix}`;
      if (!used.has(candidate)) return candidate;
    }

    // Astronomically unlikely; better than looping forever.
    return `${base}-${Date.now()}`;
  }
}
