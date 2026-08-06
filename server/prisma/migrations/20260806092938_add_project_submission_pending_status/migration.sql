-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "submittedByEmail" TEXT,
ADD COLUMN     "submittedByName" TEXT;

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");
