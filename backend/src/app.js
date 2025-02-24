import express from "express";
import { errorHandler } from "./middleware/errorHandlingMiddleware.js";

import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());

app.use("/api/user", userRoutes);

app.use(errorHandler);

export default app;
