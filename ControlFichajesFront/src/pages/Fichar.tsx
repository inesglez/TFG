import { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { ficharEntrada, ficharSalida, iniciarPausa, finalizarPausa } from '../api/fichajes';

export default function Fichar() {
  const [enPausa, setEnPausa] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [tiempoPausa, setTiempoPausa] = useState(0);
  
  // Obtener idUsuario del token (ajusta según tu implementación)
  const idUsuario = 6; // 🔥 Cambia esto por el ID real del usuario logueado

  useEffect(() => {
    // Verificar si hay una pausa activa al cargar
    const pausaActiva = localStorage.getItem('pausa_inicio');
    setEnPausa(!!pausaActiva);
    
    // Si hay pausa activa, actualizar el contador cada segundo
    if (pausaActiva) {
      const interval = setInterval(() => {
        const inicio = new Date(pausaActiva);
        const ahora = new Date();
        const minutos = Math.floor((ahora.getTime() - inicio.getTime()) / 60000);
        setTiempoPausa(minutos);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [enPausa]);

  const handleEntrada = async () => {
    try {
      await ficharEntrada(idUsuario);
      setMensaje({ tipo: 'success', texto: '✅ Entrada registrada correctamente' });
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: `❌ ${error.message || 'Error al fichar entrada'}` });
    }
  };

  const handleSalida = async () => {
    try {
      // Si hay pausa activa, avisar
      if (enPausa) {
        setMensaje({ tipo: 'error', texto: '⚠️ Debes reanudar la pausa antes de fichar salida' });
        return;
      }
      
      await ficharSalida(idUsuario);
      setMensaje({ tipo: 'success', texto: '✅ Salida registrada correctamente' });
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: `❌ ${error.message || 'Error al fichar salida'}` });
    }
  };

  const handlePausa = async () => {
    try {
      if (enPausa) {
        await finalizarPausa(idUsuario);
        setEnPausa(false);
        setTiempoPausa(0);
        setMensaje({ tipo: 'success', texto: '✅ Pausa finalizada' });
      } else {
        await iniciarPausa(idUsuario);
        setEnPausa(true);
        setMensaje({ tipo: 'success', texto: '⏸️ Pausa iniciada' });
      }
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: `❌ ${error.message || 'Error con la pausa'}` });
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Control de Fichajes
      </Typography>
      
      {mensaje && (
        <Alert 
          severity={mensaje.tipo} 
          sx={{ mb: 2 }}
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </Alert>
      )}
      
      {enPausa && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          ⏸️ Pausa activa: {tiempoPausa} minuto{tiempoPausa !== 1 ? 's' : ''}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button 
          variant="contained" 
          color="success" 
          size="large"
          onClick={handleEntrada}
          disabled={enPausa}
        >
          🟢 Fichar Entrada
        </Button>
        
        <Button 
          variant="contained" 
          color={enPausa ? "warning" : "info"}
          size="large"
          onClick={handlePausa}
        >
          {enPausa ? '▶️ Reanudar' : '⏸️ Pausar'}
        </Button>
        
        <Button 
          variant="contained" 
          color="error" 
          size="large"
          onClick={handleSalida}
          disabled={enPausa}
        >
          🔴 Fichar Salida
        </Button>
      </Box>
    </Box>
  );
}