import express from "express";
import { errorHandler } from "./middleware/errorHandlingMiddleware.js";

const app = express();

app.use(express.json());

app.use(errorHandler);

export default app;
