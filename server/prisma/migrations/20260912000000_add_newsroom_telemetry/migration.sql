-- Newsroom operational telemetry.
--
-- Purely additive: one new table and its indexes. Nothing existing is altered
-- and no data is touched. Written by hand rather than generated, because
-- `migrate diff --from-migrations` also emitted pre-existing drift corrections
-- (a DropIndex on "Media" and an unrelated AlterTable) that have nothing to do
-- with telemetry and must not ride along inside this migration.

-- CreateTable
CREATE TABLE "NewsroomEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "workflowId" TEXT,
    "clusterId" TEXT,
    "articleId" TEXT,
    "stage" TEXT,
    "status" TEXT,
    "source" TEXT,
    "model" TEXT,
    "durationMs" INTEGER,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsroomEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsroomEvent_createdAt_idx" ON "NewsroomEvent"("createdAt");

-- CreateIndex
CREATE INDEX "NewsroomEvent_type_createdAt_idx" ON "NewsroomEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "NewsroomEvent_workflowId_createdAt_idx" ON "NewsroomEvent"("workflowId", "createdAt");

-- CreateIndex
CREATE INDEX "NewsroomEvent_clusterId_createdAt_idx" ON "NewsroomEvent"("clusterId", "createdAt");
