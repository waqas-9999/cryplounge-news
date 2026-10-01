/**
 * "Key points": the short summary a reader scans before deciding to read on.
 * Sits between the lead image and the body on the article page, and in the
 * admin preview, so both show the same thing.
 *
 * The lines are plain text (the backend strips markup on save), so they are
 * rendered as text — never as HTML.
 */
export function ArticleKeyPoints({ points, className = '' }: { points: string[]; className?: string }) {
  if (points.length === 0) return null;

  return (
    <section aria-labelledby="article-key-points" className={`cl-keypoints ${className}`}>
      <h2 id="article-key-points" className="cl-keypoints-title !m-0">
        Key points
      </h2>
      <ul className="mt-3 space-y-2.5 !list-none !p-0">
        {points.map((point, i) => (
          <li key={i} className="cl-keypoint">
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
