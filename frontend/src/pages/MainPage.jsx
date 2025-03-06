import { Link } from "react-router-dom";

export default function MainPage() {
  // const navigate = useNavigate();

  return (
    <div className="h-screen bg-blue-900">
      <div className="h-full flex flex-col justify-end items-center text-white text-center">
        {/* <button className="rounded-md px-3 py-2 border-2 hover:text-white hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transform transition duration-700 hover:scale-150 mb-48">
          Kezdés
        </button> */}
        <Link
          to="/currentGame"
          className="rounded-md px-3 py-2 border-2 hover:text-white hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transform transition duration-700 hover:scale-150 mb-48"
        >
          Kezdés
        </Link>
      </div>
    </div>
  );
}
