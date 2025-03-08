import { useState, useEffect } from "react";
import gameService from "../services/game.service";

export default function GameStatusInline({ gameId }) {
  const [gameData, setGameData] = useState(null);
  const [latestAnswer, setLatestAnswer] = useState(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const data = await gameService.getGameById(gameId);
        console.log("🔍 API adatok:", data);
        if (!data.availableForAns) {
          setGameData(data);
          if (data.collAnswer.length > 0) {
            setLatestAnswer(data.collAnswer[data.collAnswer.length - 1]);
          }
        }
      } catch (error) {
        console.error("❌ Hiba a játékadatok lekérdezésekor:", error);
      }
    };

    fetchGameData();
    const interval = setInterval(fetchGameData, 5000);

    return () => clearInterval(interval);
  }, [gameId]);

  if (!gameData) {
    return (
      <p style={{ color: "white", textAlign: "center" }}>
        Játékállás betöltése...
      </p>
    );
  }

  const { rekaResult, domiResult, kataResult } = gameData;

  console.log("📊 Értékek:", { rekaResult, domiResult, kataResult });

  // ✅ Egyedi oszlopmagasságok kiszámítása minden oszlophoz!
  const calculateHeight = (value) => {
    let heightPercentage = (Math.abs(value) / 4) * 100;
    if (Math.abs(value) === 1) {
      heightPercentage = 25;
    }
    console.log(`📏 Oszlop (${value}): ${heightPercentage}%`);
    return heightPercentage;
  };

  // ✅ Egyedi színek minden oszlophoz
  const getColor = (value) => {
    const colorMap = {
      4: "#008000", // sötétzöld
      3: "#32CD32", // világoszöld
      2: "#ADFF2F", // sárgászöld
      1: "#FFFF00", // sárga
      0: "#808080", // szürke
      "-1": "#FF6347", // korallpiros
      "-2": "#FF4500", // narancs
      "-3": "#DC143C", // vörös
      "-4": "#8B0000", // sötétvörös
    };
    return colorMap[String(value)] || "#808080";
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h2
        style={{ fontSize: "24px", textAlign: "center", marginBottom: "16px" }}
      >
        Jelenlegi állás:
      </h2>

      {latestAnswer && (
        <p
          style={{
            fontSize: "22px",
            color: "#ddd",
            textAlign: "center",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          <span
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#fff",
              display: "block",
              marginBottom: "8px",
            }}
          >
            {latestAnswer.answer}
          </span>
          (Reka:{" "}
          <span style={{ fontWeight: "bold" }}>{latestAnswer.resultReka}</span>,
          Domi:{" "}
          <span style={{ fontWeight: "bold" }}>{latestAnswer.resultDomi}</span>,
          Kata:{" "}
          <span style={{ fontWeight: "bold" }}>{latestAnswer.resultKata}</span>)
        </p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "flex-end",
          width: "100%",
          height: "70vh",
          padding: "20px",
        }}
      >
        {[
          { name: "Reka", value: rekaResult },
          { name: "Domi", value: domiResult },
          { name: "Kata", value: kataResult },
        ].map(({ name, value }) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "30%",
            }}
          >
            <p style={{ marginBottom: "8px", fontSize: "24px" }}>{name}</p>
            <div
              style={{
                height: "400px", // 🔥 FIXÁLT magasság az oszlopoknak!
                width: "100%",
                maxWidth: "250px", // Szélesebb oszlopok!
                backgroundColor: "#444",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                borderRadius: "8px",
                overflow: "hidden",
                minHeight: "200px",
              }}
            >
              <div
                style={{
                  height: `${calculateHeight(value)}%`, // 🔥 Most már tényleg kitölti az oszlopot!
                  backgroundColor: getColor(value),
                  transition:
                    "height 0.8s ease-in-out, background-color 0.5s ease-in-out",
                  minHeight: "30px", // ✅ Minimum méret, hogy mindig látszódjon
                }}
              ></div>
            </div>
            <p
              style={{ marginTop: "8px", fontSize: "28px", fontWeight: "bold" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
