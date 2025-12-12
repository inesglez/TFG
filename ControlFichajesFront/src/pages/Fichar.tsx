import { useState, useEffect } from 'react';
import { Button, Box, Typography, Alert, Paper, Divider } from '@mui/material';
import { ficharEntrada, ficharSalida, iniciarPausa, finalizarPausa } from '../api/fichajes';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function Fichar() {
  const [enPausa, setEnPausa] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);
  const [tiempoPausa, setTiempoPausa] = useState(0);
  
  const idUsuario = 6;

  useEffect(() => {
    const pausaActiva = localStorage.getItem('pausa_inicio');
    setEnPausa(!!pausaActiva);
    
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
      setMensaje({ tipo: 'success', texto: ' Entrada registrada correctamente' });
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: ` ${error.message || 'Error al fichar entrada'}` });
    }
  };

  const handleSalida = async () => {
    try {
      if (enPausa) {
        setMensaje({ tipo: 'error', texto: 'Debes reanudar la pausa antes de fichar salida' });
        return;
      }
      
      await ficharSalida(idUsuario);
      setMensaje({ tipo: 'success', texto: ' Salida registrada correctamente' });
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: ` ${error.message || 'Error al fichar salida'}` });
    }
  };

  const handlePausa = async () => {
    try {
      if (enPausa) {
        await finalizarPausa(idUsuario);
        setEnPausa(false);
        setTiempoPausa(0);
        setMensaje({ tipo: 'success', texto: 'Pausa finalizada' });
      } else {
        await iniciarPausa(idUsuario);
        setEnPausa(true);
        setMensaje({ tipo: 'success', texto: 'Pausa iniciada' });
      }
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: ` ${error.message || 'Error con la pausa'}` });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        py: 4,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 3, sm: 4 }, bgcolor: "#f8fafc" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Control de Fichajes
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 0.5, textAlign: "center" }}
          >
            Registra tu entrada, salida y pausas
          </Typography>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {mensaje && (
            <Alert 
              severity={mensaje.tipo} 
              sx={{ mb: 3 }}
              onClose={() => setMensaje(null)}
            >
              {mensaje.texto}
            </Alert>
          )}
          
          {enPausa && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Pausa activa: <strong>{tiempoPausa} minuto{tiempoPausa !== 1 ? 's' : ''}</strong>
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="success" 
              size="large"
              onClick={handleEntrada}
              disabled={enPausa}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(46,125,50,0.3)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(46,125,50,0.4)",
                },
                "&:disabled": {
                  bgcolor: "rgba(46,125,50,0.3)",
                },
              }}
            >
              Fichar Entrada
            </Button>
            
            <Button 
              variant="contained" 
              color={enPausa ? "warning" : "info"}
              size="large"
              onClick={handlePausa}
              startIcon={enPausa ? <PlayArrowIcon /> : <PauseIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: enPausa 
                  ? "0 2px 8px rgba(237,108,2,0.3)" 
                  : "0 2px 8px rgba(2,136,209,0.3)",
                "&:hover": {
                  boxShadow: enPausa 
                    ? "0 4px 12px rgba(237,108,2,0.4)" 
                    : "0 4px 12px rgba(2,136,209,0.4)",
                },
              }}
            >
              {enPausa ? 'Reanudar' : 'Pausar'}
            </Button>
            
            <Button 
              variant="contained" 
              color="error" 
              size="large"
              onClick={handleSalida}
              disabled={enPausa}
              startIcon={<LogoutIcon />}
              sx={{
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(211,47,47,0.3)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(211,47,47,0.4)",
                },
                "&:disabled": {
                  bgcolor: "rgba(211,47,47,0.3)",
                },
              }}
            >
              Fichar Salida
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}