import gameService from "../services/game.service.js";
import questionService from "../services/question.service.js";
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
    // a játékosok válaszait csak az admin kapja meg
    const getGameById = await gameService.getById(id, {
      withAnswers: Boolean(req.user?.isAdmin),
    });
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
  const { name, questionNum, rekaResult, domiResult, kataResult } = req.body;

  try {
    const resetGameData = await gameService.resetGame(id, {
      name,
      questionNum,
      rekaResult,
      domiResult,
      kataResult,
    });
    res.status(200).json(resetGameData);
  } catch (error) {
    next(error);
  }
};

// NEXT
// VOL.1
// const nextQuestion = async (req, res, next) => {
//   const { id } = req.params;

//   try {
//     // Játék és következő kérdés lekérése
//     let currentGame = await gameService.getById(id);
//     const nextQuestionNumber = currentGame.questionNum + 1;
//     const nextQuestion = await questionService.getByNumber(nextQuestionNumber);

//     // 🔥 Előző válaszok törlése a collAnswers-ből
//     await gameService.update(id, {
//       collAnswers: {
//         set: [], // 🔥 Kiürítjük a tömböt, hogy ne maradjanak benne korábbi válaszok
//       },
//     });

//     // 🔥 Kiküldjük az új kérdést a kliensnek
//     res.status(201).json(nextQuestion);

//     // 20 másodperc várakozás a felhasználói válaszokra
//     await new Promise((resolve) => setTimeout(resolve, 20000));

//     // 🔥 Ismét lekérjük a frissített játék állapotot, hogy megkapjuk az új válaszokat
//     currentGame = await gameService.getById(id);

//     // Ha nincsenek beérkezett válaszok, nem csinálunk semmit
//     if (!currentGame.collAnswers || currentGame.collAnswers.length === 0) {
//       console.log("No answers received");
//       return;
//     }

//     // 🔥 Számoljuk, hogy melyik válaszból mennyi érkezett
//     const answerCounts = currentGame.collAnswers.reduce((acc, answer) => {
//       acc[answer.id] = (acc[answer.id] || 0) + 1;
//       return acc;
//     }, {});

//     // 🔥 Megkeressük a legtöbbször érkezett válaszokat
//     let maxCount = Math.max(...Object.values(answerCounts));
//     let mostVotedAnswers = Object.keys(answerCounts).filter(
//       (id) => answerCounts[id] === maxCount
//     );

//     // 🔥 Ha több válasznak is ugyanannyi szavazata van, véletlenszerűen választunk egyet
//     const selectedAnswerId =
//       mostVotedAnswers.length > 1
//         ? mostVotedAnswers[Math.floor(Math.random() * mostVotedAnswers.length)]
//         : mostVotedAnswers[0];

//     // 🔥 Kiválasztott válasz objektumának kikeresése
//     const selectedAnswer = currentGame.collAnswers.find(
//       (answer) => answer.id === selectedAnswerId
//     );

//     if (!selectedAnswer) {
//       console.error("Selected answer not found in collAnswers");
//       return;
//     }

//     // 🔥 Frissítjük a játék állapotát Prisma-val: csak a legtöbb szavazatot kapott választ tartjuk meg
//     await gameService.update(id, {
//       collAnswers: {
//         set: [{ id: selectedAnswerId }], // 🔥 Csak az ID marad
//       },
//       questionNum: selectedAnswer.nextQuestN, // 🔥 A kiválasztott válasz nextQuestN értékét beírjuk
//     });

//     console.log(
//       `Game ${id} updated: selected answer = ${selectedAnswerId}, next questionNum = ${selectedAnswer.nextQuestN}`
//     );
//   } catch (error) {
//     next(error);
//   }
// };

const nextQuestion = async (req, res, next) => {
  const { id } = req.params;
  let currentQuestion;

  try {
    // 🔥 Játék és aktuális kérdés lekérése
    const currentGame = await gameService.getById(id);

    // Már fut egy szavazás: nem indítunk második időzítőt
    if (currentGame.availableForAns) {
      return next(new HttpError("A szavazás már folyamatban van", 409));
    }

    currentQuestion = await questionService.getByNumber(currentGame.questionNum);

    if (!currentQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    // 🔥 Elérhetővé tesszük a válaszadást (atomikusan, párhuzamos hívások ellen)
    const opened = await gameService.openVoting(id);
    if (!opened) {
      return next(new HttpError("A szavazás már folyamatban van", 409));
    }

    // 🔥 Kiküldjük az aktuális kérdést, válaszokat és a válaszolhatóság állapotát
    res.status(201).json({ ...currentQuestion, availableForAns: true });
  } catch (error) {
    return next(error);
  }

  // Innen a válasz már elment: hiba esetén nem hívhatunk next(error)-t
  try {
    // 🔥 Megjegyezzük a kiküldött válaszok ID-jait
    const validAnswerIds = currentQuestion.answers.map((answer) => answer.id);

    // 20 másodperc várakozás a válaszokra
    await new Promise((resolve) => setTimeout(resolve, 20000));

    // 🔥 Válaszadás lehetőség letiltása
    await gameService.update(id, { availableForAns: false });

    // 🔥 Ismét lekérjük a frissített játék állapotot, hogy megkapjuk a felhasználók válaszait
    const currentGame = await gameService.getById(id, { withAnswers: true });

    // 🔥 Felhasználók válaszainak begyűjtése
    const userAnswers = currentGame.users.flatMap((user) => user.answers);

    // 🔥 Csak a korábban kiküldött válaszokat vesszük figyelembe
    const filteredAnswers = userAnswers.filter((answer) =>
      validAnswerIds.includes(answer.id)
    );

    // 🔥 Ha nincsenek érvényes válaszok, nem csinálunk semmit
    if (filteredAnswers.length === 0) {
      console.log("No valid answers received");
      return;
    }

    // 🔥 Számoljuk, hogy melyik válaszból mennyi érkezett
    const answerCounts = filteredAnswers.reduce((acc, answer) => {
      acc[answer.id] = (acc[answer.id] || 0) + 1;
      return acc;
    }, {});

    // 🔥 Megkeressük a legtöbbször választott válaszokat
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
    const selectedAnswer = filteredAnswers.find(
      (answer) => answer.id === selectedAnswerId
    );

    if (!selectedAnswer) {
      console.error("Selected answer not found in user answers");
      return;
    }

    // 🔥 Frissítjük a játék állapotát Prisma-val
    await gameService.update(id, {
      collAnswer: {
        set: [{ id: selectedAnswerId }], // 🔥 Az új válasz beállítása, előzőek törlése
      },
      questionNum: selectedAnswer.nextQuestN, // 🔥 Következő kérdés beállítása

      // 🔥 Hozzáadjuk a válasz eredményeit az eddigi eredményekhez
      rekaResult: currentGame.rekaResult + selectedAnswer.resultReka,
      domiResult: currentGame.domiResult + selectedAnswer.resultDomi,
      kataResult: currentGame.kataResult + selectedAnswer.resultKata,
    });

    console.log(
      `Game ${id} updated: selected answer = ${selectedAnswerId}, next questionNum = ${selectedAnswer.nextQuestN}`
    );
  } catch (error) {
    console.error(`Game ${id} szavazás-lezárási hiba:`, error);
    try {
      await gameService.update(id, { availableForAns: false });
    } catch (resetError) {
      console.error(
        `Game ${id} availableForAns visszaállítása sikertelen:`,
        resetError
      );
    }
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
