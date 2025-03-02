import gameService from "../services/game.service.js";
import questionService from "../services/question.service.js";

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

// const nextQuestion = async (req, res, next) => {
//   const { id } = req.params;
//   const currentGame = await gameService.getById(id);
//   const nextQuestionNumber = currentGame.questionNum + 1;
//   try {
//     const nextQuestion = await questionService.getByNumber(nextQuestionNumber);
//     res.status(201).json(nextQuestion);
//   } catch (error) {
//     next(error);
//   }
// };

// RESET
const reset = async (req, res, next) => {
  const { id } = req.params;
  const { name, questionNum } = req.body;

  try {
    const resetGameData = await gameService.resetGame(id, {
      name,
      questionNum,
    });
    res.status(200).json(resetGameData);
  } catch (error) {
    next(error);
  }
};

// NEXT
const nextQuestion = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Játék és következő kérdés lekérése
    let currentGame = await gameService.getById(id);
    const nextQuestionNumber = currentGame.questionNum + 1;
    const nextQuestion = await questionService.getByNumber(nextQuestionNumber);

    // 🔥 Előző válaszok törlése a collAnswers-ből
    await gameService.update(id, {
      collAnswers: {
        set: [], // 🔥 Kiürítjük a tömböt, hogy ne maradjanak benne korábbi válaszok
      },
    });

    // 🔥 Kiküldjük az új kérdést a kliensnek
    res.status(201).json(nextQuestion);

    // 20 másodperc várakozás a felhasználói válaszokra
    await new Promise((resolve) => setTimeout(resolve, 20000));

    // 🔥 Ismét lekérjük a frissített játék állapotot, hogy megkapjuk az új válaszokat
    currentGame = await gameService.getById(id);

    // Ha nincsenek beérkezett válaszok, nem csinálunk semmit
    if (!currentGame.collAnswers || currentGame.collAnswers.length === 0) {
      console.log("No answers received");
      return;
    }

    // 🔥 Számoljuk, hogy melyik válaszból mennyi érkezett
    const answerCounts = currentGame.collAnswers.reduce((acc, answer) => {
      acc[answer.id] = (acc[answer.id] || 0) + 1;
      return acc;
    }, {});

    // 🔥 Megkeressük a legtöbbször érkezett válaszokat
    let maxCount = Math.max(...Object.values(answerCounts));
    let mostVotedAnswers = Object.keys(answerCounts).filter(
      (id) => answerCounts[id] === maxCount
    );

    // 🔥 Ha több válasznak is ugyanannyi szavazata van, véletlenszerűen választunk egyet
    const selectedAnswerId =
      mostVotedAnswers.length > 1
        ? mostVotedAnswers[Math.floor(Math.random() * mostVotedAnswers.length)]
        : mostVotedAnswers[0];

    // 🔥 Kiválasztott válasz objektumának kikeresése
    const selectedAnswer = currentGame.collAnswers.find(
      (answer) => answer.id === selectedAnswerId
    );

    if (!selectedAnswer) {
      console.error("Selected answer not found in collAnswers");
      return;
    }

    // 🔥 Frissítjük a játék állapotát Prisma-val: csak a legtöbb szavazatot kapott választ tartjuk meg
    await gameService.update(id, {
      collAnswers: {
        set: [{ id: selectedAnswerId }], // 🔥 Csak az ID marad
      },
      questionNum: selectedAnswer.nextQuestN, // 🔥 A kiválasztott válasz nextQuestN értékét beírjuk
    });

    console.log(
      `Game ${id} updated: selected answer = ${selectedAnswerId}, next questionNum = ${selectedAnswer.nextQuestN}`
    );
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
  // RESET
  reset,
  // NEXT
  nextQuestion,
};
