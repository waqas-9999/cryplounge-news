-- Frequently asked questions as a structured field: [{ question, answer }].
--
-- Additive and non-destructive: existing articles receive an empty list and
-- no existing column or row is modified. FAQ blocks already inside article
-- bodies are left exactly where they are. To reverse:
--   ALTER TABLE "Article" DROP COLUMN "faqs";
ALTER TABLE "Article" ADD COLUMN "faqs" JSONB NOT NULL DEFAULT '[]';
