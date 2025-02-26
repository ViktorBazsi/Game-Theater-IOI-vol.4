import userService from "../services/user.service.js";
import { JWT_SECRET } from "../constants/constants.js";
import HttpError from "../utils/HttpError.js";
import { extractUserIdFromToken } from "../utils/validation.utils.js";
import gameService from "../services/game.service.js";

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

// EXTRA
const joinGameById = async (req, res, next) => {
  const { gameId } = req.params;
  const user = req.user;

  try {
    // Megkeressük az adott játékot
    const game = await gameService.getById(gameId);
    if (!game) {
      return res.status(404).json({ error: "A játék nem található." });
    }

    // Ellenőrizzük, hogy a felhasználó már benne van-e a játékban
    const isUserAlreadyInGame = game.users.some((u) => u.id === user.id);
    if (isUserAlreadyInGame) {
      return res
        .status(400)
        .json({ error: "Már csatlakoztál ehhez a játékhoz." });
    }

    // **Prisma update: connect user to game**
    const updatedGame = await gameService.update(gameId, {
      users: {
        connect: { id: user.id }, // **Helyes Prisma kapcsolat**
      },
    });

    res.status(200).json({
      message: `Sikeresen hozzáadva a következő játékhoz: ${updatedGame.name}`,
      updatedGame: updatedGame,
    });
  } catch (error) {
    next(error);
  }
};

const LeaveGameById = async (req, res, next) => {
  const { gameId } = req.params;
  const user = req.user;

  try {
    // Megkeressük az adott játékot
    const game = await gameService.getById(gameId);
    if (!game) {
      return res.status(404).json({ error: "A játék nem található." });
    }

    // Ellenőrizzük, hogy a felhasználó már benne van-e a játékban
    const isUserAlreadyInGame = game.users.some((u) => u.id === user.id);
    if (!isUserAlreadyInGame) {
      return res
        .status(400)
        .json({
          error: "Nem tudsz kilépni ebből a játékból, mert nem vagy benne.",
        });
    }

    // **Prisma update: connect user to game**
    const updatedGame = await gameService.update(gameId, {
      users: {
        disconnect: { id: user.id }, // **Helyes Prisma kapcsolat**
      },
    });

    res.status(200).json({
      message: `Sikeresen kiléptél a következő játékból: ${updatedGame.name}`,
      updatedGame: updatedGame,
    });
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
  // EXTRA
  joinGameById,
  LeaveGameById,
};
