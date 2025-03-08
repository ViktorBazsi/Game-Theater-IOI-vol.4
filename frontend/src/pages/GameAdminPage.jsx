import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gameService from "../services/game.service";

import GameSummary from "../components/GameSummary";
import UpcomingQuestion from "../components/UpcomingQuestion"; // 📌 Importáljuk az új komponenst

export default function GameAdminPage() {
  const { gameId } = useParams(); // 🔹 URL-ből kiolvassuk a gameId-t
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await gameService.getGameById(gameId);
        setGame(gameData);
      } catch (err) {
        setError("Hiba történt a játék adatainak betöltése közben.");
        console.error("Hiba a játék lekérésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

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
        <div className="w-1/3 flex justify-center items-center">
          {game?.questionNum && (
            <UpcomingQuestion questionNumber={game.questionNum} />
          )}
        </div>
      </div>
    </div>
  );
}
