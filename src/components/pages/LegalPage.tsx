'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getPage, type LegalPage as LegalPageData } from '@/services/pages';

interface LegalPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

/**
 * Renders any admin-authored legal/policy page (Terms, Privacy, Editorial
 * Policy, ...) by slug. There is no hardcoded content here — everything
 * comes from the `legal_pages` table via the admin panel.
 */
export default function LegalPage({ slug, onNavigate }: LegalPageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [page, setPage] = useState<LegalPageData | null>(null);

  useEffect(() => {
    setState('loading');
    getPage(slug)
      .then(data => {
        setPage(data);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [slug]);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0D0D0D]">
        <Loader2 className="w-6 h-6 animate-spin text-[#EFB81A]" />
      </div>
    );
  }

  if (state === 'error' || !page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#0D0D0D] px-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">This page isn&apos;t available right now.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-3 bg-[#EFB81A] text-black rounded-lg hover:bg-black hover:text-[#EFB81A] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(page.content);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0D0D0D] transition-colors">
      <SEOHead
        title={page.seoTitle || `${page.title} - CrypLounge`}
        description={page.seoDescription || page.title}
        canonical={`/${page.slug}`}
      />

      <section className="relative bg-gradient-to-br from-[#F9D96A]/20 to-white dark:from-[#EFB81A]/10 dark:to-[#0D0D0D] border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#EFB81A] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#F9D96A]/20 dark:bg-[#EFB81A]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#EFB81A]" />
            </div>
            <h1 className="text-gray-900 dark:text-white">{page.title}</h1>
          </div>
          {page.publishedAt && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Last Updated:{' '}
              {new Date(page.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div
          className="prose prose-gray dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </section>
    </div>
  );
}
