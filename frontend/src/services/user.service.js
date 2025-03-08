import axiosInstance from "./axiosInstance";

const getById = async (id) => {
  const response = await axiosInstance.get(`/api/user/${id}`);
  return response.data;
};

const joinGameById = async (gameId) => {
  const response = await axiosInstance.post(`/api/user/join-game/${gameId}`);
  return response.data;
};

const leaveGameById = async (gameId) => {
  const response = await axiosInstance.post(`/api/user/leave-game/${gameId}`);
  return response.data;
};

const answerByUserByGameById = async (gameId, answer) => {
  const response = await axiosInstance.post(
    `/api/user/answer/${gameId}`,
    answer
  );
  return response.data;
};

export default {
  getById,
  joinGameById,
  leaveGameById,
  answerByUserByGameById,
};
