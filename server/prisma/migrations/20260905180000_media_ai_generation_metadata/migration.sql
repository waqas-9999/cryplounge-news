-- Image Studio: provenance and review state for AI-generated media.
--
-- Additive only. Every column is nullable or defaulted, so existing rows and
-- the running CMS are unaffected and the migration is safe to apply to a
-- production database with live traffic.

CREATE TYPE "MediaReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ERROR');

ALTER TABLE "Media"
  ADD COLUMN "isAiGenerated"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "generationProvider"    TEXT,
  ADD COLUMN "generationModel"       TEXT,
  ADD COLUMN "reviewStatus"          "MediaReviewStatus",
  ADD COLUMN "reviewScore"           INTEGER,
  ADD COLUMN "reviewReasons"         TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "generatedForArticleId" TEXT;

-- The Studio lists candidates for one article, newest first.
CREATE INDEX "Media_generatedForArticleId_createdAt_idx"
  ON "Media" ("generatedForArticleId", "createdAt" DESC);
