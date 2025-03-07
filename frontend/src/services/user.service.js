import axiosInstance from "./axiosInstance";

const joinGameById = async (gameId) => {
  const response = await axiosInstance.post(`/api/user/join-game/${gameId}`);
  return response.data;
};

const leaveGameById = async (gameId) => {
  const response = await axiosInstance.post(`/api/user/leave-game/${gameId}`);
  return response.data;
};

export default {
  joinGameById,
  leaveGameById,
};
