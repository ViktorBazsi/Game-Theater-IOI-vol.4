/*
  Warnings:

  - You are about to drop the column `questionId` on the `Game` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_questionId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "questionId",
ADD COLUMN     "questionNum" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_questionNum_fkey" FOREIGN KEY ("questionNum") REFERENCES "Question"("number") ON DELETE RESTRICT ON UPDATE CASCADE;
