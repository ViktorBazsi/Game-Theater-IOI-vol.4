import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import gameController from "../controllers/game.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

// POST
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  upload.none(),
  gameController.create,
);
// GET
router.get("/", authMiddleware.authenticate, gameController.list);
router.get("/:id", authMiddleware.authenticate, gameController.getById);
// PUT
router.put("/:id", authMiddleware.authenticate, gameController.update);
// DELETE
router.delete("/:id", authMiddleware.authenticate, gameController.destroy);

export default router;
