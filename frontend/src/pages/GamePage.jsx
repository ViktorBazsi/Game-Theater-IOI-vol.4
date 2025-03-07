import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import gameService from "../services/game.service";
import AuthContext from "../contexts/AuthContext";

export default function GamePage() {
  const { gameId } = useParams();
  const { user } = useContext(AuthContext); // 🔹 Bejelentkezett felhasználó lekérése
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
    <div className="h-screen bg-purple-950 text-white flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold">{game?.name}</h1>
      <p className="text-lg mt-4">
        Kedves {user?.username || "Játékos"}, várj a következő kérdésre!
      </p>
    </div>
  );
}
