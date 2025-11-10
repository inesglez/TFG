import { useEffect, useState } from "react";
import {
  Paper, Typography, TextField, Button, Stack, Box,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, InputAdornment, Tooltip, Divider
} from "@mui/material";
import { getUsuarios, setUsuarioActivo, setUsuarioRol, deleteUsuario, updateUsuario } from "../../api/admin";
import EditIcon from "@mui/icons-material/Edit";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";

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
  const [loading, setLoading] = useState(false);

  // Filtros
  const [buscar, setBuscar] = useState("");
  const [filtroRol, setFiltroRol] = useState<"todos" | "admin" | "empleado">("todos");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activo" | "inactivo">("todos");
  const [ordenar, setOrdenar] = useState<"nombre" | "apellido" | "correo" | "rol">("nombre");

  // Modales
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [editing, setEditing] = useState<UsuarioLite | null>(null);
  const [editPassword, setEditPassword] = useState("");

  // PDF
  const [pdfUsuario, setPdfUsuario] = useState<UsuarioLite | null>(null);
  const [pdfTipo, setPdfTipo] = useState<"completo" | "rango" | "dia">("completo");
  const [pdfFechaInicio, setPdfFechaInicio] = useState("");
  const [pdfFechaFin, setPdfFechaFin] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, [buscar, filtroRol, filtroActivo, ordenar]);

  async function cargarUsuarios() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (buscar) params.append("buscar", buscar);
      if (filtroRol !== "todos") params.append("rol", filtroRol);
      if (filtroActivo !== "todos") params.append("activo", filtroActivo === "activo" ? "true" : "false");
      params.append("ordenar", ordenar);

      const url = `/api/admin/usuarios?${params.toString()}`;
      const response = await fetch(`http://localhost:5002${url}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      setList(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
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

  async function handleDescargarPdf() {
    if (!pdfUsuario) return;

    let url = `http://localhost:5002/api/admin/fichajes/pdf/${pdfUsuario.idUsuario}`;
    const params = new URLSearchParams();

    if (pdfTipo === "rango") {
      if (pdfFechaInicio) params.append("fechaInicio", pdfFechaInicio);
      if (pdfFechaFin) params.append("fechaFin", pdfFechaFin);
    } else if (pdfTipo === "dia") {
      if (pdfFechaInicio) {
        params.append("fechaInicio", pdfFechaInicio);
        params.append("fechaFin", pdfFechaInicio);
      }
    }

    if (params.toString()) url += `?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (!response.ok) throw new Error("Error al generar PDF");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Fichajes_${pdfUsuario.nombre}_${pdfUsuario.apellido}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setOpenPdf(false);
      setPdfTipo("completo");
      setPdfFechaInicio("");
      setPdfFechaFin("");
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el PDF");
    }
  }

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
          maxWidth: 1400,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#f8fafc" }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Administra usuarios, roles y permisos del sistema
          </Typography>
        </Box>

        <Divider />

        {/* Filtros */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: "#fafbfc" }}>
          <Stack spacing={2}>
            <TextField
              label="Buscar por nombre, apellido o correo"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Filtrar por rol"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value as any)}
                fullWidth
                size="small"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="admin">Administradores</MenuItem>
                <MenuItem value="empleado">Empleados</MenuItem>
              </TextField>

              <TextField
                select
                label="Filtrar por estado"
                value={filtroActivo}
                onChange={(e) => setFiltroActivo(e.target.value as any)}
                fullWidth
                size="small"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activo">Activos</MenuItem>
                <MenuItem value="inactivo">Inactivos</MenuItem>
              </TextField>

              <TextField
                select
                label="Ordenar por"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value as any)}
                fullWidth
                size="small"
              >
                <MenuItem value="nombre">Nombre</MenuItem>
                <MenuItem value="apellido">Apellido</MenuItem>
                <MenuItem value="correo">Correo</MenuItem>
                <MenuItem value="rol">Rol</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {loading ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography color="text.secondary">Cargando…</Typography>
            </Box>
          ) : list.length === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                No se encontraron usuarios
              </Typography>
              <Typography color="text.secondary">
                Intenta ajustar los filtros de búsqueda
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Apellido</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Correo</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Rol</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Estado</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((u, idx) => (
                    <TableRow
                      key={u.idUsuario}
                      sx={{
                        "&:hover": { bgcolor: "rgba(37,99,235,0.04)" },
                        bgcolor: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                      }}
                    >
                      <TableCell>{u.idUsuario}</TableCell>
                      <TableCell>{u.nombre ?? "-"}</TableCell>
                      <TableCell>{u.apellido ?? "-"}</TableCell>
                      <TableCell>{u.correo ?? "-"}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={u.rol} 
                          color={u.rol === "admin" ? "secondary" : "default"}
                          icon={u.rol === "admin" ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={u.activo ? "Activo" : "Inactivo"} 
                          color={u.activo ? "success" : "default"} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Descargar historial de fichajes" arrow>
                            <IconButton 
                              size="small" 
                              onClick={() => { 
                                setPdfUsuario(u); 
                                setOpenPdf(true); 
                              }}
                              color="info"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Editar usuario" arrow>
                            <IconButton size="small" onClick={() => { setEditing(u); setOpenEdit(true); }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Eliminar usuario" arrow>
                            <IconButton size="small" onClick={() => { setEditing(u); setOpenDelete(true); }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={`Cambiar a ${u.rol === "admin" ? "empleado" : "admin"}`} arrow>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleRol(u)}
                              color={u.rol === "admin" ? "secondary" : "default"}
                            >
                              {u.rol === "admin" ? <AdminPanelSettingsIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title={u.activo ? "Desactivar usuario" : "Activar usuario"} arrow>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleActivo(u)}
                              color={u.activo ? "success" : "default"}
                            >
                              {u.activo ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Modal Descargar PDF */}
      <Dialog open={openPdf} onClose={() => setOpenPdf(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Descargar historial de fichajes</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2">
              Usuario: <strong>{pdfUsuario?.nombre} {pdfUsuario?.apellido}</strong>
            </Typography>

            <TextField
              select
              label="Tipo de reporte"
              value={pdfTipo}
              onChange={(e) => setPdfTipo(e.target.value as any)}
              fullWidth
              size="small"
            >
              <MenuItem value="completo">Historial completo</MenuItem>
              <MenuItem value="rango">Rango de fechas</MenuItem>
              <MenuItem value="dia">Un día específico</MenuItem>
            </TextField>

            {pdfTipo === "rango" && (
              <>
                <TextField
                  label="Fecha inicio"
                  type="date"
                  value={pdfFechaInicio}
                  onChange={(e) => setPdfFechaInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Fecha fin"
                  type="date"
                  value={pdfFechaFin}
                  onChange={(e) => setPdfFechaFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  size="small"
                />
              </>
            )}

            {pdfTipo === "dia" && (
              <TextField
                label="Fecha"
                type="date"
                value={pdfFechaInicio}
                onChange={(e) => setPdfFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                size="small"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPdf(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={handleDescargarPdf}
            disabled={
              (pdfTipo === "rango" && (!pdfFechaInicio || !pdfFechaFin)) ||
              (pdfTipo === "dia" && !pdfFechaInicio)
            }
          >
            Descargar PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Editar usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={editing?.nombre ?? ""}
              onChange={(e) => setEditing(prev => prev ? { ...prev, nombre: e.target.value } : prev)}
              size="small"
            />
            <TextField
              label="Apellido"
              value={editing?.apellido ?? ""}
              onChange={(e) => setEditing(prev => prev ? { ...prev, apellido: e.target.value } : prev)}
              size="small"
            />
            <TextField
              label="Correo"
              value={editing?.correo ?? ""}
              onChange={(e) => setEditing(prev => prev ? { ...prev, correo: e.target.value } : prev)}
              size="small"
            />
            <TextField
              select
              label="Rol"
              value={editing?.rol ?? "empleado"}
              onChange={(e) => setEditing(prev => prev ? { ...prev, rol: e.target.value as "admin" | "empleado" } : prev)}
              size="small"
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
              size="small"
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </TextField>
            <TextField
              label="Nueva contraseña (opcional)"
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdate}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar usuario</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que quieres eliminar al usuario <strong>{editing?.nombre} {editing?.apellido}</strong>?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}