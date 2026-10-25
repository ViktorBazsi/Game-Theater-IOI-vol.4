import prisma from "../models/prismaClient.js";
import HttpError from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import { isValidUserId } from "../utils/validation.utils.js";

const create = async ({ username, email, password }) => {
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });
  if (existingEmail) {
    throw new HttpError("Ezzel az email címmel már regisztráltak", 400);
  }
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    throw new HttpError("Ezzel a felhasználónévvel már regisztráltak", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
    omit: { password: true },
  });
  return newUser;
};

const list = async () => {
  const allUsers = await prisma.user.findMany({
    omit: { password: true },
    include: {
      answers: true,
    },
  });
  return allUsers;
};

const getById = async (id) => {
  const userById = await prisma.user.findUnique({
    where: { id },
    omit: { password: true },
    include: {
      answers: true,
    },
  });
  return userById;
};

// const update = async (id, userData) => {
//   await isValidUserId(id);
//   const updatedUser = await prisma.user.update({
//     where: { id },
//     data: { ...userData },
//   });
//   return updatedUser;
// };

const update = async (id, userData) => {
  await isValidUserId(id);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...(userData.answers && {
        answers: {
          connect: userData.answers.map((answerId) => ({ id: answerId })),
        },
      }),
    },
    omit: { password: true },
    include: {
      answers: true, // 📌 Visszaküldjük a felhasználóhoz tartozó válaszokat
    },
  });

  return updatedUser;
};

const resetAnswers = async (id) => {
  await isValidUserId(id);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      answers: {
        set: [], // 📌 Minden választ eltávolítunk (disconnect)
      },
    },
    omit: { password: true },
    include: {
      answers: true, // 📌 Visszaküldjük a felhasználóhoz tartozó válaszokat (most üres lesz)
    },
  });

  return updatedUser;
};

// Egy kérdésre egy szavazat: a régi válaszokat lecseréli az újra (egy lépésben)
const replaceAnswer = async (id, answerId, oldAnswerIds) => {
  return prisma.user.update({
    where: { id },
    data: {
      answers: {
        disconnect: oldAnswerIds.map((oldId) => ({ id: oldId })),
        connect: { id: answerId },
      },
    },
    omit: { password: true },
    include: { answers: true },
  });
};

const destroy = async (id) => {
  await isValidUserId(id);
  const deletedUser = await prisma.user.delete({
    where: { id },
    omit: { password: true },
  });
  return deletedUser;
};

export default {
  create,
  list,
  getById,
  update,
  destroy,
  // EXTRA
  resetAnswers,
  replaceAnswer,
};
