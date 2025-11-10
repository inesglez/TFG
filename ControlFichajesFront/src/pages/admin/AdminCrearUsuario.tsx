import { useState } from "react";
import { Paper, Typography, TextField, Button, Stack, Alert, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AdminCrearUsuario() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"admin" | "empleado">("empleado");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5002/api/admin/crear-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nombre, apellido, correo, password, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al crear usuario");
        return;
      }

      setSuccess(true);
      setNombre("");
      setApellido("");
      setCorreo("");
      setPassword("");
      setRol("empleado");

      // Redirigir después de 2 segundos
      setTimeout(() => navigate("/admin/usuarios"), 2000);
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", maxWidth: 600, mx: "auto", borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Crear Nuevo Usuario</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Usuario creado exitosamente. Redirigiendo...</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="Mínimo 6 caracteres"
          />
          <TextField
            select
            label="Rol"
            value={rol}
            onChange={(e) => setRol(e.target.value as "admin" | "empleado")}
            fullWidth
          >
            <MenuItem value="empleado">Empleado</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </TextField>

          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/admin/usuarios")}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !nombre || !apellido || !correo || !password}
              fullWidth
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}