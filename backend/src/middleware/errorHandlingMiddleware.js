import HttpError from "../utils/HttpError.js";

export const errorHandler = (err, req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.log("Unexpected error: ", err);
  res.status(500).json({ error: "Internal Server Error" });
};
