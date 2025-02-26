import prisma from "../models/prismaClient.js";
import { isValidGameName, isValidGameId } from "../utils/validation.utils.js";
import questionService from "../services/question.service.js";

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

export const addQuestionToGame = async (id, number) => {
  // Lekérjük a kérdést a number alapján
  const question = await questionService.getByNumber(Number(number));

  if (!question) {
    throw new Error("Question not found");
  }

  await isValidGameId(id);

  // Ellenőrizzük, hogy a kérdés már hozzá van-e adva a játékhoz
  // const isAlreadyAdded = game.questions.some((q) => q.id === question.id);

  // if (isAlreadyAdded) {
  //   throw new Error("Question already added to the game");
  // }

  // Hozzáadjuk a kérdést a játékhoz

  const updatedGameWithQuestion = await prisma.game.update({
    where: { id },
    data: {
      question: {
        set: [{ id: question.id }],
      },
    },
    include: {
      question: {
        include: {
          answers: true,
        },
      },
      answer: true,
    },
  });
  return updatedGameWithQuestion;
};

export default {
  list,
  getById,
  create,
  update,
  destroy,
  // EXTRA
  addQuestionToGame,
};
