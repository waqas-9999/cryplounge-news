'use client';

import { ArrowLeft, Heart, MessageCircle, Twitter, Facebook, Instagram, Share2, ChevronLeft, ChevronRight, Link2, Printer, Bookmark, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ArticleVisuals } from '@/components/ArticleVisualRenderer';
import type { ArticleVisual } from '@/types/article';
import { useState, useEffect, useRef } from 'react';
import { trackEvent, recordContentView, trackReadingDepth, trackShare, trackBookmark } from '@/utils/analytics';
import DOMPurify from 'dompurify';
import { siteConfig } from '@/config/site';
import { excerpt } from '@/lib/text';
import { listArticles } from '@/services/news';
import { NEWS_CATEGORIES, labelForSlug } from '@/lib/taxonomy';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

interface ArticleDetailPageProps {
  category: string;
  categorySlug: string;
  articleSlug: string;
  articleTitle?: string;
  articleContent?: string;
  articleImage?: string;
  /** ISO timestamp; formatted as relative time for display. */
  publishedTime?: string;
  /** ISO timestamp of the last edit, for JSON-LD `dateModified`. */
  updatedTime?: string;
  articleDescription?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  tags?: string[];
  images: {
    vrImage: string;
    businessmanImage: string;
    solanaImage: string;
    phoneImage: string;
    speakerImage: string;
    documentImage: string;
    asianBusinessmanImage: string;
  };
  onNavigate?: (page: string) => void;
  /**
   * Inline editorial visuals, already ordered by the API. Optional so every
   * existing caller and every article without visuals is unaffected.
   */
  visuals?: ArticleVisual[];
}

export function ArticleDetailPage({
  category,
  categorySlug,
  articleSlug,
  articleTitle = "Latest Crypto News Article",
  articleContent = "",
  articleImage,
  publishedTime,
  updatedTime,
  articleDescription,
  authorName = 'CrypLounge Editorial Team',
  authorAvatarUrl,
  tags = ['Crypto', 'News'],
  images,
  onNavigate,
  visuals
}: ArticleDetailPageProps) {
  const { vrImage, businessmanImage, solanaImage, phoneImage, speakerImage, documentImage, asianBusinessmanImage } = images;
  const displayTime = publishedTime ? timeAgo(publishedTime) : '';
  const [likes, setLikes] = useState(14);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Track page view on mount
  useEffect(() => {
    trackEvent('article_view', {
      category,
      articleSlug,
      articleTitle
    });
    recordContentView('Article', articleSlug);

    // Feeds the reading-depth funnel in the admin analytics: emits
    // `article_scroll` at each milestone plus `article_complete` at the end.
    const stopDepthTracking = trackReadingDepth('Article', articleSlug);

    return () => {
      stopDepthTracking();
      // Track read time on unmount
      const readTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      trackEvent('article_read_time', {
        category,
        articleSlug,
        readTime,
        readProgress
      });
    };
  }, [category, articleSlug, articleTitle, readProgress]);

  // Read progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const windowHeight = window.innerHeight;
      const documentHeight = element.offsetHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;
      
      if (scrollableHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100));
        setReadProgress(Math.round(progress));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLike = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    
    trackEvent('article_like', {
      category,
      articleSlug,
      action: newIsLiked ? 'like' : 'unlike'
    });
  };

  const toggleSave = () => {
    const nowSaved = !isSaved;
    setIsSaved(nowSaved);
    // Only the save is tracked — un-saving is not a bookmark, and counting it
    // would inflate the bookmark totals in the content reports.
    if (nowSaved) {
      trackBookmark({ entity: 'Article', entityId: articleSlug, meta: { category } });
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate(`news/${categorySlug}`);
    }
  };

  // Social sharing functions
  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/news/${categorySlug}/${articleSlug}`;
    const text = articleTitle;
    
    let shareUrl = '';
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      trackShare(platform, { entity: 'Article', entityId: articleSlug, meta: { category } });
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/news/${categorySlug}/${articleSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      trackEvent('article_copy_link', {
        category,
        articleSlug
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePrint = () => {
    window.print();
    trackEvent('article_print', {
      category,
      articleSlug
    });
  };

  // Navigate with validation
  const safeNavigate = (path: string) => {
    if (!onNavigate) return;
    
    // Validate and sanitize path - allow alphanumeric, hyphens, underscores, and slashes
    const safePath = path.replace(/[^a-zA-Z0-9/_-]/g, '');
    if (safePath && safePath.startsWith('news/')) {
      onNavigate(safePath);
      
      // Track navigation
      trackEvent('related_article_click', {
        from_article: articleSlug,
        to_article: safePath
      });
    }
  };

  // Related articles: same category, excluding the current article
  const [relatedArticles, setRelatedArticles] = useState<
    { category: string; categorySlug: string; time: string; title: string; image: string; slug: string }[]
  >([]);
  const [bestOfMonth, setBestOfMonth] = useState<
    { category: string; categorySlug: string; time: string; title: string; image: string; slug: string }[]
  >([]);

  useEffect(() => {
    listArticles({ category: categorySlug, perPage: 6 })
      .then(({ items }) => {
        setRelatedArticles(
          items
            .filter(article => (article.slug ?? article.id) !== articleSlug)
            .slice(0, 5)
            .map(article => ({
              category: article.category,
              categorySlug: article.categorySlug,
              time: article.readTime,
              title: article.title,
              image: article.imageUrl || vrImage,
              slug: article.slug ?? article.id
            }))
        );
      })
      .catch(() => setRelatedArticles([]));

    listArticles({ perPage: 2 })
      .then(({ items }) => {
        setBestOfMonth(
          items
            .filter(article => (article.slug ?? article.id) !== articleSlug)
            .slice(0, 1)
            .map(article => ({
              category: article.category,
              categorySlug: article.categorySlug,
              time: article.readTime,
              title: article.title,
              image: article.imageUrl || speakerImage,
              slug: article.slug ?? article.id
            }))
        );
      })
      .catch(() => setBestOfMonth([]));
  }, [articleSlug, categorySlug]);

  // The real desks, so every chip resolves. The old hardcoded list included
  // Finance and Geopolitics, which are not routes — both linked to a 404.
  const moreNewsCategories = NEWS_CATEGORIES.filter(slug => slug !== categorySlug);

  // Sanitize article content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(articleContent || "Stay informed with the latest developments in the cryptocurrency and blockchain space. Our comprehensive coverage brings you in-depth analysis, expert insights, and breaking news from across the digital asset ecosystem.");

  // Structured data for SEO — plain text only, never raw HTML, per schema.org NewsArticle.
  const pageUrl = `${siteConfig.url}/news/${categorySlug}/${articleSlug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": articleTitle,
    "description": articleDescription || excerpt(sanitizedContent),
    "image": articleImage || `${siteConfig.url}${phoneImage}`,
    "datePublished": publishedTime || new Date().toISOString(),
    "dateModified": updatedTime || publishedTime || new Date().toISOString(),
    // A named byline is a Person. Google treats `Organization` here as "no
    // named author", which weakens the E-E-A-T signal news results rely on;
    // it is only correct when the piece genuinely has no individual author.
    "author": authorName
      ? { "@type": "Person", "name": authorName }
      : { "@type": "Organization", "name": siteConfig.name },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        // Served by `app/logo.png/route.tsx`. Dimensions are declared because
        // Google validates the publisher logo against its size guidance.
        "url": `${siteConfig.url}/logo.png`,
        "width": 600,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "url": pageUrl,
    "articleSection": category,
    "keywords": tags.join(', ')
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F0F10] transition-colors" ref={contentRef}>
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      
      {/* Read Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-[60]">
        <div 
          className="h-full bg-[#EFB81A] transition-all duration-150"
          style={{ width: `${readProgress}%` }}
          role="progressbar"
          aria-valuenow={readProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Article read progress"
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#161618] border-b border-gray-200 dark:border-white/[0.08] transition-colors">

      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A] rounded-lg px-2 py-1"
            aria-label="Go back to category"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Main Article */}
          <article className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Article Header */}
            <header className="space-y-4 md:space-y-6">
              <div className="flex items-center gap-2" role="contentinfo">
                <span className="text-[#EFB81A] text-xs md:text-sm">{category}</span>
                <span className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm" aria-label={`Published ${displayTime}`}>
                  {displayTime}
                </span>
              </div>

              <h1 className="text-gray-800 dark:text-[#F3F3F5] text-2xl md:text-4xl lg:text-5xl leading-tight">
                {articleTitle}
              </h1>

              <div className="flex flex-wrap gap-2" role="list" aria-label="Article tags">
                {tags.map((tag, idx) => (
                  <span key={`tag-${idx}-${tag}`} className="text-gray-400 dark:text-[#A0A0A5] text-xs md:text-sm" role="listitem">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-3 flex-wrap" role="group" aria-label="Share article">
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-4 h-4 text-blue-500" />
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                </button>
                <button 
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  aria-label="Share on LinkedIn"
                >
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-[#A0A0A5]" />
                </button>
                <div className="relative">
                  <button 
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    aria-label="Copy link to article"
                  >
                    <Link2 className="w-4 h-4 text-gray-600 dark:text-[#A0A0A5]" />
                  </button>
                  {showCopied && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs rounded-lg whitespace-nowrap" role="status">
                      Link copied!
                    </div>
                  )}
                </div>
                <button 
                  onClick={handlePrint}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:border-[#EFB81A] transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  aria-label="Print article"
                >
                  <Printer className="w-4 h-4 text-gray-600 dark:text-[#A0A0A5]" />
                </button>
              </div>
            </header>

            {/* Featured Image */}
            <figure className="rounded-2xl overflow-hidden">
              <ImageWithFallback 
                src={articleImage || phoneImage}
                alt={articleTitle}
                className="w-full aspect-video object-cover"
                loading="eager"
              />
              <figcaption className="sr-only">{articleTitle}</figcaption>
            </figure>

            {/* Article Content */}
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            {/*
              Inline editorial visuals — charts, timelines, secondary images.

              Rendered after the body rather than spliced into it: the body is
              sanitised HTML injected wholesale, and there is no marker in it
              saying where a chart belongs. Placing them here shows the reader
              the visual reliably; positioning within the prose needs the
              writer to emit an anchor, which is a newsroom change.

              The hero image is `featuredImageId` and is rendered above. These
              are filtered to INLINE so it is never drawn twice.
            */}
            <ArticleVisuals visuals={visuals} />
            
            {/* Fallback content if no article content */}
            {!articleContent && (
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-[#C0C0C5] leading-relaxed text-base md:text-lg mb-4">
                  The crypto market continues to evolve rapidly, with new technologies, regulations, and investment opportunities emerging daily. Understanding these trends is crucial for anyone involved in the digital asset space.
                </p>

                <h2 className="text-gray-800 dark:text-[#F3F3F5] text-xl md:text-2xl mt-6 mb-4">Key Insights</h2>
                
                <p className="text-gray-700 dark:text-[#C0C0C5] leading-relaxed text-base md:text-lg mb-4">
                  Market dynamics are shifting as institutional adoption accelerates and regulatory frameworks become more defined. These changes are creating new opportunities while also introducing new considerations for investors and developers alike.
                </p>

                <h2 className="text-gray-800 dark:text-[#F3F3F5] text-xl md:text-2xl mt-6 mb-4">Looking Ahead</h2>
                
                <p className="text-gray-700 dark:text-[#C0C0C5] leading-relaxed text-base md:text-lg mb-4">
                  As we move forward, staying informed about technological advancements, market trends, and regulatory developments will be essential for navigating the evolving cryptocurrency landscape successfully.
                </p>
              </div>
            )}

            {/* Author Info */}
            <aside className="bg-[#F4F4F4] dark:bg-[#1A1A1A] rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-800" aria-label="Author information">
              <div className="flex items-start gap-4">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt={authorName}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#EFB81A] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <span className="text-black text-lg md:text-xl">
                      {authorName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-1">{authorName}</h3>
                  <p className="text-gray-600 dark:text-[#A0A0A5] text-sm">
                    Expert analysis and insights from our team of crypto journalists and analysts
                  </p>
                </div>
              </div>
            </aside>

            {/* Comments Section */}
            <div id="comments-section">
            </div>
          </article>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6 md:space-y-8 pt-16 md:pt-20" aria-label="Sidebar">
            {/* Featured News */}
            <section aria-labelledby="best-of-month-heading">
              <div className="inline-block px-3 py-1.5 bg-[#F9D96A] dark:bg-[#EFB81A]/20 rounded-lg mb-4">
                <span className="text-black dark:text-[#EFB81A] text-xs flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  FEATURED NEWS
                </span>
              </div>
              
              {bestOfMonth.length > 0 ? (
                bestOfMonth.map((article, idx) => (
                  <article 
                    key={`best-${article.slug}-${idx}`}
                  >
                    <button
                      onClick={() => safeNavigate(`news/${article.categorySlug}/${article.slug}`)}
                      className="rounded-xl overflow-hidden relative h-48 cursor-pointer group w-full focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                      aria-label={`Read featured article: ${article.title}`}
                    >
                      <ImageWithFallback 
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden="true"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="mb-2 text-xs">
                          {article.category} • {article.time}
                        </div>
                        <h3 className="leading-snug text-sm">
                          {article.title}
                        </h3>
                      </div>
                    </button>
                  </article>
                ))
              ) : (
                <p className="text-gray-600 dark:text-[#A0A0A5] text-sm">No featured articles available.</p>
              )}
            </section>

            {/* Related Articles */}
            <section aria-labelledby="related-articles-heading">
              <h3 id="related-articles-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                Related Articles
              </h3>
              {relatedArticles.length > 0 ? (
                <div className="space-y-3 md:space-y-4" role="list">
                  {relatedArticles.map((article, idx) => (
                    <article 
                      key={`related-${article.slug}-${idx}`}
                      role="listitem"
                    >
                      <button
                        onClick={() => safeNavigate(`news/${article.categorySlug}/${article.slug}`)}
                        className="flex gap-3 items-start cursor-pointer group w-full text-left focus:outline-none focus:ring-2 focus:ring-[#EFB81A] rounded-lg p-2 -m-2"
                        aria-label={`Read article: ${article.title}`}
                      >
                        <div className="flex-1">
                          <div className="mb-1">
                            <span className="text-[#EFB81A] text-xs">{article.category}</span>
                            <span className="text-gray-400 dark:text-[#A0A0A5] text-xs ml-2">{article.time}</span>
                          </div>
                          <h4 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm group-hover:text-[#EFB81A] transition-colors">
                            {article.title}
                          </h4>
                        </div>
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback 
                            src={article.image}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-[#A0A0A5] text-sm">No related articles available.</p>
              )}
            </section>

            {/* More News Categories */}
            <nav aria-labelledby="more-news-heading">
              <h3 id="more-news-heading" className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base md:text-lg">
                More News
              </h3>
              <div className="flex flex-wrap gap-2" role="list">
                {moreNewsCategories.map(slug => {
                  const cat = labelForSlug(slug);

                  return (
                    <button
                      key={`category-${slug}`}
                      onClick={() => safeNavigate(`news/${slug}`)}
                      className="px-3.5 py-2 rounded-lg bg-[#F4F4F4] dark:bg-[#1A1A1A] text-gray-700 dark:text-[#C0C0C5] text-xs hover:bg-[#F9D96A] dark:hover:bg-[#EFB81A]/20 hover:text-black dark:hover:text-[#EFB81A] transition-colors border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                      role="listitem"
                      aria-label={`Browse ${cat} category`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>

        {/* More from Category */}
        <section className="mt-12" aria-labelledby="more-from-category-heading">
          <div className="flex items-center justify-between mb-6">
            <h2 id="more-from-category-heading" className="text-gray-800 dark:text-[#F3F3F5] text-xl md:text-2xl">
              More from {category}
            </h2>
            <button 
              onClick={() => safeNavigate(`news/${categorySlug}`)}
              className="px-4 md:px-5 py-2 md:py-2.5 text-gray-600 dark:text-[#A0A0A5] hover:text-[#EFB81A] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A] rounded-lg"
              aria-label={`View all ${category} articles`}
            >
              View all →
            </button>
          </div>

          {relatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
              {relatedArticles.slice(0, 4).map((article, idx) => (
                <article 
                  key={`more-${article.slug}-${idx}`}
                  role="listitem"
                >
                  <button
                    onClick={() => safeNavigate(`news/${article.categorySlug}/${article.slug}`)}
                    className="bg-white dark:bg-[#1A1A1A] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#EFB81A] dark:hover:border-[#EFB81A] transition-all cursor-pointer group w-full text-left focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    aria-label={`Read article: ${article.title}`}
                  >
                    <div className="aspect-video overflow-hidden">
                      <ImageWithFallback 
                        src={article.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-[#EFB81A] text-xs">{article.category}</span>
                        <span className="text-gray-400 dark:text-[#A0A0A5] text-xs ml-2">{article.time}</span>
                      </div>
                      <h3 className="text-gray-800 dark:text-[#F3F3F5] leading-snug text-sm group-hover:text-[#EFB81A] transition-colors">
                        {article.title}
                      </h3>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-[#A0A0A5] text-center py-8">No more articles available in this category.</p>
          )}
        </section>
      </div>
    </main>
  );
}