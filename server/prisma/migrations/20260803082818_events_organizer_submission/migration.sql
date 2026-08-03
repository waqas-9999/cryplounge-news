-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "organizerId" TEXT,
ADD COLUMN     "postponedAt" TIMESTAMP(3),
ADD COLUMN     "submittedByEmail" TEXT,
ADD COLUMN     "submittedByName" TEXT,
ADD COLUMN     "telegramChannel" TEXT,
ADD COLUMN     "ticketPrice" TEXT;

-- CreateTable
CREATE TABLE "Organizer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoId" TEXT,
    "contactPerson" TEXT,
    "contactEmail" TEXT,
    "telegramUsername" TEXT,
    "telegramChannel" TEXT,
    "website" TEXT,
    "x" TEXT,
    "linkedin" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventToResearch" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToResearch_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToRegulation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToRegulation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Organizer_verified_idx" ON "Organizer"("verified");

-- CreateIndex
CREATE INDEX "_EventToResearch_B_index" ON "_EventToResearch"("B");

-- CreateIndex
CREATE INDEX "_EventToRegulation_B_index" ON "_EventToRegulation"("B");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organizer" ADD CONSTRAINT "Organizer_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToResearch" ADD CONSTRAINT "_EventToResearch_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToResearch" ADD CONSTRAINT "_EventToResearch_B_fkey" FOREIGN KEY ("B") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToRegulation" ADD CONSTRAINT "_EventToRegulation_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToRegulation" ADD CONSTRAINT "_EventToRegulation_B_fkey" FOREIGN KEY ("B") REFERENCES "Regulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
