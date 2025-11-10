import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table,
  TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, Alert, Divider
} from '@mui/material';
import { getHistorial } from '../../api/fichajes';

interface Fichaje {
  id_Fichaje: number;
  idUsuario: number;
  fecha: string;
  hora_Entrada: string | null;
  hora_Salida: string | null;
  tiempo_Pausa: number;
}

export default function FichajesHoy() {
  const [fichajes, setFichajes] = useState<Fichaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarFichajes();
  }, []);

  const normalizarHora = (hora: any): string | null => {
    if (!hora) return null;
    if (typeof hora === 'string') return hora;
    if (typeof hora === 'object' && hora.toString) return hora.toString();
    return null;
  };

  const cargarFichajes = async () => {
    try {
      setLoading(true);
      const hoy = new Date().toISOString().split('T')[0];
      const data = await getHistorial(undefined as any, hoy, hoy);
      
      console.log('📊 Datos recibidos:', data);
      
      const fichajesNormalizados = data.map((f: any) => ({
        id_Fichaje: f.id_Fichaje || f.Id_Fichaje,
        idUsuario: f.idUsuario || f.IdUsuario,
        fecha: f.fecha || f.Fecha,
        hora_Entrada: normalizarHora(f.hora_Entrada || f.Hora_Entrada),
        hora_Salida: normalizarHora(f.hora_Salida || f.Hora_Salida),
        tiempo_Pausa: f.tiempo_Pausa || f.Tiempo_Pausa || 0
      }));
      
      console.log('📊 Fichajes normalizados:', fichajesNormalizados);
      
      setFichajes(fichajesNormalizados);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al cargar fichajes');
    } finally {
      setLoading(false);
    }
  };

  const calcularHorasTrabajadas = (entrada: string | null, salida: string | null, pausa: number) => {
    console.log('🔢 Calculando:', { entrada, salida, pausa });
    
    if (!entrada || !salida || entrada === 'null' || salida === 'null') {
      console.log('⚠️ Falta entrada o salida');
      return '-';
    }
    
    try {
      const entradaLimpia = entrada.substring(0, 5);
      const salidaLimpia = salida.substring(0, 5);
      
      if (!entradaLimpia.includes(':') || !salidaLimpia.includes(':')) {
        console.log('⚠️ Formato inválido');
        return '-';
      }
      
      const [hE, mE] = entradaLimpia.split(':').map(Number);
      const [hS, mS] = salidaLimpia.split(':').map(Number);
      
      console.log('🔢 Parseado:', { hE, mE, hS, mS });
      
      if (isNaN(hE) || isNaN(mE) || isNaN(hS) || isNaN(mS)) {
        console.log('⚠️ Valores no numéricos');
        return '-';
      }
      
      const minutosEntrada = hE * 60 + mE;
      const minutosSalida = hS * 60 + mS;
      const minutosTotales = minutosSalida - minutosEntrada - (pausa || 0);
      
      console.log('🔢 Minutos:', { minutosEntrada, minutosSalida, minutosTotales });
      
      if (minutosTotales < 0) {
        console.log('⚠️ Resultado negativo');
        return '-';
      }
      
      const horas = Math.floor(minutosTotales / 60);
      const minutos = minutosTotales % 60;
      
      const resultado = `${horas}h ${minutos}m`;
      console.log('✅ Resultado:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ Error calculando horas:', error);
      return '-';
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        bgcolor: "background.default",
        py: 4,
        px: { xs: 2, sm: 3, md: 6 },
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 1400,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Fichajes de hoy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </Typography>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
          )}

          {fichajes.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                No hay fichajes registrados
              </Typography>
              <Typography color="text.secondary">
                No se han registrado fichajes para hoy.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ID Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Entrada</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Salida</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Pausa (min)</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Horas trabajadas</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fichajes.map((f, idx) => (
                    <TableRow
                      key={f.id_Fichaje}
                      sx={{
                        "&:hover": { bgcolor: "rgba(37,99,235,0.04)" },
                        bgcolor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={`Usuario ${f.idUsuario}`} 
                          color="primary" 
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {f.hora_Entrada || '-'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {f.hora_Salida
                          ? f.hora_Salida
                          : <Chip size="small" label="En curso" color="warning" />}
                      </TableCell>
                      <TableCell>{f.tiempo_Pausa || 0} min</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>
                        {calcularHorasTrabajadas(f.hora_Entrada, f.hora_Salida, f.tiempo_Pausa)}
                      </TableCell>
                      <TableCell>
                        {f.hora_Salida
                          ? <Chip label="Completado" size="small" color="success" />
                          : <Chip label="Activo" size="small" color="info" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}