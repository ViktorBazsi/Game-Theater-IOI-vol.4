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
  const [timeLeft, setTimeLeft] = useState(null); // ⏳ Visszaszámláló
  const [lastQuestionNum, setLastQuestionNum] = useState(null); // 🔥 Az előző kérdésszámot tárolja

  const fetchGame = async () => {
    try {
      const gameData = await gameService.getGameById(gameId);
      setGame(gameData);

      // 🔥 Ha a kérdésszám megváltozott, frissítsük azt is
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
  }, [gameId]); // 🔄 Frissítés a játék állapotának változásakor

  const handleNextQuestion = async () => {
    setLoading(true);
    setError(null);
    setTimeLeft(20); // ⏳ Indul a visszaszámlálás

    try {
      await gameService.NextQuestionByGameById(gameId);

      // ⏳ Indítjuk a 20 másodperces visszaszámlálást
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setTimeLeft(null);

            // 🔄 Kétszer frissítjük a game adatokat, hogy biztosan naprakész legyen
            fetchGame();
            setTimeout(fetchGame, 1000); // Egy kis idő múlva újra lekérjük az adatokat

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
    <div className="h-screen bg-logo-pattern bg-cover bg-center p-6">
      <div className="h-full flex text-white">
        {/* Bal oldal: GameSummary (2/3 szélesség) */}
        <div className="w-2/3 flex justify-center items-center">
          <GameSummary game={game} />
        </div>

        {/* Jobb oldal: UpcomingQuestion (1/3 szélesség) */}
        <div className="w-1/3 flex flex-col justify-center items-center">
          {game?.questionNum && (
            <UpcomingQuestion questionNumber={game.questionNum} />
          )}

          {/* Gomb és hibaüzenet az UpcomingQuestion alatt */}
          <div className="mt-4 text-white">
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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
