import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { excerpt } from '@/lib/text';
import { getEventBySlug } from '@/services/events';
import { EventDetailView } from '@/views';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event Not Found' };

  const title = event.seoTitle || event.name;
  const description = event.seoDescription || excerpt(event.summary || event.content);
  const canonical = `${siteConfig.url}/events/${slug}`;
  const image = event.bannerImage ? [event.bannerImage] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: event.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
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
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return <EventDetailView event={event} />;
}
