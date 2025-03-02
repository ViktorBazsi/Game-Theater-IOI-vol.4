/*
  Warnings:

  - You are about to drop the `_Answer_Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Answer_Game" DROP CONSTRAINT "_Answer_Game_A_fkey";

-- DropForeignKey
ALTER TABLE "_Answer_Game" DROP CONSTRAINT "_Answer_Game_B_fkey";

-- DropTable
DROP TABLE "_Answer_Game";

-- CreateTable
CREATE TABLE "_User_Answer_Game" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_User_Answer_Game_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_User_Answer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_User_Answer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_User_Answer_Game_B_index" ON "_User_Answer_Game"("B");

-- CreateIndex
CREATE INDEX "_User_Answer_B_index" ON "_User_Answer"("B");

-- AddForeignKey
ALTER TABLE "_User_Answer_Game" ADD CONSTRAINT "_User_Answer_Game_A_fkey" FOREIGN KEY ("A") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_User_Answer_Game" ADD CONSTRAINT "_User_Answer_Game_B_fkey" FOREIGN KEY ("B") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_User_Answer" ADD CONSTRAINT "_User_Answer_A_fkey" FOREIGN KEY ("A") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_User_Answer" ADD CONSTRAINT "_User_Answer_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
