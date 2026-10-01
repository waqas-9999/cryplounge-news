import type { ArticleFaq } from '@/types/article';

/**
 * The article's FAQs, after the body. Shared by the public article page and
 * the admin preview so the two cannot drift apart.
 *
 * Drawn with the same markup and styles as the editor's in-body FAQ block
 * (`section[data-type="faq"]` inside `.cl-prose`), so an article whose FAQ
 * lives in the field and an older one whose FAQ lives in the body look alike.
 * Questions and answers are plain text and rendered as text — never as HTML;
 * an answer's blank lines become paragraphs.
 */
export function ArticleFaqs({ faqs, className = '' }: { faqs: ArticleFaq[]; className?: string }) {
  if (faqs.length === 0) return null;

  return (
    <div className={`prose dark:prose-invert max-w-none cl-prose ${className}`}>
      <section data-type="faq" aria-labelledby="article-faqs">
        <h2 id="article-faqs" data-role="faq-title">
          Frequently asked questions
        </h2>
        {faqs.map((faq, i) => (
          <details key={i} data-type="faq-item">
            <summary>{faq.question}</summary>
            <div data-role="faq-answer">
              {faq.answer
                .split(/\n{2,}/)
                .map(part => part.trim())
                .filter(Boolean)
                .map((part, j) => (
                  <p key={j}>{part}</p>
                ))}
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
