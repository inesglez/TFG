const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export interface Incidencia {
  id_Incidencia: number;
  idUsuario: number;
  fecha: string;
  tipo: string;
  descripcion: string;
  estado: string;
  respuestaAdmin?: string;
  fechaRespuesta?: string;
  fechaInicio?: string;
  fechaFin?: string;
  nombreUsuario?: string;
}

// Función helper para obtener el token
function getToken(): string | null {
  const auth = localStorage.getItem("auth");
  if (!auth) return null;
  try {
    const parsed = JSON.parse(auth);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export async function getPendientes(): Promise<Incidencia[]> {
  const res = await fetch(`${API_URL}/incidencias/pendientes`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener pendientes");
  return res.json();
}

export async function getTodasIncidencias(params?: {
  estado?: string;
  idUsuario?: number;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}): Promise<Incidencia[]> {
  const query = new URLSearchParams();
  if (params?.estado) query.append("estado", params.estado);
  if (params?.idUsuario) query.append("idUsuario", params.idUsuario.toString());
  if (params?.tipo) query.append("tipo", params.tipo);
  if (params?.fechaDesde) query.append("fechaDesde", params.fechaDesde);
  if (params?.fechaHasta) query.append("fechaHasta", params.fechaHasta);

  const url = `${API_URL}/admin/incidencias${query.toString() ? `?${query.toString()}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error al obtener incidencias");
  }
  return res.json();
}

export async function crearIncidencia(
  idUsuario: number,
  descripcion: string,
  tipo: string = "Incidencia",
  fechaInicio?: string,
  fechaFin?: string
): Promise<Incidencia> {
  const res = await fetch(`${API_URL}/incidencias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      idUsuario,
      descripcion,
      tipo,
      fechaInicio,
      fechaFin,
      estado: "Pendiente",
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Error al crear incidencia: ${error}`);
  }
  return res.json();
}

export async function responderIncidencia(
  id: number,
  respuesta: string,
  estado: "Resuelta" | "Aprobada" | "Rechazada"
): Promise<Incidencia> {
  const res = await fetch(`${API_URL}/admin/incidencias/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ estado, respuestaAdmin: respuesta }),
  });
  if (!res.ok) throw new Error("Error al responder incidencia");
  return res.json();
}

export async function resolverIncidencia(id: number, respuesta: string): Promise<Incidencia> {
  return responderIncidencia(id, respuesta, "Resuelta");
}