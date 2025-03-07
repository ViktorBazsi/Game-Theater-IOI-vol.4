import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Importáld a useNavigate-et
import gameService from "../../services/game.service";
import userService from "../../services/user.service";
import AuthContext from "../../contexts/AuthContext";

export default function GameSelectionModal({ onClose }) {
  const { user } = useContext(AuthContext);
  const [games, setGames] = useState([]);
  const [_userGameId, setUserGameId] = useState(null);
  const navigate = useNavigate(); // Használjuk a navigációhoz

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesList = await gameService.listAllGames();
        setGames(gamesList);

        const joinedGame = gamesList.find((game) =>
          game.users?.some((player) => player.id === user?.id)
        );

        setUserGameId(joinedGame ? joinedGame.id : null);
      } catch (error) {
        console.error("Hiba a játékok lekérésekor:", error);
      }
    };

    fetchGames();
  }, [user]);

  const handleJoinGame = async (gameId) => {
    try {
      await userService.joinGameById(gameId);
      setUserGameId(gameId);
      onClose();
      navigate(`/game/${gameId}`); // Átnavigálás a kiválasztott játék oldalára
    } catch (error) {
      console.error("Hiba a csatlakozáskor:", error);
    }
  };

  const handleLeaveGame = async (gameId) => {
    try {
      await userService.leaveGameById(gameId);
      setUserGameId(null);
      onClose();
    } catch (error) {
      console.error("Hiba a kilépéskor:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-xl font-bold mb-4">Válassz egy játékot</h2>
        <ul>
          {games.map((game) => {
            const isUserInGame = game.users?.some(
              (player) => player.id === user?.id
            );
            return (
              <li
                key={game.id}
                className="mb-2 flex justify-between items-center"
              >
                <span>{game.name}</span>
                {isUserInGame ? (
                  <button
                    onClick={() => handleLeaveGame(game.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Kilépés
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGame(game.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Csatlakozás
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}
