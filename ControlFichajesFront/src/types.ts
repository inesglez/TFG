export type Fichaje = {
  id_Fichaje: number;
  idUsuario: number;
  fecha: string; // ISO UTC
  hora_Entrada?: string; // HH:mm:ss
  hora_Salida?: string;
  tiempo_Pausa: number;
  tipo_Jornada: string;
};

export type Incidencia = {
  id_Incidencia: number;
  idUsuario: number;
  idFichaje?: number;
  comentario: string;
  estado: string;
  fechaReporte: string; // ISO UTC
};

export type Usuario = {
  id_Usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  contraseña: string; // por ahora, hasta que tengamos auth real
  rol: string;
  estado: string;
};