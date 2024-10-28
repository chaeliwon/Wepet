import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // 통신할 baseURL
  withCredentials: true, // 모든 요청에 쿠키 포함
});

export default api;
