// pages/Dashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { getHistorial } from "../api/fichajes";
import {
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Box, Chip, Stack, Divider, Tooltip, useTheme, useMediaQuery
} from "@mui/material";
import { getAuth } from "../auth";

type Fichaje = {
  id_Fichaje: number;
  idUsuario: number;
  fecha: string;
  hora_Entrada?: string;
  hora_Salida?: string;
  tiempo_Pausa: number;
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

export default function Dashboard() {
  const auth = getAuth();
  const idUsuario = auth?.idUsuario ?? 0;
  const [items, setItems] = useState<Fichaje[]>([]);
  const theme = useTheme();
  const isUpSm = useMediaQuery(theme.breakpoints.up("sm"));

  useEffect(() => {
    if (!idUsuario) return;
    getHistorial(idUsuario).then(setItems).catch(() => {});
  }, [idUsuario]);

  const totalPausa = useMemo(
    () => items.reduce((acc, i) => acc + (i.tiempo_Pausa || 0), 0),
    [items]
  );

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
          maxWidth: 1200,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                Historial de fichajes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Registros recientes del usuario #{idUsuario || "—"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: { xs: 1, sm: 0 } }}>
              <Chip label={`${items.length} registros`} size="small" color="primary" variant="outlined" />
              <Chip label={`${totalPausa} min pausa`} size="small" color="secondary" variant="outlined" />
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {!idUsuario ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                Inicia sesión
              </Typography>
              <Typography color="text.secondary">
                Accede para ver tu historial.
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                No hay fichajes aún
              </Typography>
              <Typography color="text.secondary">
                Cuando registres tu primer fichaje, aparecerá aquí.
              </Typography>
            </Box>
          ) : (
            <>
              {isUpSm ? (
                <Box sx={{ overflowX: "auto" }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Entrada</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Salida</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Pausa</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((f, idx) => (
                        <TableRow
                          key={f.id_Fichaje}
                          sx={{
                            bgcolor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                            "&:hover": {
                              bgcolor: "rgba(37,99,235,0.04)",
                            },
                          }}
                        >
                          <TableCell>
                            <Tooltip title={new Date(f.fecha).toLocaleString()}>
                              <span style={{ fontWeight: 600 }}>{fmtDate(f.fecha)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{fmtTime(f.hora_Entrada)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{fmtTime(f.hora_Salida)}</TableCell>
                          <TableCell>{f.tiempo_Pausa ?? 0} min</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Stack divider={<Divider flexItem sx={{ opacity: 0.5 }} />} spacing={2}>
                  {items.map((f) => (
                    <Box
                      key={f.id_Fichaje}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, mb: 1 }}>{fmtDate(f.fecha)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Entrada: {fmtTime(f.hora_Entrada)} • Salida: {fmtTime(f.hora_Salida)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pausa: {f.tiempo_Pausa ?? 0} min
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}