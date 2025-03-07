import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gameService from "../services/game.service";

export default function GamePage() {
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
    <div className="h-screen bg-logo-pattern bg-cover bg-center text-white p-10 pt-24">
      <div className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">{game?.name}</h1>
        <p className="text-lg mb-4">Létrehozva: {new Date(game?.createdAt).toLocaleString()}</p>
        <p className="text-lg mb-4">Aktuális kérdésszám: {game?.questionNum}</p>

        <h2 className="text-xl font-semibold mb-2">Játékosok és válaszaik:</h2>
        {game?.users?.length > 0 ? (
          <ul className="list-none">
            {game.users.map((player) => (
              <li key={player.id} className="bg-gray-900 p-4 mb-2 rounded-lg">
                <p className="text-lg font-bold">{player.username}</p>
                {player.answers.length > 0 ? (
                  <ul className="mt-2">
                    {player.answers.map((answer) => (
                      <li key={answer.id} className="text-gray-300 text-sm">
                        <strong>Kérdés #{answer.relQuestN}:</strong> {answer.answer}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">Még nincs válasza.</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Nincsenek csatlakozott játékosok.</p>
        )}

        <h2 className="text-xl font-semibold mt-4 mb-2">Eredmények:</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-900 p-3 rounded-lg">
            <p className="font-bold">Réka</p>
            <p className="text-lg">{game?.rekaResult}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg">
            <p className="font-bold">Domi</p>
            <p className="text-lg">{game?.domiResult}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg">
            <p className="font-bold">Kata</p>
            <p className="text-lg">{game?.kataResult}</p>
          </div>
        </div>

        {game?.collAnswer?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-4 mb-2">Kollektív válaszok:</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm">
              {JSON.stringify(game.collAnswer, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
