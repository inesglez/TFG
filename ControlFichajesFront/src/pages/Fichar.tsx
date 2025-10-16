import { useState } from "react";
import { ficharEntrada, ficharSalida } from "../api/fichajes";
import { Paper, Typography, Button, Stack, Alert } from "@mui/material";

export default function Fichar() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idUsuario = Number(localStorage.getItem("idUsuario") ?? 0);

  async function handleEntrada() {
    setLoading(true); setMsg(null); setError(null);
    try { await ficharEntrada(idUsuario); setMsg("Entrada registrada"); }
    catch (e: any) { setError(e?.response?.data?.detail ?? "Error"); }
    finally { setLoading(false); }
  }
  async function handleSalida() {
    setLoading(true); setMsg(null); setError(null);
    try { await ficharSalida(idUsuario); setMsg("Salida registrada"); }
    catch (e: any) { setError(e?.response?.data?.detail ?? "Error"); }
    finally { setLoading(false); }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Fichar</Typography>
      <Typography sx={{ mb: 2 }} color="text.secondary">Usuario: {idUsuario || "no logueado"}</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleEntrada} disabled={!idUsuario || loading}>Fichar Entrada</Button>
        <Button variant="outlined" onClick={handleSalida} disabled={!idUsuario || loading}>Fichar Salida</Button>
      </Stack>
      {msg && <Alert sx={{ mt: 2 }} severity="success">{msg}</Alert>}
      {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
    </Paper>
  );
}