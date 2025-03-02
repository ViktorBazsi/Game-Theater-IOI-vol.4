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
  });
  return newUser;
};

const list = async () => {
  const allUsers = await prisma.user.findMany({
    include: {
      answers: true,
    },
  });
  return allUsers;
};

const getById = async (id) => {
  const userById = await prisma.user.findUnique({
    where: { id },
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
    include: {
      answers: true, // 📌 Visszaküldjük a felhasználóhoz tartozó válaszokat (most üres lesz)
    },
  });

  return updatedUser;
};

const destroy = async (id) => {
  await isValidUserId(id);
  const deletedUser = await prisma.user.delete({
    where: { id },
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
};
