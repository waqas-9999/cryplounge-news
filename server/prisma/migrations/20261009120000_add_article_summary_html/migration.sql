-- Standfirst with contextual links (sanitized inline HTML). The plain-text
-- `summary` is unchanged and remains what cards, RSS and metadata use.
--
-- Additive and nullable: existing articles keep NULL and render exactly as
-- before. No existing row is modified.
-- reverse: ALTER TABLE "Article" DROP COLUMN "summaryHtml";
ALTER TABLE "Article" ADD COLUMN "summaryHtml" TEXT;
