-- Key points shown above the article body: an ordered list of plain-text
-- lines. Defaults to an empty list so existing articles are unaffected.
--
-- Additive and non-destructive. To reverse:
--   ALTER TABLE "Article" DROP COLUMN "keyPoints";
ALTER TABLE "Article" ADD COLUMN "keyPoints" JSONB NOT NULL DEFAULT '[]';
