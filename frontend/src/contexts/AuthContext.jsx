import { jwtDecode } from "jwt-decode";
import { createContext, useState, useEffect } from "react";

import authService from "../services/auth.service.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [authMsg, setAuthMsg] = useState({
    show: false,
    msg: "",
    success: false,
  });

  const showAuthMsg = (show) => {
    setAuthMsg(
      show
        ? { show: true, msg: authMsg.msg, success: authMsg.success }
        : { show: false, msg: "", success: false }
    );
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser(decodedToken);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setUser(undefined);
      }
    }
    setIsLoading(false);
  }, []);

  const register = async (userData) => {
    try {
      await authService.register(userData);
      setAuthMsg({ show: true, msg: "Sikeres regisztráció!", success: true });
      return { ok: true, message: "Sikeres regisztráció!" };
    } catch (error) {
      setAuthMsg({
        show: true,
        msg: "Ez az email cím már regisztrálva van!",
        success: false,
      });
      return { ok: false, message: error };
    }
  };

  const login = async (credentials) => {
    try {
      const token = await authService.login(credentials);
      localStorage.setItem("token", token);
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      setAuthMsg({
        show: true,
        msg: "Sikeresen bejelentkeztél!",
        success: true,
      });
      return { ok: true, message: "Sikeresen bejelentkeztél!" };
    } catch (error) {
      setAuthMsg({
        show: true,
        msg: "Érvénytelen email vagy jelszó!",
        success: false,
      });
      return { ok: false, message: error };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = { user, login, register, logout, authMsg, showAuthMsg };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
