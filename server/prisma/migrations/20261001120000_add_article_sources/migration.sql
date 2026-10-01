-- Structured article sources ([{ name, url, note? }]), kept separate from the body.
--
-- Editorial metadata only: CrypLounge does not render these on the public
-- article or return them from public endpoints.
--
-- Additive and non-destructive: existing articles receive an empty list and
-- no existing column or row is modified. To reverse:
--   ALTER TABLE "Article" DROP COLUMN "sources";
ALTER TABLE "Article" ADD COLUMN "sources" JSONB NOT NULL DEFAULT '[]';
