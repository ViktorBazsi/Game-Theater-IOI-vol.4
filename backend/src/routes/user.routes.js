import express from "express";
import userController from "../controllers/user.controller.js";
// import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST
router.post("/", userController.create);
// GET
router.get("/", userController.list);
router.get("/:id", userController.getById);
// PUT
router.put("/:id", userController.update);
// DELETE
router.delete("/:id", userController.destroy);

export default router;
