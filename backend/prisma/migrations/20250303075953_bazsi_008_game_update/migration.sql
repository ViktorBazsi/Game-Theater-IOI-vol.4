-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "domiResult" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "kataResult" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rekaResult" INTEGER NOT NULL DEFAULT 0;
