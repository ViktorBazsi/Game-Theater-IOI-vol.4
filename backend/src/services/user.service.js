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
      games: true,
    },
  });
  return allUsers;
};

const getById = async (id) => {
  const userById = await prisma.user.findUnique({
    where: { id },
  });
  return userById;
};

const update = async (id, userData) => {
  await isValidUserId(id);
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { ...userData },
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

// JOIN GAME

const addUserToGame = async (gameId, userId) => {
  // Ellenőrizzük, hogy a játék és a felhasználó létezik-e
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!game || !user) {
    throw new Error("Game or User not found");
  }

  // Felhasználó hozzáadása a játékhoz
  return await prisma.game.update({
    where: { id: gameId },
    data: {
      users: {
        connect: { id: userId },
      },
    },
  });
};

// ROMVE FROM GAME

const removeUserFromGame = async (gameId, userId) => {
  // Ellenőrizzük, hogy a játék és a felhasználó létezik-e
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!game || !user) {
    throw new Error("Game or User not found");
  }

  // Felhasználó hozzáadása a játékhoz
  return await prisma.game.update({
    where: { id: gameId },
    data: {
      users: {
        disconnect: { id: userId },
      },
    },
  });
};

export default {
  create,
  list,
  getById,
  update,
  destroy,
  // JOIN
  addUserToGame,
  // REMOVE
  removeUserFromGame,
};
