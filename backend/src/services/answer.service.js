import prisma from "../models/prismaClient.js";
import { isValidAnswerId } from "../utils/validation.utils.js";

const create = async (answerData) => {
  const { relQuestN, answer, resultReka, resultDomi, resultKata, nextQuestN } =
    answerData;

  const newAnswer = await prisma.answer.create({
    data: {
      relQuestN,
      answer,
      resultReka,
      resultDomi,
      resultKata,
      nextQuestN,
    },
  });
  return newAnswer;
};

const list = async () => {
  const allAnswers = await prisma.answer.findMany();
  return allAnswers;
};

const getById = async (id) => {
  await isValidAnswerId(id);
  const answerById = await prisma.answer.findUnique({
    where: { id },
  });
  return answerById;
};

const getByAnswer = async (answer) => {
  const answerByAnswer = await prisma.answer.findFirst({
    where: { answer },
  });
  return answerByAnswer;
};

const update = async (id, answerData) => {
  await isValidAnswerId(id);
  const updatedAnswer = await prisma.answer.update({
    where: { id },
    data: { ...answerData },
  });
  return updatedAnswer;
};

const destroy = async (id) => {
  await isValidAnswerId(id);
  const deletedAnswer = await prisma.answer.delete({
    where: { id },
  });
  return deletedAnswer;
};

export default {
  create,
  list,
  getById,
  update,
  destroy,
  // ------ EXTRA
  getByAnswer,
};
