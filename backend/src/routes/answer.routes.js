import express from "express";
import answerController from "../controllers/answer.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST
router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  answerController.create,
);
// GET
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  answerController.list,
);
router.get(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  answerController.getById,
);
// PUT
router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  answerController.update,
);
// DELETE
router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.authorize,
  answerController.destroy,
);

export default router;
