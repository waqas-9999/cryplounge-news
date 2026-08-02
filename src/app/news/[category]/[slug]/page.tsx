import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { isNewsCategory } from '@/lib/taxonomy';
import { excerpt } from '@/lib/text';
import { getArticleBySlug } from '@/services/news';
import { ArticleView } from '@/views';

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.categorySlug !== category) return {};

  const title = article.seoTitle || article.title;
  const description =
    article.seoDescription || article.summary || excerpt(article.content ?? '');
  const canonical = article.canonicalUrl || `${siteConfig.url}/news/${category}/${slug}`;
  const image = article.imageUrl ? [article.imageUrl] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: article.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: image,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image,
    },
  };
}

export default async function Page({ params }: Params) {
  const { category, slug } = await params;
  if (!isNewsCategory(category)) notFound();

  const article = await getArticleBySlug(slug);
  if (!article || article.categorySlug !== category) notFound();

  return <ArticleView category={category} article={article} />;
}
