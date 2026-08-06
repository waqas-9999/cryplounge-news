'use client';

import { useEffect, useState } from 'react';
import { TrendingCard } from '@/components/TrendingCard';
import { LatestNewsCard } from '@/components/LatestNewsCard';
import { ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { listArticles, articleHref } from '@/services/news';
import { subscribeToNewsletter } from '@/services/newsletter';
import { trackNewsletterSignup } from '@/utils/analytics';
import type { Article } from '@/types/article';

/**
 * Shared template for every editorial section page (Latest, Markets,
 * Business, Technology, Regulation, Research). Replaces the seven
 * near-duplicate hardcoded implementations that used to live here — the
 * only thing that varies between sections is `category`/`displayTitle`.
 *
 * Data comes from the real `articles` backend via `src/services/news.ts`.
 */

const FALLBACK_IMAGE_KEYS = [
  'vrImage',
  'businessmanImage',
  'solanaImage',
  'phoneImage',
  'speakerImage',
  'documentImage',
  'asianBusinessmanImage',
] as const;

export interface CategoryNewsPageImages {
  vrImage: string;
  businessmanImage: string;
  solanaImage: string;
  phoneImage: string;
  speakerImage: string;
  documentImage: string;
  asianBusinessmanImage: string;
}

interface CategoryNewsPageProps {
  /** Omit to show all categories (used by the "Latest" page). */
  category?: string;
  displayTitle: string;
  images: CategoryNewsPageImages;
  onNavigate?: (page: string) => void;
}

function fallbackImage(images: CategoryNewsPageImages, index: number): string {
  const key = FALLBACK_IMAGE_KEYS[index % FALLBACK_IMAGE_KEYS.length];
  return images[key];
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function CategoryNewsPage({ category, displayTitle, images, onNavigate }: CategoryNewsPageProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [featured, setFeatured] = useState<Article | null>(null);
  const [latest, setLatest] = useState<Article[]>([]);
  const [more, setMore] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) {
      toast.error('Email required', { description: 'Please enter your email address' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', { description: 'Please enter a valid email address' });
      return;
    }

    setNewsletterSubmitting(true);
    try {
      const result = await subscribeToNewsletter(email);
      if (result.alreadySubscribed) {
        toast.info('Already subscribed', { description: 'This email is already on our list.' });
      } else {
        trackNewsletterSignup();
        toast.success('Subscribed!', { description: 'Check your inbox for confirmation.' });
      }
      setNewsletterEmail('');
    } catch {
      toast.error('Subscription failed', {
        description: 'Could not subscribe right now. Please try again in a moment.',
      });
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setState('loading');

    listArticles({ category, page, perPage: 13 })
      .then(result => {
        if (cancelled) return;
        setFeatured(result.items[0] ?? null);
        setLatest(result.items.slice(1, 6));
        setMore(result.items.slice(6, 14));
        setTotalPages(result.totalPages);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [category, page]);

  if (state === 'loading') {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#EFB81A]" />
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-gray-600 dark:text-[#A0A0A5]">
          Couldn&apos;t load {displayTitle} articles right now. Please try again shortly.
        </p>
      </main>
    );
  }

  if (!featured) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-gray-600 dark:text-[#A0A0A5]">No {displayTitle} articles yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 md:space-y-12">
      <button
        onClick={() => onNavigate?.('home')}
        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2">
          <div
            onClick={() => onNavigate?.(articleHref(featured))}
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl p-6 md:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group"
          >
            <div className="mb-3 md:mb-4">
              <span className="text-[#EFB81A] text-xs md:text-sm">{displayTitle}</span>
              <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm ml-2">
                {timeAgo(featured.publishedAt)}
              </span>
            </div>
            <h2 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl mb-4 md:mb-6 leading-tight">
              {featured.title}
            </h2>
            <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
              {featured.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm">
                  #{tag}
                </span>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 text-gray-800 dark:text-[#F3F3F5] hover:text-[#EFB81A] transition-colors mb-6 md:mb-8 text-sm">
              Read article
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="rounded-xl md:rounded-2xl overflow-hidden">
              {featured.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.imageUrl} alt={featured.title} className="w-full h-48 md:h-64 object-cover" />
              ) : (
                <div className="relative h-48 md:h-64 bg-[#F9D96A] dark:bg-[#EFB81A]/20 flex items-center justify-center">
                  <div className="text-black dark:text-[#EFB81A] text-3xl md:text-5xl lg:text-6xl tracking-wider font-bold uppercase">
                    {displayTitle}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">Latest in {displayTitle}</h3>
            </div>
            <div className="space-y-3 md:space-y-4 bg-white dark:bg-[#1A1A1A] rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-gray-800 transition-colors">
              {latest.map((article, index) => (
                <div key={article.id}>
                  <LatestNewsCard
                    category={article.category}
                    categorySlug={article.categorySlug}
                    time={timeAgo(article.publishedAt)}
                    title={article.title}
                    image={article.imageUrl ?? fallbackImage(images, index)}
                    articleSlug={article.slug ?? article.id}
                    onNavigate={onNavigate}
                  />
                  {index < latest.length - 1 && <div className="h-px bg-gray-100 dark:bg-white/[0.08]"></div>}
                </div>
              ))}
              {latest.length === 0 && (
                <p className="text-gray-500 dark:text-[#A0A0A5] text-sm">More stories coming soon.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="bg-[#FFD200] rounded-xl md:rounded-2xl p-4 md:p-6">
            <h3 className="text-black text-base md:text-lg font-semibold mb-2">{displayTitle} Newsletter</h3>
            <p className="text-black/70 text-sm mb-4">Get the latest {displayTitle.toLowerCase()} news delivered daily.</p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder="Your email"
                aria-label={`Email address to subscribe to the ${displayTitle} newsletter`}
                className="w-full px-3 py-2.5 bg-white/80 rounded-lg text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {newsletterSubmitting ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-gray-800 dark:text-[#F3F3F5] text-lg md:text-xl">More in {displayTitle}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {more.map((article, index) => (
            <TrendingCard
              key={article.id}
              category={article.category}
              categorySlug={article.categorySlug}
              time={timeAgo(article.publishedAt)}
              title={article.title}
              tags={article.tags.slice(0, 2)}
              image={article.imageUrl ?? fallbackImage(images, index)}
              articleSlug={article.slug ?? article.id}
              onNavigate={onNavigate}
            />
          ))}
          {more.length === 0 && (
            <p className="text-gray-500 dark:text-[#A0A0A5] text-sm col-span-full">No further stories yet.</p>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-2 text-sm text-gray-800 dark:text-[#F3F3F5]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-[#F3F3F5] hover:border-[#EFB81A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
