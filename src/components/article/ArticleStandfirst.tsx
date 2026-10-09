import { renderSummaryHtml } from '@/lib/article-body';

/**
 * The standfirst with its contextual links, under the headline.
 *
 * Renders only when the article has a linked form (`summaryHtml`). Articles
 * without one render exactly as before, and the plain-text `summary` stays what
 * cards, RSS, metadata and JSON-LD use. The HTML is sanitized to links and
 * emphasis before it is injected.
 */
export function ArticleStandfirst({ html, className = '' }: { html?: string; className?: string }) {
  if (!html?.trim()) return null;
  const safe = renderSummaryHtml(html);
  if (!safe.trim()) return null;

  return <p className={`cl-standfirst ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />;
}
