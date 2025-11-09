import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableContainer,
  TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, Alert
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
    
    // 🔥 VALIDACIÓN ESTRICTA
    if (!entrada || !salida || entrada === 'null' || salida === 'null') {
      console.log('⚠️ Falta entrada o salida');
      return '-';
    }
    
    try {
      // Extraer solo HH:mm (ignorar segundos si vienen)
      const entradaLimpia = entrada.substring(0, 5);
      const salidaLimpia = salida.substring(0, 5);
      
      // 🔥 VALIDACIÓN ADICIONAL
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Fichajes de hoy
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {new Date().toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {fichajes.length === 0 ? (
        <Alert severity="info">No hay fichajes registrados para hoy.</Alert>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>ID Usuario</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Entrada</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Salida</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Pausa (min)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Horas trabajadas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fichajes.map((f) => (
                <TableRow key={f.id_Fichaje} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Chip label={`Usuario ${f.idUsuario}`} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    {f.hora_Entrada ? <b>{f.hora_Entrada}</b> : '-'}
                  </TableCell>
                  <TableCell>
                    {f.hora_Salida
                      ? <b>{f.hora_Salida}</b>
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
        </TableContainer>
      )}
    </Box>
  );
}