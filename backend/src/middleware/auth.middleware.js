import { JWT_SECRET } from "../constants/constants.js";
import HttpError from "../utils/HttpError.js";
import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new HttpError("Token missing, jelentkezz be!", 401));
  try {
    const userDecoded = jwt.verify(token, JWT_SECRET);
    req.user = userDecoded;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (req, res, next) => {
  const { isAdmin } = req.user;
  if (isAdmin) {
    next();
  } else {
    next(new HttpError("Unauthorized, not admin", 403));
  }
};

export default {
  authenticate,
  authorize,
};
