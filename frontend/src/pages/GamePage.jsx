import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import gameService from "../services/game.service";
import questionService from "../services/question.service";
import userService from "../services/user.service";
import AuthContext from "../contexts/AuthContext";

export default function GamePage() {
  const { gameId } = useParams();
  const { _user } = useContext(AuthContext);
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submittedAnswer, setSubmittedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableForAns, setAvailableForAns] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // ⏳ Visszaszámláló állapota

  // 🔄 Frissítjük a játék állapotát 2 másodpercenként
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await gameService.getGameById(gameId);
        setGame(gameData);
        setAvailableForAns(gameData.availableForAns || false);

        // 🔥 Ha availableForAns true és új kérdés érkezik, akkor:
        // - Nullázzuk a submittedAnswer-t (hogy újra lehessen választani)
        // - Nullázzuk a selectedAnswer-t is (ne maradjon kijelölve az előző válasz)
        // - Állítsuk be a visszaszámlálót 20-ra
        if (gameData.availableForAns && timeLeft === null) {
          setTimeLeft(20);
          setSubmittedAnswer(null);
          setSelectedAnswer(null);
        }

        // 🔥 Ha availableForAns false lesz, nullázzuk a kérdést és visszaszámlálót
        if (!gameData.availableForAns) {
          setCurrentQuestion(null);
          setTimeLeft(null);
        }

        // 🔥 Lekérdezzük a kérdést, ha availableForAns true és van kérdésszám
        if (gameData.availableForAns && gameData.questionNum) {
          const questionData = await questionService.getQuestionByNumber(
            gameData.questionNum
          );
          setCurrentQuestion(questionData);
        }
      } catch (err) {
        setError("Hiba történt a játék betöltése közben.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [gameId, timeLeft]); // 🔄 timeLeft is figyelés alatt

  // 🔄 Visszaszámláló (egyszeri indítás)
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : null));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]); // 🔥 Csak akkor indul el újra, ha timeLeft nem null

  // ✅ A felhasználó válaszküldése
  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    try {
      await userService.answerByUserByGameById(gameId, selectedAnswer);
      setSubmittedAnswer(selectedAnswer); // 🔥 Mentjük a választ, hogy látható maradjon
    } catch (err) {
      console.error("Hiba a válasz elküldésekor:", err);
    }
  };

  if (loading) {
    return <div className="text-center text-white">Betöltés...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-screen bg-purple-950 text-white flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold">{game?.name || "Játék"}</h1>

      {/* Ha `availableForAns` false, akkor várakozó állapot */}
      {!availableForAns ? (
        <p className="text-lg mt-4">Várakozás a következő kérdésre...</p>
      ) : currentQuestion ? (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg text-white w-96">
          <h2 className="text-xl font-bold">{currentQuestion.question}</h2>

          {/* 🔥 Ha `answers` nem létezik vagy üres, ne próbáljunk `map()`-et hívni */}
          {currentQuestion.answers &&
          Array.isArray(currentQuestion.answers) &&
          currentQuestion.answers.length > 0 ? (
            <ul className="mt-4">
              {currentQuestion.answers.map((answer) => (
                <li
                  key={answer.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    submittedAnswer?.id === answer.id
                      ? "bg-blue-500" // 🔵 Megjelenítjük a kiválasztott választ
                      : selectedAnswer?.id === answer.id
                      ? "bg-green-500"
                      : "bg-gray-700"
                  }`}
                  onClick={() => !submittedAnswer && setSelectedAnswer(answer)}
                >
                  {answer.answer}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-4">Nincsenek válaszok...</p>
          )}

          {/* Ha a felhasználó már válaszolt, ne engedjük újra beküldeni */}
          {!submittedAnswer && (
            <button
              onClick={submitAnswer}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              disabled={!selectedAnswer}
            >
              Válasz beküldése
            </button>
          )}

          {/* 🔥 Visszaszámláló megjelenítése */}
          <p className="mt-4 text-red-500 font-bold">
            {timeLeft !== null ? `Hátralévő idő: ${timeLeft} másodperc` : ""}
          </p>
        </div>
      ) : (
        <p className="text-lg mt-4">Kérdés betöltése...</p>
      )}
    </div>
  );
}
