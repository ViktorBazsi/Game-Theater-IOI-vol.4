import express from "express";
import { errorHandler } from "./middleware/errorHandlingMiddleware.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import questionRoutes from "./routes/question.routes.js";
import answerRoutes from "./routes/answer.routes.js";
import gameRoutes from "./routes/game.routes.js";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/question", questionRoutes);
app.use("/api/answer", answerRoutes);
app.use("/api/game", gameRoutes);

app.use(errorHandler);

export default app;
