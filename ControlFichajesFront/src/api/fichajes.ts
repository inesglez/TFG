// api/fichajes.ts
import { api } from "./client";

export async function ficharEntrada(idUsuario: number, fecha?: string) {
  return api.post("/fichajes", { 
    idUsuario, 
    fecha: fecha || new Date().toISOString().split('T')[0],
    Hora_Entrada: new Date().toTimeString().slice(0, 8),
    Tiempo_Pausa: 0
  });
}

export async function ficharSalida(idUsuario: number) {
  const hoy = new Date().toISOString().split('T')[0];
  console.log("🔍 Buscando fichajes para:", { idUsuario, hoy });
  
  const historial = await getHistorial(idUsuario, hoy, hoy);
  console.log("📋 Historial recibido:", historial);
  
  if (!historial || historial.length === 0) {
    console.error("❌ No hay entrada registrada hoy");
    throw new Error("No hay entrada registrada hoy");
  }
  
  const fichaje = historial[0];
  console.log("✅ Fichaje a actualizar:", fichaje);
  
  const payload = {
    Id_Fichaje: fichaje.id_Fichaje,
    IdUsuario: fichaje.idUsuario,
    Fecha: fichaje.fecha,
    Hora_Entrada: fichaje.hora_Entrada,
    Hora_Salida: new Date().toTimeString().slice(0, 8),
    Tiempo_Pausa: fichaje.tiempo_Pausa || 0
  };
  
  console.log("📤 Enviando PUT con:", payload);
  
  return api.put(`/fichajes/${fichaje.id_Fichaje}`, payload);
}

export async function getHistorial(idUsuario: number, desde?: string, hasta?: string) {
  const params: Record<string, string | number> = { idUsuario };
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const { data } = await api.get("/fichajes/historial", { params });
  return data;
}

// 🆕 Iniciar pausa
export async function iniciarPausa(idUsuario: number) {
  const hoy = new Date().toISOString().split('T')[0];
  const historial = await getHistorial(idUsuario, hoy, hoy);
  
  if (!historial || historial.length === 0) {
    throw new Error("No hay fichaje activo hoy");
  }
  
  const fichaje = historial[0];
  
  // Verificar que haya entrada pero no salida
  if (fichaje.hora_Salida) {
    throw new Error("Ya has fichado la salida");
  }
  
  // Guardar en localStorage cuándo empezó la pausa
  localStorage.setItem('pausa_inicio', new Date().toISOString());
  localStorage.setItem('pausa_fichaje_id', fichaje.id_Fichaje.toString());
  
  console.log("⏸️ Pausa iniciada");
  return { message: "Pausa iniciada" };
}

// 🆕 Finalizar pausa
export async function finalizarPausa(idUsuario: number) {
  const hoy = new Date().toISOString().split('T')[0];
  const historial = await getHistorial(idUsuario, hoy, hoy);
  
  if (!historial || historial.length === 0) {
    throw new Error("No hay fichaje activo hoy");
  }
  
  const fichaje = historial[0];
  const pausaInicio = localStorage.getItem('pausa_inicio');
  
  if (!pausaInicio) {
    throw new Error("No hay pausa activa");
  }
  
  // Calcular tiempo de pausa en minutos
  const inicio = new Date(pausaInicio);
  const fin = new Date();
  const minutosTranscurridos = Math.floor((fin.getTime() - inicio.getTime()) / 60000);
  
  console.log(`⏱️ Pausa duró ${minutosTranscurridos} minutos`);
  
  // Sumar al tiempo de pausa existente
  const tiempoPausaTotal = (fichaje.tiempo_Pausa || 0) + minutosTranscurridos;
  
  const payload = {
    Id_Fichaje: fichaje.id_Fichaje,
    IdUsuario: fichaje.idUsuario,
    Fecha: fichaje.fecha,
    Hora_Entrada: fichaje.hora_Entrada,
    Hora_Salida: fichaje.hora_Salida,
    Tiempo_Pausa: tiempoPausaTotal
  };
  
  console.log("📤 Actualizando pausa:", payload);
  
  // Limpiar localStorage
  localStorage.removeItem('pausa_inicio');
  localStorage.removeItem('pausa_fichaje_id');
  
  return api.put(`/fichajes/${fichaje.id_Fichaje}`, payload);
}