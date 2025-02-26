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
      question: true,
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
      question: {
        include: {
          answers: true,
        },
      },
      answer: true,
    },
  });
  return gameById;
};

const update = async (id, gameData) => {
  {
    await isValidGameId(id);
    const updatedGame = await prisma.game.update({
      where: { id },
      data: { ...gameData },
    });
    return updatedGame;
  }
};

const destroy = async (id) => {
  await isValidGameId(id);
  const deletedGame = await prisma.game.delete({
    where: { id },
  });
  return deletedGame;
};

export default {
  list,
  getById,
  create,
  update,
  destroy,
};
