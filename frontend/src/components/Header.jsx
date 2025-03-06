import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import AuthModal from "./modals/AuthModal"; // Új AuthModal importálása

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("login"); // login vagy register

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const showLoginModal = () => {
    setModalType("login");
    setIsModalOpen(true);
  };

  const showRegisterModal = () => {
    setModalType("register");
    setIsModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full text-white py-4 px-24 flex justify-between items-center shadow-md">
        <div className="flex gap-4 text-xl font-bold">
          <h1 className="cursor-default">Üdvözlünk a játékSzínházban</h1>
          {user && (
            <span className="hover:text-white transform transition hover:cursor-pointer duration-700 hover:scale-110 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] cursor-default">
              {`${user.username}!`}
            </span>
          )}
        </div>
        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <Link
                to="/signedIn"
                className="rounded-md px-3 py-2 hover:border-2  hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transform transition duration-300 hover:scale-110"
              >
                Profilod
              </Link>
              <Link
                to="/signedIn/games"
                className="rounded-md px-3 py-2 hover:border-2  hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transform transition duration-300 hover:scale-110"
              >
                Eddigi játékaid
              </Link>
              {user.isAdmin && (
                <>
                  <Link
                    to="/question"
                    className="rounded-md px-3 py-2 text-yellow-500 border border-transparent hover:border-yellow-500 hover:text-yellow-600 transition duration-300"
                  >
                    Kérdések & Válaszok
                  </Link>
                  <Link
                    to="/newGame"
                    className="rounded-md px-3 py-2 text-yellow-500 border border-transparent hover:border-yellow-500 hover:text-yellow-600 transition duration-300"
                  >
                    Új játék
                  </Link>
                </>
              )}
              <button
                className="rounded-md px-3 py-2 text-red-600 border border-transparent hover:border-red-600 hover:text-red-700 transition duration-300"
                onClick={handleLogout}
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <button
              className="rounded-md px-3 py-2  text-green-600 border border-transparent hover:border-green-600 hover:text-green-700 transition duration-300"
              onClick={() => setIsModalOpen(true)}
            >
              Belépés
            </button>
          )}
        </nav>
      </header>

      {/* Új AuthModal megjelenítése */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} // 🔹 Így a háttérre kattintás és az `×` gomb is bezárja
        modalType={modalType}
        showRegisterModal={showRegisterModal}
        showLoginModal={showLoginModal}
      />
    </>
  );
}
