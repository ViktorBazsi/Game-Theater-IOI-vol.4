import authService from "../services/auth.service.js";
import {
  userValidationSchemaForLoginEmail,
  userValidationSchemaForLoginName,
  userValidationSchemaForRegister,
} from "../validations/user.validations.js";

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    await userValidationSchemaForRegister.validate({
      username,
      email,
      password,
    });
    const newUser = await authService.register({
      username,
      email,
      password,
    });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (username) {
      await userValidationSchemaForLoginName.validate({
        username,
        password,
      });
    }
    if (email) {
      await userValidationSchemaForLoginEmail.validate({
        email,
        password,
      });
    }
    const token = await authService.login({
      username,
      email,
      password,
    });
    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
};
