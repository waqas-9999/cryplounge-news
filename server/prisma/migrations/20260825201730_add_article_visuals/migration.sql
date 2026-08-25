-- CreateEnum
CREATE TYPE "ArticleVisualType" AS ENUM ('PHOTO', 'CHART', 'INFOGRAPHIC', 'TIMELINE');

-- CreateEnum
CREATE TYPE "ArticleVisualPlacement" AS ENUM ('HERO', 'INLINE');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "caption" TEXT;

-- CreateTable
CREATE TABLE "ArticleVisual" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" "ArticleVisualType" NOT NULL,
    "placement" "ArticleVisualPlacement" NOT NULL DEFAULT 'INLINE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "relevanceReason" TEXT,
    "chartMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticleVisual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArticleVisual_articleId_placement_position_idx" ON "ArticleVisual"("articleId", "placement", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleVisual_articleId_mediaId_key" ON "ArticleVisual"("articleId", "mediaId");

-- AddForeignKey
ALTER TABLE "ArticleVisual" ADD CONSTRAINT "ArticleVisual_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleVisual" ADD CONSTRAINT "ArticleVisual_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
