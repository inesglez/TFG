// src/pages/Login.tsx
import {
  Box, Paper, TextField, Button, Typography, Stack, Alert,
  InputAdornment, IconButton
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { login, setAuth } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useColorModeContext } from "../theme/ColorModeContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { mode } = useColorModeContext();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await login(usuario, password);
      setAuth(resp);
      navigate(resp.rol === "admin" ? "/admin" : "/usuario");
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          width: "100%",
          maxWidth: 440,
          bgcolor: "background.paper",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header con logo */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
         <Box
  sx={{
    width: 56,
    height: 56,
    borderRadius: 2,
    display: "grid",
    placeItems: "center",
    mx: "auto",
    mb: 2,
    overflow: "hidden",
  }}
>
  <img 
    src="/controlFichaje.png" 
    alt="Logo Control Fichajes" 
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
</Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              mb: 0.5,
              background: mode === "light"
                ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                : "linear-gradient(135deg, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accede a tu cuenta de Control Fichajes
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Usuario o correo"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoFocus
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || !usuario || !password}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                },
                "&:disabled": {
                  bgcolor: "action.disabledBackground",
                },
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}