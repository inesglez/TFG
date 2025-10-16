// src/pages/Login.tsx
import { Box, Paper, TextField, Button, Typography, Stack, Alert } from "@mui/material";
import { useState } from "react";
import { login } from "../api/auth";
import { setAuth } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await login(usuario, password);
      setAuth(resp);
      navigate(resp.rol === "admin" ? "/admin" : "/");
    } catch (e: any) {
      setError(e?.response?.data ?? "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)", // centrado perfecto
        width: "100%",
        px: 2, // margen lateral en móvil
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          width: "100%",
          maxWidth: 640,
          mx: "auto",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Iniciar sesión
        </Typography>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Usuario o correo"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !usuario || !password}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}