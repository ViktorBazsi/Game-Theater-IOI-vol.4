import questionService from "../services/question.service.js";
import HttpError from "../utils/HttpError.js";

const create = async (req, res, next) => {
  const { number, question } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return next(
      new HttpError("Admin bejelentkezés kell a kérdés feltöltéséhez", 401)
    );
  }

  try {
    const newQuestion = await questionService.create({
      number: Number(number),
      question,
    });
    res.status(201).json(newQuestion);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const questions = await questionService.list();
    res.status(200).json(questions);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const getQuestionById = await questionService.getById(id);
    res.status(200).json(getQuestionById);
  } catch (error) {
    next(error);
  }
};

const getByNumber = async (req, res, next) => {
  const { number } = req.params;
  try {
    const getQuestionByNumber = await questionService.getByNumber(
      Number(number)
    );
    res.status(200).json(getQuestionByNumber);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const { number, question } = req.body;

  try {
    const updatedQuestion = await questionService.update(id, {
      number: Number(number),
      question,
    });
    res.status(201).json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await questionService.destroy(id);
    res.status(200).json({ deletedQuestion });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  getById,
  getByNumber,
  update,
  destroy,
};
