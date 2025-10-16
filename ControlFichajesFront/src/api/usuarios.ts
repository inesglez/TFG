import { api } from "./client";
export async function getUsuarios() {
  const { data } = await api.get("/Usuarios");
  return data;
}