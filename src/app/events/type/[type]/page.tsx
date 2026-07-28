import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { EventsView } from '@/views';

type Params = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  return {
    title: `${labelForSlug(type)} Events`,
    alternates: { canonical: `/events/type/${type}` },
  };
}

export default async function Page({ params }: Params) {
  const { type } = await params;
  return <EventsView initialType={type} />;
}
