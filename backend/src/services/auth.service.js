import prisma from "../models/prismaClient.js";
import HttpError from "../utils/HttpError.js";
import userService from "../services/user.service.js";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../constants/constants.js";
import jwt from "jsonwebtoken";

const register = async ({ username, email, password }) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  if (existingUser) {
    throw new HttpError("A felhasználónév vagy e-mail már foglalt!", 400);
  }

  const newUser = userService.create({
    username,
    email,
    password,
  });
  return newUser;
};

const login = async ({ username, email, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: username || undefined }, { email: email || undefined }],
    },
  });
  if (!user)
    throw new HttpError("Nincs ilyen felhasználónév vagy e-mail cím!", 403);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new HttpError("Helytelen jelszó!", 403);

  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
    isAdmin: user.isAdmin,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
  return token;
};

export default { register, login };
