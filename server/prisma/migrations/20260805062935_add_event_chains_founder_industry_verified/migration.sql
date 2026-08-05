-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "chains" TEXT[];

-- AlterTable
ALTER TABLE "Founder" ADD COLUMN     "industry" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
