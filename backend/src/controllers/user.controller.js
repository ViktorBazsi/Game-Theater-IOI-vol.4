import userService from "../services/user.service.js";
import { JWT_SECRET } from "../constants/constants.js";
import HttpError from "../utils/HttpError.js";
import { extractUserIdFromToken } from "../utils/validation.utils.js";
import gameService from "../services/game.service.js";
import answerService from "../services/answer.service.js";

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

// REMOVE USER ANSWERS
const resetAnswers = async (req, res, next) => {
  const { id } = req.params;

  // UserId from token - AUTHENTICATION NEEDED
  let userId = extractUserIdFromToken(req, JWT_SECRET);
  if (id != userId) {
    return next(new HttpError("Csak a saját profilodat módosíthatod", 401));
  }

  try {
    const updatedUser = await userService.resetAnswers(id);
    res.status(200).json(updatedUser);
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
      return res.status(400).json({
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

// ANSWER
// wokring ver 01
// const addAnswerToGame = async (req, res, next) => {
//   const { gameId } = req.params; // A game ID kinyerése az URL-ből
//   const { id: answerId } = req.body; // Az answer ID kinyerése a body-ból

//   try {
//     // 📌 Ellenőrizzük, hogy létezik-e a játék
//     const game = await gameService.getById(gameId);
//     if (!game) {
//       return res.status(404).json({ error: "Game not found" });
//     }

//     // 📌 Ellenőrizzük, hogy létezik-e a válasz az adatbázisban
//     const existingAnswer = await answerService.getById(answerId);
//     if (!existingAnswer) {
//       return res.status(404).json({ error: "Answer not found" });
//     }

//     // 📌 A meglévő answer kapcsolása a game.collAnswers tömbhöz (Prisma `connect` használata)
//     const updatedGame = await gameService.update(gameId, {
//       collAnswers: {
//         connect: { id: answerId }, // 🔥 Kapcsoljuk a meglévő answer-t a game-hez
//       },
//     });

//     res.status(200).json(updatedGame); // 📌 Frissített játék visszaküldése
//   } catch (error) {
//     next(error); // Hibakezelés
//   }
// };

// VOL2:
// const addAnswerToGame = async (req, res, next) => {
//   const { gameId } = req.params; // A játék ID kinyerése az URL-ből
//   const { id: answerId } = req.body; // A válasz ID-ja
//   const userId = req.user?.id; // 🔥 Felhasználó ID-ja az auth middleware-ből

//   try {
//     // 📌 Ellenőrizzük, hogy a felhasználó be van-e jelentkezve
//     if (!userId) {
//       return res
//         .status(401)
//         .json({ error: "Unauthorized: User not authenticated" });
//     }

//     // 📌 Ellenőrizzük, hogy létezik-e a játék
//     const game = await gameService.getById(gameId);
//     if (!game) {
//       return res.status(404).json({ error: "Game not found" });
//     }

//     // 📌 Ellenőrizzük, hogy létezik-e a válasz az adatbázisban
//     const existingAnswer = await answerService.getById(answerId);
//     if (!existingAnswer) {
//       return res.status(404).json({ error: "Answer not found" });
//     }

//     // 📌 Hozzáadjuk az új választ a `collAnswers` tömbhöz (duplikációk is megengedettek)
//     const updatedGame = await gameService.update(gameId, {
//       collAnswers: {
//         connect: { id: answerId }, // 🔥 Hozzácsatoljuk az új választ anélkül, hogy törölnénk az előzőeket
//       },
//     });

//     res.status(200).json(updatedGame); // 📌 Frissített játék visszaküldése
//   } catch (error) {
//     next(error); // Hibakezelés
//   }
// };

const addAnswerToGame = async (req, res, next) => {
  const { gameId } = req.params;
  const { id: answerId } = req.body;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not authenticated" });
    }

    const game = await gameService.getById(gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const existingAnswer = await answerService.getById(answerId);
    if (!existingAnswer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    // 🔥 A felhasználóhoz hozzákapcsoljuk az új választ
    const updatedUser = await userService.update(userId, {
      answers: [answerId],
    });

    res.status(200).json(updatedUser);
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
  // REMOVE ANSWERS
  resetAnswers,
  // EXTRA
  joinGameById,
  LeaveGameById,
  // ANSWER
  addAnswerToGame,
};
