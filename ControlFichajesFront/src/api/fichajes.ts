import { api } from "./client";
export async function ficharEntrada(idUsuario: number, fecha?: string) {
  return api.post("/Fichajes/entrada", { idUsuario, fecha });
}
export async function ficharSalida(idUsuario: number) {
  return api.post("/Fichajes/salida", { idUsuario });
}
export async function getHistorial(idUsuario: number, desde?: string, hasta?: string) {
  const params: any = { idUsuario };
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const { data } = await api.get("/Fichajes/historial", { params });
  return data;
}