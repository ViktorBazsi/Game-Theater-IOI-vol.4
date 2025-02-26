import userService from "../services/user.service.js";
import { JWT_SECRET } from "../constants/constants.js";
import HttpError from "../utils/HttpError.js";
import { extractUserIdFromToken } from "../utils/validation.utils.js";

const create = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await userService.create({
      username,
      email,
      password,
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const allUsers = await userService.list();
    res.status(200).json(allUsers);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userById = await userService.getById(id);
    res.status(200).json(userById);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, isAdmin } = req.body;

  // UserId form token - AUTHENTICATION NEEDED
  let userId = extractUserIdFromToken(req, JWT_SECRET);
  if (id != userId) {
    return next(new HttpError("Csak a saját profilodat módosíthatod", 401));
  }

  try {
    const updatedUser = await userService.update(id, {
      username,
      email,
      password,
      isAdmin,
    });
    res.status(201).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req.params;

  // UserId form token - AUTHENTICATION NEEDED
  let userId = extractUserIdFromToken(req, JWT_SECRET);
  if (id != userId) {
    return next(new HttpError("Csak a saját profilodat törölheted", 401));
  }

  try {
    const deletedUser = await userService.destroy(id);
    res.status(200).json({ deletedUser });
  } catch (error) {
    next(error);
  }
};

// JOIN GAME

const joinGame = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id; // Az authenticate middleware állítja be

    if (!gameId) {
      return next(new HttpError("Missing gameId", 400));
    }

    await userService.addUserToGame(gameId, userId);
    res.status(200).json({ message: "User successfully added to the game" });
  } catch (error) {
    next(error);
  }
};

// REMOVE FROM GAME

const removeFromGame = async (req, res, next) => {
  try {
    const { gameId } = req.body;
    const userId = req.user.id; // Az authenticate middleware állítja be

    if (!gameId) {
      return next(new HttpError("Missing gameId", 400));
    }

    await userService.removeUserFromGame(gameId, userId);
    res
      .status(200)
      .json({ message: "User successfully removed from the game" });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  getById,
  update,
  destroy,
  // JOIN
  joinGame,
  // REMOVE
  removeFromGame,
};
