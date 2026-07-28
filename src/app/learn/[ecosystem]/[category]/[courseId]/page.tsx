import type { Metadata } from 'next';
import { labelForSlug } from '@/lib/taxonomy';
import { CourseDetailView } from '@/views';

type Params = { params: Promise<{ ecosystem: string; category: string; courseId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { ecosystem, category, courseId } = await params;
  return {
    title: labelForSlug(courseId),
    alternates: { canonical: `/learn/${ecosystem}/${category}/${courseId}` },
  };
}

export default async function Page({ params }: Params) {
  const { courseId } = await params;
  return <CourseDetailView courseId={courseId} />;
}
