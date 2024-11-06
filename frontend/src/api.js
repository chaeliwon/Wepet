import axios from "axios";

const api = axios.create({
  baseURL: "https://5zld3up4c4.execute-api.ap-northeast-2.amazonaws.com/dev",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 추가
api.interceptors.request.use(
  (config) => {
    // 요청 보내기 전 수행
    config.headers = {
      ...config.headers,
      Accept: "application/json",
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Details:", {
      config: error.config,
      response: error.response,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;
