import { renderArticleBody } from '@/lib/article-body';

/**
 * The article body as readers see it: the stored HTML, sanitized to the
 * editor's shapes and styled for tables, FAQs and figures. Shared by the
 * public article page and the admin preview so the two cannot drift apart.
 *
 * TechiArena's version also renders the article's Sources list here.
 * CrypLounge does not: sources are editorial metadata, kept for traceability
 * and review, and CrypLounge does not credit source publications on the page.
 */
export function ArticleBody({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`prose dark:prose-invert max-w-none cl-prose ${className}`}
      dangerouslySetInnerHTML={{ __html: renderArticleBody(html) }}
    />
  );
}
