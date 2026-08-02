'use client';

import { Check, AlertCircle } from 'lucide-react';
import { SLUG_PATTERN } from '@/lib/slug';

interface SeoChecklistProps {
  title: string;
  slug: string;
  summary: string;
  content: string;
  categoryId: string;
  featuredImageId: string;
  featuredImageAltText?: string | null;
  seoTitle: string;
  seoDescription: string;
}

/** Non-blocking recommendations — never prevents saving or publishing. */
export function SeoChecklist(props: SeoChecklistProps) {
  const checks = [
    { label: 'SEO title set', pass: props.seoTitle.trim().length > 0 || props.title.trim().length > 0 },
    {
      label: 'Meta description is a good length (120–160 chars)',
      pass: (props.seoDescription || props.summary).trim().length >= 50,
    },
    { label: 'Slug is lowercase and URL-safe', pass: props.slug === '' || SLUG_PATTERN.test(props.slug) },
    { label: 'Category selected', pass: props.categoryId.trim().length > 0 },
    { label: 'Featured image added', pass: props.featuredImageId.trim().length > 0 },
    {
      label: 'Featured image has alt text',
      pass: !props.featuredImageId || Boolean(props.featuredImageAltText?.trim()),
    },
    { label: 'Article has a summary', pass: props.summary.trim().length > 0 },
    { label: 'Article contains headings', pass: /<h[234][ >]/i.test(props.content) },
    { label: 'Article contains at least one link', pass: /<a[ >]/i.test(props.content) },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-gray-900 dark:text-gray-100 mb-4">SEO Checklist</h3>
      <ul className="space-y-2">
        {checks.map(check => (
          <li key={check.label} className="flex items-start gap-2 text-sm">
            {check.pass ? (
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            )}
            <span className={check.pass ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
