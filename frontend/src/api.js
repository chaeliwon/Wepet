import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // 통신할 baseURL
});

export default api;
