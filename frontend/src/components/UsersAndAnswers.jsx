import { useState } from "react";
import CollectiveAnswersModal from "./modals/CollectiveAnswersModal";

export default function UsersAnsewers({ game }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full flex justify-center items-center p-6">
      <div className="max-w-3xl w-full bg-gray-800 p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-xl font-semibold mb-2">Játékosok és válaszaik:</h2>
        {game.users?.length > 0 ? (
          <ul className="list-none">
            {game.users.map((player) => (
              <li key={player.id} className="bg-gray-900 p-4 mb-2 rounded-lg">
                <p className="text-lg font-bold">{player.username}</p>
                {player.answers.length > 0 ? (
                  <ul className="mt-2">
                    {player.answers.map((answer) => (
                      <li key={answer.id} className="text-gray-300 text-sm">
                        <strong>Kérdés #{answer.relQuestN}:</strong>{" "}
                        {answer.answer}
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
            <p className="text-lg">{game.rekaResult}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg">
            <p className="font-bold">Domi</p>
            <p className="text-lg">{game.domiResult}</p>
          </div>
          <div className="bg-gray-900 p-3 rounded-lg">
            <p className="font-bold">Kata</p>
            <p className="text-lg">{game.kataResult}</p>
          </div>
        </div>

        {game.collAnswer?.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-4 mb-2">
              Kollektív válaszok:
            </h2>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              Megtekintés
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-lg w-full"
            onClick={(e) => e.stopPropagation()} // Megakadályozza a háttér kattintáskor a bezárást
          >
            <h2 className="text-xl font-semibold mb-4">Kollektív válaszok</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm">
              {JSON.stringify(game.collAnswer, null, 2)}
            </pre>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              onClick={() => setIsModalOpen(false)}
            >
              Bezárás
            </button>
          </div>

          {/* Modal használata */}
          <CollectiveAnswersModal
            title="Kollektív válaszok"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <pre className="bg-gray-900 p-4 rounded text-sm">
              {JSON.stringify(game.collAnswer, null, 2)}
            </pre>
          </CollectiveAnswersModal>
        </div>
      )}
    </div>
  );
}
