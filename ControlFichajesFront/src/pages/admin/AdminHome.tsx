// src/pages/admin/AdminHome.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Stack, Chip, Divider, useTheme, useMediaQuery
} from "@mui/material";
import { getFichajesHoy } from "../../api/admin";

// Tipos locales para evitar problemas de import de tipos
type UsuarioLite = {
  idUsuario: number;
  usuario: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol: "admin" | "empleado";
  activo: boolean;
};
type FichajeAdmin = {
  id_Fichaje: number;
  usuario: UsuarioLite;
  fecha: string;
  hora_Entrada?: string;
  hora_Salida?: string;
  tiempo_Pausa: number;
  tipo_Jornada: string;
};

function fmt(t?: string) {
  if (!t) return "-";
  if (/^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  const d = new Date(t);
  return isNaN(d.getTime()) ? "-" : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function AdminHome() {
  const [items, setItems] = useState<FichajeAdmin[]>([]);
  const theme = useTheme();
  const upSm = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    getFichajesHoy().then(setItems).catch(console.error);
  }, []);

  const total = useMemo(() => items.length, [items]);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", maxWidth: 1100, mx: "auto", borderRadius: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Fichajes de hoy</Typography>
          <Typography color="text.secondary">Resumen global de entradas y salidas</Typography>
        </Box>
        <Chip label={`${total} registros`} size="small" color="primary" variant="outlined" />
      </Stack>

      {items.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No hay fichajes hoy</Typography>
          <Typography color="text.secondary">En cuanto alguien fiche, aparecerá aquí.</Typography>
        </Box>
      ) : upSm ? (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Entrada</TableCell>
                <TableCell>Salida</TableCell>
                <TableCell>Pausa</TableCell>
                <TableCell>Tipo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((f) => (
                <TableRow key={f.id_Fichaje}>
                  <TableCell>{f.usuario.nombre ?? f.usuario.usuario} {f.usuario.apellido ?? ""}</TableCell>
                  <TableCell>{f.usuario.correo ?? "-"}</TableCell>
                  <TableCell>{fmt(f.hora_Entrada)}</TableCell>
                  <TableCell>{fmt(f.hora_Salida)}</TableCell>
                  <TableCell>{f.tiempo_Pausa ?? 0} min</TableCell>
                  <TableCell>{f.tipo_Jornada}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={1}>
          {items.map((f) => (
            <Box key={f.id_Fichaje} sx={{ p: 1.5, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 600 }}>{f.usuario.nombre ?? f.usuario.usuario} {f.usuario.apellido ?? ""}</Typography>
              <Typography variant="body2" color="text.secondary">{f.usuario.correo ?? "-"}</Typography>
              <Typography variant="body2">Entrada: {fmt(f.hora_Entrada)} • Salida: {fmt(f.hora_Salida)} • Pausa: {f.tiempo_Pausa ?? 0} min</Typography>
              <Typography variant="body2">Tipo: {f.tipo_Jornada}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}