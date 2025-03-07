import { useState } from "react";
import GameSelectionModal from "../components/modals/GameSelectionModal";

export default function MainPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-screen bg-logo-pattern bg-cover bg-center">
      <div className="h-full flex flex-col justify-end items-center text-white text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-md px-3 py-2 border-2 hover:text-white hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transform transition duration-700 hover:scale-150 mb-48"
        >
          Csatlakozás
        </button>
      </div>
      {isModalOpen && (
        <GameSelectionModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
