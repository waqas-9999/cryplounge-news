-- Editor recovery requests for stories the newsroom held back.
--
-- Purely additive: two enums, one table, its indexes. Nothing existing is
-- altered and no data is touched. Written by hand, like the telemetry
-- migration, so no unrelated drift correction rides along.

-- CreateEnum
CREATE TYPE "NewsroomRecoveryAction" AS ENUM ('ADVANCE_TO_RESEARCH', 'REQUIRE_REWRITE', 'RETRY', 'DISMISS');

-- CreateEnum
CREATE TYPE "NewsroomRecoveryStatus" AS ENUM ('PENDING', 'QUEUED', 'APPLIED', 'REJECTED');

-- CreateTable
CREATE TABLE "NewsroomRecoveryRequest" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,
    "action" "NewsroomRecoveryAction" NOT NULL,
    "status" "NewsroomRecoveryStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "previousState" TEXT,
    "previousStateCode" TEXT,
    "decisionClass" TEXT,
    "originalReason" TEXT,
    "requestedState" TEXT NOT NULL,
    "pipelineVersion" TEXT,
    "storyTitle" TEXT,
    "requestedById" TEXT,
    "requestedByEmail" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "ackDetail" TEXT,
    "jobId" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsroomRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsroomRecoveryRequest_idempotencyKey_key" ON "NewsroomRecoveryRequest"("idempotencyKey");

-- CreateIndex
CREATE INDEX "NewsroomRecoveryRequest_status_createdAt_idx" ON "NewsroomRecoveryRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NewsroomRecoveryRequest_clusterId_createdAt_idx" ON "NewsroomRecoveryRequest"("clusterId", "createdAt");
