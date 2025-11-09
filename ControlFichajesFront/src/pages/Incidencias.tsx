import { useEffect, useState } from "react";
import { crearIncidencia, getTodasIncidencias } from "../api/incidencias";
import {
  Typography, Stack, TextField, Button, List, ListItem,
  ListItemText, Chip, Box, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel, Card, Alert
} from "@mui/material";
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

type Incidencia = {
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
};

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [comentario, setComentario] = useState("");
  const [tipoReporte, setTipoReporte] = useState<"incidencia" | "solicitud">("incidencia");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState<"Vacaciones" | "AsuntosPropios">("Vacaciones");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivoSolicitud, setMotivoSolicitud] = useState("");
  
  const idUsuario = Number(localStorage.getItem("idUsuario") ?? 0);
  const rol = localStorage.getItem("rol") ?? "empleado";

  async function cargar() {
    try {
      const data = await getTodasIncidencias();
      setIncidencias(data);
    } catch (error) {
      console.error("Error cargando incidencias:", error);
    }
  }
  
  useEffect(() => { cargar(); }, []);

  async function crearIncidenciaNormal() {
    if (!comentario.trim()) return;
    try {
      await crearIncidencia(idUsuario, comentario, "Incidencia");
      setComentario("");
      await cargar();
    } catch (error) {
      console.error("Error creando incidencia:", error);
      alert("Error al crear la incidencia");
    }
  }

  async function crearSolicitudDias() {
    if (!fechaInicio || !fechaFin) {
      alert("Debes seleccionar las fechas");
      return;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const descripcionCompleta = motivoSolicitud 
      ? `Solicitud de ${dias} día(s). Motivo: ${motivoSolicitud}`
      : `Solicitud de ${dias} día(s)`;

    try {
      await crearIncidencia(idUsuario, descripcionCompleta, tipoSolicitud, fechaInicio, fechaFin);
      
      // Reset
      setDialogOpen(false);
      setFechaInicio("");
      setFechaFin("");
      setMotivoSolicitud("");
      await cargar();
    } catch (error) {
      console.error("Error creando solicitud:", error);
      alert("Error al crear la solicitud");
    }
  }

  const getEstadoChip = (estado: string) => {
    switch (estado) {
      case "Aprobada":
        return { color: "success" as const, icon: <CheckCircleIcon />, label: "Aprobada" };
      case "Rechazada":
        return { color: "error" as const, icon: <CancelIcon />, label: "Rechazada" };
      case "Resuelta":
        return { color: "info" as const, icon: <CheckCircleIcon />, label: "Resuelta" };
      default:
        return { color: "warning" as const, icon: <PendingIcon />, label: "Pendiente" };
    }
  };

  const getTipoChip = (tipo: string) => {
    switch (tipo) {
      case "Vacaciones":
        return { color: "primary" as const, label: "🏖️ Vacaciones" };
      case "AsuntosPropios":
        return { color: "secondary" as const, label: "📋 Asuntos Propios" };
      default:
        return { color: "default" as const, label: "⚠️ Incidencia" };
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Incidencias y Solicitudes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Reporta problemas o solicita días libres
      </Typography>

      {/* Selector de tipo de reporte */}
      {rol !== "admin" && (
        <Card sx={{ p: 3, mb: 3 }}>
          <ToggleButtonGroup
            value={tipoReporte}
            exclusive
            onChange={(_, val) => val && setTipoReporte(val)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="incidencia" sx={{ py: 2 }}>
              <AssignmentLateIcon sx={{ mr: 1 }} />
              Reportar Incidencia
            </ToggleButton>
            <ToggleButton value="solicitud" sx={{ py: 2 }}>
              <EventIcon sx={{ mr: 1 }} />
              Solicitar Días
            </ToggleButton>
          </ToggleButtonGroup>

          {tipoReporte === "incidencia" && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Describe la incidencia"
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Ej: Error al fichar salida, problema con el sistema..."
              />
              <Button
                variant="contained"
                onClick={crearIncidenciaNormal}
                disabled={!idUsuario || !comentario.trim()}
                sx={{ minWidth: { xs: "100%", md: 150 } }}
              >
                Reportar
              </Button>
            </Stack>
          )}

          {tipoReporte === "solicitud" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
              fullWidth
              size="large"
              startIcon={<EventIcon />}
              sx={{ py: 2 }}
            >
              Solicitar Vacaciones o Días por Asuntos Propios
            </Button>
          )}
        </Card>
      )}

      {/* Lista de incidencias */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Mis incidencias y solicitudes
      </Typography>
      
      {incidencias.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No tienes incidencias registradas
          </Typography>
        </Card>
      ) : (
        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {incidencias.map(inc => {
            const estadoChip = getEstadoChip(inc.estado);
            const tipoChip = getTipoChip(inc.tipo);
            
            return (
              <Card key={inc.id_Incidencia} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Chip label={`#${inc.id_Incidencia}`} size="small" color="primary" />
                  <Chip label={tipoChip.label} size="small" color={tipoChip.color} />
                  <Chip 
                    icon={estadoChip.icon} 
                    label={estadoChip.label} 
                    size="small" 
                    color={estadoChip.color} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(inc.fecha).toLocaleString('es-ES')}
                  </Typography>
                </Box>

                {/* Fechas de solicitud */}
                {inc.fechaInicio && inc.fechaFin && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Período solicitado:</strong> {inc.fechaInicio} al {inc.fechaFin}
                  </Alert>
                )}

                {/* Descripción */}
                <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                  {inc.descripcion}
                </Typography>

                {/* Respuesta del admin */}
                {inc.respuestaAdmin && (
                  <Alert 
                    severity={inc.estado === "Aprobada" ? "success" : inc.estado === "Rechazada" ? "error" : "info"}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                      Respuesta del administrador:
                    </Typography>
                    <Typography variant="body2">{inc.respuestaAdmin}</Typography>
                    {inc.fechaRespuesta && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                        Respondido el {new Date(inc.fechaRespuesta).toLocaleString('es-ES')}
                      </Typography>
                    )}
                  </Alert>
                )}
              </Card>
            );
          })}
        </List>
      )}

      {/* Diálogo para solicitar días */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Solicitar Días</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo de solicitud</InputLabel>
              <Select
                value={tipoSolicitud}
                label="Tipo de solicitud"
                onChange={(e) => setTipoSolicitud(e.target.value as any)}
              >
                <MenuItem value="Vacaciones">🏖️ Vacaciones</MenuItem>
                <MenuItem value="AsuntosPropios">📋 Asuntos propios</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Fecha de inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Fecha de fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <TextField
              label="Motivo (opcional)"
              value={motivoSolicitud}
              onChange={(e) => setMotivoSolicitud(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Describe brevemente el motivo de tu solicitud..."
            />

            {fechaInicio && fechaFin && (
              <Chip
                label={`Total: ${Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} día(s)`}
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={crearSolicitudDias}
            disabled={!fechaInicio || !fechaFin}
          >
            Enviar Solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}