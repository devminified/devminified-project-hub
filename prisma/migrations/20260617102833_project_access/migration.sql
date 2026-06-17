-- CreateTable
CREATE TABLE "_ProjectAccess" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectAccess_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectAccess_B_index" ON "_ProjectAccess"("B");

-- AddForeignKey
ALTER TABLE "_ProjectAccess" ADD CONSTRAINT "_ProjectAccess_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectAccess" ADD CONSTRAINT "_ProjectAccess_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
