import prisma from "../models/prismaClient.js";
import HttpError from "../utils/HttpError.js";
import { isValidQuestionId } from "../utils/validation.utils.js";

const create = async (questionData) => {
  const { number, question } = questionData;

  const existingQuestion = await prisma.question.findUnique({
    where: { number },
  });
  if (existingQuestion)
    throw new HttpError("Az adott sorszámú kérdés már szerepel", 400);

  const newQuestion = await prisma.question.create({
    data: {
      number,
      question,
    },
  });
  return newQuestion;
};

const list = async () => {
  const allQuestions = await prisma.question.findMany({
    include: {
      answers: true,
    },
    orderBy: {
      number: "asc",
    },
  });
  return allQuestions;
};

const getById = async (id) => {
  await isValidQuestionId(id);
  const getQuestionById = await prisma.question.findUnique({
    where: { id },
    include: {
      answers: true,
    },
  });
  return getQuestionById;
};

const getByNumber = async (number) => {
  const getQuestionByNumber = await prisma.question.findUnique({
    where: { number },
    include: {
      answers: true,
    },
  });
  return getQuestionByNumber;
};

const update = async (id, questionData) => {
  await isValidQuestionId(id);
  const updatedQuestion = await prisma.question.update({
    where: { id },
    data: { ...questionData },
  });
  return updatedQuestion;
};

const destroy = async (id) => {
  await isValidQuestionId(id);
  const deletedQuestion = await prisma.question.delete({
    where: { id },
  });
  return deletedQuestion;
};

export default {
  create,
  list,
  getById,
  getByNumber,
  update,
  destroy,
};
