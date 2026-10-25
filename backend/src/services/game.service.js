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
      users: { select: { id: true, username: true } },
    },
  });
  return allGames;
};

// withAnswers: csak admin / szerveroldali számoláshoz (a játékosok válaszaival)
const getById = async (id, { withAnswers = false } = {}) => {
  await isValidGameId(id);
  const gameById = await prisma.game.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, username: true, answers: withAnswers },
      },
      collAnswer: true,
    },
  });
  return gameById;
};

const update = async (id, gameData) => {
  await isValidGameId(id);

  const updatedGame = await prisma.game.update({
    where: { id },
    data: { ...gameData },
    include: { collAnswer: true }, // 🔥 Így a `collAnswers` tartalma is visszajön
  });

  return updatedGame;
};

// Atomikus nyitás: csak akkor sikerül, ha a szavazás még nincs nyitva
const openVoting = async (id) => {
  const { count } = await prisma.game.updateMany({
    where: { id, availableForAns: false },
    data: { availableForAns: true },
  });
  return count === 1;
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
      collAnswer: {
        set: [], // 🔥 Az összes választ eltávolítja anélkül, hogy törölné azokat
      },
    },
    include: { collAnswer: true },
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
  openVoting,
};
