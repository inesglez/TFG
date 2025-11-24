import { useEffect, useState } from "react";
import { crearIncidencia, getTodasIncidencias } from "../api/incidencias";
import {
  Typography, Stack, TextField, Button, List,
  Chip, Box, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select,
  FormControl, InputLabel, Card, Alert, Paper, Divider
} from "@mui/material";
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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
  justificanteMedico?: string | null;
};

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [comentario, setComentario] = useState("");
  const [tipoReporte, setTipoReporte] = useState<"incidencia" | "solicitud">("incidencia");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tipoSolicitud, setTipoSolicitud] = useState<"Vacaciones" | "AsuntosPropios" | "Baja">("Vacaciones");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivoSolicitud, setMotivoSolicitud] = useState("");
  const [archivoPDF, setArchivoPDF] = useState<File | null>(null);

  const idUsuario = Number(localStorage.getItem("idUsuario") ?? 0);
  const rol = localStorage.getItem("rol") ?? "empleado";
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

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

    let descripcionCompleta = "";

    if (tipoSolicitud === "Baja") {
      descripcionCompleta = motivoSolicitud
        ? `Baja médica de ${dias} día(s). Motivo: ${motivoSolicitud}`
        : `Baja médica de ${dias} día(s)`;

      if (archivoPDF) {
        descripcionCompleta += ` [Justificante adjunto: ${archivoPDF.name}]`;
      }
    } else {
      descripcionCompleta = motivoSolicitud
        ? `Solicitud de ${dias} día(s). Motivo: ${motivoSolicitud}`
        : `Solicitud de ${dias} día(s)`;
    }

    try {
      // 1. Crear incidencia y obtener la creada con su id_Incidencia
      const nueva = await crearIncidencia(
        idUsuario,
        descripcionCompleta,
        tipoSolicitud,
        fechaInicio,
        fechaFin
      );

      // 2. Si es Baja y hay PDF, subir justificante
      if (tipoSolicitud === "Baja" && archivoPDF) {
        const auth = localStorage.getItem("auth");
        const token = auth ? JSON.parse(auth).token : null;

        const formData = new FormData();
        formData.append("archivo", archivoPDF);

        const resp = await fetch(
          `${API_URL}/incidencias/${nueva.id_Incidencia}/justificante`,
          {
            method: "POST",
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: formData,
          }
        );

        if (!resp.ok) {
          console.error("Error al subir justificante");
          alert("La solicitud se creó, pero hubo un error al subir el justificante médico.");
        }
      }

      // Reset
      setDialogOpen(false);
      setFechaInicio("");
      setFechaFin("");
      setMotivoSolicitud("");
      setArchivoPDF(null);
      await cargar();
    } catch (error) {
      console.error("Error creando solicitud:", error);
      alert("Error al crear la solicitud");
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert("El archivo no puede superar los 5MB");
        return;
      }
      setArchivoPDF(file);
    }
  };

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
      case "Baja":
        return { color: "error" as const, label: "🏥 Baja Médica" };
      default:
        return { color: "default" as const, label: "⚠️ Incidencia" };
    }
  };

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
      <Box sx={{ width: "100%", maxWidth: 1000 }}>
        {/* Header */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
            mb: 3,
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "-0.02em",
              }}
            >
              Incidencias y Solicitudes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Reporta problemas o solicita días libres
            </Typography>
          </Box>

          <Divider />

          {/* Selector de tipo de reporte */}
          {rol !== "admin" && (
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <ToggleButtonGroup
                value={tipoReporte}
                exclusive
                onChange={(_, val) => val && setTipoReporte(val)}
                fullWidth
                sx={{ mb: 3 }}
              >
                <ToggleButton value="incidencia" sx={{ py: 1.5, textTransform: "none", fontWeight: 600 }}>
                  <AssignmentLateIcon sx={{ mr: 1 }} />
                  Reportar Incidencia
                </ToggleButton>
                <ToggleButton value="solicitud" sx={{ py: 1.5, textTransform: "none", fontWeight: 600 }}>
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
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={crearIncidenciaNormal}
                    disabled={!idUsuario || !comentario.trim()}
                    sx={{
                      minWidth: { xs: "100%", md: 150 },
                      textTransform: "none",
                      fontWeight: 600,
                    }}
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
                  sx={{
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Solicitar Vacaciones, Asuntos Propios o Baja Médica
                </Button>
              )}
            </Box>
          )}
        </Paper>

        {/* Lista de incidencias */}
        <Paper
          elevation={4}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              Mis incidencias y solicitudes
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {incidencias.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  No tienes incidencias registradas
                </Typography>
                <Typography color="text.secondary">
                  Cuando reportes una incidencia o solicites días, aparecerán aquí
                </Typography>
              </Box>
            ) : (
              <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {incidencias.map((inc, idx) => {
                  const estadoChip = getEstadoChip(inc.estado);
                  const tipoChip = getTipoChip(inc.tipo);

                  return (
                    <Card
                      key={inc.id_Incidencia}
                      sx={{
                        p: 3,
                        bgcolor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
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
                        <Alert severity={inc.tipo === "Baja" ? "error" : "info"} sx={{ mb: 2 }}>
                          <strong>Período solicitado:</strong> {inc.fechaInicio} al {inc.fechaFin}
                        </Alert>
                      )}

                      {/* Descripción */}
                      <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                        {inc.descripcion}
                      </Typography>

                      {/* Justificante médico (si quieres que el empleado también pueda verlo) */}
                      {inc.justificanteMedico && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LocalHospitalIcon />}
                          onClick={() =>
                            window.open(
                              `${API_URL}/incidencias/${inc.id_Incidencia}/justificante`,
                              "_blank"
                            )
                          }
                          sx={{ mb: 1 }}
                        >
                          Ver justificante médico
                        </Button>
                      )}

                      {/* Respuesta del admin */}
                      {inc.respuestaAdmin && (
                        <Alert
                          severity={
                            inc.estado === "Aprobada"
                              ? "success"
                              : inc.estado === "Rechazada"
                              ? "error"
                              : "info"
                          }
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
          </Box>
        </Paper>
      </Box>

      {/* Diálogo para solicitar días */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Solicitar Días</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de solicitud</InputLabel>
              <Select
                value={tipoSolicitud}
                label="Tipo de solicitud"
                onChange={(e) => {
                  setTipoSolicitud(e.target.value as any);
                  setArchivoPDF(null); // Reset archivo al cambiar tipo
                }}
              >
                <MenuItem value="Vacaciones">🏖️ Vacaciones</MenuItem>
                <MenuItem value="AsuntosPropios">📋 Asuntos propios</MenuItem>
                <MenuItem value="Baja">🏥 Baja médica</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Fecha de inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              label="Fecha de fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />

            <TextField
              label="Motivo (opcional)"
              value={motivoSolicitud}
              onChange={(e) => setMotivoSolicitud(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Describe brevemente el motivo de tu solicitud..."
              size="small"
            />

            {/* Subida de PDF solo para Baja Médica */}
            {tipoSolicitud === "Baja" && (
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {archivoPDF ? archivoPDF.name : "Adjuntar justificante médico (opcional)"}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
                {archivoPDF && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Chip
                      label={archivoPDF.name}
                      onDelete={() => setArchivoPDF(null)}
                      color="success"
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {(archivoPDF.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Stack>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Solo archivos PDF, máximo 5MB
                </Typography>
              </Box>
            )}

            {fechaInicio && fechaFin && (
              <Chip
                label={`Total: ${Math.ceil(
                  (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1} día(s)`}
                color="primary"
                sx={{ alignSelf: "flex-start" }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDialogOpen(false);
              setArchivoPDF(null);
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={crearSolicitudDias}
            disabled={!fechaInicio || !fechaFin}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Enviar Solicitud
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}