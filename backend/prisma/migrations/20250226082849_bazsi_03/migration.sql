/*
  Warnings:

  - You are about to drop the `_Answer_Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Question_Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_User_Game` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Answer_Game" DROP CONSTRAINT "_Answer_Game_A_fkey";

-- DropForeignKey
ALTER TABLE "_Answer_Game" DROP CONSTRAINT "_Answer_Game_B_fkey";

-- DropForeignKey
ALTER TABLE "_Question_Game" DROP CONSTRAINT "_Question_Game_A_fkey";

-- DropForeignKey
ALTER TABLE "_Question_Game" DROP CONSTRAINT "_Question_Game_B_fkey";

-- DropForeignKey
ALTER TABLE "_User_Game" DROP CONSTRAINT "_User_Game_A_fkey";

-- DropForeignKey
ALTER TABLE "_User_Game" DROP CONSTRAINT "_User_Game_B_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "questionId" TEXT,
ADD COLUMN     "resultAnsId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gameId" TEXT;

-- DropTable
DROP TABLE "_Answer_Game";

-- DropTable
DROP TABLE "_Question_Game";

-- DropTable
DROP TABLE "_User_Game";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_resultAnsId_fkey" FOREIGN KEY ("resultAnsId") REFERENCES "Answer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
