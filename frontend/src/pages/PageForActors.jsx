import GameStatus from "../components/GameStatus";

export default function PageForActors() {
  const gameId = "cm7ort9i20000tyyk20iw2czo"; // Ez dinamikusan is állítható

  return (
    <div className="h-screen bg-logo-pattern bg-cover bg-center">
      <div className="h-full flex flex-col justify-end items-center text-white text-center">
        {/* Játékállás megjelenítése középen */}

        <GameStatus gameId={gameId} />
      </div>
    </div>
  );
}
