import answerService from "../services/answer.service.js";
import HttpError from "../utils/HttpError.js";

const create = async (req, res, next) => {
  const { relQuestN, answer, resultReka, resultDomi, resultKata, nextQuestN } =
    req.body;
  const userId = req.user?.id;

  if (!userId) {
    return next(
      new HttpError(
        "Be kell jelentkezned adminként a válaszok feltöltéséhez",
        401,
      ),
    );
  }
  try {
    const newAnswer = await answerService.create({
      relQuestN: Number(relQuestN),
      answer,
      resultReka: Number(resultReka),
      resultDomi: Number(resultDomi),
      resultKata: Number(resultKata),
      nextQuestN: Number(nextQuestN),
    });
    res.status(201).json(newAnswer);
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const allAnswers = await answerService.list();
    res.status(200).json(allAnswers);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const userById = await answerService.getById(id);
    res.status(200).json(userById);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const {
    relQuestionNr,
    answer,
    resultReka,
    resultDomi,
    resultKata,
    nextQuestNr,
  } = req.body;

  try {
    const updatedAnswer = await answerService.update(id, {
      relQuestionNr,
      answer,
      resultReka,
      resultDomi,
      resultKata,
      nextQuestNr,
    });
    res.status(201).json(updatedAnswer);
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedAnswer = await answerService.destroy(id);
    res.status(200).json({ deletedAnswer });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  list,
  getById,
  update,
  destroy,
};
