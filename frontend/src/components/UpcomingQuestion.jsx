import { useState, useEffect } from "react";
import questionService from "../services/question.service";

export default function UpcomingQuestion({ questionNumber }) {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!questionNumber) return;

    const fetchQuestion = async () => {
      try {
        const data = await questionService.getQuestionByNumber(questionNumber);
        setQuestionData(data);
      } catch (err) {
        setError("Hiba történt a kérdés betöltésekor.");
        console.error("Hiba a kérdés lekérésekor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionNumber]);

  if (loading) {
    return <div className="text-center text-white">Betöltés...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!questionData) {
    return (
      <div className="text-center text-gray-400">Nincs elérhető kérdés.</div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white mt-6">
      <h2 className="text-2xl font-bold mb-4">Következő kérdés:</h2>
      <p className="text-lg mb-4">{questionData.question}</p>

      <h3 className="text-xl font-semibold mb-2">Válaszok:</h3>
      <ul className="list-none">
        {questionData.answers.map((answer) => (
          <li key={answer.id} className="bg-gray-900 p-3 mb-2 rounded-lg">
            <p className="text-lg">{answer.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
