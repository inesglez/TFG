// src/pages/admin/AdminUsuarios.tsx
import { useEffect, useState } from "react";
import {
  Paper, Typography, TextField, Button, Stack, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton
} from "@mui/material";
import { getUsuarios, createUsuario, setUsuarioActivo, setUsuarioRol } from "../../api/admin";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

// Tipos locales para evitar errores de import de tipos
type UsuarioLite = {
  idUsuario: number;
  usuario: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  rol: "admin" | "empleado";
  activo: boolean;
};

export default function AdminUsuarios() {
  const [list, setList] = useState<UsuarioLite[]>([]);
  const [usuario, setUsuario] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRolLocal] = useState<"admin" | "empleado">("empleado");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUsuarios().then(setList).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const nuevo = await createUsuario({ usuario, correo, password, rol });
    setList(prev => [nuevo as unknown as UsuarioLite, ...prev]); // casteo por si la API devuelve campos extra
    setUsuario(""); setCorreo(""); setPassword(""); setRolLocal("empleado");
  }

  async function toggleActivo(u: UsuarioLite) {
    await setUsuarioActivo(u.idUsuario, !u.activo);
    setList(prev => prev.map(x => x.idUsuario === u.idUsuario ? { ...x, activo: !x.activo } : x));
  }

  async function toggleRol(u: UsuarioLite) {
    const nuevoRol = u.rol === "admin" ? "empleado" : "admin";
    await setUsuarioRol(u.idUsuario, nuevoRol);
    setList(prev => prev.map(x => x.idUsuario === u.idUsuario ? { ...x, rol: nuevoRol } : x));
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", maxWidth: 1100, mx: "auto", borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Usuarios</Typography>

      <Box component="form" onSubmit={handleCreate}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required fullWidth />
          <TextField label="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} fullWidth />
          <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button type="submit" variant="contained" disabled={!usuario || !password}>Crear usuario</Button>
        </Stack>
      </Box>

      {loading ? (
        <Typography>Cargando…</Typography>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map((u) => (
                <TableRow key={u.idUsuario}>
                  <TableCell>{u.idUsuario}</TableCell>
                  <TableCell>{u.usuario}</TableCell>
                  <TableCell>{u.correo ?? "-"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={u.rol} color={u.rol === "admin" ? "secondary" : "default"} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={u.activo ? "Activo" : "Inactivo"} color={u.activo ? "success" : "default"} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => toggleRol(u)} title="Cambiar rol">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => toggleActivo(u)} title={u.activo ? "Desactivar" : "Activar"}>
                        {u.activo ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}