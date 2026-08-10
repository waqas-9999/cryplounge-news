-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pendingRoleKey" TEXT;

-- CreateTable
CREATE TABLE "_UserAdditionalRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserAdditionalRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserAdditionalRoles_B_index" ON "_UserAdditionalRoles"("B");

-- AddForeignKey
ALTER TABLE "_UserAdditionalRoles" ADD CONSTRAINT "_UserAdditionalRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "RoleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserAdditionalRoles" ADD CONSTRAINT "_UserAdditionalRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
