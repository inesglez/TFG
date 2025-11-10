// src/auth.ts
import { api } from "./client";

export type AuthUser = {
  idUsuario: number;
  nombre: string;
  email?: string;
  rol: "admin" | "empleado";
  token: string;
};

const AUTH_KEY = "auth";

/**
 * Guarda la información del usuario autenticado en localStorage
 */
export function setAuth(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/**
 * Obtiene la información del usuario autenticado desde localStorage
 */
export function getAuth(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Elimina la información del usuario autenticado (logout)
 */
export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Verifica si hay un usuario autenticado
 */
export function isLoggedIn(): boolean {
  return getAuth() !== null;
}

/**
 * Verifica si el usuario autenticado es administrador
 */
export function isAdmin(): boolean {
  const auth = getAuth();
  return auth?.rol === "admin";
}

/**
 * Obtiene el token del usuario autenticado (útil para headers de API)
 */
export function getToken(): string | null {
  const auth = getAuth();
  return auth?.token || null;
}

// ✅ FUNCIÓN: Login con el backend
export type LoginResponse = {
  idUsuario: number;
  nombre: string;
  rol: "admin" | "empleado";
  token: string;
};

export async function login(usuario: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post("/Usuarios/login", { usuario, password });
  return data as LoginResponse;
}