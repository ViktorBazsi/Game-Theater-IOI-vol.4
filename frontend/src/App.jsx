import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
// Pages
import LandingPage from "./pages/LandingPage";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <ToastContainer /> {/* 🔹 Ezt ide rakd, hogy minden oldalon működjön */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/main" element={<MainPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
