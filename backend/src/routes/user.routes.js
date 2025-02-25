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
// JOIN
router.post("/join", authMiddleware.authenticate, userController.joinGame);
// REMOVE
router.post(
  "/remove",
  authMiddleware.authenticate,
  userController.removeFromGame,
);

export default router;
