import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  userController.create
);
// GET
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  userController.list
);
// admin vagy a saját profil (a controllerben ellenőrizve)
router.get("/:id", authMiddleware.authenticate, userController.getById);
// PUT
router.put("/:id", authMiddleware.authenticate, userController.update);
// DELETE
router.delete("/:id", authMiddleware.authenticate, userController.destroy);
// EXTRA
router.post(
  "/join-game/:gameId",
  authMiddleware.authenticate,
  userController.joinGameById
);
router.post(
  "/leave-game/:gameId",
  authMiddleware.authenticate,
  userController.LeaveGameById
);
// ANSWER
router.post(
  "/answer/:gameId",
  authMiddleware.authenticate,
  userController.addAnswerToGame
);
// REMOVE ANSWERS
router.put(
  "/reset/:id",
  authMiddleware.authenticate,
  userController.resetAnswers
);

export default router;
