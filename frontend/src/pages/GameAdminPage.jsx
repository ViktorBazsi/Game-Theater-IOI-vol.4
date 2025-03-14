import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gameService from "../services/game.service";

import GameSummary from "../components/GameSummary";
import UpcomingQuestion from "../components/UpcomingQuestion";

export default function GameAdminPage() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lastQuestionNum, setLastQuestionNum] = useState(null);

  const fetchGame = async () => {
    try {
      const gameData = await gameService.getGameById(gameId);
      setGame(gameData);
      if (gameData.questionNum !== lastQuestionNum) {
        setLastQuestionNum(gameData.questionNum);
      }
    } catch (err) {
      setError("Hiba történt a játék adatainak betöltése közben.");
      console.error("Hiba a játék lekérésekor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [gameId]);

  const handleNextQuestion = async () => {
    setLoading(true);
    setError(null);
    setTimeLeft(20);

    try {
      await gameService.NextQuestionByGameById(gameId);
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setTimeLeft(null);
            fetchGame();
            setTimeout(fetchGame, 1000);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Hiba történt a következő kérdés indításakor.");
      console.error("Hiba:", err);
      setTimeLeft(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-white">Betöltés...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-logo-pattern bg-cover bg-center pt-20">
      <div className="max-w-screen-xl mx-auto min-h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 p-6">
        {/* Game Summary (3/5 szélesség nagy kijelzőn) */}
        <div className="lg:w-3/5 flex justify-center items-center">
          <GameSummary game={game} />
        </div>

        {/* Upcoming Question (2/5 szélesség nagy kijelzőn) */}
        <div className="lg:w-2/5 flex flex-col items-center">
          {game?.questionNum && (
            <UpcomingQuestion questionNumber={game.questionNum} />
          )}

          {/* Gomb és visszaszámláló */}
          <div className="mt-4 text-white text-center w-full">
            <button
              onClick={handleNextQuestion}
              className="w-full md:w-auto bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={loading || timeLeft !== null}
            >
              {loading
                ? "Kérdés küldése..."
                : timeLeft !== null
                ? `Visszaszámlálás: ${timeLeft} mp`
                : "Következő kérdés"}
            </button>

            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
