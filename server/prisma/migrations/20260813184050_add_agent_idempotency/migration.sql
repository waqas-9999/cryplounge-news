-- CreateEnum
CREATE TYPE "IdempotencyStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "AgentIdempotencyKey" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" "IdempotencyStatus" NOT NULL DEFAULT 'PROCESSING',
    "resultEntity" TEXT,
    "resultEntityId" TEXT,
    "response" JSONB,
    "error" TEXT,
    "requestHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentIdempotencyKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentIdempotencyKey_status_createdAt_idx" ON "AgentIdempotencyKey"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AgentIdempotencyKey_createdAt_idx" ON "AgentIdempotencyKey"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentIdempotencyKey_agentId_operation_key_key" ON "AgentIdempotencyKey"("agentId", "operation", "key");

-- AddForeignKey
ALTER TABLE "AgentIdempotencyKey" ADD CONSTRAINT "AgentIdempotencyKey_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AiAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
