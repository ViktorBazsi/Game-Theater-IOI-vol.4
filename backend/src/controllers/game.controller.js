import gameService from "../services/game.service.js";
import HttpError from "../utils/HttpError.js";

const create = async (req, res, next) => {
  const { name } = req.body;

  try {
    const newGame = await gameService.create({
      name,
    });
    res.status(201).json(newGame);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const allGame = await gameService.list();
    res.status(200).json(allGame);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const getGameById = await gameService.getById(id);
    res.status(200).json(getGameById);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedGamePath = await gameService.update(id, {
      name,
    });
    res.status(201).json(updatedGamePath);
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedGame = await gameService.destroy(id);
    res.status(200).json({ deletedGame });
  } catch (error) {
    next(error);
  }
};

export default {
  list,
  getById,
  create,
  update,
  destroy,
};
