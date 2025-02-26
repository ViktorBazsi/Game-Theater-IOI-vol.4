-- CreateTable
CREATE TABLE "_Answer_Game" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Answer_Game_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_Answer_Game_B_index" ON "_Answer_Game"("B");

-- AddForeignKey
ALTER TABLE "_Answer_Game" ADD CONSTRAINT "_Answer_Game_A_fkey" FOREIGN KEY ("A") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Answer_Game" ADD CONSTRAINT "_Answer_Game_B_fkey" FOREIGN KEY ("B") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
