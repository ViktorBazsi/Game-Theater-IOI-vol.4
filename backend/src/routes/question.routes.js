import express from "express";
import questionController from "../controllers/question.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

// POST
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  upload.none(),
  questionController.create,
);
// GET
router.get("/", authMiddleware.authenticate, questionController.list);
router.get("/:id", authMiddleware.authenticate, questionController.getById);
router.get(
  "/number/:number",
  authMiddleware.authenticate,
  questionController.getByNumber,
);
// PUT
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  questionController.update,
);
// DELETE
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  questionController.destroy,
);

export default router;
