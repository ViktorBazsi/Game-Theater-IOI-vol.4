import prisma from "../models/prismaClient.js";
import { isValidGameName, isValidGameId } from "../utils/validation.utils.js";

const create = async ({ name }) => {
  await isValidGameName(name);
  const newGame = await prisma.game.create({
    data: { name },
  });
  return newGame;
};

const list = async () => {
  const allGames = await prisma.game.findMany({
    include: {
      users: true,
    },
  });
  return allGames;
};

const getById = async (id) => {
  await isValidGameId(id);
  const gameById = await prisma.game.findUnique({
    where: { id },
    include: {
      users: true,
      collAnswers: true,
    },
  });
  return gameById;
};

const update = async (id, gameData) => {
  await isValidGameId(id);

  const updatedGame = await prisma.game.update({
    where: { id },
    data: { ...gameData },
    include: { collAnswers: true }, // 🔥 Így a `collAnswers` tartalma is visszajön
  });

  return updatedGame;
};

const destroy = async (id) => {
  await isValidGameId(id);
  const deletedGame = await prisma.game.delete({
    where: { id },
  });
  return deletedGame;
};

// EXTRA
const resetGame = async (id, gameData) => {
  await isValidGameId(id);

  const updatedGame = await prisma.game.update({
    where: { id },
    data: {
      ...gameData,
      collAnswers: {
        set: [], // 🔥 Az összes választ eltávolítja anélkül, hogy törölné azokat
      },
    },
    include: { collAnswers: true },
  });

  return updatedGame;
};

export default {
  list,
  getById,
  create,
  update,
  destroy,
  // EXTRA
  resetGame,
};
