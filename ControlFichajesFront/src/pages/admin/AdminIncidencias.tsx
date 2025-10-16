// src/pages/admin/AdminIncidencias.tsx
import { useEffect, useState } from "react";
import { Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Button, Stack } from "@mui/material";
import { getIncidenciasAdmin, updateEstadoIncidencia } from "../../api/admin";

// Tipos locales
type UsuarioLite = {
  idUsuario: number;
  usuario: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol: "admin" | "empleado";
  activo: boolean;
};
type IncidenciaAdmin = {
  id: number;
  usuario: UsuarioLite;
  fecha: string;
  tipo: string;
  descripcion: string;
  estado: "pendiente" | "resuelta" | "en_proceso";
};

function estadoChip(e: IncidenciaAdmin["estado"]) {
  return e === "resuelta"
    ? { color: "success" as const, label: "Resuelta" }
    : e === "en_proceso"
    ? { color: "warning" as const, label: "En proceso" }
    : { color: "error" as const, label: "Pendiente" };
}

export default function AdminIncidencias() {
  const [items, setItems] = useState<IncidenciaAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getIncidenciasAdmin("pendiente")
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function marcarResuelta(id: number) {
    await updateEstadoIncidencia(id, "resuelta");
    setItems(prev => prev.map(i => (i.id === id ? { ...i, estado: "resuelta" } : i)));
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", maxWidth: 1100, mx: "auto", borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Incidencias de usuarios</Typography>

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}><Typography>Cargando…</Typography></Box>
      ) : items.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Sin incidencias</Typography>
          <Typography color="text.secondary">No hay incidencias nuevas.</Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((i) => {
                const c = estadoChip(i.estado);
                return (
                  <TableRow key={i.id}>
                    <TableCell>{i.usuario.nombre ?? i.usuario.usuario}</TableCell>
                    <TableCell>{i.usuario.correo ?? "-"}</TableCell>
                    <TableCell>{new Date(i.fecha).toLocaleString()}</TableCell>
                    <TableCell>{i.tipo}</TableCell>
                    <TableCell>{i.descripcion}</TableCell>
                    <TableCell><Chip size="small" color={c.color} label={c.label} /></TableCell>
                    <TableCell align="right">
                      {i.estado !== "resuelta" && (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => marcarResuelta(i.id)}>
                            Marcar resuelta
                          </Button>
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
  );
}