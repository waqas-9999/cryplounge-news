import { db } from '@/server/db';
import { requireCapability } from '@/server/auth';
import { recordAudit } from '@/server/audit';
import { apiError, clientIp, handle, noContent, ok, parseBody } from '@/server/api';
import { ArticleUpdateInput } from '@/server/schemas';

type Context = { params: Promise<{ id: string }> };

const detailInclude = {
  category: { select: { id: true, slug: true, name: true } },
  author: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
  featuredImage: { select: { id: true, path: true, altText: true } },
  projects: { select: { id: true, slug: true, name: true } },
  versions: { orderBy: { createdAt: 'desc' }, take: 20 },
} as const;

/** GET /api/articles/:id — drafts require read capability. */
export const GET = handle(async (_request: Request, context: Context) => {
  const { id } = await context.params;

  const article = await db.article.findUnique({ where: { id }, include: detailInclude });
  if (!article) return apiError('Article not found', 404, 'not_found');

  if (article.status !== 'PUBLISHED') {
    await requireCapability('content.read');
  }

  return ok(article);
});

/**
 * PATCH /api/articles/:id
 *
 * Snapshots the previous body into ArticleVersion before applying changes, so
 * version history reflects what the article actually was.
 */
export const PATCH = handle(async (request: Request, context: Context) => {
  const user = await requireCapability('content.write');
  const { id } = await context.params;
  const input = await parseBody(request, ArticleUpdateInput);

  const current = await db.article.findUnique({ where: { id } });
  if (!current) return apiError('Article not found', 404, 'not_found');

  if (input.status === 'PUBLISHED' && current.status !== 'PUBLISHED') {
    await requireCapability('content.publish');
  }

  if (input.slug && input.slug !== current.slug) {
    const clash = await db.article.findUnique({ where: { slug: input.slug } });
    if (clash) return apiError(`Slug "${input.slug}" is already in use`, 409, 'slug_conflict');
  }

  const { tagIds, projectIds, ...data } = input;
  const bodyChanged =
    (data.title !== undefined && data.title !== current.title) ||
    (data.summary !== undefined && data.summary !== current.summary) ||
    (data.content !== undefined && data.content !== current.content);

  const article = await db.article.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        input.status === 'PUBLISHED' && !current.publishedAt
          ? new Date()
          : (data.publishedAt ?? undefined),
      ...(tagIds ? { tags: { set: tagIds.map(tagId => ({ id: tagId })) } } : {}),
      ...(projectIds ? { projects: { set: projectIds.map(pid => ({ id: pid })) } } : {}),
      ...(bodyChanged
        ? {
            versions: {
              create: {
                title: current.title,
                summary: current.summary,
                content: current.content,
                editedById: user.id,
              },
            },
          }
        : {}),
    },
    include: detailInclude,
  });

  const published = input.status === 'PUBLISHED' && current.status !== 'PUBLISHED';
  await recordAudit({
    action: published ? 'PUBLISH' : 'UPDATE',
    entity: 'Article',
    entityId: article.id,
    summary: published
      ? `Published article "${article.title}"`
      : `Updated article "${article.title}"`,
    user,
    ipAddress: clientIp(request),
  });

  return ok(article);
});

/** DELETE /api/articles/:id */
export const DELETE = handle(async (request: Request, context: Context) => {
  const user = await requireCapability('content.delete');
  const { id } = await context.params;

  const article = await db.article.findUnique({ where: { id } });
  if (!article) return apiError('Article not found', 404, 'not_found');

  await db.article.delete({ where: { id } });

  await recordAudit({
    action: 'DELETE',
    entity: 'Article',
    entityId: id,
    summary: `Deleted article "${article.title}"`,
    user,
    ipAddress: clientIp(request),
  });

  return noContent();
});
