import { api } from "./client";
export async function crearIncidencia(idUsuario: number, comentario: string, idFichaje?: number) {
  const { data } = await api.post("/Incidencias", { idUsuario, idFichaje, comentario });
  return data;
}
export async function getPendientes() {
  const { data } = await api.get("/Incidencias/pendientes");
  return data;
}
export async function resolverIncidencia(id: number, comentario?: string) {
  await api.put(`/Incidencias/${id}/resolver`, comentario ?? "", {
    headers: { "Content-Type": "application/json" },
  });
}