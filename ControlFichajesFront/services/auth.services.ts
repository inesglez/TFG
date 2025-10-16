import { api } from "./api";

export type LoginDto = {
  usuario: string;
  password: string;
};

export type User = {
  idUsuario: number;
  nombre: string;
  rol: "admin" | "empleado";
  token: string;
};

export async function login(dto: LoginDto): Promise<User> {
  const { data } = await api.post<User>("/api/Usuarios/login", dto);
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("current_user", JSON.stringify(data));
  return data;
}

export function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
}

export function getCurrentUser(): User | null {
  const raw = localStorage.getItem("current_user");
  return raw ? JSON.parse(raw) : null;
}