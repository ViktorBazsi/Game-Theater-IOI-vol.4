import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST
router.post("/", userController.create);
// GET
router.get("/", userController.list);
router.get("/:id", userController.getById);
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

export default router;
