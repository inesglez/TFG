// src/api/admin.ts
import http from "./http";

// Tipos
export type UsuarioLite = {
  idUsuario: number;
  usuario: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol: "admin" | "empleado";
  activo: boolean;
};

export type FichajeAdmin = {
  id_Fichaje: number;
  usuario: UsuarioLite;
  fecha: string;           // ISO
  hora_Entrada?: string;   // "HH:mm" o ISO
  hora_Salida?: string;
  tiempo_Pausa: number;    // minutos
  tipo_Jornada: string;
};

export type IncidenciaAdmin = {
  id: number;
  usuario: UsuarioLite;
  fecha: string;           // ISO
  tipo: string;
  descripcion: string;
  estado: "pendiente" | "resuelta" | "en_proceso";
};

// ---------- FICHAJES ----------
export async function getFichajesHoy(): Promise<FichajeAdmin[]> {
  // Backend sugerido: GET /api/admin/fichajes/hoy
  const { data } = await http.get<FichajeAdmin[]>("/api/admin/fichajes/hoy");
  return data;
}

export async function getFichajesRango(desdeISO: string, hastaISO: string): Promise<FichajeAdmin[]> {
  // Backend sugerido: GET /api/admin/fichajes?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
  const { data } = await http.get<FichajeAdmin[]>("/api/admin/fichajes", {
    params: { desde: desdeISO, hasta: hastaISO },
  });
  return data;
}

// ---------- INCIDENCIAS ----------
export async function getIncidenciasAdmin(
  estado?: "pendiente" | "resuelta" | "en_proceso"
): Promise<IncidenciaAdmin[]> {
  // Backend sugerido: GET /api/admin/incidencias?estado=pendiente
  const { data } = await http.get<IncidenciaAdmin[]>("/api/admin/incidencias", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export async function updateEstadoIncidencia(
  id: number,
  estado: "pendiente" | "resuelta" | "en_proceso"
): Promise<void> {
  // Backend sugerido: PATCH /api/admin/incidencias/{id}/estado
  await http.patch(`/api/admin/incidencias/${id}/estado`, { estado });
}

// ---------- USUARIOS ----------
export async function getUsuarios(): Promise<UsuarioLite[]> {
  // Backend sugerido: GET /api/admin/usuarios
  const { data } = await http.get<UsuarioLite[]>("/api/admin/usuarios");
  return data;
}

export async function createUsuario(payload: {
  usuario: string;
  correo?: string;
  password: string;
  rol: "admin" | "empleado";
}): Promise<UsuarioLite> {
  // Backend sugerido: POST /api/admin/usuarios
  const { data } = await http.post<UsuarioLite>("/api/admin/usuarios", payload);
  return data;
}

export async function setUsuarioActivo(idUsuario: number, activo: boolean): Promise<void> {
  // Backend sugerido: PATCH /api/admin/usuarios/{id}/activo
  await http.patch(`/api/admin/usuarios/${idUsuario}/activo`, { activo });
}

export async function setUsuarioRol(idUsuario: number, rol: "admin" | "empleado"): Promise<void> {
  // Backend sugerido: PATCH /api/admin/usuarios/{id}/rol
  await http.patch(`/api/admin/usuarios/${idUsuario}/rol`, { rol });
}