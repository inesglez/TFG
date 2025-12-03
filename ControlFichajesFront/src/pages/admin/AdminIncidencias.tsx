import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CommentIcon from "@mui/icons-material/Comment";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { getTodasIncidencias, responderIncidencia } from "../../api/incidencias";

type Incidencia = {
  id_Incidencia: number;
  idUsuario: number;
  fecha: string;
  tipo: string;
  descripcion: string;
  estado: string;
  respuestaAdmin?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaRespuesta?: string;
  nombreUsuario?: string;
  justificanteMedico?: string | null;
};

export default function AdminIncidencias() {
  const [items, setItems] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [accion, setAccion] = useState<"Aprobada" | "Rechazada" | "Resuelta" | null>(null);

  // Estados de filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

  // Función para descargar justificante con token
  const descargarJustificante = async (idIncidencia: number) => {
    try {
      const auth = localStorage.getItem("auth");
      const token = auth ? JSON.parse(auth).token : null;

      const resp = await fetch(
        `${API_URL}/incidencias/${idIncidencia}/justificante`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!resp.ok) {
        const text = await resp.text();
        alert(`No se pudo descargar el justificante (${resp.status}): ${text}`);
        return;
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      alert("Error al descargar el justificante");
    }
  };

  async function cargar() {
    setLoading(true);
    try {
      // Construir parámetros de consulta para el backend
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroFechaDesde) params.fechaDesde = filtroFechaDesde;
      if (filtroFechaHasta) params.fechaHasta = filtroFechaHasta;

      const data = await getTodasIncidencias(params);

      // Filtro por nombre/ID en frontend
      let resultado: Incidencia[] = data;
      if (filtroNombre.trim()) {
        const busqueda = filtroNombre.toLowerCase();
        resultado = resultado.filter(
          (i: Incidencia) =>
            i.idUsuario.toString().includes(busqueda) ||
            i.nombreUsuario?.toLowerCase().includes(busqueda)
        );
      }

      setItems(resultado);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Recarga cuando cambian filtros de backend
  useEffect(() => {
    cargar();
  }, [filtroEstado, filtroTipo, filtroFechaDesde, filtroFechaHasta]);

  // Debounce del filtro de nombre
  useEffect(() => {
    if (!filtroNombre.trim()) {
      cargar();
    } else {
      const timer = setTimeout(() => cargar(), 300);
      return () => clearTimeout(timer);
    }
  }, [filtroNombre]);

  function limpiarFiltros() {
    setFiltroNombre("");
    setFiltroTipo("");
    setFiltroEstado("");
    setFiltroFechaDesde("");
    setFiltroFechaHasta("");
  }

  async function abrirDialogo(id: number, estado: "Aprobada" | "Rechazada" | "Resuelta") {
    setSelectedId(id);
    setAccion(estado);
    setRespuesta("");
    setDialogOpen(true);
  }

  async function confirmarAccion() {
    if (selectedId === null || !accion) return;
    try {
      await responderIncidencia(selectedId, respuesta, accion);
    } catch (err) {
      // Error al actualizar incidencia
    } finally {
      setDialogOpen(false);
      setRespuesta("");
      setAccion(null);
      setSelectedId(null);
      await cargar();
    }
  }

  const estadoChip = (estado: string) => {
    switch (estado) {
      case "Aprobada":
        return { color: "success" as const, label: "Aprobada" };
      case "Rechazada":
        return { color: "error" as const, label: "Rechazada" };
      case "Resuelta":
        return { color: "info" as const, label: "Resuelta" };
      default:
        return { color: "warning" as const, label: "Pendiente" };
    }
  };

  const hayFiltrosActivos =
    filtroNombre || filtroTipo || filtroEstado || filtroFechaDesde || filtroFechaHasta;

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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
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
                Gestiona las solicitudes de vacaciones e incidencias reportadas
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {hayFiltrosActivos && (
                <Tooltip title="Limpiar filtros">
                  <IconButton onClick={limpiarFiltros} color="error" size="small">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Button
                variant={mostrarFiltros ? "contained" : "outlined"}
                startIcon={<FilterListIcon />}
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                size="small"
              >
                Filtros
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Filtros */}
        {mostrarFiltros && (
          <>
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#fafbfc" }}>
              {/* Fila 1: usuario + tipo + estado */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Buscar usuario"
                    placeholder="Nombre o ID"
                    fullWidth
                    size="small"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={filtroTipo}
                      label="Tipo"
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Vacaciones">Vacaciones</MenuItem>
                      <MenuItem value="AsuntosPropios">Asuntos propios</MenuItem>
                      <MenuItem value="Incidencia">Incidencia</MenuItem>
                      <MenuItem value="Baja">Baja</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={filtroEstado}
                      label="Estado"
                      onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pendiente">Pendiente</MenuItem>
                      <MenuItem value="Aprobada">Aprobada</MenuItem>
                      <MenuItem value="Rechazada">Rechazada</MenuItem>
                      <MenuItem value="Resuelta">Resuelta</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>

              {/* Fila 2: fechas */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 1 }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Desde"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filtroFechaDesde}
                    onChange={(e) => setFiltroFechaDesde(e.target.value)}
                  />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Hasta"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={filtroFechaHasta}
                    onChange={(e) => setFiltroFechaHasta(e.target.value)}
                  />
                </Box>
              </Stack>

              {hayFiltrosActivos && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Mostrando {items.length} incidencia(s)
                  </Typography>
                </Box>
              )}
            </Box>
            <Divider />
          </>
        )}

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {loading ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">Cargando…</Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {hayFiltrosActivos ? "No hay resultados" : "No hay incidencias"}
              </Typography>
              <Typography color="text.secondary">
                {hayFiltrosActivos
                  ? "Intenta ajustar los filtros para ver más resultados"
                  : "No se han registrado incidencias pendientes."}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Rango</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Justificante</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Respuesta</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Fecha</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((i, idx) => {
                    const chip = estadoChip(i.estado);
                    return (
                      <TableRow
                        key={i.id_Incidencia}
                        sx={{
                          "&:hover": { bgcolor: "rgba(37,99,235,0.04)" },
                          bgcolor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                        }}
                      >
                        <TableCell>#{i.id_Incidencia}</TableCell>
                        <TableCell>
                          {i.nombreUsuario || `Usuario ${i.idUsuario}`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={i.tipo}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          {i.fechaInicio && i.fechaFin
                            ? `${i.fechaInicio} → ${i.fechaFin}`
                            : "-"}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Tooltip title={i.descripcion}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {i.descripcion}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip color={chip.color} label={chip.label} size="small" />
                        </TableCell>

                        {/* Columna justificante */}
                        <TableCell>
                          {i.justificanteMedico ? (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<LocalHospitalIcon />}
                              onClick={() => descargarJustificante(i.id_Incidencia)}
                            >
                              Ver PDF
                            </Button>
                          ) : (
                            "-"
                          )}
                        </TableCell>

                        <TableCell>
                          {i.respuestaAdmin ? (
                            <Tooltip title={i.respuestaAdmin}>
                              <CommentIcon color="info" fontSize="small" />
                            </Tooltip>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(i.fecha).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell align="right">
                          {i.estado === "Pendiente" && (
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {i.tipo === "Incidencia" ? (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<DoneAllIcon />}
                                  onClick={() => abrirDialogo(i.id_Incidencia, "Resuelta")}
                                >
                                  Resuelta
                                </Button>
                              ) : (
                                <>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    startIcon={<CheckIcon />}
                                    onClick={() => abrirDialogo(i.id_Incidencia, "Aprobada")}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<CloseIcon />}
                                    onClick={() => abrirDialogo(i.id_Incidencia, "Rechazada")}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Diálogo de respuesta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {accion === "Rechazada"
            ? "Rechazar solicitud"
            : accion === "Aprobada"
            ? "Aprobar solicitud"
            : "Marcar incidencia como resuelta"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Comentario (opcional)"
            fullWidth
            multiline
            rows={3}
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder={
              accion === "Rechazada"
                ? "Ej: No se puede aprobar por falta de días disponibles"
                : "Escribe una nota o comentario..."
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color={accion === "Rechazada" ? "error" : "primary"}
            onClick={confirmarAccion}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}