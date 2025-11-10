import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip, Divider
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CommentIcon from "@mui/icons-material/Comment";
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
};

export default function AdminIncidencias() {
  const [items, setItems] = useState<Incidencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [accion, setAccion] = useState<"Aprobada" | "Rechazada" | "Resuelta" | null>(null);

  async function cargar() {
    setLoading(true);
    try {
      const data = await getTodasIncidencias();
      setItems(data.sort((a, b) => b.id_Incidencia - a.id_Incidencia));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function abrirDialogo(id: number, estado: "Aprobada" | "Rechazada" | "Resuelta") {
    setSelectedId(id);
    setAccion(estado);
    setRespuesta("");
    setDialogOpen(true);
  }

  async function confirmarAccion() {
    if (!selectedId || !accion) return;
    try {
      await responderIncidencia(selectedId, respuesta, accion);
      setDialogOpen(false);
      setRespuesta("");
      setAccion(null);
      await cargar();
    } catch (err) {
      console.error("Error al actualizar incidencia:", err);
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
            Incidencias y Solicitudes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestiona las solicitudes de vacaciones e incidencias reportadas
          </Typography>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {loading ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">Cargando…</Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                No hay incidencias
              </Typography>
              <Typography color="text.secondary">
                No se han registrado incidencias pendientes.
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
                        <TableCell>{i.idUsuario}</TableCell>
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