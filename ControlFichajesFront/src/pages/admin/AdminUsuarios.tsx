import { useEffect, useState } from "react";
import {
  Paper, Typography, TextField, Button, Stack, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from "@mui/material";
import { getUsuarios, createUsuario, setUsuarioActivo, setUsuarioRol, deleteUsuario, updateUsuario } from "../../api/admin";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import DeleteIcon from "@mui/icons-material/Delete";

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

  // Modales
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [editing, setEditing] = useState<UsuarioLite | null>(null);
  const [editPassword, setEditPassword] = useState(""); // opcional

  useEffect(() => {
    setLoading(true);
    getUsuarios().then(setList).finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const nuevo = await createUsuario({ usuario, correo, password, rol });
    setList(prev => [nuevo as unknown as UsuarioLite, ...prev]);
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

  async function handleUpdate() {
    if (!editing) return;
    await updateUsuario(editing.idUsuario, {
      correo: editing.correo,
      rol: editing.rol,
      activo: editing.activo,
      password: editPassword || undefined,
    });
    setList(prev => prev.map(x => x.idUsuario === editing.idUsuario ? {
      ...x,
      correo: editing.correo,
      rol: editing.rol,
      activo: editing.activo,
    } : x));
    setOpenEdit(false);
    setEditPassword("");
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteUsuario(editing.idUsuario);
    setList(prev => prev.filter(x => x.idUsuario !== editing.idUsuario));
    setOpenDelete(false);
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, width: "100%", maxWidth: 1100, mx: "auto", borderRadius: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Usuarios</Typography>

      <Box component="form" onSubmit={handleCreate}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required fullWidth />
          <TextField label="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} fullWidth />
          <TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <TextField
            select
            label="Rol"
            value={rol}
            onChange={(e) => setRolLocal(e.target.value as "admin" | "empleado")}
            fullWidth
          >
            <MenuItem value="empleado">Empleado</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
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
                      <IconButton size="small" onClick={() => { setEditing(u); setOpenEdit(true); }} title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => { setEditing(u); setOpenDelete(true); }} title="Eliminar">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => toggleRol(u)} title="Cambiar rol rápido">
                        <ToggleOnIcon fontSize="small" />
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

      {/* Editar */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Usuario (solo lectura)"
              value={editing?.usuario ?? ""}
              disabled
            />
            <TextField
              label="Correo"
              value={editing?.correo ?? ""}
              onChange={(e) => setEditing(prev => prev ? { ...prev, correo: e.target.value } : prev)}
            />
            <TextField
              select
              label="Rol"
              value={editing?.rol ?? "empleado"}
              onChange={(e) => setEditing(prev => prev ? { ...prev, rol: e.target.value as "admin" | "empleado" } : prev)}
            >
              <MenuItem value="empleado">Empleado</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              select
              label="Estado"
              value={editing?.activo ? "activo" : "inactivo"}
              onChange={(e) => {
                const activo = e.target.value === "activo";
                setEditing(prev => prev ? { ...prev, activo } : prev);
              }}
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
            <TextField
              label="Nueva contraseña (opcional)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdate}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Eliminar */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que quieres eliminar al usuario {editing?.usuario}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}