import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { excerpt } from '@/lib/text';
import { getFounderBySlug } from '@/services/founders';
import { FounderDetailView } from '@/views';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const founder = await getFounderBySlug(slug);
  if (!founder) return { title: 'Story Not Found' };

  const title = founder.seoTitle || founder.name;
  const description = founder.seoDescription || founder.excerpt || excerpt(founder.bio);
  const canonical = `${siteConfig.url}/founders/${slug}`;
  const image = founder.photo ? [founder.photo] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: founder.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'profile',
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: image,
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
  const { slug } = await params;
  const founder = await getFounderBySlug(slug);
  if (!founder) notFound();

  return <FounderDetailView founder={founder} />;
}
