import axios from "axios";
import { API_BASE } from "../config";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Interceptor para token cuando implementes JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});