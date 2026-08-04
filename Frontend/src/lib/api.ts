import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      console.log("========== AXIOS ==========");
      console.log(
        "URL:",
        `${config.baseURL}${config.url}`,
      );
      console.log(
        "TOKEN PRESENT:",
        !!token,
      );
      console.log(
        "TOKEN START:",
        token?.substring(0, 20),
      );
      console.log("===========================");

      if (token) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;