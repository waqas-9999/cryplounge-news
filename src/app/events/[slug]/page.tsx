import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { EventDetailView } from '@/views';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: labelForSlug(slug),
    alternates: { canonical: `/events/${slug}` },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  return <EventDetailView eventSlug={slug} />;
}
