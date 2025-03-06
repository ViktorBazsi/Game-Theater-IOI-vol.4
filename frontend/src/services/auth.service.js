import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const login = async (credentials) => {
  try {
    // console.log("Bejelentkezési adatok:", credentials); // Ellenőrizd, hogy mit küld a frontend!
    const response = await axiosInstance.post("/auth/login", credentials);
    // console.log("Szerver válasza:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Bejelentkezési hiba:",
      error.response ? error.response.data : error
    );
    throw error.response ? error.response.data : error;
  }
};

export default {
  register,
  login,
};
