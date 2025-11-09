import { useEffect, useState } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Tooltip
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
      // Mostrar las más recientes primero
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
    // si es rechazo o resuelta, pedimos comentario
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
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Incidencias y Solicitudes
        </Typography>

        {loading ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography>Cargando…</Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
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
                  <TableCell>ID</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Rango</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Respuesta</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((i) => {
                  const chip = estadoChip(i.estado);
                  return (
                    <TableRow key={i.id_Incidencia}>
                      <TableCell>#{i.id_Incidencia}</TableCell>
                      <TableCell>{i.idUsuario}</TableCell>
                      <TableCell>{i.tipo}</TableCell>
                      <TableCell>
                        {i.fechaInicio && i.fechaFin
                          ? `${i.fechaInicio} → ${i.fechaFin}`
                          : "-"}
                      </TableCell>
                      <TableCell>{i.descripcion}</TableCell>
                      <TableCell>
                        <Chip color={chip.color} label={chip.label} size="small" />
                      </TableCell>
                      <TableCell>
                        {i.respuestaAdmin ? (
                          <Tooltip title={i.respuestaAdmin}>
                            <CommentIcon color="info" />
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
      </Paper>

      {/* Diálogo de respuesta */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
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
        <DialogActions>
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