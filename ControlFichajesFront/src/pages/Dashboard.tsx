// pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { getHistorial } from "../api/fichajes";
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Chip, Stack, Divider, Tooltip, useTheme, useMediaQuery
} from "@mui/material";

type Fichaje = {
  id_Fichaje: number;
  idUsuario: number;
  fecha: string;
  hora_Entrada?: string;
  hora_Salida?: string;
  tiempo_Pausa: number;
  tipo_Jornada: string;
};

function fmtDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(t?: string) {
  if (!t) return "-";
  if (/^\d{2}:\d{2}/.test(t)) return t.slice(0, 5);
  const d = new Date(t);
  return isNaN(d.getTime()) ? "-" : d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
function chipFor(tipo: string) {
  const k = (tipo || "").toLowerCase();
  if (k.includes("complet")) return { color: "primary" as const, label: "Completa" };
  if (k.includes("parc"))    return { color: "secondary" as const, label: "Parcial" };
  if (k.includes("remot"))   return { color: "info" as const, label: "Remoto" };
  if (k.includes("extra"))   return { color: "warning" as const, label: "Extra" };
  return { color: "default" as const, label: tipo || "—" };
}

export default function Dashboard() {
  const idUsuario = Number(localStorage.getItem("idUsuario") ?? 0);
  const [items, setItems] = useState<Fichaje[]>([]);
  const theme = useTheme();
  const isUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    if (!idUsuario) return;
    getHistorial(idUsuario).then(setItems).catch(console.error);
  }, [idUsuario]);

  const totalPausa = useMemo(() => items.reduce((acc, i) => acc + (i.tiempo_Pausa || 0), 0), [items]);

  return (
    <Box sx={{ width: "100%" }}>
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Historial de fichajes</Typography>
            <Typography variant="body2" color="text.secondary">
              Registros recientes del usuario #{idUsuario || "—"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 0 } }}>
            <Chip label={`${items.length} registros`} size="small" color="primary" variant="outlined" />
            <Chip label={`${totalPausa} min pausa`} size="small" color="secondary" variant="outlined" />
          </Stack>
        </Stack>

        {!idUsuario ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Inicia sesión</Typography>
            <Typography color="text.secondary">Accede para ver tu historial.</Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>No hay fichajes aún</Typography>
            <Typography color="text.secondary">Cuando registres tu primer fichaje, aparecerá aquí.</Typography>
          </Box>
        ) : (
          <>
            {isUpSm ? (
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Entrada</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Salida</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Pausa</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((f, idx) => {
                      const info = chipFor(f.tipo_Jornada);
                      return (
                        <TableRow
                          key={f.id_Fichaje}
                          sx={{
                            bgcolor: idx % 2 ? (theme.palette.mode === "light" ? "rgba(15,23,42,0.02)" : "rgba(255,255,255,0.04)") : "transparent",
                            "&:hover": { bgcolor: theme.palette.mode === "light" ? "rgba(37,99,235,0.06)" : "rgba(96,165,250,0.12)" },
                          }}
                        >
                          <TableCell>
                            <Tooltip title={new Date(f.fecha).toLocaleString()}>
                              <span>{fmtDate(f.fecha)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{fmtTime(f.hora_Entrada)}</TableCell>
                          <TableCell>{fmtTime(f.hora_Salida)}</TableCell>
                          <TableCell>{f.tiempo_Pausa ?? 0} min</TableCell>
                          <TableCell>
                            <Chip
                              label={info.label}
                              color={info.color}
                              size="small"
                              variant={info.color === "default" ? "outlined" : "filled"}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              // Móvil: tarjetas compactas
              <Stack divider={<Divider flexItem sx={{ opacity: 0.5 }} />} spacing={1}>
                {items.map((f) => {
                  const info = chipFor(f.tipo_Jornada);
                  return (
                    <Box
                      key={f.id_Fichaje}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === "light" ? "#fff" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{fmtDate(f.fecha)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Entrada: {fmtTime(f.hora_Entrada)} • Salida: {fmtTime(f.hora_Salida)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pausa: {f.tiempo_Pausa ?? 0} min
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "start" }}>
                        <Chip
                          label={info.label}
                          color={info.color}
                          size="small"
                          variant={info.color === "default" ? "outlined" : "filled"}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}