import axiosInstance from "./axiosInstance";

const listAllGames = async () => {
  const response = await axiosInstance.get("/api/game");
  return response.data;
};

export default {
  listAllGames,
};
