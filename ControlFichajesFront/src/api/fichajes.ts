// api/fichajes.ts
import { api } from "./client";

export async function ficharEntrada(idUsuario: number, fecha?: string) {
  return api.post("/fichajes/entrada", { idUsuario, fecha });
}

export async function ficharSalida(idUsuario: number) {
  return api.post("/fichajes/salida", { idUsuario });
}

// Ahora sí filtra por fechas en backend
export async function getHistorial(idUsuario: number, desde?: string, hasta?: string) {
  const params: Record<string, string | number> = { idUsuario };
  if (desde) params.desde = desde;   // usar ISO: "2025-10-30" o "2025-10-30T00:00:00Z"
  if (hasta) params.hasta = hasta;
  const { data } = await api.get("/fichajes/historial", { params });
  return data;
}