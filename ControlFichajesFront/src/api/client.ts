import axios from "axios";
import { clearAuth, getAuth } from "../auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Interceptor para añadir el token JWT
api.interceptors.request.use((config) => {
  const auth = getAuth();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

// Interceptor para manejar errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuth();
      window.location.href = "/login"; // opcional: redirigir al login
    }
    return Promise.reject(error);
  }
);