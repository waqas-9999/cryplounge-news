import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isNewsCategory, labelForSlug } from '@/lib/taxonomy';
import { ArticleView } from '@/views';

type Params = { params: Promise<{ category: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, slug } = await params;
  return {
    title: labelForSlug(slug),
    alternates: { canonical: `/news/${category}/${slug}` },
    openGraph: { type: 'article' },
  };
}

export default async function Page({ params }: Params) {
  const { category, slug } = await params;
  if (!isNewsCategory(category)) notFound();
  return <ArticleView category={category} slug={slug} />;
}
