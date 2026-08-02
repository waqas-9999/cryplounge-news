import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isNewsCategory } from '@/lib/taxonomy';
import { getArticleBySlug } from '@/services/news';
import { ArticleView } from '@/views';

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.categorySlug !== category) return {};

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: `/news/${category}/${slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : undefined,
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
