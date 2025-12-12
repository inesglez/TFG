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
  fecha: string;          
  hora_Entrada?: string;  
  hora_Salida?: string;
  tiempo_Pausa: number;   
  tipo_Jornada: string;
};

export type IncidenciaAdmin = {
  id: number;
  usuario: UsuarioLite;
  fecha: string;          
  tipo: string;
  descripcion: string;
  estado: "pendiente" | "resuelta" | "en_proceso";
};

//FICHAJES
export async function getFichajesHoy(): Promise<FichajeAdmin[]> {
  const { data } = await http.get<FichajeAdmin[]>("/admin/fichajes/hoy");
  return data;
}

export async function getFichajesRango(desdeISO: string, hastaISO: string): Promise<FichajeAdmin[]> {
  const { data } = await http.get<FichajeAdmin[]>("/admin/fichajes", {
    params: { desde: desdeISO, hasta: hastaISO },
  });
  return data;
}

//INCIDENCIAS
export async function getIncidenciasAdmin(
  estado?: "pendiente" | "resuelta" | "en_proceso"
): Promise<IncidenciaAdmin[]> {
  const { data } = await http.get<IncidenciaAdmin[]>("/admin/incidencias", {
    params: estado ? { estado } : undefined,
  });
  return data;
}

export async function updateEstadoIncidencia(
  id: number,
  estado: "pendiente" | "resuelta" | "en_proceso"
): Promise<void> {
  await http.patch(`/admin/incidencias/${id}/estado`, { estado });
}

// USUARIOS
export async function getUsuarios(): Promise<UsuarioLite[]> {
  const { data } = await http.get<UsuarioLite[]>("/admin/usuarios");
  return data;
}

// Crear usuario con rol seleccionado
export async function createUsuario(payload: {
  usuario: string;
  correo?: string;
  password: string;
  rol: "admin" | "empleado";
  nombre?: string;
  apellido?: string;
  activo?: boolean;
}): Promise<UsuarioLite> {
  // Si tu backend espera PascalCase (CreateUsuarioDto):
  const body = {
    Usuario: payload.usuario,
    Correo: payload.correo,
    Password: payload.password,
    Rol: payload.rol,
    Nombre: payload.nombre,
    Apellido: payload.apellido,
    Activo: payload.activo,
  };
  const { data } = await http.post<UsuarioLite>("/admin/usuarios", body);
  return data;
}

// Editar usuario (correo, rol, estado, contraseña opcional, nombre/apellido opcionales)
export async function updateUsuario(
  idUsuario: number,
  data: {
    nombre?: string;
    apellido?: string;
    correo?: string;
    rol?: "admin" | "empleado";
    activo?: boolean;
    password?: string;
  }
): Promise<void> {
  const body = {
    Nombre: data.nombre,
    Apellido: data.apellido,
    Correo: data.correo,
    Rol: data.rol,
    Activo: data.activo,
    Password: data.password,
  };
  await http.put(`/admin/usuarios/${idUsuario}`, body);
}

// Activar/desactivar
export async function setUsuarioActivo(idUsuario: number, activo: boolean): Promise<void> {
  await http.patch(`/admin/usuarios/${idUsuario}/activo`, { Activo: activo });
}

// Cambiar rol rápido
export async function setUsuarioRol(idUsuario: number, rol: "admin" | "empleado"): Promise<void> {
  await http.patch(`/admin/usuarios/${idUsuario}/rol`, { Rol: rol });
}

// Eliminar usuario
export async function deleteUsuario(idUsuario: number): Promise<void> {
  await http.delete(`/admin/usuarios/${idUsuario}`);
}