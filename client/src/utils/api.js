// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const timezone =
    localStorage.getItem("userTimezone") ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add timezone to all requests
  config.headers["X-User-Timezone"] = timezone;

  return config;
});

export default api;
