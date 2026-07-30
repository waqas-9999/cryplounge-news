import { Prisma } from '@prisma/client';
import { db } from '@/server/db';
import { requireCapability } from '@/server/auth';
import { recordAudit } from '@/server/audit';
import { apiError, clientIp, created, handle, ok, pageParams, paginated, parseBody } from '@/server/api';
import { ArticleCreateInput } from '@/server/schemas';

const listInclude = {
  category: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
  featuredImage: { select: { id: true, path: true, altText: true } },
} satisfies Prisma.ArticleInclude;

/**
 * GET /api/articles
 *
 * Public by default: only published articles are returned. Passing
 * `?status=` requires read capability, so drafts never leak to anonymous
 * callers through a query parameter.
 */
export const GET = handle(async (request: Request) => {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');
  const params = pageParams(request);

  if (status) await requireCapability('content.read');

  const where: Prisma.ArticleWhereInput = {
    ...(status ? { status: status as Prisma.EnumContentStatusFilter['equals'] } : { status: 'PUBLISHED' }),
    ...(category ? { category: { slug: category } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { summary: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.article.findMany({
      where,
      include: listInclude,
      orderBy: [{ pinned: 'desc' }, { priority: 'desc' }, { publishedAt: 'desc' }],
      skip: params.skip,
      take: params.take,
    }),
    db.article.count({ where }),
  ]);

  return ok(paginated(items, total, params));
});

/** POST /api/articles — create. Requires content.write. */
export const POST = handle(async (request: Request) => {
  const user = await requireCapability('content.write');
  const input = await parseBody(request, ArticleCreateInput);

  const existing = await db.article.findUnique({ where: { slug: input.slug } });
  if (existing) {
    return apiError(`Slug "${input.slug}" is already in use`, 409, 'slug_conflict');
  }

  // Only an editor may publish directly; authors submit for review.
  if (input.status === 'PUBLISHED') {
    await requireCapability('content.publish');
  }

  const { tagIds, projectIds, ...data } = input;

  const article = await db.article.create({
    data: {
      ...data,
      createdById: user.id,
      publishedAt: data.status === 'PUBLISHED' ? (data.publishedAt ?? new Date()) : data.publishedAt,
      tags: { connect: tagIds.map(id => ({ id })) },
      projects: { connect: projectIds.map(id => ({ id })) },
      versions: {
        create: {
          title: data.title,
          summary: data.summary,
          content: data.content,
          editedById: user.id,
        },
      },
    },
    include: listInclude,
  });

  await recordAudit({
    action: 'CREATE',
    entity: 'Article',
    entityId: article.id,
    summary: `Created article "${article.title}"`,
    user,
    ipAddress: clientIp(request),
  });

  return created(article);
});
