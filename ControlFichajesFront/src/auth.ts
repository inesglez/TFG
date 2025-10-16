export type AuthUser = {
  idUsuario: number;
  nombre: string;
  rol: "admin" | "empleado";
  token: string;
};

const KEY = "auth";

export function setAuth(u: AuthUser) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function getAuth(): AuthUser | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isLoggedIn() {
  return !!getAuth();
}

export function isAdmin() {
  return getAuth()?.rol === "admin";
}