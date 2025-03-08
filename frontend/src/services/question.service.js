import axiosInstance from "./axiosInstance";

const getQuestionByNumber = async (number) => {
  const response = await axiosInstance.get(`/api/question/number/${number}`);
  return response.data;
};

export default {
  getQuestionByNumber,
};
