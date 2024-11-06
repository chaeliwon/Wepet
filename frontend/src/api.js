import axios from "axios";

const api = axios.create({
  baseURL: "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev",
  withCredentials: true, // 모든 요청에 쿠키 포함
});

export default api;
