import axiosInstance from "./axiosInstance";

const listAllGames = async () => {
  const response = await axiosInstance.get("/api/game");
  return response.data;
};

const getGameById = async (gameId) => {
  const response = await axiosInstance.get(`/api/game/${gameId}`);
  return response.data;
};

export default {
  listAllGames,
  getGameById,
};
