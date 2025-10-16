import { api } from "./client";

export type LoginResponse = {
  idUsuario: number;
  nombre: string;
  rol: "admin" | "empleado";
  token: string;
};

export async function login(usuario: string, password: string) {
  const { data } = await api.post("/Usuarios/login", { usuario, password });
  return data as LoginResponse;
}