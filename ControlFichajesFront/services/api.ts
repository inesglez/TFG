import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5002",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para añadir token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});